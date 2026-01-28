#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Python requirements
pip install -r requirements.txt

# Navigate to client and build React
echo "Building React Client..."
cd client
npm install
npm run build
cd ..

echo "Build Configuration Complete!"
