#!/bin/sh

echo "Installing npm packages..."
npm install
if [ $? -ne 0 ]; then
  echo "npm install failed"
  exit 1
fi

echo "Installing Prisma as a dev dependency..."
npm install prisma --save-dev
if [ $? -ne 0 ]; then
  echo "npm install prisma --save-dev failed"
  exit 1
fi

echo "Installing specific versions of Prisma client and Prisma..."
npm install @prisma/client@dev prisma@dev
if [ $? -ne 0 ]; then
  echo "npm install @prisma/client@dev prisma@dev failed"
  exit 1
fi

echo "Generating Prisma client..."
npx dotenv -e .env.develop -- npx prisma generate
if [ $? -ne 0 ]; then
  echo "npx prisma generate failed"
  exit 1
fi

echo "Running Python script..."
python3 ./layers/create_prisma_layer_from_generate.py .env.develop
if [ $? -ne 0 ]; then
  echo "Python script execution failed"
  exit 1
fi

echo "Bootstrapping CDK..."
cdk bootstrap
if [ $? -ne 0 ]; then
  echo "cdk bootstrap failed"
  exit 1
fi

echo "Synthesizing CDK stack..."
cdk synth
if [ $? -ne 0 ]; then
  echo "cdk synth failed"
  exit 1
fi

echo "Deploying CDK stack..."
cdk deploy
if [ $? -ne 0 ]; then
  echo "cdk deploy failed"
  exit 1
fi
