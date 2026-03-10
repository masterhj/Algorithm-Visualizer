#!/bin/bash

echo "Algorithm Visualizer - Quick Start Setup"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL is not installed or not in PATH"
    echo "Please install MySQL from https://dev.mysql.com/downloads/mysql/"
    echo ""
fi

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🔧 Configuration"
echo "================"
echo ""
echo "Please update .env file with your MySQL credentials:"
echo "  - MYSQL_HOST: localhost (or your MySQL host)"
echo "  - MYSQL_USER: root (or your MySQL user)"
echo "  - MYSQL_PASSWORD: your_password (your MySQL password)"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
PORT=3001
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=algorithm_visualizer
MYSQL_PORT=3306
NODE_ENV=development
EOF
    echo "✅ .env file created. Please edit it with your MySQL credentials."
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🚀 Ready to Start!"
echo "=================="
echo ""
echo "1. Ensure MySQL is running"
echo "2. Update .env with your MySQL credentials"
echo "3. Run: npm start (or npm run dev for development)"
echo "4. Open: http://localhost:3001 in your browser"
echo ""
echo "For detailed setup instructions, see SETUP_GUIDE.md"
