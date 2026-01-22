import { test, expect } from '@playwright/test';

// Test specifically for the loading indicator functionality
test('should show loading indicator when sending chat message', async ({ page }) => {
  // Navigate to the chat interface (main page)
  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');
  
  // Wait for the chat interface to load
  await page.waitForTimeout(2000); // Wait for React hydration
  const chatInput = page.locator('input[type="text"]').first();
  await expect(chatInput).toBeVisible({ timeout: 15000 });
  
  const sendButton = page.getByRole('button', { name: 'Send' });
  
  // Type a test message
  await chatInput.fill('Test message for loading indicator');
  
  // Wait for send button to be enabled
  await expect(sendButton).toBeVisible({ timeout: 5000 });
  await expect(sendButton).toBeEnabled();
  
  // Click send button to trigger loading
  await sendButton.click();
  
  // Verify loading message appears
  const loadingMessage = page.locator('text="AI is thinking..."');
  await expect(loadingMessage).toBeVisible({ timeout: 5000 });
  
  // Verify loading spinner is present
  const loadingSpinner = page.locator('.animate-spin');
  await expect(loadingSpinner.first()).toBeVisible();
  
  // Verify send button shows loading state
  await expect(sendButton).toHaveText('Sending...');
  await expect(sendButton).toBeDisabled();
  
  // Verify input is disabled during loading
  await expect(chatInput).toBeDisabled();
  
  // Wait for AI response (with timeout for processing)
  await expect(loadingMessage).not.toBeVisible({ timeout: 30000 });
  
  // Verify UI returns to normal state after response
  await expect(sendButton).toHaveText('Send');
  await expect(chatInput).toBeEnabled();
  await expect(chatInput).toHaveValue(''); // Should be cleared after sending
});

test('should display loading spinner with proper styling', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');
  
  // Wait for interface and send a message
  await page.waitForTimeout(2000); // Wait for React hydration
  const chatInput = page.locator('input[type="text"]').first();
  await expect(chatInput).toBeVisible({ timeout: 15000 });
  
  await chatInput.fill('Testing spinner animation');
  const sendButton = page.getByRole('button', { name: 'Send' });
  await expect(sendButton).toBeEnabled();
  await sendButton.click();
  
  // Verify loading message container has dashed border styling
  const loadingMessage = page.locator('text="AI is thinking..."');
  await expect(loadingMessage).toBeVisible({ timeout: 5000 });
  
  // Check for dashed border styling on the loading message card
  const loadingCard = loadingMessage.locator('xpath=ancestor::div[contains(@class, "border-dashed")]');
  await expect(loadingCard).toBeVisible();
  
  // Verify there are multiple spinner elements (avatar + inline)
  const spinners = page.locator('.animate-spin');
  await expect(spinners).toHaveCountGreaterThan(0);
  
  // Wait for completion
  await expect(loadingMessage).not.toBeVisible({ timeout: 30000 });
});