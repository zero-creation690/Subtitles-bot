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

async function downloadSubtitle(downloadUrl) {
  try {
    const response = await axios.get(`${API_BASE_URL}${downloadUrl}`, {
      responseType: 'arraybuffer',
      timeout: 20000, // 20 seconds timeout
      maxContentLength: 10 * 1024 * 1024, // 10MB max
      maxBodyLength: 10 * 1024 * 1024
    });
    return response.data;
  } catch (error) {
    console.error('Download error:', error.message);
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

ᴏʀ ᴊᴜsᴛ ᴛʏᴘᴇ ᴀɴʏ ᴍᴏᴠɪᴇ ɴᴀᴍᴇ ᴅɪʀᴇᴄᴛʟʏ!

ʙᴏᴛ ᴅᴇᴠᴇʟᴏᴘᴇᴅ ʙʏ @Zeroboy216`, { parse_mode: 'Markdown' });
});

// Search command
bot.command('search', async (ctx) => {
  const query = ctx.message.text.split(' ').slice(1).join(' ');
  
  if (!query) {
    return ctx.reply('❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴍᴏᴠɪᴇ ɴᴀᴍᴇ.\n\n*ᴇxᴀᴍᴘʟᴇ:* /search Fight Club', { parse_mode: 'Markdown' });
  }

  await handleSearch(ctx, query);
});

// TMDB command
bot.command('tmdb', async (ctx) => {
  const tmdbId = ctx.message.text.split(' ')[1];
  
  if (!tmdbId) {
    return ctx.reply('❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴛᴍᴅʙ ɪᴅ.\n\n*ᴇxᴀᴍᴘʟᴇ:* /tmdb 550', { parse_mode: 'Markdown' });
  }

  if (!/^\d+$/.test(tmdbId)) {
    return ctx.reply('❌ ɪɴᴠᴀʟɪᴅ ᴛᴍᴅʙ ɪᴅ. ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ɴᴜᴍᴇʀɪᴄ ɪᴅ.');
  }

  try {
    const startTime = Date.now();
    const searchMsg = await ctx.reply('🔍 sᴇᴀʀᴄʜɪɴɢ...');
    
    const data = await getSubtitlesByTMDB(tmdbId);
    const searchTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    // Delete searching message
    await ctx.telegram.deleteMessage(ctx.chat.id, searchMsg.message_id).catch(() => {});
    
    if (!data || !data.success) {
      return ctx.reply('❌ ɴᴏ sᴜʙᴛɪᴛʟᴇs ғᴏᴜɴᴅ ғᴏʀ ᴛʜɪs ᴛᴍᴅʙ ɪᴅ.');
    }

    // Store movie data in session
    userSessions.set(ctx.from.id, {
      movie: data.movie,
      subtitles: data.subtitles,
      searchTime: searchTime,
      query: tmdbId
    });

    // Wait 1 second before showing results
    await new Promise(resolve => setTimeout(resolve, 1000));

    await showLanguageSelection(ctx, data, searchTime, tmdbId);
    
  } catch (error) {
    console.error('TMDB search error:', error);
    ctx.reply('❌ ᴇʀʀᴏʀ sᴇᴀʀᴄʜɪɴɢ. ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ.');
  }
});

// Handle search with autofilter style
async function handleSearch(ctx, query) {
  try {
    const startTime = Date.now();
    const searchMsg = await ctx.reply('🔍 sᴇᴀʀᴄʜɪɴɢ...');
    
    const data = await searchSubtitles(query);
    const searchTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    // Delete searching message
    await ctx.telegram.deleteMessage(ctx.chat.id, searchMsg.message_id).catch(() => {});
    
    if (!data || !data.success) {
      return ctx.reply('❌ ɴᴏ sᴜʙᴛɪᴛʟᴇs ғᴏᴜɴᴅ.\n\nᴛʀʏ ᴀɴᴏᴛʜᴇʀ ᴍᴏᴠɪᴇ ɴᴀᴍᴇ!');
    }

    // Store movie data in session
    userSessions.set(ctx.from.id, {
      movie: data.movie,
      subtitles: data.subtitles,
      searchTime: searchTime,
      query: query
    });

    // Wait 1 second before showing results
    await new Promise(resolve => setTimeout(resolve, 1000));

    await showLanguageSelection(ctx, data, searchTime, query);
    
  } catch (error) {
    console.error('Search error:', error);
    ctx.reply('❌ ᴇʀʀᴏʀ sᴇᴀʀᴄʜɪɴɢ. ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ.');
  }
}

// Show language selection with inline buttons
async function showLanguageSelection(ctx, data, searchTime, query) {
  const { subtitles } = data;
  const userName = ctx.from.first_name || 'User';
  
  // Group subtitles by language
  const subtitlesByLang = {};
  subtitles.forEach(sub => {
    if (!subtitlesByLang[sub.language]) {
      subtitlesByLang[sub.language] = [];
    }
    subtitlesByLang[sub.language].push(sub);
  });

  // Autofilter style header
  const headerMessage = `Tʜᴇ Rᴇꜱᴜʟᴛꜱ Fᴏʀ ☞ *${query}*

Rᴇǫᴜᴇꜱᴛᴇᴅ Bʏ ☞ ${userName}

ʀᴇsᴜʟᴛ sʜᴏᴡ ɪɴ ☞ ${searchTime} sᴇᴄᴏɴᴅs

ᴘᴏᴡᴇʀᴇᴅ ʙʏ ☞ @Subtitles_Z_bot

🗣️ *sᴇʟᴇᴄᴛ ʏᴏᴜʀ ʟᴀɴɢᴜᴀɢᴇ:*`;

  // Create language selection buttons (2 per row)
  const languageButtons = [];
  const languages = Object.keys(subtitlesByLang);
  
  for (let i = 0; i < languages.length; i += 2) {
    const row = [];
    const lang1 = languages[i];
    const count1 = subtitlesByLang[lang1].length;
    row.push(Markup.button.callback(`🗣️ ${lang1} (${count1})`, `lang_${lang1}`));
    
    if (i + 1 < languages.length) {
      const lang2 = languages[i + 1];
      const count2 = subtitlesByLang[lang2].length;
      row.push(Markup.button.callback(`🗣️ ${lang2} (${count2})`, `lang_${lang2}`));
    }
    
    languageButtons.push(row);
  }

  await ctx.reply(headerMessage, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard(languageButtons)
  });
}

// Show subtitle files for selected language (max 6 files, 2 per row)
async function showSubtitlesForLanguage(ctx, language, messageId) {
  const session = userSessions.get(ctx.from.id);
  
  if (!session) {
    return ctx.answerCbQuery('❌ sᴇssɪᴏɴ ᴇxᴘɪʀᴇᴅ. sᴇᴀʀᴄʜ ᴀɢᴀɪɴ!', { show_alert: true });
  }

  const { subtitles, query } = session;
  
  // Filter subtitles by language
  const langSubtitles = subtitles.filter(sub => sub.language === language);
  
  if (langSubtitles.length === 0) {
    return ctx.answerCbQuery('❌ ɴᴏ sᴜʙᴛɪᴛʟᴇs ғᴏᴜɴᴅ', { show_alert: true });
  }

  // Delete the language selection message
  await ctx.telegram.deleteMessage(ctx.chat.id, messageId).catch(() => {});

  const userName = ctx.from.first_name || 'User';
  
  const subtitleMessage = `📥 *${language} sᴜʙᴛɪᴛʟᴇs ғᴏʀ:* ${query}

Rᴇǫᴜᴇꜱᴛᴇᴅ Bʏ ☞ ${userName}

🍿 *sᴇʟᴇᴄᴛ ᴀ ғɪʟᴇ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ:*`;

  // Create file buttons (max 6 files, 2 per row)
  const fileButtons = [];
  const maxFiles = Math.min(langSubtitles.length, 6);
  
  for (let i = 0; i < maxFiles; i += 2) {
    const row = [];
    const sub1 = langSubtitles[i];
    
    // Shorten name for button
    let displayName1 = sub1.name;
    if (displayName1.length > 25) {
      displayName1 = displayName1.substring(0, 22) + '...';
    }
    
    const callbackData1 = `dl_${ctx.from.id}_${i}_${language}`.substring(0, 64);
    
    // Store subtitle info in session
    if (!session.downloadMap) session.downloadMap = {};
    session.downloadMap[callbackData1] = sub1;
    userSessions.set(ctx.from.id, session);
    
    row.push(Markup.button.callback(`📥 ${displayName1}`, callbackData1));
    
    // Add second button if available
    if (i + 1 < maxFiles) {
      const sub2 = langSubtitles[i + 1];
      
      let displayName2 = sub2.name;
      if (displayName2.length > 25) {
        displayName2 = displayName2.substring(0, 22) + '...';
      }
      
      const callbackData2 = `dl_${ctx.from.id}_${i + 1}_${language}`.substring(0, 64);
      session.downloadMap[callbackData2] = sub2;
      userSessions.set(ctx.from.id, session);
      
      row.push(Markup.button.callback(`📥 ${displayName2}`, callbackData2));
    }
    
    fileButtons.push(row);
  }

  // Add back button
  fileButtons.push([Markup.button.callback('🔙 ʙᴀᴄᴋ ᴛᴏ ʟᴀɴɢᴜᴀɢᴇs', 'back_to_languages')]);

  await ctx.reply(subtitleMessage, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard(fileButtons)
  });
}

// Handle callback queries
bot.on('callback_query', async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  
  // Handle language selection
  if (callbackData.startsWith('lang_')) {
    const language = callbackData.replace('lang_', '');
    await ctx.answerCbQuery(`✅ sᴇʟᴇᴄᴛᴇᴅ ${language}`);
    await showSubtitlesForLanguage(ctx, language, ctx.callbackQuery.message.message_id);
    return;
  }
  
  // Handle back to languages
  if (callbackData === 'back_to_languages') {
    const session = userSessions.get(ctx.from.id);
    if (!session) {
      return ctx.answerCbQuery('❌ sᴇssɪᴏɴ ᴇxᴘɪʀᴇᴅ. sᴇᴀʀᴄʜ ᴀɢᴀɪɴ!', { show_alert: true });
    }
    
    await ctx.answerCbQuery('🔙 ʙᴀᴄᴋ');
    await ctx.telegram.deleteMessage(ctx.chat.id, ctx.callbackQuery.message.message_id).catch(() => {});
    
    const data = {
      movie: session.movie,
      subtitles: session.subtitles
    };
    
    await showLanguageSelection(ctx, data, session.searchTime, session.query);
    return;
  }
  
  // Handle subtitle download
  if (callbackData.startsWith('dl_')) {
    const session = userSessions.get(ctx.from.id);
    
    if (!session || !session.downloadMap || !session.downloadMap[callbackData]) {
      return ctx.answerCbQuery('❌ sᴜʙᴛɪᴛʟᴇ ɴᴏᴛ ғᴏᴜɴᴅ. sᴇᴀʀᴄʜ ᴀɢᴀɪɴ!', { show_alert: true });
    }
    
    const subtitle = session.downloadMap[callbackData];
    
    try {
      // Quick response
      await ctx.answerCbQuery('⚡ ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ...');
      
      // Show uploading status in chat
      const statusMsg = await ctx.reply('📤 *ᴜᴘʟᴏᴀᴅɪɴɢ ᴛᴏ ᴛᴇʟᴇɢʀᴀᴍ...*\n\n📁 ' + subtitle.name.substring(0, 50), { parse_mode: 'Markdown' });
      
      // Download the file
      const fileData = await downloadSubtitle(subtitle.proxy_download_url);
      
      if (!fileData) {
        // Delete status message
        await ctx.telegram.deleteMessage(ctx.chat.id, statusMsg.message_id).catch(() => {});
        return ctx.reply('❌ *ᴅᴏᴡɴʟᴏᴀᴅ ғᴀɪʟᴇᴅ*\n\nᴛʀʏ ᴀɴᴏᴛʜᴇʀ sᴜʙᴛɪᴛʟᴇ!', { parse_mode: 'Markdown' });
      }
      
      // Delete uploading message
      await ctx.telegram.deleteMessage(ctx.chat.id, statusMsg.message_id).catch(() => {});
      
      // Send subtitle file directly
      await ctx.replyWithDocument(
        { 
          source: Buffer.from(fileData), 
          filename: subtitle.name 
        },
        {
          caption: `✅ *sᴜʙᴛɪᴛʟᴇ ʀᴇᴀᴅʏ!*\n\n📁 ${subtitle.name}\n⭐ ${subtitle.rating} | 📥 ${subtitle.downloads}\n\nᴘᴏᴡᴇʀᴇᴅ ʙʏ @Subtitles_Z_bot`,
          parse_mode: 'Markdown'
        }
      );
      
    } catch (error) {
      console.error('Download error:', error);
      await ctx.answerCbQuery('❌ ᴅᴏᴡɴʟᴏᴀᴅ ғᴀɪʟᴇᴅ', { show_alert: true });
      ctx.reply('❌ *ᴇʀʀᴏʀ!*\n\nᴄᴏᴜʟᴅɴ\'ᴛ ᴅᴏᴡɴʟᴏᴀᴅ. ᴛʀʏ ᴀɢᴀɪɴ!', { parse_mode: 'Markdown' });
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
