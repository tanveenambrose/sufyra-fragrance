'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/data/products';
import { Upload, X, Plus, Trash2, Save, Image as ImageIcon, Sparkles, Layers, Box } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProductFormProps {
  initialData?: Product;
}

type ComboType = 'duo' | 'trio' | 'quad' | 'set';
type BaseSize = '3ml' | '6ml' | '12ml' | 'set';

interface Variant {
  size: string;
  price: number;
  image_url?: string;
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // States for the smart logic
  const [comboType, setComboType] = useState<ComboType>('duo');
  const [baseSize, setBaseSize] = useState<BaseSize>('3ml');
  const [isAutoGenerating, setIsAutoGenerating] = useState(!initialData);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    image_url: initialData?.image_url || '',
    category: initialData?.category || 'perfume-oil',
    discount_percent: initialData?.discount_percent || 0,
    variants: (initialData?.variants as Variant[]) || [{ size: '3ml', price: 0, image_url: '' }, { size: '6ml', price: 0, image_url: '' }],
    top_notes: initialData?.top_notes || '',
    middle_notes: initialData?.middle_notes || '',
    base_notes: initialData?.base_notes || '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [variantImageFiles, setVariantImageFiles] = useState<(File | null)[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>(initialData?.image_url || '');

  // Effect to sync variantImageFiles with variants count
  useEffect(() => {
    setVariantImageFiles(prev => {
      const newFiles = [...prev];
      if (newFiles.length < formData.variants.length) {
        return [...newFiles, ...Array(formData.variants.length - newFiles.length).fill(null)];
      }
      if (newFiles.length > formData.variants.length) {
        return newFiles.slice(0, formData.variants.length);
      }
      return newFiles;
    });
  }, [formData.variants.length]);

  // Effect to handle auto-generation of variants based on category and combo settings
  useEffect(() => {
    if (!isAutoGenerating) return;

    if (formData.category === 'perfume-oil') {
      setFormData(prev => ({
        ...prev,
        variants: [
          { size: '3ml', price: prev.variants.find((v: Variant) => v.size === '3ml')?.price || 0 },
          { size: '6ml', price: prev.variants.find((v: Variant) => v.size === '6ml')?.price || 0 }
        ]
      }));
    } else {
      // Combo logic
      let label = '';
      if (comboType === 'set') {
        label = 'Set';
      } else {
        const count = comboType === 'duo' ? 2 : comboType === 'trio' ? 3 : 4;
        label = Array(count).fill(baseSize).join('+');
      }

      setFormData(prev => ({
        ...prev,
        variants: [{ size: label, price: prev.variants[0]?.price || 0 }]
      }));
    }
  }, [formData.category, comboType, baseSize, isAutoGenerating]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleVariantImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFiles = [...variantImageFiles];
      newFiles[index] = file;
      setVariantImageFiles(newFiles);
      
      const newVariants = [...formData.variants];
      newVariants[index].image_url = URL.createObjectURL(file); // Temporary preview URL
      setFormData({ ...formData, variants: newVariants });
    }
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const addVariant = () => {
    setIsAutoGenerating(false);
    setFormData({
      ...formData,
      variants: [...formData.variants, { size: 'Custom', price: 0, image_url: '' }],
    });
  };

  const removeVariant = (index: number) => {
    setIsAutoGenerating(false);
    const newVariants = [...formData.variants];
    newVariants.splice(index, 1);
    setFormData({ ...formData, variants: newVariants });
  };

