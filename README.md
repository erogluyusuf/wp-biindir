#  WhatsApp Video Downloader (Pi 5 Edition)

<img src="https://badges-jet.vercel.app/api/card?username=erogluyusuf&repo=wp-biindir&theme=dark&bg=0d1117&titleColor=58a6ff&textColor=8b949e&animate=true&qr=true&customBadges=OS:Ubuntu:E95420:ubuntu,Dev:Node.js:339933:nodedotjs,Core:Python:3776AB:python,Tool:yt-dlp:FF0000:youtube,Hardware:Pi5:C51A4A:raspberrypi" width="100%">

This is a high-performance WhatsApp bot specifically optimized for **Raspberry Pi 5**. It automatically detects YouTube and Instagram links in chats, processes them through the **Bagdeg API** infrastructure, and delivers playable media directly back to the user.



##  Features

* **Multi-Platform Support:** Works seamlessly with YouTube (Shorts/Videos) and Instagram (Reels/Posts).
* **Smart Queue Management:** Handles multiple requests using a specialized queue system to prevent CPU spikes on the Pi 5.
* **Bagdeg API Integration:** Optimized backend processing for media fetching and metadata handling.
* **Automated Conversion:** Uses `yt-dlp` and `ffmpeg` to ensure every video is 100% compatible with WhatsApp's native player.
* **Resource Efficient:** Low-idle power consumption with automated disk cleanup after each transmission.

## 🛠️ Technical Stack

* **Hardware:** Raspberry Pi 5 (8GB)
* **OS:** Ubuntu 24.04 Server (ARM64)
* **Runtime:** Node.js v20+
* **Core Engines:** yt-dlp, ffmpeg, Chromium (Headless)
* **Library:** [whatsapp-web.js](https://github.com/pedrosnap/whatsapp-web.js)

##  Getting Started

### 1. Installation
Clone the repository and install the necessary Node.js packages:
```bash
git clone [https://github.com/erogluyusuf/wp-biindir.git](https://github.com/erogluyusuf/wp-biindir.git)
cd wp-biindir
npm install
```
### 2. System Dependencies
Ensure your Pi 5 has the latest media processing tools:

```bash
sudo apt update
sudo apt install ffmpeg chromium-browser
# Install latest yt-dlp
sudo wget [https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp](https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp) -O /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

### 3. Running the Bot
Start the service and scan the generated QR code with your WhatsApp:

```bash
node index.js
```
##  Security & Privacy
This project is pre-configured with a `.gitignore` file. It strictly excludes:

* **node_modules/** (Dependency overhead)
* **.wwebjs_auth/** (Your private WhatsApp session keys)
* ***.mp4** (Temporary media files)

##  Developer
Developed with ❤️ by **[Yusuf Eroğlu](https://github.com/erogluyusuf)** *Software Developer | Network & System Administration Specialist*

---
*Powered by Bagdeg API Infrastructure*