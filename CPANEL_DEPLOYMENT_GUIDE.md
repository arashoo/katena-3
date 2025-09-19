# Katena 3 - cPanel Deployment Instructions

## Quick Setup Summary
1. Upload files to your cPanel hosting
2. Set up Node.js app in cPanel
3. Install dependencies and start the application

## Detailed Deployment Steps

### Step 1: Prepare Files for Upload
The following files need to be uploaded to your cPanel hosting:

**Required Files:**
- `server.js` (backend server)
- `production-package.json` (rename to `package.json` on server)
- `dist/` folder (contains built frontend)
- `backend/data/` folder (contains your data files)

### Step 2: Upload to cPanel File Manager

1. **Login to cPanel** and open **File Manager**
2. **Navigate** to your **subdomain folder** (for `staging.katena.ca`, look for a folder named `staging` or similar)
3. **Upload files directly to the subdomain root** (NOT in a subfolder)
4. **Upload the following structure:**
   ```
   staging.katena.ca/ (or staging/)
   ├── server.js
   ├── package.json (renamed from production-package.json)
   ├── dist/ (entire folder from your build)
   └── data/
       ├── glasses.json
       ├── backlog.json
       └── pendingOrders.json
   ```

**⚠️ IMPORTANT:** Upload directly to your subdomain folder, NOT inside a subfolder like `katena3`

### Step 3: Set Up Node.js Application in cPanel

1. **Find "Node.js" or "Node.js Selector"** in your cPanel
2. **Click "Create Application"**
3. **Configure the application:**
   - **Node.js Version:** Choose the latest available (14.x or higher)
   - **Application Mode:** Production
   - **Application Root:** `staging` (or whatever your subdomain folder is named)
   - **Application URL:** `staging.katena.ca`
   - **Application Startup File:** `server.js`

**⚠️ CRITICAL FOR SUBDOMAIN:** 
- Set **Application Root** to your subdomain folder name (usually `staging`)
- Set **Application URL** to `staging.katena.ca`
- Make sure the **Application Root** path points exactly to the folder containing your `package.json` file!

### Step 4: Install Dependencies

1. **Click on your Node.js application** in the list
2. **Click "Run NPM Install"** or use the terminal to run:
   ```bash
   npm install
   ```

### Step 5: Configure Environment (if needed)

If your hosting provider requires specific environment variables:
1. **Set NODE_ENV** to `production`
2. **Set PORT** to the port provided by your hosting (usually auto-configured)

### Step 6: Start the Application

1. **Click "Restart"** on your Node.js application
2. **Check the URL** provided by cPanel
3. **Test the application** by visiting your domain

## Important Notes

### Domain Configuration
- Your application will be accessible at: `https://staging.katena.ca`
- The API endpoints will be at: `https://staging.katena.ca/api/`

**No subfolders needed** - the app runs directly on your subdomain!

### File Permissions ⚠️ **CRITICAL FOR DATA PERSISTENCE**
Make sure the `data/` folder has write permissions so the application can save changes:

**Steps to Fix File Permissions:**
1. **Go to cPanel File Manager**
2. **Navigate to your subdomain folder** (`staging/`)
3. **Right-click on the `data` folder**
4. **Select "Change Permissions"**
5. **Set permissions to `755` or `775`**:
   - Owner: Read, Write, Execute (7)
   - Group: Read, Execute (5) 
   - World: Read, Execute (5)
6. **Apply to all files in the folder** (check "Recurse into subdirectories")

**Alternative Method:**
If the above doesn't work, try setting permissions to `777` (full access) temporarily to test:
- Owner: Read, Write, Execute (7)
- Group: Read, Write, Execute (7)
- World: Read, Write, Execute (7)

**⚠️ IMPORTANT:** Without proper write permissions, your changes won't be saved and will reset on refresh!

### Data Backup
Your inventory data is stored in JSON files in the `data/` folder. Regularly backup these files through cPanel File Manager.

### SSL Certificate
Enable SSL for your domain to ensure secure data transmission.

## Troubleshooting

### Common Issues:

#### 1. **"Need package.json" Error When Running NPM Install**
**Problem:** The Node.js Application Root doesn't point to the correct folder.

**Solutions:**
- **Check your folder structure:** Make sure `package.json` is in the same folder as `server.js`
- **Verify Application Root:** In cPanel Node.js, edit your app and check the "Application Root" path
- **For staging.katena.ca:** 
  - Set Application Root to `staging` (or your subdomain folder name)
  - Upload files directly to the subdomain folder, NOT in a subfolder

**File Structure Check for Subdomain:**
```
staging/ (your subdomain folder)
├── package.json ← Must be here!
├── server.js
├── dist/
└── data/
```

#### 2. **Data Not Persisting (Changes Reset on Refresh)**
**Problem:** File permissions prevent writing to JSON files OR path issues.

**Solutions:**

**STEP 1: Check File Permissions**
1. **Fix Data Folder Permissions:**
   - Go to cPanel File Manager
   - Navigate to your `staging/data/` folder
   - Right-click → Change Permissions
   - Set to `755` or `775` (or try `777` temporarily)
   - Apply to all files in folder

