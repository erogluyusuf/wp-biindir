#!/bin/bash

# Color definitions
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}============================================================${NC}"
echo -e "${GREEN}🚀 WhatsApp Video Downloader (Pi 5) Smart Auto-Installer${NC}"
echo -e "${CYAN}============================================================${NC}"

# 1. Root Check
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Error: Please run this script as root (sudo ./install.sh)${NC}"
  exit 1
fi

PROJECT_DIR=$(pwd)
echo -e "${YELLOW}📂 Project directory:${NC} ${PROJECT_DIR}\n"

echo -e "${CYAN}[1/6] Updating package lists...${NC}"
apt update -qq

# Helper function to check and install apt packages
install_if_missing() {
    PACKAGE=$1
    if ! dpkg -s "$PACKAGE" >/dev/null 2>&1; then
        echo -e "${YELLOW}➔ Installing $PACKAGE...${NC}"
        apt install -y "$PACKAGE" >/dev/null
    else
        echo -e "${GREEN}✔ $PACKAGE is already installed. Skipping.${NC}"
    fi
}

# 2. Check and Install Core Dependencies
echo -e "\n${CYAN}[2/6] Checking core dependencies...${NC}"
install_if_missing "ffmpeg"
install_if_missing "wget"
install_if_missing "curl"
install_if_missing "snapd"

# Special check for Node.js and npm to avoid conflicts
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}➔ Installing Node.js...${NC}"
    apt install -y nodejs
else
    echo -e "${GREEN}✔ Node.js is already installed ($(node -v)). Skipping.${NC}"
fi

if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}➔ Installing npm...${NC}"
    apt install -y npm >/dev/null 2>&1 || echo -e "${RED}Note: npm might be bundled with Node.js. Moving on.${NC}"
else
    echo -e "${GREEN}✔ npm is already installed ($(npm -v)). Skipping.${NC}"
fi

# 3. Check and Install Chromium via Snap
echo -e "\n${CYAN}[3/6] Checking Chromium browser...${NC}"
if ! snap list chromium &> /dev/null; then
    echo -e "${YELLOW}➔ Installing Chromium via snap...${NC}"
    snap install chromium
else
    echo -e "${GREEN}✔ Chromium is already installed via snap. Skipping.${NC}"
fi

# 4. Check and Install yt-dlp
echo -e "\n${CYAN}[4/6] Checking yt-dlp...${NC}"
if ! command -v yt-dlp &> /dev/null; then
    echo -e "${YELLOW}➔ Fetching the latest yt-dlp...${NC}"
    wget -qO /usr/local/bin/yt-dlp https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp
    chmod a+rx /usr/local/bin/yt-dlp
else
    echo -e "${GREEN}✔ yt-dlp is already installed. Forcing a self-update just in case...${NC}"
    yt-dlp -U >/dev/null 2>&1
fi

# 5. Install Node Dependencies
echo -e "\n${CYAN}[5/6] Checking project Node.js libraries...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}➔ Running npm install...${NC}"
    npm install --silent
else
    echo -e "${GREEN}✔ node_modules folder exists. Updating packages just in case...${NC}"
    npm update --silent
fi

# 6. Systemd Service Setup
echo -e "\n${CYAN}[6/6] Configuring Systemd background service...${NC}"

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

systemctl daemon-reload
systemctl enable wp-biindir.service >/dev/null 2>&1
systemctl restart wp-biindir.service

echo -e "\n${CYAN}============================================================${NC}"
echo -e "${GREEN}✅ Installation & Setup Completed Successfully!${NC}"
echo -e "${CYAN}============================================================${NC}"
echo -e "The bot service has been started automatically."
echo -e "Here is the latest status from the background service logs:\n"

# En son journalctl loglarını ekrana basar ve scripti bitirir (kapatmadan önce 15 satır)
journalctl -u wp-biindir.service -n 15 --no-pager

echo -e "\n${YELLOW}To view live logs at any time, run: ${NC}journalctl -u wp-biindir -f"