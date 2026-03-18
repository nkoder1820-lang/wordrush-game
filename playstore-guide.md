# WordRush Play Store Upload Guide

Follow these steps exactly to publish WordRush on the Google Play Store.

## Prerequisites
1. You have a Google Play Developer Account ($25 fee paid).
2. The EAS Production Build (AAB file) has finished successfully.

## 1. Create the App
1. Go to the [Google Play Console](https://play.google.com/console).
2. Click **Create app** (top right).
3. Fill in:
   - App name: **WordRush**
   - Default language: **English (United States)**
   - App or game: **Game**
   - Free or paid: **Free**
4. Check both declaration boxes and click **Create app**.

## 2. Store Listing Details
Go to **Store presence > Main store listing** on the left menu.
- **Short description**: `Test your English skills in 30 seconds! Unscramble words, fix spelling & more.`
- **Full description**: (Copy from `store-listing.md`)

*Note: You requested no image generation, so you will need to create your own App Icon (512x512) and Feature Graphic (1024x500) and 2-8 phone screenshots to upload here.*

## 3. App Content Setup
Go to **Policy > App content** and complete the declarations:
1. **Privacy Policy**: Enter the URL where you hosted `privacy-policy.html`.
2. **Ads**: Select "No, my app does not contain ads."
3. **App Access**: Select "All functionality is available without special access."
4. **Content Rating**: Fill out the questionnaire (Select Game, No violence, No restricted content). You will get an "Everyone" rating.
5. **Target Audience and Content**: Target ages 9-12, 13-15, 16-17, and 18 and over. Check "No" for "Could your store listing appeal to children unintentionally?".
6. **Financial Features**: "My app doesn't provide any financial features."
7. **Covid-19 Apps**: "My app is not a publicly available COVID-19 contact tracing or status app."
8. **Data Safety**:
   - Does your app collect or share any of the required user data types? **No**.
   - Save and submit.

## 4. Upload the AAB Code
1. Go to **Testing > Internal testing** or **Release > Production**.
2. Click **Create new release**.
3. Under "App bundles", click **Upload**.
4. Upload the `.aab` file provided by the Expo build link.
5. In release notes, enter `<en-US>Initial release of WordRush!</en-US>`.
6. Click **Save** and then **Review release**.

## 5. Rollout
Once all errors are cleared on the Review page, click **Start rollout to Production** (or Internal Testing). Google will review the app (usually takes 1-7 days for a new developer account) and then it will be live!
