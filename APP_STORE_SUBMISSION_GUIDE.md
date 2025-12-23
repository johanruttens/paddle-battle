# Paddle Battle - App Store Submission Guide

## Pre-Submission Checklist

### 1. Apple Developer Account
- [ ] Active Apple Developer Program membership ($99/year)
- [ ] App Store Connect access configured
- [ ] Signing certificates and provisioning profiles set up

### 2. App Configuration

Update `app.json` with production settings:
```json
{
  "expo": {
    "name": "Paddle Battle",
    "slug": "paddle-battle",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.paddlebattle.app",
      "buildNumber": "1",
      "supportsTablet": false,
      "requireFullScreen": true,
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
    }
  }
}
```

### 3. Required Assets

#### App Icon (1024x1024)
- [ ] Create `assets/app-icon.png` (1024x1024 pixels)
- [ ] PNG format, no transparency, no rounded corners
- [ ] Simple, recognizable design visible at small sizes

#### Screenshots (Required)
Minimum: One set of iPhone screenshots (6.9" or 6.5" display)

| Display Size | Dimensions | Required |
|--------------|------------|----------|
| 6.9" (iPhone 16 Pro Max) | 1320 x 2868 px | Either this |
| 6.5" (iPhone 11 Pro Max) | 1242 x 2688 px | Or this |

Recommended screenshots (3-10):
1. Main Menu - Shows game title and options
2. Gameplay - Ball in motion, scores visible
3. Level Select - Grid of 100 levels
4. Boss Battle - Special boss level
5. Statistics - Player stats and achievements

---

## Build & Submit Process

### Step 1: Create Production Build

```bash
# Install EAS CLI if not installed
npm install -g eas-cli

# Login to Expo account
eas login

# Configure EAS Build
eas build:configure

# Create production build for iOS
eas build --platform ios --profile production
```

### Step 2: Configure Fastlane (Optional but Recommended)

```bash
# Install fastlane
brew install fastlane

# Navigate to project
cd /path/to/PaddleBattle

# Update Appfile with your credentials
# Edit: fastlane/Appfile
```

Update `fastlane/Appfile`:
```ruby
app_identifier("com.paddlebattle.app")
apple_id("your-apple-id@example.com")
team_id("YOUR_TEAM_ID")
itc_team_id("YOUR_ITC_TEAM_ID")
```

### Step 3: Upload to App Store Connect

**Option A: Using EAS Submit**
```bash
eas submit --platform ios
```

**Option B: Using Fastlane**
```bash
cd fastlane
fastlane deliver
```

**Option C: Manual Upload**
1. Download the .ipa from EAS Build
2. Open Transporter app (from Mac App Store)
3. Drag and drop the .ipa file
4. Click "Deliver"

---

## App Store Connect Configuration

### App Information

| Field | Value |
|-------|-------|
| Name | Paddle Battle |
| Subtitle | Classic Pong Arcade Challenge |
| Primary Category | Games |
| Secondary Category | Entertainment |
| Subcategory | Arcade |
| Content Rating | 4+ |
| Price | Free |

### Privacy

| Question | Answer |
|----------|--------|
| Does this app collect user data? | No |
| Does this app track users? | No |
| Does this app use third-party analytics? | No |
| Privacy Policy URL | https://paddlebattle.app/privacy |

### Export Compliance

Add to `app.json`:
```json
"ios": {
  "infoPlist": {
    "ITSAppUsesNonExemptEncryption": false
  }
}
```

This app does NOT use encryption, so select "No" for export compliance.

---

## Screenshot Capture Guide

### Using Simulator (Recommended for Consistency)

```bash
# Boot iPhone 16 Pro Max simulator
xcrun simctl boot "iPhone 16 Pro Max"

# Set clean status bar
xcrun simctl status_bar booted override \
  --time "9:41" \
  --batteryState charged \
  --batteryLevel 100 \
  --cellularMode active \
  --cellularBars 4 \
  --wifiBars 3

# Run production build on simulator
# Navigate to each screen and capture:
xcrun simctl io booted screenshot ~/Desktop/screenshot_name.png
```

### Screenshot Checklist

1. **1_main_menu.png** - Main menu with PLAY button
2. **2_gameplay.png** - Active gameplay with ball in motion
3. **3_level_select.png** - Level selection grid
4. **4_boss_battle.png** - Boss level (25, 50, 75, or 100)
5. **5_statistics.png** - Stats screen with player data

---

## Files Ready for Submission

### Metadata (fastlane/metadata/en-US/)
- [x] name.txt - "Paddle Battle"
- [x] subtitle.txt - "Classic Pong Arcade Challenge"
- [x] description.txt - Full app description
- [x] keywords.txt - Search keywords (100 chars max)
- [x] promotional_text.txt - Updatable promo text
- [x] release_notes.txt - Version 1.0.0 notes
- [x] privacy_url.txt - Privacy policy link
- [x] support_url.txt - Support page link
- [x] marketing_url.txt - Marketing page link

### Review Information (fastlane/metadata/review_information/)
- [x] notes.txt - Instructions for App Review team
- [ ] first_name.txt - Update with your name
- [ ] last_name.txt - Update with your name
- [ ] email_address.txt - Update with your email
- [ ] phone_number.txt - Update with your phone

### Assets Needed
- [ ] App icon (1024x1024 PNG)
- [ ] Screenshots (1320x2868 or 1242x2688)
- [ ] Privacy Policy hosted at URL

---

## Common Rejection Reasons & Prevention

| Reason | Prevention |
|--------|------------|
| Incomplete metadata | Fill ALL required fields |
| Broken URLs | Test privacy_url and support_url before submission |
| Misleading screenshots | Only show actual app UI |
| Placeholder content | Remove any "lorem ipsum" or test data |
| Crashes on launch | Test thoroughly on physical device |
| Missing privacy policy | Host privacy policy at specified URL |

---

## Post-Submission

1. Monitor App Store Connect for review status
2. Respond promptly to any App Review questions
3. Typical review time: 24-48 hours
4. If rejected, read feedback carefully and resubmit

---

## Quick Reference Commands

```bash
# Build for production
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios

# Check build status
eas build:list

# View on App Store Connect
open "https://appstoreconnect.apple.com"
```

---

## Support

- Apple Developer Documentation: https://developer.apple.com/documentation/
- Expo EAS Documentation: https://docs.expo.dev/submit/introduction/
- Fastlane Documentation: https://docs.fastlane.tools/
