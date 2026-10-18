import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { UploadApiResponse } from 'cloudinary';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { 
          error: 'Cloudinary credentials are not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your environment variables.' 
        },
        { status: 500 }
      );
    }

    const data = await req.formData();
    const file = data.get('file') as File | null;
    const section = (data.get('section') as string) || 'products';
    const subcategory = (data.get('category') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Determine target folder mirroring website sections
    let targetFolder = 'sufyra';
    if (section === 'variant') {
      targetFolder = 'sufyra/variants';
    } else if (section === 'banner' || section === 'hero') {
      targetFolder = 'sufyra/banners';
    } else if (section === 'branding' || section === 'logo') {
      targetFolder = 'sufyra/branding';
    } else if (subcategory === 'perfume-oil') {
      targetFolder = 'sufyra/products/perfume-oils';
    } else if (subcategory.includes('combo') || subcategory === 'combos' || subcategory === 'set') {
      targetFolder = 'sufyra/products/combos';
    } else {
      targetFolder = `sufyra/products/${subcategory || 'general'}`;
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload via stream to Cloudinary
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: targetFolder,
          resource_type: 'image',
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error('Upload to Cloudinary failed'));
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      folder: targetFolder,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown upload error' },
      { status: 500 }
    );
  }
}
