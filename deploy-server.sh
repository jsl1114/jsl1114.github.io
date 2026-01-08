#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}Starting deployment...${NC}"

echo -e "${YELLOW}Pulling latest changes...${NC}"
git pull

echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

echo -e "${YELLOW}Building project...${NC}"
npm run build

echo -e "${YELLOW}Restarting PM2 process...${NC}"
pm2 restart jsl-express

echo -e "${GREEN}Deployment completed successfully!${NC}"
