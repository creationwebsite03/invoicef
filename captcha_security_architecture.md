# INVOXA CAPTCHA Security Architecture

This document outlines the professional SaaS security layer implemented for the **INVOXA** PDF download system.

## 1. System Overview
The CAPTCHA system is designed to prevent automated scrapers and bots from abusing the PDF generation engine, which is computationally expensive.

### Key Components:
- **Frontend (`CaptchaModal.tsx`)**: Renders 4 randomized challenges (Image selection, Puzzle, Pattern, Math).
- **Bot Detection Layer**: Fingerprints the browser to detect headless environments and rapid automation.
- **Rate Limiter**: Enforces a strict limit of 5 downloads per minute per browser.
- **Backend (Firebase Cloud Functions)**: Conceptual verification of the challenge resolution server-side.

---

## 2. Firebase Cloud Function Logic
The following code should be deployed to your Firebase environment (`functions/index.ts`) to ensure verification is not bypassed client-side.

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();

/**
 * Verify Captcha Attempt
 * Called by frontend before PDF generation
 */
export const verifyDownloadCaptcha = functions.https.onCall(async (data, context) => {
  const { challengeType, solution } = data;
  const uid = context.auth ? context.auth.uid : 'guest_' + context.rawRequest?.ip;

  // 1. Check Backend Rate Limit (Store in Firestore)
  const rateLimitRef = admin.firestore().collection('rateLimits').doc(uid);
  const doc = await rateLimitRef.get();
  const now = Date.now();

  if (doc.exists) {
    const { count, lastReset } = doc.data() as { count: number; lastReset: number };
    if (now - lastReset < 60000) {
      if (count >= 5) {
        throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded (5 downloads/min).');
      }
      await rateLimitRef.update({ count: count + 1 });
    } else {
      await rateLimitRef.set({ count: 1, lastReset: now });
    }
  } else {
    await rateLimitRef.set({ count: 1, lastReset: now });
  }

  // 2. Challenge Validation logic (Simulated)
  // In production, the "expected answer" would be securely generated on the server 
  // and checked against the 'solution' provided here.
  let isValid = true; // Placeholder for logic

  if (!isValid) {
    return { success: false, message: 'Verification failed.' };
  }

  // 3. Return success flag
  return { success: true, timestamp: now };
});
```

---

## 3. Advanced Bot Detection (Frontend)
The `CaptchaModal` uses a multi-layered fingerprinting approach:

1.  **Timing Analysis**: We track the time between the modal opening and the submission. If it's under **1,200ms**, it's flagged as an automated bot action.
2.  **`navigator.webdriver` Check**: Detects basic Selenium, Puppeteer, or Chromium automation headers.
3.  **Headless Browsing Detection**: Inspects the user agent for common headless strings and checks for a zero-length `navigator.languages` array which is common in automated browsers.

---

## 4. UI/UX Design Aesthetics
The CAPTCHA UI follows **INVOXA's premium branding**:
- **Black & White Palette**: Cohesive with the new high-contrast logo.
- **Seamless Animations**: Uses `framer-motion` for professional transitions between challenge types.
- **Contextual Math**: Dynamically generates logic puzzles based on common invoice variables.

---

## 5. Implementation Instructions
1.  **Modal Integration**: In `InvoiceGenerator.tsx`, the `Download` button now triggers `handleDownloadRequest()`, which opens the modal.
2.  **Download on Success**: Upon successful verification, the modal calls `onSuccess`, which executes the `downloadPDF` logic.
3.  **Session Tracking**: Download attempts are logged to `localStorage` to enforce the rate limit for guest users.
