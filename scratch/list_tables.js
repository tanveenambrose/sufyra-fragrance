
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  const { data, error } = await supabase.from('pg_tables').select('tablename').eq('schemaname', 'public');
  if (error) {
    // If pg_tables is not accessible, try a common table
    console.log('Cannot access pg_tables. Trying common tables...');
    const tables = ['products', 'orders', 'order_items', 'profiles', 'users'];
    for (const table of tables) {
      const { error: tableError } = await supabase.from(table).select('*').limit(0);
      if (!tableError) {
        console.log(`Table "${table}" exists.`);
      } else {
        console.log(`Table "${table}" does not exist or not accessible:`, tableError.message);
      }
    }
  } else {
    console.log('Tables:', data.map(t => t.tablename));
  }
}

listTables();
