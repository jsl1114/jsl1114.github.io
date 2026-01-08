#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

INCLUDE_FRONTEND=false

# Check for arguments
for arg in "$@"
do
    if [ "$arg" == "--include-frontend" ] || [ "$arg" == "-if" ]; then
        INCLUDE_FRONTEND=true
    else
        echo -e "${YELLOW}Error: Invalid argument '$arg'${NC}"
        echo "Usage: $0 [--include-frontend | -if]"
        exit 1
    fi
done

echo -e "${CYAN}Starting deployment...${NC}"

echo -e "${YELLOW}Pulling latest changes...${NC}"
git pull

if [ "$INCLUDE_FRONTEND" = true ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install

    echo -e "${YELLOW}Building project...${NC}"
    npm run build
else
    echo -e "${CYAN}Skipping frontend build (use --include-frontend or -if to include)...${NC}"
fi

echo -e "${YELLOW}Restarting PM2 process...${NC}"
pm2 restart jsl-express

echo -e "${GREEN}Deployment completed successfully!${NC}"
