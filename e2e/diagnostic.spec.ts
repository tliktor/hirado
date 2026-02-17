import { test, expect } from '@playwright/test';

test.describe('Diagnostic Tests', () => {
  test('Capture console logs and network requests', async ({ page }) => {
    const consoleMessages: string[] = [];
    const errors: string[] = [];
    const networkRequests: { url: string; status: number; type: string }[] = [];
    const failedRequests: { url: string; error: string }[] = [];

    // Capture console messages
    page.on('console', (msg) => {
      const text = msg.text();
      consoleMessages.push(`[${msg.type()}] ${text}`);
      if (msg.type() === 'error') {
        errors.push(text);
      }
    });

    // Capture page errors
    page.on('pageerror', (error) => {
      errors.push(`PageError: ${error.message}`);
    });

    // Capture network requests
    page.on('response', async (response) => {
      networkRequests.push({
        url: response.url(),
        status: response.status(),
        type: response.request().resourceType(),
      });
    });

    // Capture failed requests
    page.on('requestfailed', (request) => {
      failedRequests.push({
        url: request.url(),
        error: request.failure()?.errorText || 'Unknown error',
      });
    });

    // Navigate to the page
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });

    // Wait a bit for any delayed loads
    await page.waitForTimeout(3000);

    // Get page content
    const html = await page.content();
    const bodyText = await page.evaluate(() => document.body.innerText);

    // Print diagnostics
    console.log('\n=== DIAGNOSTIC REPORT ===\n');

    console.log('1. PAGE CONTENT:');
    console.log('Body text:', bodyText.substring(0, 500));
    console.log('HTML length:', html.length);

    console.log('\n2. CONSOLE MESSAGES:');
    consoleMessages.forEach(msg => console.log(msg));

    console.log('\n3. ERRORS:');
    if (errors.length === 0) {
      console.log('No errors detected');
    } else {
      errors.forEach(err => console.log(err));
    }

    console.log('\n4. FAILED REQUESTS:');
    if (failedRequests.length === 0) {
      console.log('No failed requests');
    } else {
      failedRequests.forEach(req => console.log(`${req.url}: ${req.error}`));
    }

    console.log('\n5. NETWORK REQUESTS (non-2xx):');
    const problematicRequests = networkRequests.filter(r => r.status >= 400);
    if (problematicRequests.length === 0) {
      console.log('All requests returned 2xx-3xx status');
    } else {
      problematicRequests.forEach(req => console.log(`[${req.status}] ${req.url}`));
    }

    console.log('\n6. KEY RESOURCES:');
    const jsFiles = networkRequests.filter(r => r.url.endsWith('.js'));
    const cssFiles = networkRequests.filter(r => r.url.endsWith('.css'));
    console.log(`JS files loaded: ${jsFiles.length}`);
    console.log(`CSS files loaded: ${cssFiles.length}`);

    console.log('\n7. DOM STATE:');
    const rootElement = await page.evaluate(() => {
      const root = document.querySelector('#root');
      return {
        exists: !!root,
        childCount: root?.children.length || 0,
        innerHTML: root?.innerHTML.substring(0, 500) || '',
      };
    });
    console.log('Root element:', rootElement);

    console.log('\n8. AWS AMPLIFY CONFIG:');
    const amplifyConfig = await page.evaluate(() => {
      return {
        // @ts-ignore
        hasAmplify: typeof window.Amplify !== 'undefined',
        // @ts-ignore
        hasAWS: typeof window.AWS !== 'undefined',
      };
    });
    console.log('Amplify loaded:', amplifyConfig);

    // Take a screenshot
    await page.screenshot({ path: 'test-results/diagnostic-screenshot.png', fullPage: true });

    console.log('\n=== END DIAGNOSTIC REPORT ===\n');

    // This test always passes - it's just for diagnostics
    expect(true).toBe(true);
  });

  test('Check specific elements and rendering', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Check for common elements
    const checks = {
      root: await page.locator('#root').count(),
      authenticator: await page.locator('[data-amplify-authenticator]').count(),
      anyButton: await page.locator('button').count(),
      anyInput: await page.locator('input').count(),
      anyForm: await page.locator('form').count(),
      anyDiv: await page.locator('div').count(),
    };

    console.log('\n=== ELEMENT CHECKS ===');
    console.log(JSON.stringify(checks, null, 2));
    console.log('=== END ELEMENT CHECKS ===\n');

    // Check computed styles
    const bodyStyles = await page.evaluate(() => {
      const body = document.body;
      const styles = window.getComputedStyle(body);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        fontFamily: styles.fontFamily,
        display: styles.display,
      };
    });

    console.log('\n=== BODY STYLES ===');
    console.log(JSON.stringify(bodyStyles, null, 2));
    console.log('=== END BODY STYLES ===\n');

    expect(checks.root).toBeGreaterThan(0);
  });

  test('Test with authenticated access simulation', async ({ page, context }) => {
    // Try to access the app and check if it's an auth issue
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });

    // Check localStorage for any stored data
    const localStorage = await page.evaluate(() => {
      const items: Record<string, string> = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          items[key] = window.localStorage.getItem(key) || '';
        }
      }
      return items;
    });

    console.log('\n=== LOCAL STORAGE ===');
    console.log('Keys:', Object.keys(localStorage));
    console.log('=== END LOCAL STORAGE ===\n');

    expect(true).toBe(true);
  });
});
