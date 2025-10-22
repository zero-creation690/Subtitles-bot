const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

// Initialize bot with your Telegram Bot Token
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN';
const API_BASE_URL = 'https://subtitlesapibzeroo.venurasandeepa22.workers.dev';

const bot = new Telegraf(BOT_TOKEN);

// Store user sessions
const userSessions = new Map();

// Store user first visit and last image index
const userVisits = new Map();

// Helper function to get greeting based on server time + timezone offset
function getGreeting() {
  const now = new Date();
  const timezoneOffset = 5.5;
  const localTime = new Date(now.getTime() + (timezoneOffset * 60 * 60 * 1000));
  const hour = localTime.getUTCHours();
  
  if (hour >= 5 && hour < 12) return 'ɢᴏᴏᴅ ᴍᴏʀɴɪɴɢ 🌞';
  if (hour >= 12 && hour < 17) return 'ɢᴏᴏᴅ ᴀғᴛᴇʀɴᴏᴏɴ ☀️';
  if (hour >= 17 && hour < 21) return 'ɢᴏᴏᴅ ᴇᴠᴇɴɪɴɢ 🌆';
  return 'ɢᴏᴏᴅ ɴɪɢʜᴛ 🌙';
}

// Helper function to make API requests
async function searchSubtitles(query) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/search/${encodeURIComponent(query)}`, {
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    console.error('Search API error:', error);
    return null;
  }
}

async function getSubtitlesByTMDB(tmdbId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/subtitles/tmdb/${tmdbId}`, {
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    console.error('TMDB API error:', error);
    return null;
  }
}

// Start command with images
bot.start(async (ctx) => {
  const userName = ctx.from.first_name || 'there';
  const greeting = getGreeting();
  const userId = ctx.from.id;
  
  const welcomeMessage = `ʜᴇʏ, ${userName}**! ${greeting}**
ɪ'ᴍ ʏᴏᴜʀ ᴘᴏᴡᴇʀғᴜʟ sᴜʙᴛɪᴛʟᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ ʙᴏᴛ 🎞️
ᴊᴜsᴛ sᴇɴᴅ ᴍᴇ ᴀ ᴍᴏᴠɪᴇ ᴏʀ sᴇʀɪᴇs ɴᴀᴍᴇ, ᴀɴᴅ ɪ'ʟʟ ғɪɴᴅ ʏᴏᴜʀ sᴜʙᴛɪᴛʟᴇs ɪɴsᴛᴀɴᴛʟʏ ⏬
sᴜᴘᴘᴏʀᴛs ᴍᴜʟᴛɪ-ʟᴀɴɢᴜᴀɢᴇ ᴀɴᴅ ᴘᴇʀᴍᴀɴᴇɴᴛ sᴜʙᴛɪᴛʟᴇ ᴍᴇʀɢɪɴɢ 🎬
ʟᴇᴛ's ᴍᴀᴋᴇ ʏᴏᴜʀ ᴍᴏᴠɪᴇ ɴɪɢʜᴛs ᴇᴠᴇɴ ʙᴇᴛᴛᴇʀ! 🍿

ʙᴏᴛ ᴅᴇᴠᴇʟᴏᴘᴇᴅ ʙʏ @Zeroboy216`;

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.url('📢 ᴊᴏɪɴ ɢʀᴏᴜᴘ', 'https://t.me/zerodevbro')
    ],
    [
      Markup.button.url('🎬 ᴍᴏᴠɪᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ', 'https://t.me/Filmzimovietvserise21bot')
    ]
  ]);

  // Available images
  const images = [
    'https://ar-hosting.pages.dev/1761107260503.jpg',
    'https://ar-hosting.pages.dev/1761107265807.jpg',
    'https://ar-hosting.pages.dev/1761107283565.jpg'
  ];

  try {
    const userVisit = userVisits.get(userId);
    
    if (!userVisit) {
      userVisits.set(userId, { 
        visited: true, 
        lastImageIndex: 0,
        visitCount: 1
      });
      
      await ctx.replyWithPhoto(images[0], {
        caption: welcomeMessage,
        ...keyboard
      });
    } else {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * images.length);
      } while (randomIndex === userVisit.lastImageIndex && images.length > 1);
      
      userVisits.set(userId, {
        visited: true,
        lastImageIndex: randomIndex,
        visitCount: userVisit.visitCount + 1
      });
      
      await ctx.replyWithPhoto(images[randomIndex], {
        caption: welcomeMessage,
        ...keyboard
      });
    }
  } catch (error) {
    console.error('Image send error:', error);
    ctx.reply(welcomeMessage, keyboard);
  }
});

