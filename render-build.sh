#!/usr/bin/env bash
# Render Build Script for Voice Shopping Assistant
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "========================================="
echo "Starting Build Process"
echo "========================================="

# Display environment info
echo "Current directory: $(pwd)"
echo "Python version: $(python --version)"
echo "Node version: $(node --version 2>&1 || echo 'Node not found')"
echo "npm version: $(npm --version 2>&1 || echo 'npm not found')"

# Install Python dependencies
echo ""
echo "========================================="
echo "Installing Python Dependencies"
echo "========================================="
pip install --upgrade pip
pip install -r requirements.txt

# Navigate to client directory and build React app
echo ""
echo "========================================="
echo "Building React Frontend"
echo "========================================="

if [ ! -d "client" ]; then
    echo "ERROR: client directory not found!"
    exit 1
fi

cd client

# Clean any previous builds
echo "Cleaning previous builds..."
rm -rf dist node_modules/.vite

# Install Node dependencies
echo "Installing Node dependencies..."
npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Build the React app
echo "Building React app with Vite..."
npm run build

# Return to root directory
cd ..

# Verify the build output
echo ""
echo "========================================="
echo "Verifying Build Output"
echo "========================================="

if [ -d "client/dist" ]; then
    echo "✅ SUCCESS: client/dist directory exists"
    echo ""
    echo "Contents of client/dist:"
    ls -lah client/dist
    echo ""
    
    if [ -f "client/dist/index.html" ]; then
        echo "✅ SUCCESS: index.html found"
        echo "File size: $(wc -c < client/dist/index.html) bytes"
    else
        echo "❌ ERROR: index.html NOT FOUND in client/dist!"
        exit 1
    fi
    
    if [ -d "client/dist/assets" ]; then
        echo "✅ SUCCESS: assets directory found"
        echo "Assets count: $(ls -1 client/dist/assets | wc -l)"
    else
        echo "⚠️  WARNING: assets directory not found"
    fi
else
    echo "❌ ERROR: client/dist directory NOT FOUND!"
    echo "Build failed - React app was not compiled"
    exit 1
fi

echo ""
echo "========================================="
echo "Build Complete Successfully!"
echo "========================================="
