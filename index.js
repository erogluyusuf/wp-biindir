const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { exec } = require('child_process');
const fs = require('fs');
const util = require('util');

// exec komutunu modern async/await yapısına uygun hale getiriyoruz
const execPromise = util.promisify(exec);

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/snap/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// KUYRUK SİSTEMİ DEĞİŞKENLERİ
const downloadQueue = []; // Gelen linklerin bekleyeceği sıra
let isProcessing = false; // Sistem şu an bir şey indiriyor mu?

client.on('qr', (qr) => {
    console.log('\nBağlantı bekleniyor... Lütfen aşağıdaki QR kodu okut:\n');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('\nHarika! Sistem uyandı, YouTube ve Instagram linklerini bekliyor...\n');
});

// KUYRUK İŞLEME FONKSİYONU
async function processQueue() {
    // Eğer zaten bir indirme işlemi sürüyorsa veya sıra boşsa fonksiyonu durdur
    if (isProcessing || downloadQueue.length === 0) return;

    isProcessing = true; // Meşgul moduna geç

    // Sıradaki ilk elemanı al (kuyruktan çıkar)
    const task = downloadQueue.shift();
    const { message, url, fileName, platform } = task;

    try {
        await message.reply(`Sıra size geldi! ${platform} videosu indiriliyor... 🚀`);

        const command = `yt-dlp -f "bestvideo[vcodec^=avc1][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" -o "${fileName}" "${url}"`;
        
        // exec komutunun bitmesini bekliyoruz
        await execPromise(command);

        if (fs.existsSync(fileName)) {
            await message.reply('Video hazır, gönderiliyor...');
            const media = MessageMedia.fromFilePath(fileName);
            await client.sendMessage(message.from, media);
            
            fs.unlinkSync(fileName);
            console.log(`${fileName} başarıyla gönderildi ve silindi.`);
        }
    } catch (error) {
        console.error(`İşlem hatası: ${error.message}`);
        await message.reply(`Maalesef ${platform} videosu indirilirken/gönderilirken bir hata oluştu.`);
        if (fs.existsSync(fileName)) fs.unlinkSync(fileName); // Hata olsa bile diski temizle
    } finally {
        isProcessing = false; // İşlem bitti, meşgul modundan çık
        processQueue(); // Sıradaki diğer işlem için fonksiyonu tekrar çağır
    }
}

client.on('message_create', async (message) => {
    if(message.body === '!ping') {
        await message.reply('pong! Pi 5 şu an hatta.');
        return;
    }

    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const igRegex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|reels|tv)\/([a-zA-Z0-9_-]+)/;

    const ytMatch = message.body.match(ytRegex);
    const igMatch = message.body.match(igRegex);

    let url = '';
    let fileName = '';
    let platform = '';

    if (ytMatch) {
        url = `https://www.youtube.com/watch?v=${ytMatch[1]}`;
        fileName = `yt_${ytMatch[1]}.mp4`;
        platform = 'YouTube';
    } else if (igMatch) {
        url = `https://www.instagram.com/reel/${igMatch[1]}/`;
        fileName = `ig_${igMatch[1]}.mp4`;
        platform = 'Instagram';
    }

    // Eğer geçerli bir link bulunduysa hemen sıraya ekle
    if (url !== '') {
        // İşlemi kuyruğa ekle
        downloadQueue.push({ message, url, fileName, platform });

        // Kullanıcıya kaçıncı sırada olduğunu bildir
        if (isProcessing) {
            await message.reply(`Linkiniz sıraya alındı! Önünüzde bekleyen işlem sayısı: ${downloadQueue.length}`);
        }

        // Kuyruğu çalışmayı dene (Eğer boşta ise hemen başlar, doluysa sırasını bekler)
        processQueue();
    }
});

client.initialize();