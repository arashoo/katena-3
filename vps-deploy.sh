#!/bin/bash
# Katena 3 VPS Deployment Script
# Run this on your SSH VPS (203.161.44.83)

echo "🚀 Starting Katena 3 deployment on VPS..."

# Stop any existing processes
pm2 stop katena-backend katena-frontend 2>/dev/null || true
pm2 delete katena-backend katena-frontend 2>/dev/null || true

# Remove old installation
rm -rf katena-3

# Clone latest version
git clone https://github.com/arashoo/katena-3.git
cd katena-3

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Start backend
echo "🔧 Starting backend on port 3001..."
cd backend
pm2 start server.js --name "katena-backend"
cd ..

# Start frontend
echo "🌐 Starting frontend on port 5173..."
pm2 serve dist 5173 --name "katena-frontend" --spa

# Save PM2 processes
pm2 save

echo "✅ Deployment complete!"
echo ""
echo "🌐 Frontend URL: http://203.161.44.83:5173"
echo "🔧 Backend API: http://203.161.44.83:3001/api/health"
echo ""
echo "📊 Check status: pm2 status"
echo "📋 View logs: pm2 logs"