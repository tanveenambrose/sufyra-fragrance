const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDelete() {
  console.log('Fetching products...');
  const { data: products, error: fetchError } = await supabase.from('products').select('id, name');
  if (fetchError) {
    console.error('Fetch Error:', fetchError);
    return;
  }
  console.log('Available products:', products);

  if (products && products.length > 0) {
    const target = products[0];
    console.log(`Attempting to delete product: "${target.name}" with ID: ${target.id}`);
    const { error: deleteError } = await supabase.from('products').delete().eq('id', target.id);
    if (deleteError) {
      console.error('Delete Error:', deleteError);
    } else {
      console.log('Delete Success!');
    }
  } else {
    console.log('No products found to delete.');
  }
}

testDelete();
