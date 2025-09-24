# Katena 3 - cPanel Deployment Troubleshooting Guide

## 🚨 Error 503 Service Unavailable - Solutions

### **Step 1: Check Node.js Version**
```bash
node --version
npm --version
```
- **Required**: Node.js 14+ 
- **If outdated**: Contact your hosting provider to update Node.js

### **Step 2: Install Dependencies**
```bash
cd backend
npm install
```
- Make sure all packages install without errors
- Check for any permission issues

### **Step 3: Test Server Startup**
```bash
cd backend
node server-debug.js
```
- This will show detailed startup logs
- Look for error messages

### **Step 4: Common cPanel Issues & Fixes**

#### **A. Port Configuration**
Most shared hosting doesn't allow custom ports. Update your server to use environment variables:

**In your server.js, change:**
```javascript
const PORT = process.env.PORT || 3001;
```

**To:**
```javascript
const PORT = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3001;
```

#### **B. File Permissions**
```bash
chmod 755 backend/
chmod 644 backend/*.js
chmod 644 backend/*.json
chmod -R 644 backend/data/
```

#### **C. Memory Limits**
Add to your server.js:
```javascript
// Increase memory limit for large data files
process.env.NODE_OPTIONS = '--max-old-space-size=512';
```

### **Step 5: Alternative Startup Methods**

#### **Method 1: Direct Node**
```bash
cd backend
node server.js
```

#### **Method 2: PM2 (if available)**
```bash
npm install -g pm2
cd backend
pm2 start server.js --name "katena-backend"
pm2 startup
pm2 save
```

#### **Method 3: Forever (if available)**
```bash
npm install -g forever
cd backend
forever start server.js
```

### **Step 6: Check Logs**

#### **cPanel Error Logs**
- Go to cPanel → Error Logs
- Look for Node.js related errors

#### **Application Logs**
```bash
cd backend
node server-debug.js > app.log 2>&1 &
tail -f app.log
```

### **Step 7: Test API Endpoints**

Once server is running, test these URLs:
- `http://yourdomain.com:3001/api/health` (if custom port allowed)
- `http://yourdomain.com/api/health` (if using standard port)

Expected response:
```json
{
  "status": "ok",
  "message": "Katena Backend API is running",
  "version": "1.02"
}
```

### **Step 8: Frontend Configuration**

If backend is running but frontend can't connect, check `apiService.js`:

```javascript
// Make sure the API base URL matches your setup
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
```

### **Step 9: Shared Hosting Specific**

#### **A. Subdomain Setup**
- Create a subdomain for the API (e.g., api.yourdomain.com)
- Point it to the backend folder
- Update frontend to use the subdomain

#### **B. .htaccess Configuration**
Create `.htaccess` in your backend folder:
```apache
RewriteEngine On
RewriteRule ^api/(.*)$ server.js [L]
```

### **Step 10: Contact Hosting Support**

If nothing works, contact your hosting provider and ask:
1. "Do you support Node.js applications?"
2. "What Node.js version is available?"
3. "Can I run Node.js servers on custom ports?"
4. "How do I deploy a Node.js API on your platform?"

### **Quick Diagnostic Commands**

Run these in your backend folder to diagnose:
```bash
# Check if files exist
ls -la
cat package.json

# Check Node.js
which node
node --version

# Test server
node -e "console.log('Node.js is working')"

# Check dependencies
npm list

# Test file permissions
ls -la data/
```

### **Emergency Fallback**

If you can't get the Node.js server running, you can:
1. Use the frontend without backend (static mode)
2. Set up a simple PHP API instead
3. Use a free service like Heroku for the backend

Need more help? Check the server logs and provide the error messages for specific troubleshooting.