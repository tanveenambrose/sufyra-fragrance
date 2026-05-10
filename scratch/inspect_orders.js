
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pcgqfuvgmzusypmaiawy.supabase.co';
const supabaseKey = 'sb_publishable_qlbl9JcfqLLDncrbxpIgKA_zEbGAp2r';
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectOrders() {
  console.log('Inspecting orders table...');
  const { data, error } = await supabase.from('orders').select('*').limit(1);
  if (error) {
    console.error('Error fetching orders:', JSON.stringify(error, null, 2));
  } else {
    console.log('Columns in orders table:', data.length > 0 ? Object.keys(data[0]) : 'No data found to inspect columns');
  }
}

inspectOrders();
