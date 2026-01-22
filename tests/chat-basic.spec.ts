import { test, expect } from '@playwright/test';

// Basic tests to verify the chat refactor without complex authentication
test('should load dashboard page', async ({ page }) => {
  await page.goto('http://localhost:3000/dashboard');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Verify page loaded (basic check)
  expect(page.url()).toContain('dashboard');
});

test('should display chat interface without mode buttons', async ({ page }) => {
  await page.goto('http://localhost:3000/dashboard');
  await page.waitForLoadState('networkidle');
  
  // Skip this test if authentication is required (redirect to login)
  if (page.url().includes('login')) {
    test.skip('Authentication required for dashboard');
    return;
  }
  
  // Verify mode selection buttons are NOT present
  const onboardingButton = page.locator('button:has-text("Security Onboarding")');
  const policyButton = page.locator('button:has-text("Policy Search")');
  
  await expect(onboardingButton).not.toBeVisible();
  await expect(policyButton).not.toBeVisible();
});

test('should show updated placeholder text', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');
  
  // Skip this test if authentication is required
  if (page.url().includes('login')) {
    test.skip('Authentication required for dashboard');
    return;
  }
  
  // Look for the new placeholder text
  const chatInput = page.locator('input[placeholder*="Ask me about security policies"]');
  await expect(chatInput).toBeVisible({ timeout: 5000 });
});

test('should enable send button when typing', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');
  
  // Skip this test if authentication is required
  if (page.url().includes('login')) {
    test.skip('Authentication required for dashboard');
    return;
  }
  
  const chatInput = page.locator('input[placeholder*="Ask me about security policies"]');
  const sendButton = page.locator('button:has-text("Send")');
  
  // Initially disabled
  await expect(sendButton).toBeDisabled();
  
  // Type message
  await chatInput.fill('Test message');
  
  // Should now be enabled
  await expect(sendButton).toBeEnabled();
});

test('should show loading indicator when sending message', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');
  
  // Skip this test if authentication is required
  if (page.url().includes('login')) {
    test.skip('Authentication required for dashboard');
    return;
  }
  
  const chatInput = page.locator('input[placeholder*="Ask me about security policies"]');
  const sendButton = page.locator('button:has-text("Send")');
  
  // Type a test message
  await chatInput.fill('What are the security policies?');
  
  // Send the message
  await sendButton.click();
  
  // Verify loading state appears
  const loadingMessage = page.locator('text="AI is thinking..."');
  await expect(loadingMessage).toBeVisible({ timeout: 5000 });
  
  // Verify loading spinner is visible
  const loadingSpinner = page.locator('.animate-spin');
  await expect(loadingSpinner).toBeVisible();
  
  // Verify send button shows loading state
  await expect(sendButton).toHaveText('Sending...');
  await expect(sendButton).toBeDisabled();
  
  // Wait for response (with generous timeout for AI processing)
  await expect(loadingMessage).not.toBeVisible({ timeout: 30000 });
  
  // Verify send button returns to normal state
  await expect(sendButton).toHaveText('Send');
  await expect(sendButton).toBeDisabled(); // Should be disabled because input is empty
});

test('should show loading spinner animation', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');
  
  // Skip this test if authentication is required
  if (page.url().includes('login')) {
    test.skip('Authentication required for dashboard');
    return;
  }
  
  const chatInput = page.locator('input[placeholder*="Ask me about security policies"]');
  const sendButton = page.locator('button:has-text("Send")');
  
  // Type and send message
  await chatInput.fill('Test message for loading');
  await sendButton.click();
  
  // Wait for loading message to appear
  const loadingMessage = page.locator('text="AI is thinking..."');
  await expect(loadingMessage).toBeVisible({ timeout: 5000 });
  
  // Verify the loading message has proper styling
  const loadingCard = loadingMessage.locator('xpath=ancestor::div[contains(@class, "border-dashed")]').first();
  await expect(loadingCard).toBeVisible();
  
  // Verify multiple spinners are present (avatar + inline)
  const spinners = page.locator('.animate-spin');
  await expect(spinners).toHaveCount(2, { timeout: 5000 });
  
  // Wait for loading to complete
  await expect(loadingMessage).not.toBeVisible({ timeout: 30000 });
});