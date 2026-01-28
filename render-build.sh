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
echo "Verifying build output..."
if [ -d "client/dist" ]; then
    echo "SUCCESS: client/dist exists."
    ls -la client/dist
else
    echo "ERROR: client/dist NOT FOUND!"
    exit 1
fi
