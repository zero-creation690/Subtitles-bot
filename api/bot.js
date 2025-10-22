const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

// Initialize bot with your Telegram Bot Token
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN';
const API_BASE_URL = 'https://subtitlesapibzeroo.venurasandeepa22.workers.dev';

const bot = new Telegraf(BOT_TOKEN);

// Store user sessions
const userSessions = new Map();

// Array of welcome images for rotation
const WELCOME_IMAGES = [
  'https://ar-hosting.pages.dev/1761107260503.jpg',
  'https://ar-hosting.pages.dev/1761107265807.jpg',
  'https://ar-hosting.pages.dev/1761107283565.jpg'
];

// Helper function to get time-based greeting
function getTimeBasedGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'ɢᴏᴏᴅ ᴍᴏʀɴɪɴɢ 🌞';
  if (hour < 18) return 'ɢᴏᴏᴅ ᴀғᴛᴇʀɴᴏᴏɴ ☀️';
  return 'ɢᴏᴏᴅ ᴇᴠᴇɴɪɴɢ 🌙';
}

// Helper function to get random welcome image
function getRandomWelcomeImage() {
  return WELCOME_IMAGES[Math.floor(Math.random() * WELCOME_IMAGES.length)];
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

// Start command
bot.start(async (ctx) => {
  const userName = ctx.from.first_name || 'User';
  const greeting = getTimeBasedGreeting();
  const welcomeImage = getRandomWelcomeImage();
  
  const welcomeMessage = `ʜᴇʏ, **${userName}**! ${greeting}

ɪ'ᴍ ʏᴏᴜʀ ᴘᴏᴡᴇʀғᴜʟ sᴜʙᴛɪᴛʟᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ ʙᴏᴛ 🎞️
ᴊᴜsᴛ sᴇɴᴅ ᴍᴇ ᴀ ᴍᴏᴠɪᴇ ᴏʀ sᴇʀɪᴇs ɴᴀᴍᴇ, ᴀɴᴅ ɪ'ʟʟ ғɪɴᴅ ʏᴏᴜʀ sᴜʙᴛɪᴛʟᴇs ɪɴsᴛᴀɴᴛʟʏ ⏬
sᴜᴘᴘᴏʀᴛs ᴍᴜʟᴛɪ-ʟᴀɴɢᴜᴀɢᴇ ᴀɴᴅ ᴘᴇʀᴍᴀɴᴇɴᴛ sᴜʙᴛɪᴛʟᴇ ᴍᴇʀɢɪɴɢ 🎬
ʟᴇᴛ's ᴍᴀᴋᴇ ʏᴏᴜʀ ᴍᴏᴠɪᴇ ɴɪɢʜᴛs ᴇᴠᴇɴ ʙᴇᴛᴛᴇʀ! 🍿

*ʙᴏᴛ ᴅᴇᴠᴇʟᴏᴘᴇᴅ ʙʏ* @Zeroboy216`;

  try {
    // Send welcome image with caption
    await ctx.replyWithPhoto(welcomeImage, {
      caption: welcomeMessage,
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [
          Markup.button.url('🌟 ᴊᴏɪɴ ᴏᴜʀ ɢʀᴏᴜᴘ', 'https://t.me/zerodevbro'),
          Markup.button.url('🎬 ᴍᴏᴠɪᴇ ʙᴏᴛ', 'https://t.me/Filmzimovietvserise21bot')
        ],
        [
          Markup.button.callback('🔍 sᴇᴀʀᴄʜ sᴜʙᴛɪᴛʟᴇs', 'quick_search')
        ]
      ])
    });

    // Send quick help message
    await ctx.reply(`*ǫᴜɪᴄᴋ ᴄᴏᴍᴍᴀɴᴅs:*
    
🔍 /search <movie name> - sᴇᴀʀᴄʜ sᴜʙᴛɪᴛʟᴇs
🎯 /tmdb <id> - sᴇᴀʀᴄʜ ʙʏ ᴛᴍᴅʙ ɪᴅ
ℹ️ /help - sʜᴏᴡ ᴅᴇᴛᴀɪʟᴇᴅ ʜᴇʟᴘ

*ᴏʀ sɪᴍᴘʟʴ ᴛʏᴘᴇ ᴛʜᴇ ᴍᴏᴠɪᴇ ɴᴀᴍᴇ ʙᴇʟᴏᴡ!*`, {
      parse_mode: 'Markdown'
    });

  } catch (error) {
    console.error('Error sending welcome message:', error);
    // Fallback to text message if image fails
    await ctx.reply(welcomeMessage, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [
          Markup.button.url('🌟 ᴊᴏɪɴ ᴏᴜʀ ɢʀᴏᴜᴘ', 'https://t.me/zerodevbro'),
          Markup.button.url('🎬 ᴍᴏᴠɪᴇ ʙᴏᴛ', 'https://t.me/Filmzimovietvserise21bot')
        ]
      ])
    });
  }
});

