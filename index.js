const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { exec } = require('child_process');
const fs = require('fs');
const util = require('util');
const path = require('path');

const execPromise = util.promisify(exec);

// Dosyaların barınacağı klasör yolu (/data)
const DOWNLOAD_DIR = path.join(__dirname, 'data');
const LOG_FILE = path.join(DOWNLOAD_DIR, 'logs.json'); // Log dosyasının yolu

if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

// LOG KAYDETME FONKSİYONU
function saveLog(phone, url, status, errorDetail = null) {
    try {
        let logs = [];
        // Eğer log dosyası varsa önce içindekileri oku
        if (fs.existsSync(LOG_FILE)) {
            const rawData = fs.readFileSync(LOG_FILE, 'utf8');
            if (rawData) {
                logs = JSON.parse(rawData);
            }
        }

        // Yeni log objesini oluştur
        const newLog = {
            tarih: new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }),
            numara: phone.replace('@c.us', ''), // Sadece numarayı al
            link: url,
            durum: status,
            hata: errorDetail
        };

        // Listeye ekle ve dosyaya geri yaz (JSON.stringify ile formatlı olarak)
        logs.push(newLog);
        fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 4));
    } catch (err) {
        console.error('Log yazılırken hata oluştu:', err);
    }
}

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/snap/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

const downloadQueue = []; 
let isProcessing = false; 

client.on('qr', (qr) => {
    console.log('\nBağlantı bekleniyor... Lütfen aşağıdaki QR kodu okut:\n');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('\nHarika! Sistem uyandı, YouTube (Music dahil) ve Instagram linklerini bekliyor...\n');
});

// KUYRUK İŞLEME FONKSİYONU
async function processQueue() {
    if (isProcessing || downloadQueue.length === 0) return;

    isProcessing = true;
    const task = downloadQueue.shift();
    const { message, url, fileName, platform, isAudio } = task;
    
    const filePath = path.join(DOWNLOAD_DIR, fileName);

    try {
        const typeText = isAudio ? 'ses (MP3)' : 'videosu';
        await message.reply(`Sıra size geldi! ${platform} ${typeText} indiriliyor... 🚀`);

        let command = '';
        if (isAudio) {
            // Sadece ses, kesinlikle MP3
            command = `yt-dlp -f "bestaudio" -x --audio-format mp3 -o "${filePath}" "${url}"`;
        } else {
            // WhatsApp'ın en sevdiği format: H264 codec ve MP4/M4A uyumu
            command = `yt-dlp -S "ext:mp4:m4a,vcodec:h264" --merge-output-format mp4 -o "${filePath}" "${url}"`;
        }
        
        await execPromise(command, { maxBuffer: 1024 * 1024 * 50 });

        if (fs.existsSync(filePath)) {
            await message.reply(`${isAudio ? 'Ses dosyası' : 'Video'} hazır, gönderiliyor...`);
            
            const media = MessageMedia.fromFilePath(filePath);
            await client.sendMessage(message.from, media);
            
            fs.unlinkSync(filePath);
            console.log(`${fileName} başarıyla gönderildi ve silindi.`);
            
            // BAŞARILI LOGU YAZDIR
            saveLog(message.from, url, 'Başarılı Gönderildi');
        } else {
            throw new Error(`Dosya indirilemedi veya ffmpeg birleştiremedi!`);
        }
    } catch (error) {
        // GERÇEK HATAYI YAKALAMA
        const realError = error.stderr ? error.stderr.toString() : error.message;
        console.error(`\n--- İŞLEM HATASI ---\n${realError}\n--------------------\n`);
        
        // Hatayı temizle ve kullanıcıya okunaklı şekilde gönder
        const shortError = realError.substring(0, 200);
        await message.reply(`❌ İşlem başarısız oldu!\n*Sebep:*\n_${shortError}_`);
        
        // HATA LOGU YAZDIR
        saveLog(message.from, url, 'Hata Oluştu', shortError.trim());

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath); 
    } finally {
        isProcessing = false;
        processQueue();
    }
}

client.on('message_create', async (message) => {
    if(message.body === '!ping') {
        await message.reply('pong! Pi 5 şu an hatta.');
        return;
    }
    if(message.body === '!restart') {
            // Sadece senin gönderdiğin mesajlarda çalışsın (Güvenlik için)
            if (message.fromMe) {
                await message.reply('🔄 Servis yeniden başlatılıyor... Lütfen 10-15 saniye bekleyin.');
                
                // Mesajın iletilmesi için çok kısa bir süre bekle, sonra servisi yeniden başlat
                setTimeout(() => {
                    execPromise('systemctl restart wp-biindir.service').catch(err => {
                        console.error('Restart başarısız:', err);
                    });
                }, 1000);
                
            } else {
                // Başkası denerse verilecek cevap (İstersen bu else kısmını silebilirsin)
                await message.reply('⛔ Bu komutu kullanma yetkiniz yok!');
            }
            return;
        }
    const textToParse = message.body.trim();
    let isAudio = textToParse.toLowerCase().startsWith('mp3 ');

    const ytRegex = /(?:https?:\/\/)?(?:www\.|music\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const igRegex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|reels|tv)\/([a-zA-Z0-9_-]+)/;

    const ytMatch = textToParse.match(ytRegex);
    const igMatch = textToParse.match(igRegex);

    let url = '';
    let fileName = '';
    let platform = '';

    if (ytMatch) {
        url = `https://www.youtube.com/watch?v=${ytMatch[1]}`;
        
        if (textToParse.includes('music.youtube.com')) {
            isAudio = true;
            platform = 'YouTube Music';
        } else {
            platform = 'YouTube';
        }
        fileName = `yt_${ytMatch[1]}.${isAudio ? 'mp3' : 'mp4'}`;
    } else if (igMatch) {
        url = `https://www.instagram.com/reel/${igMatch[1]}/`;
        platform = 'Instagram';
        fileName = `ig_${igMatch[1]}.${isAudio ? 'mp3' : 'mp4'}`;
    }

    if (url !== '') {
        downloadQueue.push({ message, url, fileName, platform, isAudio });

        if (isProcessing) {
            await message.reply(`Linkiniz sıraya alındı! Önünüzde bekleyen işlem sayısı: ${downloadQueue.length}`);
        }

        processQueue();
    }
});

client.initialize();