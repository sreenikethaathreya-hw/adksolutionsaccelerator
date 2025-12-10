#!/bin/bash

# HatchWorks AI Frontend - Automated Setup Script
# This script sets up the complete frontend development environment

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║       HatchWorks AI - Frontend Installation Script        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version $NODE_VERSION is too old${NC}"
    echo "Please upgrade to Node.js 18 or higher"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm $(npm -v) detected${NC}"
echo ""

# Create frontend directory if it doesn't exist
if [ ! -d "frontend" ]; then
    echo -e "${BLUE}📁 Creating frontend directory...${NC}"
    mkdir -p frontend
fi

cd frontend

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
echo "This may take a few minutes..."
echo ""

npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Dependencies installed successfully${NC}"
echo ""

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${BLUE}⚙️  Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}📝 Please update .env with your backend URL if needed${NC}"
else
    echo -e "${YELLOW}⚠️  .env file already exists, skipping...${NC}"
fi

echo ""

# Create public directory if it doesn't exist
if [ ! -d "public" ]; then
    echo -e "${BLUE}📁 Creating public directory...${NC}"
    mkdir -p public
fi

echo ""
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                 ✅ Installation Complete!                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${BLUE}📚 Next Steps:${NC}"
echo ""
echo "1. Update your .env file if needed:"
echo -e "   ${YELLOW}nano .env${NC}"
echo ""
echo "2. Start the development server:"
echo -e "   ${GREEN}npm run dev${NC}"
echo ""
echo "3. Open your browser to:"
echo -e "   ${GREEN}http://localhost:5173${NC}"
echo ""
echo "4. Make sure your ADK backend is running on:"
echo -e "   ${GREEN}http://localhost:8080${NC}"
echo ""
echo -e "${BLUE}📖 For more information, see:${NC}"
echo "   - QUICKSTART.md (Quick start guide)"
echo "   - ../FRONTEND_INTEGRATION_GUIDE.md (Complete integration guide)"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""