// Handle quick search callback
bot.action('quick_search', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply('🔍 *sᴇɴᴅ ᴍᴇ ᴛʜᴇ ᴍᴏᴠɪᴇ ᴏʀ sᴇʀɪᴇs ɴᴀᴍᴇ ʏᴏᴜ ᴡᴀɴᴛ sᴜʙᴛɪᴛʟᴇs ғᴏʀ:*', {
    parse_mode: 'Markdown'
  });
});

// Help command
bot.help((ctx) => {
  const userName = ctx.from.first_name || 'User';
  const greeting = getTimeBasedGreeting();
  
  ctx.reply(`ʜᴇʏ **${userName}**! ${greeting}

🤖 *sᴜʙᴛɪᴛʟᴇ ʙᴏᴛ ᴄᴏᴍᴍᴀɴᴅs:*

🔍 /search <movie name> - sᴇᴀʀᴄʜ sᴜʙᴛɪᴛʟᴇs ʙʏ ɴᴀᴍᴇ
🎯 /tmdb <tmdb id> - sᴇᴀʀᴄʜ ʙʏ ᴛᴍᴅʙ ɪᴅ
ℹ️ /help - sʜᴏᴡ ᴛʜɪs ʜᴇʟᴘ ᴍᴇssᴀɢᴇ

*ᴇxᴀᴍᴘʟᴇs:*
• /search Inception
• /search The Dark Knight
• /tmdb 550
• /tmdb 680

*ǫᴜɪᴄᴋ sᴇᴀʀᴄʜ:*
ʏᴏᴜ ᴄᴀɴ ᴀʟsᴏ sɪᴍᴘʟʴ ᴛʏᴘᴇ ᴛʜᴇ ᴍᴏᴠɪᴇ ɴᴀᴍᴇ ᴀɴᴅ ɪ'ʟʟ ғɪɴᴅ sᴜʙᴛɪᴛʟᴇs ғᴏʀ ʏᴏᴜ!

*ᴅᴇᴠᴇʟᴏᴘᴇᴅ ʙʏ* @Zeroboy216`, { 
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [
        Markup.button.url('🌟 ᴊᴏɪɴ ᴏᴜʀ ɢʀᴏᴜᴘ', 'https://t.me/zerodevbro'),
        Markup.button.url('🎬 ᴍᴏᴠɪᴇ ʙᴏᴛ', 'https://t.me/Filmzimovietvserise21bot')
      ]
    ])
  });
});

// Search command
bot.command('search', async (ctx) => {
  const query = ctx.message.text.split(' ').slice(1).join(' ');
  
  if (!query) {
    return ctx.reply('❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴍᴏᴠɪᴇ ɴᴀᴍᴇ. \nᴇxᴀᴍᴘʟᴇ: `/search Fight Club`', {
      parse_mode: 'Markdown'
    });
  }

  try {
    const searchingMsg = await ctx.reply('🔍 *sᴇᴀʀᴄʜɪɴɢ ғᴏʀ sᴜʙᴛɪᴛʟᴇs...*', { parse_mode: 'Markdown' });
    
    const data = await searchSubtitles(query);
    
    if (!data || !data.success) {
      await ctx.deleteMessage(searchingMsg.message_id);
      return ctx.reply('❌ ɴᴏ sᴜʙᴛɪᴛʟᴇs ғᴏᴜɴᴅ ᴏʀ ᴀᴘɪ ᴇʀʀᴏʀ. ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɴᴏᴛʜᴇʀ ᴍᴏᴠɪᴇ.');
    }

    // Store movie data in session
    userSessions.set(ctx.from.id, {
      movie: data.movie,
      subtitles: data.subtitles
    });

    await ctx.deleteMessage(searchingMsg.message_id);
    await sendMovieResults(ctx, data);
    
  } catch (error) {
    console.error('Search error:', error);
    ctx.reply('❌ ᴇʀʀᴏʀ sᴇᴀʀᴄʜɪɴɢ ғᴏʀ sᴜʙᴛɪᴛʟᴇs. ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ.');
  }
});

