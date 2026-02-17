import { test, expect } from '@playwright/test';

const APP_URL = 'https://master.d3rzgyt9cnfupy.amplifyapp.com';
const TEST_USER = 'tibor@liktor.hu';
const TEST_PASSWORD = 'viFxyg-jymzun-2zimno';

test.describe('PhotoVault Manual Tests', () => {
  test.use({
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure'
  });

  test('Full workflow: Login -> Upload -> Album -> Share', async ({ page }) => {
    // Navigate to app
    await page.goto(APP_URL);
    await page.waitForLoadState('networkidle');

    // Login
    console.log('Attempting login...');
    await page.fill('input[name="username"], input[type="email"]', TEST_USER);
    await page.fill('input[name="password"], input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"], button:has-text("Sign in"), button:has-text("Bejelentkezés")');

    // Wait for auth to complete
    await page.waitForTimeout(3000);

    // Check if we're logged in (look for navigation or user info)
    const isLoggedIn = await page.locator('nav, header').count() > 0;
    console.log('Login status:', isLoggedIn);

    if (!isLoggedIn) {
      console.error('Login failed - saving screenshot');
      await page.screenshot({ path: 'test-results/login-failed.png', fullPage: true });
      throw new Error('Login failed');
    }

    // Navigate to Upload page
    console.log('Navigating to Upload...');
    await page.goto(`${APP_URL}/upload`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/01-upload-page.png', fullPage: true });

    // Test upload functionality exists
    const uploadZoneExists = await page.locator('[class*="upload"], [class*="drop"]').count() > 0;
    console.log('Upload zone found:', uploadZoneExists);
    expect(uploadZoneExists).toBe(true);

    // Navigate to Albums
    console.log('Navigating to Albums...');
    await page.goto(`${APP_URL}/albums`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/02-albums-page.png', fullPage: true });

    // Check for "Új album" button
    const newAlbumButton = page.locator('button:has-text("Új album")');
    const buttonExists = await newAlbumButton.count() > 0;
    console.log('New Album button found:', buttonExists);
    expect(buttonExists).toBe(true);

    // Try clicking the button
    if (buttonExists) {
      await newAlbumButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/03-new-album-clicked.png', fullPage: true });

      // Check if modal/form appeared
      const modalExists = await page.locator('[role="dialog"], .modal, form').count() > 0;
      console.log('Album creation modal/form appeared:', modalExists);

      if (!modalExists) {
        console.error('❌ NEW ALBUM: Button exists but does nothing!');
      }
    }

    // Navigate to Gallery to check Viber Bot mention
    console.log('Checking for Viber Bot references...');
    await page.goto(`${APP_URL}`);
    await page.waitForLoadState('networkidle');
    const viberMentions = await page.locator('text=/viber/i').count();
    console.log('Viber mentions found:', viberMentions);

    // Check footer for "Viber Bot" and "Share Album"
    const footerViberBot = await page.locator('footer:has-text("Viber Bot")').count();
    const footerShareAlbum = await page.locator('footer:has-text("Share Album")').count();
    console.log('Footer - Viber Bot found:', footerViberBot > 0);
    console.log('Footer - Share Album found:', footerShareAlbum > 0);

    if (footerViberBot > 0) {
      console.error('❌ VIBER BOT: Still referenced in footer (should be removed)');
    }
    if (footerShareAlbum > 0) {
      console.error('❌ SHARE ALBUM: Still referenced in footer (should be removed for private app)');
    }

    // Test Share functionality if we have albums
    await page.goto(`${APP_URL}/albums`);
    await page.waitForLoadState('networkidle');

    const firstAlbum = page.locator('a[href^="/albums/"]').first();
    const albumExists = await firstAlbum.count() > 0;

    if (albumExists) {
      console.log('Testing Share functionality on existing album...');
      await firstAlbum.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/04-album-detail.png', fullPage: true });

      const shareButton = page.locator('button:has-text("Megosztás")');
      const shareButtonExists = await shareButton.count() > 0;
      console.log('Share button found:', shareButtonExists);

      if (shareButtonExists) {
        await shareButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-results/05-share-modal.png', fullPage: true });

        // Check if share modal appeared
        const shareModalExists = await page.locator('[role="dialog"]:has-text("megosztás"), .modal:has-text("megosztás")').count() > 0;
        console.log('Share modal appeared:', shareModalExists);

        if (shareModalExists) {
          console.error('❌ SHARE: Modal still exists (should be removed for private app)');
        }
      }
    } else {
      console.log('No albums exist yet - skipping share test');
    }

    // Final summary screenshot
    await page.screenshot({ path: 'test-results/99-final-state.png', fullPage: true });

    console.log('\n=== TEST SUMMARY ===');
    console.log('Upload page: ✓');
    console.log('Albums page: ✓');
    console.log('New Album button:', buttonExists ? '✓' : '❌');
    console.log('Viber Bot removal needed:', footerViberBot > 0 ? '❌' : '✓');
    console.log('Share Album removal needed:', footerShareAlbum > 0 ? '❌' : '✓');
  });
});
