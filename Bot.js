const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const axios = require('axios');

// Bot tokeni
const token = '6741471645:AAHd82r_aAwvHPFK8lDSZdd39KEGp55ZP18';
const bot = new TelegramBot(token, { polling: true });

// Kanallar ro‘yxati (foydalanuvchilar obuna bo‘lishi shart)
const requiredChannels = [
    '@your_channel_1',
    '@your_channel_2',
    '@your_channel_3'
];

// JSON fayldan kinolarni yuklash
function loadMovies() {
    return JSON.parse(fs.readFileSync('kinolar.json', 'utf8'));
}

// Foydalanuvchining kanallarga obuna bo‘lganligini tekshirish
async function isUserSubscribed(userId) {
    try {
        for (const channel of requiredChannels) {
            const response = await bot.getChatMember(channel, userId);
            if (response.status !== 'member' && response.status !== 'administrator' && response.status !== 'creator') {
                return false; // Agar foydalanuvchi kanallardan biriga a'zo bo'lmasa
            }
        }
        return true; // Hammasiga a'zo bo'lsa
    } catch (error) {
        return false; // Kanallar tekshirilayotganida xatolik bo'lsa
    }
}

// /start komandasiga javob
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const subscribed = await isUserSubscribed(userId);

    if (subscribed) {
        bot.sendMessage(chatId, "✅ Siz kanallarga obuna bo‘lgansiz! Kino kodini yuboring.");
    } else {
        let message = "❌ Kino kodlarini olish uchun quyidagi kanallarga obuna bo‘ling:\n";
        requiredChannels.forEach(channel => {
            message += `👉 ${channel}\n`;
        });
        bot.sendMessage(chatId, message);
    }
});

// Kino kodini tekshirish va javob qaytarish
bot.onText(/\/search (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const code = match[1].trim().toUpperCase();
    const movies = loadMovies();

    const movie = movies.find(m => m.code === code);
    if (movie) {
        bot.sendMessage(chatId, `🎬 Kino: ${movie.title}\n🔗 Link: ${movie.link}`);
    } else {
        bot.sendMessage(chatId, "❌ Kino topilmadi!");
    }
});