// TMDB command
bot.command('tmdb', async (ctx) => {
  const tmdbId = ctx.message.text.split(' ')[1];
  
  if (!tmdbId) {
    return ctx.reply('❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴛᴍᴅʙ ɪᴅ. \nᴇxᴀᴍᴘʟᴇ: `/tmdb 550`', {
      parse_mode: 'Markdown'
    });
  }

  if (!/^\d+$/.test(tmdbId)) {
    return ctx.reply('❌ ɪɴᴠᴀʟɪᴅ ᴛᴍᴅʙ ɪᴅ. ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ɴᴜᴍᴇʀɪᴄ ɪᴅ.');
  }

  try {
    const searchingMsg = await ctx.reply('🔍 *sᴇᴀʀᴄʜɪɴɢ ғᴏʀ sᴜʙᴛɪᴛʟᴇs ʙʏ ᴛᴍᴅʙ ɪᴅ...*', { parse_mode: 'Markdown' });
    
    const data = await getSubtitlesByTMDB(tmdbId);
    
    if (!data || !data.success) {
      await ctx.deleteMessage(searchingMsg.message_id);
      return ctx.reply('❌ ɴᴏ sᴜʙᴛɪᴛʟᴇs ғᴏᴜɴᴅ ғᴏʀ ᴛʜɪs ᴛᴍᴅʙ ɪᴅ.');
    }

    // Store movie data in session
    userSessions.set(ctx.from.id, {
      movie: data.movie,
      subtitles: data.subtitles
    });

    await ctx.deleteMessage(searchingMsg.message_id);
    await sendMovieResults(ctx, data);
    
  } catch (error) {
    console.error('TMDB search error:', error);
    ctx.reply('❌ ᴇʀʀᴏʀ sᴇᴀʀᴄʜɪɴɢ ғᴏʀ sᴜʙᴛɪᴛʟᴇs. ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ.');
  }
});