  const handleVariantChange = (index: number, field: string, value: string | number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newVariants = [...formData.variants] as any[];
    newVariants[index][field] = value;
    setFormData({ ...formData, variants: newVariants });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let finalImageUrl = formData.image_url;

      // Upload main image
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      // Upload variant images
      const finalVariants = await Promise.all(formData.variants.map(async (v, i) => {
        let vImageUrl = v.image_url;
        if (variantImageFiles[i]) {
          vImageUrl = await uploadImage(variantImageFiles[i]!);
        } else if (vImageUrl?.startsWith('blob:')) {
          // This case shouldn't happen if logic is correct, but let's be safe
          vImageUrl = '';
        }
        return { ...v, image_url: vImageUrl || '' };
      }));

      const productToSave = {
        name: formData.name,
        description: formData.description,
        image_url: finalImageUrl,
        category: formData.category,
        discount_percent: formData.discount_percent,
        variants: finalVariants,
        top_notes: formData.top_notes,
        middle_notes: formData.middle_notes,
        base_notes: formData.base_notes,
      };

      if (initialData?.id) {
        const { error } = await supabase
          .from('products')
          .update(productToSave)
          .eq('id', initialData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productToSave]);
        if (error) throw error;
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Error saving product. Make sure the "product-images" storage bucket exists and is public.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-12 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left: Image Upload */}
        <div className="space-y-6">
           <div className="bg-[#0A0A0A] rounded-2xl border border-white/5 p-6 sm:p-8 text-center space-y-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Visual Identity</h3>
                <ImageIcon size={14} className="text-luxury-gold/40" />
              </div>
              <div 
                className="relative aspect-[4/5] bg-white/[0.02] rounded-xl border-2 border-dashed border-white/10 overflow-hidden group cursor-pointer hover:border-luxury-gold/50 transition-all flex items-center justify-center shadow-inner"
                onClick={() => document.getElementById('imageInput')?.click()}
              >
                {previewUrl ? (
                  <>
                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 lg:group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="text-white scale-110" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-4 text-white/10">
                    <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center border border-white/5">
                        <ImageIcon size={32} strokeWidth={1} />
                    </div>
                    <span className="text-[9px] uppercase tracking-widest font-bold">Upload Portrait Image</span>
                  </div>
                )}
              </div>
              <input 
                id="imageInput"
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageChange}
              />
              <div className="flex flex-col gap-2 pt-2">
                  <p className="text-[8px] text-white/20 uppercase tracking-[0.3em]">Max size: 5MB</p>
                  <p className="text-[8px] text-white/20 uppercase tracking-[0.3em]">Format: JPG, PNG, WEBP</p>
              </div>
           </div>
        </div>

        {/* Right: Product Details */}
        <div className="lg:col-span-2 space-y-8">
           {/* Section 1: Core Identity */}
           <div className="bg-[#0A0A0A] rounded-2xl border border-white/5 p-6 sm:p-10 space-y-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 flex items-center gap-2">
                    <Sparkles size={12} className="text-luxury-gold" />
                    Scent Name
                  </label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Royal Oud"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 focus:border-luxury-gold focus:outline-none transition-all text-sm font-medium placeholder:text-white/10"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 flex items-center gap-2">
                    <Layers size={12} className="text-luxury-gold" />
                    Collection Type
                  </label>
                  <div className="flex bg-white/[0.03] p-1 rounded-xl border border-white/10">
                    <button 
                        type="button"
                        onClick={() => setFormData({...formData, category: 'perfume-oil'})}
                        className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${formData.category === 'perfume-oil' ? 'bg-luxury-gold text-luxury-charcoal shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                        Regular
                    </button>
                    <button 
                        type="button"
                        onClick={() => setFormData({...formData, category: 'combo'})}
                        className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${formData.category === 'combo' ? 'bg-luxury-gold text-luxury-charcoal shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                        Combo
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1">Aromatic Notes & Experience</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  placeholder="Describe the top, heart, and base notes..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 focus:border-luxury-gold focus:outline-none transition-all resize-none text-sm font-medium leading-relaxed"
                />
              </div>

              {/* Scent Notes Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
                <div className="space-y-3">
                  <label className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1">Top Notes</label>
                  <input 
                    type="text" 
                    value={formData.top_notes}
                    onChange={(e) => setFormData({...formData, top_notes: e.target.value})}
                    placeholder="e.g. Citrus, Bergamot"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-4 py-3 focus:border-luxury-gold outline-none text-xs"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1">Middle Notes</label>
                  <input 
                    type="text" 
                    value={formData.middle_notes}
                    onChange={(e) => setFormData({...formData, middle_notes: e.target.value})}
                    placeholder="e.g. Jasmine, Rose"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-4 py-3 focus:border-luxury-gold outline-none text-xs"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1">Base Notes</label>
                  <input 
                    type="text" 
                    value={formData.base_notes}
                    onChange={(e) => setFormData({...formData, base_notes: e.target.value})}
                    placeholder="e.g. Musk, Amber, Wood"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-4 py-3 focus:border-luxury-gold outline-none text-xs"
                  />
                </div>
              </div>

              <div className="space-y-6 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-red-400/80 font-bold ml-1">Exclusive Promotion (%)</label>
                  <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-3 py-1 rounded-full">{formData.discount_percent || 0}% OFF</span>
                </div>
                <div className="flex items-center gap-8">
                  <input 
                    type="range" 
                    min="0"
                    max="90"
                    step="5"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({...formData, discount_percent: parseInt(e.target.value) || 0})}
                    className="flex-grow h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-red-500"
                  />
                  <input 
                    type="number" 
                    min="0"
                    max="99"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({...formData, discount_percent: parseInt(e.target.value) || 0})}
                    className="w-20 bg-white/[0.02] border border-white/10 rounded-lg px-3 py-3 text-center text-sm font-bold focus:border-red-500/50 outline-none"
                  />
                </div>
              </div>
           </div>

           {/* Section 2: Pricing & Variants */}
           <div className="bg-[#0A0A0A] rounded-2xl border border-white/5 p-6 sm:p-10 space-y-10 shadow-2xl">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-luxury-gold">Pricing Strategy</h3>
                    <p className="text-[9px] text-white/20 uppercase tracking-widest">Define your sizing and market value</p>
                </div>
                {formData.category === 'combo' && isAutoGenerating && (
                    <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Auto-Generator Active</span>
                    </div>
                )}
              </div>

              {formData.category === 'combo' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="space-y-4">
                        <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold ml-1">Bundle Magnitude</label>
                        <div className="grid grid-cols-4 gap-2">
                            {(['duo', 'trio', 'quad', 'set'] as ComboType[]).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => {setComboType(t); setIsAutoGenerating(true);}}
                                    className={`py-2.5 text-[9px] font-bold uppercase tracking-widest rounded-lg border transition-all ${comboType === t ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold' : 'bg-transparent border-white/5 text-white/20 hover:text-white/40'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    {comboType !== 'set' && (
                        <div className="space-y-4">
                            <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold ml-1">Base Component Size</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['3ml', '6ml', '12ml'] as BaseSize[]).map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => {setBaseSize(s); setIsAutoGenerating(true);}}
                                        className={`py-2.5 text-[9px] font-bold uppercase tracking-widest rounded-lg border transition-all ${baseSize === s ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold' : 'bg-transparent border-white/5 text-white/20 hover:text-white/40'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
              )}

              <div className="space-y-6">
                <div className="flex justify-between items-center mb-2">
                     <span className="text-[9px] uppercase tracking-[0.2em] text-white/20">Active Variants</span>
                     {!isAutoGenerating ? (
                        <button 
                            type="button" 
                            onClick={addVariant}
                            className="text-luxury-gold text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-luxury-gold/5 px-3 py-1.5 rounded-lg transition-all border border-luxury-gold/20"
                        >
                            <Plus size={12} /> New Variant
                        </button>
                     ) : (
                        <button 
                            type="button" 
                            onClick={() => setIsAutoGenerating(false)}
                            className="text-white/40 text-[9px] font-bold uppercase tracking-widest hover:text-white transition-colors"
                        >
                            Manual Edit
                        </button>
                     )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {formData.variants.map((variant, index) => {
                    // Calculate original price based on discount
                    const originalPrice = formData.discount_percent > 0 
                      ? Math.round(variant.price / (1 - formData.discount_percent / 100)) 
                      : null;

                    return (
                      <div key={index} className="flex gap-4 sm:gap-6 items-start bg-white/[0.01] p-4 sm:p-6 rounded-xl border border-white/5 animate-in fade-in slide-in-from-right-4 duration-300 group relative">
                        {/* Variant Image Slot */}
                        <div 
                          className="w-24 aspect-[4/5] bg-white/[0.03] rounded-lg border border-white/10 overflow-hidden flex-shrink-0 cursor-pointer hover:border-luxury-gold/40 transition-all flex items-center justify-center relative"
                          onClick={() => document.getElementById(`variant-image-${index}`)?.click()}
                        >
                          {variant.image_url ? (
                            <img src={variant.image_url} className="w-full h-full object-cover" alt={`Variant ${variant.size}`} />
                          ) : (
                            <ImageIcon size={20} className="text-white/10" />
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 lg:group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload size={14} className="text-white/70" />
                          </div>
                          <input 
                            id={`variant-image-${index}`}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleVariantImageChange(index, e)}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-1 text-[7px] text-white/70 text-center uppercase tracking-tighter">
                            Size View
                          </div>
                        </div>

                        <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
                          <div className="space-y-2">
                            <label className="text-[8px] uppercase tracking-widest text-white/20 ml-1">Sizing (e.g. 3ml+3ml)</label>
                            <input 
                              type="text" 
                              disabled={isAutoGenerating}
                              placeholder="3ml"
                              value={variant.size}
                              onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                              className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-4 py-3 focus:border-luxury-gold transition-all text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[8px] uppercase tracking-widest text-white/20 ml-1 flex justify-between">
                              <span>Market Price (৳)</span>
                              {originalPrice && (
                                <span className="text-red-400/50 line-through">৳{originalPrice}</span>
                              )}
                            </label>
                            <div className="relative">
                              <input 
                                  type="number" 
                                  placeholder="0"
                                  value={variant.price === 0 ? '' : variant.price}
                                  onChange={(e) => handleVariantChange(index, 'price', parseInt(e.target.value) || 0)}
                                  className="w-full bg-white/[0.02] border border-white/10 rounded-lg pl-4 pr-10 py-3 focus:border-luxury-gold transition-all text-sm font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 text-xs font-bold">৳</span>
                            </div>
                          </div>
                        </div>
                        {!isAutoGenerating && formData.variants.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="p-3 text-white/10 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all absolute -top-2 -right-2 bg-[#0A0A0A] border border-white/5"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
           </div>

           {/* Final Actions */}
           <div className="flex flex-col-reverse sm:flex-row justify-end gap-6 pt-4">
              <button 
                type="button"
                onClick={() => router.push('/admin/products')}
                className="px-10 py-5 text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 hover:text-white transition-all rounded-xl border border-transparent hover:border-white/5 active:scale-95"
              >
                Discard Changes
              </button>
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-12 py-5 luxury-gradient text-luxury-charcoal rounded-xl font-bold text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all shadow-2xl shadow-luxury-gold/40 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-luxury-charcoal border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Box size={18} />
                )}
                {initialData ? 'Update Manifest' : 'Induct into Collection'}
              </button>
           </div>
        </div>
      </div>
    </form>
  );
}
