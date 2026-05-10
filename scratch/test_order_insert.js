
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pcgqfuvgmzusypmaiawy.supabase.co';
const supabaseKey = 'sb_publishable_qlbl9JcfqLLDncrbxpIgKA_zEbGAp2r';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('Testing order insertion without delivery_email...');
  const testOrder = {
    user_id: 'e1a16ad0-5ebe-4a8f-a9a1-ddce0a1f6a6f',
    product_id: 'd033a062-b649-4c13-9e3a-5127593563fa',
    product_name: 'Test Order via Script',
    product_image: 'http://test.com/image.png',
    variant_size: '3ml',
    quantity: 1,
    subtotal: 500,
    delivery_cost: 80,
    total_price: 580,
    delivery_name: 'Test User',
    delivery_zone: 'Inside Dhaka',
    delivery_address: 'Test Address',
    whatsapp_number: '01234567890',
    payment_method: 'Cash on Delivery',
    status: 'Pending'
  };

  const { data, error } = await supabase.from('orders').insert([testOrder]).select();
  if (error) {
    console.error('Insert Error:', JSON.stringify(error, null, 2));
  } else {
    console.log('Insert Success:', data);
    if (data && data.length > 0) {
      await supabase.from('orders').delete().eq('id', data[0].id);
      console.log('Test order deleted.');
    }
  }
}

testInsert();