// Function to send movie results
async function sendMovieResults(ctx, data) {
  const { movie, subtitles } = data;
  
  // Movie info
  const movieInfo = `🎭 *${movie.title}* (${new Date(movie.release_date).getFullYear()})
  
📝 *ᴏᴠᴇʀᴠɪᴇᴡ:* ${movie.overview || 'ɴᴏ ᴏᴠᴇʀᴠɪᴇᴡ ᴀᴠᴀɪʟᴀʙʟᴇ'}
⭐ *ʀᴀᴛɪɴɢ:* ${movie.vote_average || 'ɴ/ᴀ'}/10
⏱️ *ʀᴜɴᴛɪᴍᴇ:* ${movie.runtime || 'ɴ/ᴀ'} ᴍɪɴᴜᴛᴇs
🗣️ *ʟᴀɴɢᴜᴀɢᴇ:* ${movie.original_language || 'ɴ/ᴀ'}
📅 *ʀᴇʟᴇᴀsᴇᴅ:* ${movie.release_date || 'ɴ/ᴀ'}

📥 ғᴏᴜɴᴅ *${subtitles.length}* sᴜʙᴛɪᴛʟᴇ ғɪʟᴇs ᴀᴠᴀɪʟᴀʙʟᴇ`;

  await ctx.reply(movieInfo, { parse_mode: 'Markdown' });

  // Group subtitles by language for better organization
  const subtitlesByLang = {};
  subtitles.forEach(sub => {
    const lang = sub.language || 'Unknown';
    if (!subtitlesByLang[lang]) {
      subtitlesByLang[lang] = [];
    }
    subtitlesByLang[lang].push(sub);
  });

  // Send subtitles organized by language
  for (const [language, langSubtitles] of Object.entries(subtitlesByLang)) {
    let langMessage = `\n🗣️ *${language} sᴜʙᴛɪᴛʟᴇs:*\n\n`;
    
    langSubtitles.slice(0, 8).forEach((sub, index) => {
      const subName = sub.name || 'Unknown Subtitle';
      const rating = sub.rating || '0';
      const downloads = sub.downloads || '0';
      const downloadUrl = sub.proxy_download_url ? `${API_BASE_URL}${sub.proxy_download_url}` : '#';
      
      langMessage += `${index + 1}. ${subName}\n`;
      langMessage += `   ⭐ ${rating} | 📥 ${downloads} downloads\n`;
      langMessage += `   [ᴅᴏᴡɴʟᴏᴀᴅ](${downloadUrl})\n\n`;
    });

    if (langSubtitles.length > 8) {
      langMessage += `... ᴀɴᴅ ${langSubtitles.length - 8} ᴍᴏʀᴇ ${language} sᴜʙᴛɪᴛʟᴇs`;
    }

    try {
      await ctx.reply(langMessage, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      });
    } catch (error) {
      // If message is too long, split it
      const chunks = langMessage.match(/[\s\S]{1,4000}/g) || [];
      for (const chunk of chunks) {
        await ctx.reply(chunk, {
          parse_mode: 'Markdown',
          disable_web_page_preview: true
        });
      }
    }
  }

  // Send quick actions with buttons
  const quickActions = `💡 *ǫᴜɪᴄᴋ ᴀᴄᴛɪᴏɴs:*
  
ʏᴏᴜ ᴄᴀɴ ᴅᴏᴡɴʟᴏᴀᴅ ᴀɴʏ sᴜʙᴛɪᴛʟᴇ ʙʏ ᴄʟɪᴄᴋɪɴɢ ᴛʜᴇ ᴅᴏᴡɴʟᴏᴀᴅ ʟɪɴᴋs ᴀʙᴏᴠᴇ!`;

  await ctx.reply(quickActions, { 
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [
        Markup.button.callback('🔍 sᴇᴀʀᴄʜ ᴀɢᴀɪɴ', 'quick_search'),
        Markup.button.url('🎬 ᴍᴏᴠɪᴇ ʙᴏᴛ', 'https://t.me/Filmzimovietvserise21bot')
      ],
      [
        Markup.button.url('🌟 ᴊᴏɪɴ ɢʀᴏᴜᴘ', 'https://t.me/zerodevbro')
      ]
    ])
  });
}

// Handle text messages for quick search
bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  
  // Ignore commands
  if (text.startsWith('/')) return;
  
  // If message is longer than 2 characters, treat as search
  if (text.length > 2) {
    try {
      const searchingMsg = await ctx.reply('🔍 *sᴇᴀʀᴄʜɪɴɢ ғᴏʀ sᴜʙᴛɪᴛʟᴇs...*', { parse_mode: 'Markdown' });
      
      const data = await searchSubtitles(text);
      
      if (!data || !data.success) {
        await ctx.deleteMessage(searchingMsg.message_id);
        return ctx.reply('❌ ɴᴏ sᴜʙᴛɪᴛʟᴇs ғᴏᴜɴᴅ. ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɴᴏᴛʜᴇʀ ᴍᴏᴠɪᴇ ɴᴀᴍᴇ.');
      }

      // Store movie data in session
      userSessions.set(ctx.from.id, {
        movie: data.movie,
        subtitles: data.subtitles
      });

      await ctx.deleteMessage(searchingMsg.message_id);
      await sendMovieResults(ctx, data);
      
    } catch (error) {
      console.error('Quick search error:', error);
      ctx.reply('❌ ᴇʀʀᴏʀ sᴇᴀʀᴄʜɪɴɢ ғᴏʀ sᴜʙᴛɪᴛʟᴇs. ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ.');
    }
  }
});

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
  ctx.reply('❌ ᴀɴ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ. ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ.');
});

// Vercel serverless function handler
module.exports = async (req, res) => {
  // Set CORS headers for webhook
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Ensure the request body is properly parsed
    if (req.body) {
      await bot.handleUpdate(req.body, res);
    } else {
      res.status(400).send('No body received');
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Error processing webhook');
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
