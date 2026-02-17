import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const APP_URL = 'https://master.d3rzgyt9cnfupy.amplifyapp.com';
const TEST_USER = 'tibor@liktor.hu';
const TEST_PASSWORD = 'viFxyg-jymzun-2zimno';

test.use({
  viewport: { width: 1920, height: 1080 },
  screenshot: 'on',
  video: 'retain-on-failure'
});

test.describe('PhotoVault Full Manual Test', () => {
  test('Complete workflow: Login → Upload Photos → Create Album → Verify', async ({ page }) => {
    const testResults: string[] = [];
    const addResult = (msg: string) => {
      console.log(msg);
      testResults.push(msg);
    };

    // 1. Login
    addResult('\n=== STEP 1: LOGIN ===');
    await page.goto(APP_URL);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/step-01-login-page.png', fullPage: true });

    await page.getByLabel('Email').fill(TEST_USER);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForTimeout(5000);

    const loggedIn = (await page.locator('nav, header').count()) > 0;
    addResult(loggedIn ? '✅ Login successful' : '❌ Login failed');
    if (!loggedIn) throw new Error('Login failed');

    await page.screenshot({ path: 'test-results/step-02-logged-in.png', fullPage: true });

    // 2. Check Gallery Page
    addResult('\n=== STEP 2: GALLERY PAGE ===');
    await page.goto(`${APP_URL}/`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/step-03-gallery.png', fullPage: true });

    const photosCount = await page.locator('[class*="photo"], img[alt*="photo"], [data-testid*="photo"]').count();
    addResult(`📸 Photos in gallery: ${photosCount}`);

    // 3. Upload Photos
    addResult('\n=== STEP 3: UPLOAD PHOTOS ===');
    await page.goto(`${APP_URL}/upload`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/step-04-upload-page.png', fullPage: true });

    // Get test images
    const imagesDir = path.join(process.cwd(), 'images');
    const imageFiles = fs.readdirSync(imagesDir).filter(f => f.endsWith('.jpg')).slice(0, 3); // Upload 3 images
    addResult(`📁 Found ${imageFiles.length} test images`);

    if (imageFiles.length > 0) {
      const fileInputs = await page.locator('input[type="file"]').all();
      if (fileInputs.length > 0) {
        const imagePaths = imageFiles.map(f => path.join(imagesDir, f));
        await fileInputs[0].setInputFiles(imagePaths);
        addResult(`📤 Selected ${imageFiles.length} images`);
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-results/step-05-files-selected.png', fullPage: true });

        // Click upload button
        const uploadButton = page.locator('button:has-text("Feltöltés")');
        if (await uploadButton.count() > 0) {
          await uploadButton.click();
          addResult('🚀 Clicked upload button');

          // Wait for upload to complete (S3 upload + Lambda thumbnail)
          await page.waitForTimeout(15000);
          await page.screenshot({ path: 'test-results/step-12-upload-in-progress.png', fullPage: true });
        } else {
          addResult('❌ Upload button not found');
        }

        // Check for success messages or errors
        const successCount = await page.locator('text=/upload.*success/i').count();
        const errorCount = await page.locator('text=/error/i').count();
        addResult(successCount > 0 ? `✅ Upload appears successful` : `⚠️ No success indicator found`);
        if (errorCount > 0) addResult(`❌ Error indicators found: ${errorCount}`);
      } else {
        addResult('❌ No file input found on upload page');
      }
    }

    // 4. Verify Photos in Gallery
    addResult('\n=== STEP 4: VERIFY PHOTOS IN GALLERY ===');
    await page.goto(`${APP_URL}/`);
    await page.waitForTimeout(3000); // Let GraphQL fetch complete
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/step-12-gallery-after-upload.png', fullPage: true });

    const newPhotosCount = await page.locator('[class*="photo"], img[alt*="photo"], [data-testid*="photo"]').count();
    addResult(`📸 Photos after upload: ${newPhotosCount} (was ${photosCount})`);
    if (newPhotosCount > photosCount) {
      addResult(`✅ New photos appeared (+${newPhotosCount - photosCount})`);
    } else {
      addResult(`⚠️ Photo count did not increase - upload may have failed or delayed`);
    }

    // 5. Create Album
    addResult('\n=== STEP 5: CREATE ALBUM ===');
    await page.goto(`${APP_URL}/albums`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/step-12-albums-page.png', fullPage: true });

    const albumsCountBefore = await page.locator('a[href^="/albums/"]').count();
    addResult(`📁 Albums before: ${albumsCountBefore}`);

    const newAlbumButton = page.locator('button:has-text("Új album")');
    if (await newAlbumButton.count() > 0) {
      await newAlbumButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/step-12-album-modal-open.png', fullPage: true });

      const modalVisible = await page.locator('[role="dialog"], .modal, form input[id*="album"]').count() > 0;
      if (modalVisible) {
        addResult('✅ Album creation modal opened');

        // Fill album form
        const albumName = `Test Album ${Date.now()}`;
        const albumDesc = 'E2E test album created by Playwright';
        await page.locator('input[id*="album-name"], input[placeholder*="album"]').first().fill(albumName);
        await page.locator('textarea[id*="description"], textarea[placeholder*="leírás"]').first().fill(albumDesc);
        await page.screenshot({ path: 'test-results/step-12-album-form-filled.png', fullPage: true });

        // Submit
        const createButton = page.locator('button:has-text("Létrehozás"), button[type="submit"]').last();
        await createButton.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'test-results/step-12-album-created.png', fullPage: true });

        // Verify album appeared
        const albumsCountAfter = await page.locator('a[href^="/albums/"]').count();
        addResult(`📁 Albums after: ${albumsCountAfter}`);
        if (albumsCountAfter > albumsCountBefore) {
          addResult('✅ New album created successfully');
        } else {
          addResult('⚠️ Album count did not increase');
        }
      } else {
        addResult('❌ Album modal did not appear');
      }
    } else {
      addResult('❌ "Új album" button not found');
    }

    // 6. Check for removed features
    addResult('\n=== STEP 6: VERIFY REMOVED FEATURES ===');
    await page.goto(`${APP_URL}/`);
    await page.waitForLoadState('networkidle');

    const viberInFooter = await page.locator('footer:has-text("Viber Bot")').count();
    const shareInFooter = await page.locator('footer:has-text("Share Album")').count();
    const sharedRoute = await page.goto(`${APP_URL}/share/test-id`);

    addResult(viberInFooter === 0 ? '✅ Viber Bot removed from footer' : '❌ Viber Bot still in footer');
    addResult(shareInFooter === 0 ? '✅ Share Album removed from footer' : '❌ Share Album still in footer');
    addResult(sharedRoute?.status() === 404 ? '✅ /share route returns 404 (no public sharing)' : '⚠️ /share route still accessible');

    // 7. Album detail page (no share button)
    if (await page.locator('a[href^="/albums/"]').count() > 0) {
      addResult('\n=== STEP 7: ALBUM DETAIL PAGE ===');
      await page.goto(`${APP_URL}/albums`);
      await page.waitForLoadState('networkidle');
      await page.locator('a[href^="/albums/"]').first().click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/step-12-album-detail.png', fullPage: true });

      const shareButton = await page.locator('button:has-text("Megosztás")').count();
      addResult(shareButton === 0 ? '✅ Share button removed from album detail' : '❌ Share button still present');
    }

    // Final screenshot
    await page.screenshot({ path: 'test-results/step-99-final.png', fullPage: true });

    // Print summary
    console.log('\n\n=== FINAL TEST SUMMARY ===');
    testResults.forEach(r => console.log(r));
    console.log('\nScreenshots saved to test-results/');
  });
});
