const { chromium } = require('playwright');
const path = require('path');

async function runSQL() {
  const userDataDir = 'C:\\Users\\mm\\.gemini\\antigravity-browser-profile';
  console.log('Launching browser with profile:', userDataDir);
  
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true,
    viewport: { width: 1280, height: 800 },
  });

  const sqlQuery = `-- 1. Setup RLS policies on the products table for the Admin email
DROP POLICY IF EXISTS "Allow admin to delete products" ON products;
DROP POLICY IF EXISTS "Allow admin to insert products" ON products;
DROP POLICY IF EXISTS "Allow admin to update products" ON products;

CREATE POLICY "Allow admin to delete products" 
ON products 
FOR DELETE 
TO authenticated 
USING (auth.jwt() ->> 'email' = 'racoctanveen15@gmail.com');

CREATE POLICY "Allow admin to insert products" 
ON products 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.jwt() ->> 'email' = 'racoctanveen15@gmail.com');

CREATE POLICY "Allow admin to update products" 
ON products 
FOR UPDATE 
TO authenticated 
USING (auth.jwt() ->> 'email' = 'racoctanveen15@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'racoctanveen15@gmail.com');

-- 2. Modify foreign key constraints on orders table to allow deletion
-- We'll drop existing foreign keys on orders referencing products and recreate them with ON DELETE SET NULL
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_product_id_fkey,
DROP CONSTRAINT IF EXISTS fk_product;

ALTER TABLE orders 
ADD CONSTRAINT orders_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES products(id) 
ON DELETE SET NULL;`;

  try {
    const page = await context.newPage();
    console.log('Navigating to Supabase SQL editor...');
    await page.goto('https://supabase.com/dashboard/project/pcgqfuvgmzusypmaiawy/sql/new', { waitUntil: 'networkidle', timeout: 90000 });
    
    console.log('Page title:', await page.title());
    await page.waitForTimeout(5000); // Extra wait for Monaco to initialize
    
    // Take a screenshot of the initial loaded state
    const screenshotInit = path.join(__dirname, 'supabase_sql_editor.png');
    await page.screenshot({ path: screenshotInit });
    console.log('Initial screenshot saved to:', screenshotInit);

    // Let's locate the Monaco editor input area
    const editorSelector = 'textarea.inputarea';
    console.log('Waiting for editor selector:', editorSelector);
    await page.waitForSelector(editorSelector, { timeout: 30000 });
    
    console.log('Focusing editor...');
    await page.focus(editorSelector);
    
    console.log('Clearing existing content...');
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(1000);
    
    // Take screenshot after clearing
    const screenshotCleared = path.join(__dirname, 'supabase_sql_editor_cleared.png');
    await page.screenshot({ path: screenshotCleared });
    console.log('Cleared screenshot saved to:', screenshotCleared);

    console.log('Inserting SQL Query...');
    await page.keyboard.insertText(sqlQuery);
    await page.waitForTimeout(2000);
    
    // Take screenshot after inserting
    const screenshotFilled = path.join(__dirname, 'supabase_sql_editor_filled.png');
    await page.screenshot({ path: screenshotFilled });
    console.log('Filled screenshot saved to:', screenshotFilled);

    console.log('Running SQL query (pressing Ctrl+Enter)...');
    await page.keyboard.press('Control+Enter');
    
    console.log('Waiting for query execution...');
    await page.waitForTimeout(8000); // Wait for execution to finish
    
    // Take a screenshot of the results
    const screenshotExecuted = path.join(__dirname, 'supabase_sql_editor_executed.png');
    await page.screenshot({ path: screenshotExecuted });
    console.log('Executed screenshot saved to:', screenshotExecuted);

    console.log('Checking for success/error messages on page...');
    const bodyText = await page.innerText('body');
    if (bodyText.includes('Success') || bodyText.includes('Query returned 0 rows') || bodyText.includes('Successfully')) {
      console.log('SUCCESS: SQL queries were executed successfully!');
    } else {
      console.log('WARNING: Could not confirm success message. Please review the executed screenshot.');
    }
  } catch (error) {
    console.error('Error executing SQL via Playwright:', error);
  } finally {
    await context.close();
  }
}

runSQL();
