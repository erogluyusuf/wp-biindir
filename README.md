#  WhatsApp Video Downloader (Pi 5 Edition)

<img src="https://badges-jet.vercel.app/api/card?username=erogluyusuf&repo=wp-biindir&theme=dark&bg=0d1117&titleColor=58a6ff&textColor=8b949e&animate=true&qr=true&customBadges=OS:Ubuntu:E95420:ubuntu,Dev:Node.js:339933:nodedotjs,Core:Python:3776AB:python,Tool:yt-dlp:FF0000:youtube,Hardware:Pi5:C51A4A:raspberrypi" width="100%">

This is a high-performance WhatsApp bot specifically optimized for **Raspberry Pi 5**. It automatically detects YouTube and Instagram links in chats, processes them through the **Bagdeg API** infrastructure, and delivers playable media directly back to the user.

##  Features

* **Multi-Platform Support:** Works seamlessly with YouTube (Shorts/Videos) and Instagram (Reels/Posts).
* **Smart Queue Management:** Handles multiple requests using a specialized queue system to prevent CPU spikes on the Pi 5.
* **Bagdeg API Integration:** Optimized backend processing for media fetching and metadata handling.
* **Automated Conversion:** Uses `yt-dlp` and `ffmpeg` to ensure every video is 100% compatible with WhatsApp's native player.
* **Resource Efficient:** Low-idle power consumption with automated disk cleanup after each transmission.

##  Technical Stack

* **Hardware:** Raspberry Pi 5 (16GB)
* **OS:** Ubuntu 24.04 Server (ARM64)
* **Runtime:** Node.js v20+
* **Core Engines:** yt-dlp, ffmpeg, Chromium (Headless)
* **Library:** [whatsapp-web.js](https://github.com/pedrosnap/whatsapp-web.js)

##  Getting Started

###  Option 1: Smart Auto-Installation (Recommended)
You can set up the entire environment, install dependencies, and create a 24/7 background service with just one command:
```bash
git clone https://github.com/erogluyusuf/wp-biindir.git
cd wp-biindir
sudo chmod +x install.sh
sudo ./install.sh
```

###  Option 2: Manual Installation
If you prefer to set it up manually:
1. Clone the repo and run `npm install`.
2. Install system packages: `sudo apt install ffmpeg chromium-browser`
3. Install yt-dlp: `sudo wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp && sudo chmod a+rx /usr/local/bin/yt-dlp`
4. Run: `node index.js`

##  Usage
Once the bot is running and you have scanned the QR code with a WhatsApp account:

1. Simply send any **YouTube** (Video/Shorts) or **Instagram** (Reels/Post) link to the bot's WhatsApp number.
2. The bot will automatically detect the link, place it in the queue, download it, and reply with the playable `.mp4` video directly in the chat.
3. Type `!ping` to check if the Pi 5 is online.

##  Disclaimer
This bot is for personal and educational use. Using unofficial APIs with standard WhatsApp accounts may lead to temporary bans from WhatsApp. It is highly recommended to use a spare phone number for the bot.

##  Security & Privacy
This project is pre-configured with a `.gitignore` file. It strictly excludes:

* **node_modules/** (Dependency overhead)
* **.wwebjs_auth/** (Your private WhatsApp session keys)
* ***.mp4** (Temporary media files)

##  Developer
Developed with ❤️ by **[Yusuf Eroğlu](https://github.com/erogluyusuf)** *Software Developer | Network & System Administration Specialist*

---
*Powered by Bagdeg API Infrastructure*