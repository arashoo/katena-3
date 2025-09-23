# Katena 3 - 503 Error Troubleshooting Guide

## 🚨 Current Issue: 503 Service Unavailable

Based on network analysis, the Node.js app is not starting properly in cPanel.

## 🔍 Step-by-Step Debugging Process

### Step 1: Check Node.js App Status
1. Login to **cPanel**
2. Go to **"Node.js Apps"** or **"Node.js Selector"**
3. Look for your Katena 3 app
4. **Status should say "Running"** - if it says "Stopped" or "Error", that's the problem

### Step 2: Check App Configuration
Verify these settings in cPanel Node.js Apps:
- **App Root Directory**: `/staging.katena.ca/Katena/` (or wherever you extracted)
- **Startup File**: `server.js`
- **Node.js Version**: 16.x or 18.x (recommended)

### Step 3: Install Dependencies
In cPanel File Manager or Terminal:
```bash
cd /staging.katena.ca/Katena/
npm install
```
**Wait for this to complete** - it may take 2-3 minutes.

### Step 4: Check Error Logs
In cPanel:
- Go to **"Error Logs"** 
- Look for Node.js related errors
- Common errors:
  ```
  Error: Cannot find module 'express'
  Error: listen EADDRINUSE
  SyntaxError: Unexpected token
  ```

### Step 5: Test with Debug Server
If main server fails, try the debug version:
1. In cPanel Node.js Apps, change **Startup File** to: `server-debug.js`
2. Click **"Restart"**
3. Test: `https://staging.katena.ca/health`

### Step 6: Manual Debug
In cPanel Terminal:
```bash
cd /staging.katena.ca/Katena/
node server-debug.js
```
This will show you exact error messages.

## 🎯 Most Common Fixes

### Fix 1: Missing Dependencies
```bash
npm install express cors fs-extra uuid
```

### Fix 2: Wrong Node.js Version
- Change to Node.js 16.x or 18.x in cPanel
- Avoid very old (12.x) or very new (20.x) versions

### Fix 3: Port Issues
- cPanel assigns ports automatically
- Make sure your server uses `process.env.PORT`

### Fix 4: File Permissions
```bash
chmod 644 server.js
chmod 644 package.json
```

## 📞 What to Report to Support

If issues persist, provide hosting support with:
1. **Error logs** from cPanel Error Logs section
2. **Node.js version** being used
3. **App configuration** screenshot
4. **Output** from `node server-debug.js` command

## 🚀 Quick Test Commands

Test these URLs to isolate the issue:
- `https://staging.katena.ca/health` (should return JSON)
- `https://staging.katena.ca/api/health` (API endpoint test)
- `https://staging.katena.ca/` (full app)

## 📁 File Structure Verification

Your extracted files should look like:
```
/staging.katena.ca/Katena/
├── server.js                 ← Main server
├── server-debug.js           ← Debug server
├── package.json              ← Dependencies
├── package-minimal.json      ← Fallback deps
├── dist/                     ← React app
│   ├── index.html
│   └── assets/
└── data/                     ← JSON data
    ├── glasses.json
    ├── backlog.json
    └── pendingOrders.json
```

Good luck! The debug server should help identify the exact issue.