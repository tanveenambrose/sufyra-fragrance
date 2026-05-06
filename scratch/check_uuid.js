
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumnTypes() {
  // We can check if product_id is a UUID by trying to insert a non-UUID string
  const { error } = await supabase.from('orders').insert({
    user_id: 'e1a16ad0-5ebe-4a8f-a9a1-ddce0a1f6a6f',
    product_id: 'multi', // Not a UUID
    product_name: 'Test',
    delivery_name: 'Test',
    delivery_address: 'Test',
    delivery_zone: 'Inside Dhaka',
    whatsapp_number: '01712345678',
    total_price: 100,
    status: 'Pending',
    delivery_cost: 80,
    subtotal: 20
  }).select();

  if (error) {
    console.log('Error inserting "multi":', error.message);
    if (error.message.includes('invalid input syntax for type uuid')) {
        console.log('product_id IS a UUID type.');
    }
  } else {
    console.log('product_id is NOT strictly a UUID or "multi" is accepted.');
  }
}

checkColumnTypes();
