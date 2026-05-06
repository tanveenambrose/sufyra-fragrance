
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrdersSchema() {
  console.log('Fetching one order to check columns...');
  const { data, error } = await supabase.from('orders').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    if (data.length > 0) {
      console.log('Columns found:', Object.keys(data[0]));
      console.log('Sample data:', data[0]);
    } else {
      console.log('No orders found to check columns.');
    }
  }
}

checkOrdersSchema();