// Help command
bot.help((ctx) => {
  ctx.reply(`🤖 *ʙᴏᴛ ᴄᴏᴍᴍᴀɴᴅs:*

/search <movie name> - sᴇᴀʀᴄʜ sᴜʙᴛɪᴛʟᴇs
/tmdb <tmdb id> - sᴇᴀʀᴄʜ ʙʏ ᴛᴍᴅʙ ɪᴅ
/help - sʜᴏᴡ ʜᴇʟᴘ

*ᴇxᴀᴍᴘʟᴇs:*
• /search Inception
• /search The Dark Knight
• /tmdb 550
• /tmdb 680

ʙᴏᴛ ᴅᴇᴠᴇʟᴏᴘᴇᴅ ʙʏ @Zeroboy216`, { parse_mode: 'Markdown' });
});

// Search command
bot.command('search', async (ctx) => {
  const query = ctx.message.text.split(' ').slice(1).join(' ');
  
  if (!query) {
    return ctx.reply('❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴍᴏᴠɪᴇ ɴᴀᴍᴇ. ᴇxᴀᴍᴘʟᴇ: /search Fight Club');
  }

  await handleSearch(ctx, query);
});

// TMDB command
bot.command('tmdb', async (ctx) => {
  const tmdbId = ctx.message.text.split(' ')[1];
  
  if (!tmdbId) {
    return ctx.reply('❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴛᴍᴅʙ ɪᴅ. ᴇxᴀᴍᴘʟᴇ: /tmdb 550');
  }

  if (!/^\d+$/.test(tmdbId)) {
    return ctx.reply('❌ ɪɴᴠᴀʟɪᴅ ᴛᴍᴅʙ ɪᴅ. ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ɴᴜᴍᴇʀɪᴄ ɪᴅ.');
  }

  try {
    const startTime = Date.now();
    ctx.reply('🔍 sᴇᴀʀᴄʜɪɴɢ ғᴏʀ sᴜʙᴛɪᴛʟᴇs ʙʏ ᴛᴍᴅʙ ɪᴅ...');
    
    const data = await getSubtitlesByTMDB(tmdbId);
    const searchTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    if (!data || !data.success) {
      return ctx.reply('❌ ɴᴏ sᴜʙᴛɪᴛʟᴇs ғᴏᴜɴᴅ ғᴏʀ ᴛʜɪs ᴛᴍᴅʙ ɪᴅ.');
    }

    userSessions.set(ctx.from.id, {
      movie: data.movie,
      subtitles: data.subtitles,
      searchTime: searchTime,
      query: tmdbId
    });

    await sendLanguageMenu(ctx, data, searchTime, tmdbId);
    
  } catch (error) {
    console.error('TMDB search error:', error);
    ctx.reply('❌ ᴇʀʀᴏʀ sᴇᴀʀᴄʜɪɴɢ ғᴏʀ sᴜʙᴛɪᴛʟᴇs. ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ.');
  }
});

// Handle search with autofilter style
async function handleSearch(ctx, query) {
  try {
    const startTime = Date.now();
    ctx.reply('🔍 sᴇᴀʀᴄʜɪɴɢ ғᴏʀ sᴜʙᴛɪᴛʟᴇs...');
    
    const data = await searchSubtitles(query);
    const searchTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    if (!data || !data.success) {
      return ctx.reply('❌ ɴᴏ sᴜʙᴛɪᴛʟᴇs ғᴏᴜɴᴅ. ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɴᴏᴛʜᴇʀ ᴍᴏᴠɪᴇ ɴᴀᴍᴇ.');
    }

    userSessions.set(ctx.from.id, {
      movie: data.movie,
      subtitles: data.subtitles,
      searchTime: searchTime,
      query: query
    });

    await sendLanguageMenu(ctx, data, searchTime, query);
    
  } catch (error) {
    console.error('Quick search error:', error);
    ctx.reply('❌ ᴇʀʀᴏʀ sᴇᴀʀᴄʜɪɴɢ ғᴏʀ sᴜʙᴛɪᴛʟᴇs. ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ.');
  }
}

// Function to send language selection menu (autofilter style)
async function sendLanguageMenu(ctx, data, searchTime, query) {
  const { movie, subtitles } = data;
  const userName = ctx.from.first_name || 'User';
  
  // Group subtitles by language
  const subtitlesByLang = {};
  subtitles.forEach(sub => {
    if (!subtitlesByLang[sub.language]) {
      subtitlesByLang[sub.language] = [];
    }
    subtitlesByLang[sub.language].push(sub);
  });

  // Store language mapping in session
  const session = userSessions.get(ctx.from.id);
  session.languageMap = subtitlesByLang;
  userSessions.set(ctx.from.id, session);

  // Autofilter style header
  const headerMessage = `Tʜᴇ Rᴇꜱᴜʟᴛꜱ Fᴏʀ ☞ ${query}

Rᴇǫᴜᴇꜱᴛᴇᴅ Bʏ ☞ ${userName}

ʀᴇsᴜʟᴛ sʜᴏᴡ ɪɴ ☞ ${searchTime} sᴇᴄᴏɴᴅs

ᴘᴏᴡᴇʀᴇᴅ ʙʏ ☞ @Subtitles_Z_bot

🍿 Yᴏᴜʀ Subtitles Fɪʟᴇꜱ 👇`;

  await ctx.reply(headerMessage);

  // Create language selection buttons
  const languageButtons = [];
  const languages = Object.keys(subtitlesByLang);
  
  for (let i = 0; i < languages.length; i++) {
    const language = languages[i];
    const count = subtitlesByLang[language].length;
    const buttonText = `🗣️ ${language} (${count})`;
    const callbackData = `lang_${language}_${Date.now()}`;
    
    if (i % 2 === 0) {
      languageButtons.push([Markup.button.callback(buttonText, callbackData)]);
    } else {
      languageButtons[languageButtons.length - 1].push(Markup.button.callback(buttonText, callbackData));
    }
  }

  await ctx.reply('**sᴇʟᴇᴄᴛ ʏᴏᴜʀ ʟᴀɴɢᴜᴀɢᴇ:**', {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard(languageButtons)
  });
}

