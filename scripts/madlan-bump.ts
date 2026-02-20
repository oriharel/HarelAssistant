import { chromium } from 'playwright';

const MADLAN_EMAIL = process.env.MADLAN_EMAIL;
const MADLAN_PASSWORD = process.env.MADLAN_PASSWORD;
const LISTING_URL = 'https://www.madlan.co.il/listings/LlJXz8dq1w2';

if (!MADLAN_EMAIL || !MADLAN_PASSWORD) {
    console.error('Missing MADLAN_EMAIL or MADLAN_PASSWORD environment variables');
    process.exit(1);
}

async function bumpListing() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        locale: 'he-IL',
        userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    try {
        // Step 1: Go to Madlan and open login
        console.log('Navigating to Madlan...');
        await page.goto('https://www.madlan.co.il', { waitUntil: 'networkidle' });

        // Click login/personal area button
        console.log('Opening login...');
        const loginButton = page.locator('button:has-text("התחברות"), a:has-text("התחברות"), button:has-text("אזור אישי"), a:has-text("אזור אישי")').first();
        await loginButton.click();
        await page.waitForTimeout(2000);

        // Step 2: Switch to email login if needed (Madlan may show Google login first)
        const emailTab = page.locator('button:has-text("אימייל"), a:has-text("אימייל"), button:has-text("מייל"), span:has-text("אימייל")').first();
        if (await emailTab.isVisible({ timeout: 3000 }).catch(() => false)) {
            await emailTab.click();
            await page.waitForTimeout(1000);
        }

        // Step 3: Fill credentials
        console.log('Logging in...');
        const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="מייל"], input[placeholder*="email"]').first();
        await emailInput.fill(MADLAN_EMAIL);

        const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
        await passwordInput.fill(MADLAN_PASSWORD);

        // Click submit
        const submitButton = page.locator('button[type="submit"], button:has-text("התחבר"), button:has-text("כניסה")').first();
        await submitButton.click();
        await page.waitForTimeout(3000);

        // Step 4: Navigate to my listings
        console.log('Navigating to my listings...');
        await page.goto('https://www.madlan.co.il/my-listings', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // Step 5: Find and bump/refresh the listing
        console.log('Looking for listing to bump...');

        // Try clicking a refresh/bump/update button on the listing
        const bumpButton = page.locator(
            'button:has-text("הקפץ"), button:has-text("רענן"), button:has-text("עדכן"), ' +
            'a:has-text("הקפץ"), a:has-text("רענן"), a:has-text("עדכן")'
        ).first();

        if (await bumpButton.isVisible({ timeout: 5000 }).catch(() => false)) {
            console.log('Found bump button, clicking...');
            await bumpButton.click();
            await page.waitForTimeout(2000);

            // Confirm if there's a confirmation dialog
            const confirmButton = page.locator('button:has-text("אישור"), button:has-text("כן"), button:has-text("שמור")').first();
            if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
                await confirmButton.click();
                await page.waitForTimeout(2000);
            }

            console.log('Listing bumped successfully!');
        } else {
            // Fallback: open the listing edit page and save without changes (triggers refresh)
            console.log('No bump button found, trying edit-and-save approach...');

            const editButton = page.locator(
                'button:has-text("ערוך"), a:has-text("ערוך"), button:has-text("עריכה"), a:has-text("עריכה")'
            ).first();

            if (await editButton.isVisible({ timeout: 5000 }).catch(() => false)) {
                await editButton.click();
                await page.waitForTimeout(3000);

                // Click save to trigger a refresh
                const saveButton = page.locator('button:has-text("שמור"), button:has-text("פרסם"), button[type="submit"]').first();
                if (await saveButton.isVisible({ timeout: 5000 }).catch(() => false)) {
                    await saveButton.click();
                    await page.waitForTimeout(2000);
                    console.log('Listing saved (edit-and-save bump)!');
                } else {
                    console.log('Could not find save button');
                    await page.screenshot({ path: 'madlan-debug-edit.png' });
                }
            } else {
                console.log('Could not find edit or bump button');
                await page.screenshot({ path: 'madlan-debug-listings.png' });
            }
        }

        // Take a screenshot for verification
        await page.screenshot({ path: 'madlan-bump-result.png' });
        console.log('Screenshot saved to madlan-bump-result.png');

    } catch (error) {
        console.error('Error during bump:', error);
        await page.screenshot({ path: 'madlan-bump-error.png' }).catch(() => {});
        process.exit(1);
    } finally {
        await browser.close();
    }
}

bumpListing();
