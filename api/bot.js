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
  // Get current UTC time
  const now = new Date();
  
  // Add your timezone offset (for Sri Lanka/India: UTC+5:30)
  // Adjust this offset based on your timezone
  const timezoneOffset = 5.5; // 5 hours 30 minutes
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
    const response = await axios.get(`${API_BASE_URL}/api/search/${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Search API error:', error);
    return null;
  }
}

async function getSubtitlesByTMDB(tmdbId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/subtitles/tmdb/${tmdbId}`);
    return response.data;
  } catch (error) {
    console.error('TMDB API error:', error);
    return null;
  }
}

async function downloadSubtitle(downloadUrl) {
  try {
    const response = await axios.get(`${API_BASE_URL}${downloadUrl}`, {
      responseType: 'arraybuffer',
      timeout: 30000 // 30 seconds timeout
    });
    return response.data;
  } catch (error) {
    console.error('Download error:', error);
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
    // Check if user has visited before
    const userVisit = userVisits.get(userId);
    
    if (!userVisit) {
      // First time user - send first image
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
      // Returning user - send random image (excluding last shown)
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * images.length);
      } while (randomIndex === userVisit.lastImageIndex && images.length > 1);
      
      // Update user visit info
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
    // Fallback if images fail
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

    // Store movie data in session
    userSessions.set(ctx.from.id, {
      movie: data.movie,
      subtitles: data.subtitles
    });

    await sendMovieResults(ctx, data, searchTime, tmdbId);
    
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

    // Store movie data in session
    userSessions.set(ctx.from.id, {
      movie: data.movie,
      subtitles: data.subtitles
    });

    await sendMovieResults(ctx, data, searchTime, query);
    
  } catch (error) {
    console.error('Quick search error:', error);
    ctx.reply('❌ ᴇʀʀᴏʀ sᴇᴀʀᴄʜɪɴɢ ғᴏʀ sᴜʙᴛɪᴛʟᴇs. ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ.');
  }
}

// Function to send movie results with autofilter style
async function sendMovieResults(ctx, data, searchTime, query) {
  const { movie, subtitles } = data;
  const userName = ctx.from.first_name || 'User';
  
  // Autofilter style header
  const headerMessage = `Tʜᴇ Rᴇꜱᴜʟᴛꜱ Fᴏʀ ☞ ${query}

Rᴇǫᴜᴇꜱᴛᴇᴅ Bʏ ☞ ${userName}

ʀᴇsᴜʟᴛ sʜᴏᴡ ɪɴ ☞ ${searchTime} sᴇᴄᴏɴᴅs

ᴘᴏᴡᴇʀᴇᴅ ʙʏ ☞ @Subtitles_Z_bot

🍿 Yᴏᴜʀ Subtitles Fɪʟᴇꜱ 👇`;

  await ctx.reply(headerMessage);

  // Group subtitles by language
  const subtitlesByLang = {};
  subtitles.forEach(sub => {
    if (!subtitlesByLang[sub.language]) {
      subtitlesByLang[sub.language] = [];
    }
    subtitlesByLang[sub.language].push(sub);
  });

  // Send subtitles with inline buttons (autofilter style)
  for (const [language, langSubtitles] of Object.entries(subtitlesByLang)) {
    const buttons = [];
    
    // Create buttons in rows of 2
    for (let i = 0; i < Math.min(langSubtitles.length, 20); i++) {
      const sub = langSubtitles[i];
      const buttonText = `📥 ${sub.name.substring(0, 35)}...`;
      const callbackData = `dl_${i}_${language}_${Date.now()}`.substring(0, 64);
      
      // Store subtitle info in session for callback
      const session = userSessions.get(ctx.from.id) || {};
      if (!session.downloadMap) session.downloadMap = {};
      session.downloadMap[callbackData] = sub;
      userSessions.set(ctx.from.id, session);
      
      buttons.push(Markup.button.callback(buttonText, callbackData));
    }
    
    // Arrange buttons in rows of 1 (full width like autofilter)
    const keyboard = [];
    buttons.forEach(button => {
      keyboard.push([button]);
    });
    
    const langHeader = `🗣️ *${language} Sᴜʙᴛɪᴛʟᴇs* (${langSubtitles.length} ᴀᴠᴀɪʟᴀʙʟᴇ)`;
    
    try {
      await ctx.reply(langHeader, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(keyboard)
      });
    } catch (error) {
      console.error('Error sending subtitles:', error);
    }
  }
}

// Handle callback queries for subtitle downloads
bot.on('callback_query', async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  
  if (callbackData.startsWith('dl_')) {
    const session = userSessions.get(ctx.from.id);
    
    if (!session || !session.downloadMap || !session.downloadMap[callbackData]) {
      return ctx.answerCbQuery('❌ sᴜʙᴛɪᴛʟᴇ ɴᴏᴛ ғᴏᴜɴᴅ. ᴘʟᴇᴀsᴇ sᴇᴀʀᴄʜ ᴀɢᴀɪɴ.');
    }
    
    const subtitle = session.downloadMap[callbackData];
    
    try {
      await ctx.answerCbQuery('⏳ ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ sᴜʙᴛɪᴛʟᴇ... ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ 20 sᴇᴄᴏɴᴅs');
      
      const downloadMsg = await ctx.reply('📥 ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ʏᴏᴜʀ sᴜʙᴛɪᴛʟᴇ...\n⏱️ ᴛʜɪs ᴍᴀʏ ᴛᴀᴋᴇ ᴜᴘ ᴛᴏ 20 sᴇᴄᴏɴᴅs\n\n*ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ...*', { parse_mode: 'Markdown' });
      
      const fileData = await downloadSubtitle(subtitle.proxy_download_url);
      
      if (!fileData) {
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          downloadMsg.message_id,
          null,
          '❌ ғᴀɪʟᴇᴅ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ sᴜʙᴛɪᴛʟᴇ. ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ.'
        );
        return;
      }
      
      // Delete downloading message
      await ctx.telegram.deleteMessage(ctx.chat.id, downloadMsg.message_id);
      
      // Send subtitle file directly to user
      await ctx.replyWithDocument(
        { source: Buffer.from(fileData), filename: subtitle.name },
        {
          caption: `✅ *sᴜʙᴛɪᴛʟᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ!*\n\n📁 ${subtitle.name}\n⭐ ʀᴀᴛɪɴɢ: ${subtitle.rating}\n📥 ᴅᴏᴡɴʟᴏᴀᴅs: ${subtitle.downloads}\n\nᴘᴏᴡᴇʀᴇᴅ ʙʏ @Subtitles_Z_bot`,
          parse_mode: 'Markdown'
        }
      );
      
    } catch (error) {
      console.error('Download error:', error);
      ctx.reply('❌ ᴇʀʀᴏʀ ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ sᴜʙᴛɪᴛʟᴇ. ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ.');
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

// Webhook for Vercel
module.exports = async (req, res) => {
  try {
    await bot.handleUpdate(req.body, res);
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
