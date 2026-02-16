import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const API_URL = 'https://68cu0kah0h.execute-api.eu-central-1.amazonaws.com/prod';
const PASSWORD = 'k1cs1nyfalumban';

test.describe('Hirado Photo Upload System', () => {
  
  test('should show login page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Hiradó');
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should reject wrong password', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    page.on('dialog', dialog => dialog.accept());
    await page.click('button[type="submit"]');
    
    // Should still be on login page
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should login with correct password', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    
    // Should see upload interface
    await expect(page.locator('h1')).toContainText('Fotók és videók feltöltése');
    await expect(page.locator('.uppy-Dashboard')).toBeVisible();
  });

  test('should upload single image', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for Uppy to load
    await page.waitForSelector('.uppy-Dashboard-input');
    
    const imagePath = path.join(process.cwd(), 'images', '20251014_151145.jpg');
    
    // Upload file
    const fileInput = await page.locator('.uppy-Dashboard-input');
    await fileInput.setInputFiles(imagePath);
    
    // Wait for file to be added
    await page.waitForSelector('.uppy-Dashboard-Item', { timeout: 5000 });
    
    // Click upload button
    await page.click('.uppy-StatusBar-actionBtn--upload');
    
    // Wait for upload to complete
    await page.waitForSelector('.uppy-StatusBar-statusPrimary:has-text("Complete")', { timeout: 30000 });
    
    console.log('✅ Single image uploaded successfully');
  });

  test('should upload multiple images', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    
    await page.waitForSelector('.uppy-Dashboard-input');
    
    const images = [
      '20251014_151147.jpg',
      '20251014_151149.jpg',
      '20251014_151151.jpg',
    ];
    
    const imagePaths = images.map(img => path.join(process.cwd(), 'images', img));
    
    const fileInput = await page.locator('.uppy-Dashboard-input');
    await fileInput.setInputFiles(imagePaths);
    
    // Wait for all files to be added
    await page.waitForSelector('.uppy-Dashboard-Item', { timeout: 5000 });
    const fileCount = await page.locator('.uppy-Dashboard-Item').count();
    expect(fileCount).toBe(3);
    
    // Upload
    await page.click('.uppy-StatusBar-actionBtn--upload');
    await page.waitForSelector('.uppy-StatusBar-statusPrimary:has-text("Complete")', { timeout: 60000 });
    
    console.log('✅ Multiple images uploaded successfully');
  });

  test('stress test: upload 20 images', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    
    await page.waitForSelector('.uppy-Dashboard-input');
    
    // Get first 20 images from images folder
    const imagesDir = path.join(process.cwd(), 'images');
    const allImages = fs.readdirSync(imagesDir).filter(f => f.endsWith('.jpg')).slice(0, 20);
    const imagePaths = allImages.map(img => path.join(imagesDir, img));
    
    console.log(`Uploading ${imagePaths.length} images...`);
    
    const fileInput = await page.locator('.uppy-Dashboard-input');
    await fileInput.setInputFiles(imagePaths);
    
    // Wait for files
    await page.waitForSelector('.uppy-Dashboard-Item', { timeout: 10000 });
    const fileCount = await page.locator('.uppy-Dashboard-Item').count();
    console.log(`Files added: ${fileCount}`);
    
    // Upload
    await page.click('.uppy-StatusBar-actionBtn--upload');
    
    // Wait for completion (longer timeout for stress test)
    await page.waitForSelector('.uppy-StatusBar-statusPrimary:has-text("Complete")', { timeout: 180000 });
    
    console.log('✅ Stress test: 20 images uploaded successfully');
  });

  test('should verify API endpoint is accessible', async ({ request }) => {
    const response = await request.post(`${API_URL}/upload`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': PASSWORD,
      },
      data: {
        fileName: 'test.jpg',
        fileType: 'image/jpeg',
      },
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.url).toBeDefined();
    expect(data.key).toBeDefined();
    
    console.log('✅ API endpoint working correctly');
  });
});