2. **Check Individual File Permissions:**
   - Set permissions for each JSON file:
     - `glasses.json` → 644 or 666
     - `backlog.json` → 644 or 666  
     - `pendingOrders.json` → 644 or 666

**STEP 2: Debug the Issue**
If permissions don't fix it, check these:

1. **Check Error Logs:**
   - Go to cPanel → Error Logs
   - Look for file writing errors
   - Node.js app logs might show permission denied errors

2. **Test API Directly:**
   - Visit: `https://staging.katena.ca/api/health`
   - Try: `https://staging.katena.ca/api/glasses` (should show current data)
   - Check browser console for API errors

3. **Verify File Paths:**
   - Make sure your folder structure is:
   ```
   staging/
   ├── server.js
   ├── package.json
   ├── dist/
   └── data/ ← Must be here, same level as server.js
       ├── glasses.json
       ├── backlog.json
       └── pendingOrders.json
   ```

4. **Check Node.js App Status:**
   - In cPanel Node.js section
   - Make sure app is "Running" 
   - Try restarting the app after permission changes

**STEP 3: Specific File Writing Test**
If you can see data at `/api/glasses` but changes don't persist:

1. **The app CAN read files** ✅
2. **The app CANNOT write files** ❌

**Advanced Permission Fix:**
1. **In cPanel File Manager**, navigate to `staging/data/`
2. **Select ALL JSON files** (glasses.json, backlog.json, pendingOrders.json)
3. **Right-click → Change Permissions**
4. **Set to 666 (rw-rw-rw-)**: 
   - Owner: Read, Write
   - Group: Read, Write
   - World: Read, Write
5. **Also check the data folder itself** - set to 777
6. **Check file ownership** - files should be owned by your cPanel user

**If that doesn't work, try this:**
1. **Delete the existing JSON files** in staging/data/
2. **Let the app recreate them** by adding new data
3. **New files will have correct permissions**

**Alternative: Manual File Recreation**
1. **Download current data** from `/api/glasses` (copy the JSON)
2. **Delete staging/data/glasses.json**
3. **Create new staging/data/glasses.json** via File Manager
4. **Paste the JSON data** and save
5. **Set permissions to 666**

**Test immediately after:**
- Add a glass item in your web app
- Check `/api/glasses` to see if it appears
- If it works, repeat for backlog.json and pendingOrders.json

**STEP 4: Specific Issue Debug**

**If Adding Works But Deleting Doesn't:**
This means basic file writing works, but there's an issue with the DELETE operation.

**Debug Steps:**
1. **Ignore browser security messages** (like TSS/domain protection - these are normal)

2. **Test DELETE specifically:**
   - Click delete on a glass item
   - Immediately check `/api/glasses` in a new tab
   - Is the item actually gone from the JSON?

3. **Check Network Tab:**
   - Open browser F12 → Network tab
   - Click delete on an item
   - Look for DELETE request to `/api/glasses/[ID]`
   - Check the response status (200 = success, 404 = not found, 500 = error)

4. **Manual DELETE Test:**
   ```javascript
   // In browser console, replace 'ACTUAL_GLASS_ID' with real ID from /api/glasses
   fetch('/api/glasses/ACTUAL_GLASS_ID', {method: 'DELETE'})
     .then(r => r.json())
     .then(console.log)
   ```

**Common Delete Issues:**
- **Item not found** (wrong ID sent)
- **Frontend not refreshing** after successful delete
- **DELETE request not being sent** at all
- **Backend error** during delete operation

**Quick Test:**
1. **Note a glass ID** from `/api/glasses`
2. **Click delete** on that specific item in your app
3. **Refresh** `/api/glasses` - is it gone?
4. **If YES** → Frontend refresh issue
5. **If NO** → Backend delete issue

#### 4. **Delete Buttons Don't Work (No DELETE Requests Sent)**
**Problem:** Delete buttons don't send DELETE requests to the API.

**Solution:** Upload updated files with debugging:
1. **Re-upload** the entire `dist/` folder from `deployment-files/dist/` to your server
2. **Restart** your Node.js app in cPanel  
3. **Test with console open** (F12):
   - Click delete on a glass item
   - Look for debug messages:
     - 🎯 Confirm delete called with: [glass object]
     - 🗑️ Attempting to delete glass with ID: [id]
     - ✅ Delete API call successful
   - Check Network tab for DELETE request

**If still no DELETE requests:**
- Make sure to click "Yes" or "Confirm" in the delete confirmation modal
- Check console for JavaScript errors
- Try manual delete test:
```javascript
fetch('/api/glasses/GLASS_ID', {method: 'DELETE'})
  .then(r => r.json()).then(console.log)
```

#### 5. **App won't start:** Check Node.js version compatibility
#### 3. **Cannot write data:** Check file permissions on data folder
#### 4. **API not working:** Verify the application URL and routing
#### 5. **White screen:** Check if dist folder uploaded correctly

### Log Files:
Check your cPanel error logs for detailed error messages if the application doesn't start.

## Support
If you encounter issues, check:
1. cPanel error logs
2. Node.js application logs
3. Browser developer console for frontend errors