import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Listen for console messages
  page.on('console', msg => {
    console.log(`CONSOLE ${msg.type()}: ${msg.text()}`);
  });
  
  // Listen for page errors
  page.on('pageerror', err => {
    console.log(`PAGE ERROR: ${err.message}`);
  });
  
  // Go to the app
  await page.goto('http://localhost:5173');
  
  // Wait a bit for the page to load
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
  
  // Get some info about the page
  const title = await page.title();
  console.log(`Page title: ${title}`);
  
  // Check if CSS is loaded
  const stylesheets = await page.evaluate(() => {
    const sheets = Array.from(document.styleSheets);
    return sheets.map(sheet => ({
      href: sheet.href,
      rules: sheet.cssRules ? sheet.cssRules.length : 'blocked'
    }));
  });
  
  console.log('Stylesheets loaded:', JSON.stringify(stylesheets, null, 2));
  
  // Check if Tailwind classes are being applied
  const hasClasses = await page.evaluate(() => {
    const elements = document.querySelectorAll('[class]');
    const classes = Array.from(elements).slice(0, 5).map(el => ({
      tagName: el.tagName,
      classes: el.className,
      computedStyle: {
        backgroundColor: window.getComputedStyle(el).backgroundColor,
        color: window.getComputedStyle(el).color,
        display: window.getComputedStyle(el).display
      }
    }));
    return classes;
  });
  
  console.log('Element classes and styles:', JSON.stringify(hasClasses, null, 2));
  
  await browser.close();
  console.log('Screenshot saved as debug-screenshot.png');
})();