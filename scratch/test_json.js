
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function tryAddColumn() {
  const { data, error } = await supabase.from('orders').insert({
    user_id: 'e1a16ad0-5ebe-4a8f-a9a1-ddce0a1f6a6f',
    product_name: JSON.stringify([{ name: 'Test', price: 100 }]),
    delivery_name: 'Test',
    delivery_address: 'Test',
    delivery_zone: 'Inside Dhaka',
    whatsapp_number: '01712345678',
    total_price: 100,
    status: 'Pending'
  }).select();

  if (error) {
    console.error('Insert error:', error);
  } else {
    console.log('Insert success with JSON string in product_name:', data);
    // Delete it
    await supabase.from('orders').delete().eq('id', data[0].id);
  }
}

tryAddColumn();
