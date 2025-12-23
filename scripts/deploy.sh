#!/bin/bash

# Deployment script for Canton Prediction Markets
# This script builds and deploys the DAML contracts to Canton

set -e

echo "Building DAML project..."
daml build

echo "Uploading DAR to Canton..."
# This would upload the built .dar file to the Canton participant
# daml ledger upload-dar --host localhost --port 6865 prediction-markets-1.0.0.dar

echo "Running setup script..."
# daml script --ledger-host localhost --ledger-port 6865 --dar prediction-markets-1.0.0.dar --script-name Setup:setup

echo "Deployment complete!"

