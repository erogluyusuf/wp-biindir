#!/bin/bash

# Color definitions for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 WhatsApp Video Downloader (Pi 5) Auto-Installer${NC}"
echo "------------------------------------------------------------"

# 1. Check Root Privileges
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Error: Please run this script as root (sudo ./install.sh)${NC}"
  exit 1
fi

# Get current working directory
PROJECT_DIR=$(pwd)
echo -e "${YELLOW}Project directory set to: ${PROJECT_DIR}${NC}"

# 2. Update System Packages
echo -e "\n${YELLOW}[1/5] Updating system packages...${NC}"
apt update -y

# 3. Install Core Dependencies
echo -e "\n${YELLOW}[2/5] Installing core dependencies (Node.js, npm, ffmpeg, etc.)...${NC}"
apt install -y nodejs npm ffmpeg wget curl snapd

# 4. Install Chromium (Required for WhatsApp Web)
echo -e "\n${YELLOW}[3/5] Installing Chromium browser via snap...${NC}"
snap install chromium

# 5. Install the Latest yt-dlp (Directly from GitHub)
echo -e "\n${YELLOW}[4/5] Fetching the latest version of yt-dlp...${NC}"
wget -qO /usr/local/bin/yt-dlp https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp
chmod a+rx /usr/local/bin/yt-dlp

# 6. Install Node.js Packages
echo -e "\n${YELLOW}[5/5] Installing project libraries (npm install)...${NC}"
cd "$PROJECT_DIR" || exit
npm install

# 7. Create Systemd Background Service
echo -e "\n${YELLOW}⚙️  Creating Systemd background service...${NC}"

cat <<EOF > /etc/systemd/system/wp-biindir.service
[Unit]
Description=WhatsApp Video Downloader Bot
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/node $PROJECT_DIR/index.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable the service to start on boot
systemctl daemon-reload
systemctl enable wp-biindir.service

echo "------------------------------------------------------------"
echo -e "${GREEN}✅ Installation Completed Successfully!${NC}"
echo ""
echo -e "👉 ${YELLOW}IMPORTANT NOTE:${NC} If this is a fresh install, run the bot manually first to scan the QR code:"
echo -e "   ${GREEN}node index.js${NC}"
echo ""
echo -e "After scanning the QR code, stop the bot (CTRL+C) and start the service for 24/7 background operation:"
echo -e "   ${GREEN}systemctl start wp-biindir${NC}"
echo ""
echo -e "To watch the bot's live logs:"
echo -e "   ${GREEN}journalctl -u wp-biindir -f${NC}"
echo "------------------------------------------------------------"
