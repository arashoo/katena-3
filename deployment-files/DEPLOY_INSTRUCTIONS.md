# 🚀 KATENA 3 - CPANEL DEPLOYMENT PACKAGE

## 📦 WHAT'S INCLUDED

This deployment package contains everything you need to deploy Katena 3 to your cPanel hosting:

```
deployment-files/
├── server.js          ← Production server (handles API + serves frontend)
├── package.json       ← Node.js dependencies
├── dist/              ← Built React frontend application
│   ├── index.html
│   ├── vite.svg
│   └── assets/
│       ├── index-BoEfg3PD.css
│       └── index-CxE4EYii.js
└── data/              ← Your current inventory data
    ├── glasses.json   ← Your current glass inventory
    ├── backlog.json   ← Your current backlog items
    └── pendingOrders.json ← Your pending orders
```

## 🎯 DEPLOYMENT STEPS

### 1. Upload Files to cPanel

1. **Login to cPanel File Manager**
2. **Navigate to your domain folder** (usually `public_html` or your subdomain folder)
3. **Upload ALL files from the `deployment-files` folder**
   - Upload `server.js`
   - Upload `package.json`
   - Upload the entire `dist` folder
   - Upload the entire `data` folder

**IMPORTANT:** Upload directly to your domain root, NOT in a subfolder!

### 2. Set Up Node.js Application

1. **Find "Node.js Apps" or "Node.js Selector"** in your cPanel
2. **Click "Create Application"**
3. **Configure:**
   - **Application Root:** Your domain folder path
   - **Application URL:** Your domain (e.g., `staging.katena.ca`)
   - **Startup File:** `server.js`
   - **Node.js Version:** 14.x or higher
   - **Application Mode:** Production

### 3. Install Dependencies

1. **In the Node.js Apps interface, click "Run NPM Install"**
2. **Or use the terminal:**
   ```bash
   npm install
   ```

### 4. Set File Permissions ⚠️ CRITICAL

The `data` folder must be writable for the app to save changes:

1. **In File Manager, right-click the `data` folder**
2. **Select "Change Permissions"**
3. **Set to 755 or 775:**
   - Owner: Read, Write, Execute (7)
   - Group: Read, Execute (5)
   - World: Read, Execute (5)
4. **Apply to all files in folder**

**If data doesn't save, try 777 permissions temporarily.**

### 5. Start the Application

1. **Click "Restart" in the Node.js Apps interface**
2. **Visit your domain to see the app running!**

## 🧪 TESTING YOUR DEPLOYMENT

Once deployed, test these URLs:

- **Main App:** `https://yourdomain.com`
- **API Health Check:** `https://yourdomain.com/api/health`
- **Glasses Data:** `https://yourdomain.com/api/glasses`

## ✅ FEATURES INCLUDED

✅ **Complete Glass Inventory Management**
✅ **Reservation System with Project Tracking**
✅ **Backlog Management**
✅ **Pending Orders System**
✅ **Dashboard with Analytics**
✅ **Export/Import Functionality**
✅ **Real-time Data Persistence**
✅ **Responsive Design**
✅ **Production-Optimized Build**

## 🔧 WHAT THE SERVER DOES

- **Serves your React frontend** at the root domain
- **Provides API endpoints** at `/api/*` for all functionality
- **Stores data in JSON files** in the `data` folder
- **Handles reservations, backlog, and inventory** automatically
- **Serves static assets** (CSS, JS, images) efficiently

## 📞 SUPPORT

If you encounter issues:

1. **Check cPanel Error Logs** for detailed error messages
2. **Verify File Permissions** on the `data` folder
3. **Test API Endpoints** directly in your browser
4. **Check Node.js App Status** in cPanel

## 🎉 YOU'RE READY!

Your Katena 3 Glass Inventory Management System is ready for production use!

**Access your app at:** `https://yourdomain.com`

All your current inventory data, reservations, and backlog items are included and will be preserved.