// Function to send subtitles for selected language with direct download links
async function sendSubtitlesForLanguage(ctx, language) {
  const session = userSessions.get(ctx.from.id);
  if (!session || !session.languageMap || !session.languageMap[language]) {
    return ctx.answerCbQuery('❌ ʟᴀɴɢᴜᴀɢᴇ ɴᴏᴛ ғᴏᴜɴᴅ. ᴘʟᴇᴀsᴇ sᴇᴀʀᴄʜ ᴀɢᴀɪɴ.');
  }

  const subtitles = session.languageMap[language];
  const userName = ctx.from.first_name || 'User';

  // Delete the language selection message
  try {
    await ctx.deleteMessage();
  } catch (error) {
    console.error('Error deleting message:', error);
  }

  // Send language selected header
  await ctx.reply(`**${language} sᴜʙᴛɪᴛʟᴇs sᴇʟᴇᴄᴛᴇᴅ ʙʏ ${userName}**\n\n**ᴄʟɪᴄᴋ ᴏɴ ᴛʜᴇ ʙᴜᴛᴛᴏɴs ʙᴇʟᴏᴡ ᴛᴏ ɢᴇᴛ ᴅɪʀᴇᴄᴛ ᴅᴏᴡɴʟᴏᴀᴅ ʟɪɴᴋs:**`, {
    parse_mode: 'Markdown'
  });

  // Create subtitle buttons with direct download links (max 6 files)
  const subtitleButtons = [];
  const maxFiles = Math.min(subtitles.length, 6);
  
  for (let i = 0; i < maxFiles; i++) {
    const sub = subtitles[i];
    
    // Create direct download URL
    const directDownloadUrl = `${API_BASE_URL}${sub.proxy_download_url}`;
    const buttonText = `📥 ${sub.name.substring(0, 25)}${sub.name.length > 25 ? '...' : ''}`;
    
    // Use URL button for direct download
    subtitleButtons.push([Markup.button.url(buttonText, directDownloadUrl)]);
  }

  // Add back button
  subtitleButtons.push([Markup.button.callback('« ʙᴀᴄᴋ ᴛᴏ ʟᴀɴɢᴜᴀɢᴇs', `back_${Date.now()}`)]);

  await ctx.reply(`**ғᴏᴜɴᴅ ${subtitles.length} ${language} sᴜʙᴛɪᴛʟᴇs - ᴄʟɪᴄᴋ ʙᴜᴛᴛᴏɴs ғᴏʀ ᴅɪʀᴇᴄᴛ ᴅᴏᴡɴʟᴏᴀᴅ:**`, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard(subtitleButtons)
  });
}

// Handle callback queries for language selection
bot.on('callback_query', async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  
  if (callbackData.startsWith('lang_')) {
    // Language selection
    const language = callbackData.split('_')[1];
    await ctx.answerCbQuery(`✅ sᴇʟᴇᴄᴛᴇᴅ ${language}`);
    await sendSubtitlesForLanguage(ctx, language);
    
  } else if (callbackData.startsWith('back_')) {
    // Back to language selection
    await ctx.answerCbQuery('↩️ ɢᴏɪɴɢ ʙᴀᴄᴋ...');
    await ctx.deleteMessage();
    
    const session = userSessions.get(ctx.from.id);
    if (session) {
      await sendLanguageMenu(ctx, {
        movie: session.movie,
        subtitles: session.subtitles
      }, session.searchTime, session.query);
    }
  }
});

// Handle text messages for quick search (autofilter style)
bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  
  // Ignore commands
  if (text.startsWith('/')) return;
  
  // If message is longer than 2 characters, treat as search
  if (text.length > 2) {
    await handleSearch(ctx, text);
  }
});

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
  ctx.reply('❌ ᴀɴ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ. ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ.');
});

// Vercel serverless function handler
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Only handle POST requests (Telegram webhooks)
    if (req.method === 'POST') {
      await bot.handleUpdate(req.body, res);
    } else {
      res.status(200).json({ status: 'Bot is running on Vercel' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send('Error processing webhook');
  }
};

// For local development
if (process.env.NODE_ENV === 'development') {
  bot.launch().then(() => {
    console.log('Bot is running in development mode');
  });
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
