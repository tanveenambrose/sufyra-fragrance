const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('Testing Products Table...');
  const { data, error } = await supabase.from('products').select('*').limit(1);
  if (error) {
    console.error('Products Table Error:', error);
  } else {
    console.log('Products Table Exists. Sample data:', data);
  }

  console.log('Testing Insert...');
  const testProduct = {
    name: 'Test Product',
    description: 'Test Description',
    image_url: 'http://test.com/image.png',
    category: 'perfume-oil',
    variants: [{ size: '3ml', price: 100 }],
    discount_percent: 0,
  };
  
  const { data: insertData, error: insertError } = await supabase.from('products').insert([testProduct]).select();
  if (insertError) {
    console.error('Insert Error:', insertError);
  } else {
    console.log('Insert Success:', insertData);
    if (insertData && insertData.length > 0) {
      console.log('Testing Delete...');
      const { error: deleteError } = await supabase.from('products').delete().eq('id', insertData[0].id);
      if (deleteError) {
        console.error('Delete Error:', deleteError);
      } else {
        console.log('Delete Success.');
      }
    }
  }

  console.log('Testing Storage Bucket "product-images"...');
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) {
    console.error('Storage Error:', bucketError);
  } else {
    const imagesBucket = buckets.find(b => b.name === 'product-images');
    if (imagesBucket) {
      console.log('Bucket "product-images" Exists. Is public?', imagesBucket.public);
    } else {
      console.log('Bucket "product-images" NOT FOUND.');
    }
  }
}

testDatabase();
