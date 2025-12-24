# Google OAuth Scopes Configuration

## Issue
Google verification shows: "The scopes shown on your app's OAuth consent screen are different from the scopes configured for your app."

## Required Scopes

Your application requests these **exact scopes** (found in `backend/app/services/gmail_service.py`):

1. **openid**
2. **https://www.googleapis.com/auth/userinfo.email**
3. **https://www.googleapis.com/auth/gmail.readonly**
4. **https://www.googleapis.com/auth/gmail.send**

## How to Fix in Google Cloud Console

### Step 1: Go to OAuth Consent Screen
1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to: **APIs & Services** → **OAuth consent screen**

### Step 2: Configure Scopes
1. Click **"EDIT APP"** button
2. Scroll down and click **"ADD OR REMOVE SCOPES"**
3. In the scopes selection dialog:

   **Filter for and select these scopes:**

   ✅ **openid** (should be automatically included)

   ✅ **userinfo.email** - "See your primary Google Account email address"
      - Filter: Search for "userinfo.email"
      - Full scope: `https://www.googleapis.com/auth/userinfo.email`

   ✅ **gmail.readonly** - "Read all resources and their metadata—no write operations"
      - Filter: Search for "gmail.readonly"
      - Full scope: `https://www.googleapis.com/auth/gmail.readonly`

   ✅ **gmail.send** - "Send email on your behalf"
      - Filter: Search for "gmail.send"
      - Full scope: `https://www.googleapis.com/auth/gmail.send`

4. Click **"UPDATE"** at the bottom
5. Click **"SAVE AND CONTINUE"**

### Step 3: Verify Scopes Match

After saving, verify that the OAuth consent screen shows exactly these 4 scopes:
- openid
- .../auth/userinfo.email
- .../auth/gmail.readonly
- .../auth/gmail.send

**IMPORTANT:** Remove any other scopes that are not in this list!

## Common Issues

### Too Many Scopes
If you have additional scopes configured (e.g., `gmail.modify`, `gmail.compose`, etc.), **remove them**. Only the 4 scopes listed above should be configured.

### Wrong Scope Variations
Make sure you're using:
- ✅ `gmail.readonly` (NOT `gmail.read` or `gmail.metadata`)
- ✅ `gmail.send` (NOT `gmail.insert` or `gmail.compose`)

### Scope Not Found
If you can't find a scope:
1. Make sure you've enabled the **Gmail API** in APIs & Services → Library
2. Search using the shorter name (e.g., "gmail.send" instead of the full URL)
3. The full URL format is: `https://www.googleapis.com/auth/[scope-name]`

## Verification

After making changes:
1. Save the OAuth consent screen configuration
2. Test the OAuth flow by logging in to your app
3. The consent screen should show exactly these permissions:
   - Know who you are on Google
   - See your primary Google Account email address
   - Read all resources and their metadata—no write operations (Gmail)
   - Send email on your behalf

## Why These Scopes?

- **openid + userinfo.email**: User authentication and identification
- **gmail.readonly**: Read emails to scan for broker communications
- **gmail.send**: Send deletion requests via Gmail on user's behalf

## Related Files

- Scope definitions: `backend/app/services/gmail_service.py` (line 16-21)
- OAuth flow: `backend/app/api/auth.py`
