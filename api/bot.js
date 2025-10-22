const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

// Initialize bot with your Telegram Bot Token
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN';
const API_BASE_URL = 'https://subtitlesapibzeroo.venurasandeepa22.workers.dev';

const bot = new Telegraf(BOT_TOKEN);

// Store user sessions
const userSessions = new Map();

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
bot.start((ctx) => {
  const welcomeMessage = `🎬 *Welcome to Subtitle Downloader Bot!* 🎬

I can help you find and download subtitles for your favorite movies.

*Available Commands:*
/search - Search subtitles by movie name
/tmdb - Search by TMDB ID
/help - Show this help message

*How to use:*
1. Use /search followed by movie name
2. Or use /tmdb followed by TMDB ID
3. Browse available subtitles
4. Download your preferred subtitle

*Example:*
/search Fight Club
/tmdb 550`;

  ctx.reply(welcomeMessage, { parse_mode: 'Markdown' });
});

// Help command
bot.help((ctx) => {
  ctx.reply(`🤖 *Bot Commands:*

/search <movie name> - Search subtitles
/tmdb <tmdb id> - Search by TMDB ID
/help - Show help

*Examples:*
• /search Inception
• /search The Dark Knight
• /tmdb 550
• /tmdb 680`, { parse_mode: 'Markdown' });
});

// Search command
bot.command('search', async (ctx) => {
  const query = ctx.message.text.split(' ').slice(1).join(' ');
  
  if (!query) {
    return ctx.reply('❌ Please provide a movie name. Example: /search Fight Club');
  }

  try {
    ctx.reply('🔍 Searching for subtitles...');
    
    const data = await searchSubtitles(query);
    
    if (!data || !data.success) {
      return ctx.reply('❌ No subtitles found or API error. Please try another movie.');
    }

    // Store movie data in session
    userSessions.set(ctx.from.id, {
      movie: data.movie,
      subtitles: data.subtitles
    });

    await sendMovieResults(ctx, data);
    
  } catch (error) {
    console.error('Search error:', error);
    ctx.reply('❌ Error searching for subtitles. Please try again.');
  }
});

// TMDB command
bot.command('tmdb', async (ctx) => {
  const tmdbId = ctx.message.text.split(' ')[1];
  
  if (!tmdbId) {
    return ctx.reply('❌ Please provide a TMDB ID. Example: /tmdb 550');
  }

  if (!/^\d+$/.test(tmdbId)) {
    return ctx.reply('❌ Invalid TMDB ID. Please provide a numeric ID.');
  }

  try {
    ctx.reply('🔍 Searching for subtitles by TMDB ID...');
    
    const data = await getSubtitlesByTMDB(tmdbId);
    
    if (!data || !data.success) {
      return ctx.reply('❌ No subtitles found for this TMDB ID.');
    }

    // Store movie data in session
    userSessions.set(ctx.from.id, {
      movie: data.movie,
      subtitles: data.subtitles
    });

    await sendMovieResults(ctx, data);
    
  } catch (error) {
    console.error('TMDB search error:', error);
    ctx.reply('❌ Error searching for subtitles. Please try again.');
  }
});

// Function to send movie results
async function sendMovieResults(ctx, data) {
  const { movie, subtitles } = data;
  
  // Movie info
  const movieInfo = `🎭 *${movie.title}* (${new Date(movie.release_date).getFullYear()})
  
📝 *Overview:* ${movie.overview}
⭐ *Rating:* ${movie.vote_average}/10
⏱️ *Runtime:* ${movie.runtime} minutes
🗣️ *Language:* ${movie.original_language}
📅 *Released:* ${movie.release_date}

📥 Found *${subtitles.length}* subtitle files available`;

  await ctx.reply(movieInfo, { parse_mode: 'Markdown' });

  // Group subtitles by language for better organization
  const subtitlesByLang = {};
  subtitles.forEach(sub => {
    if (!subtitlesByLang[sub.language]) {
      subtitlesByLang[sub.language] = [];
    }
    subtitlesByLang[sub.language].push(sub);
  });

  // Send subtitles organized by language
  for (const [language, langSubtitles] of Object.entries(subtitlesByLang)) {
    let langMessage = `\n🗣️ *${language} Subtitles:*\n\n`;
    
    langSubtitles.slice(0, 10).forEach((sub, index) => {
      langMessage += `${index + 1}. ${sub.name}\n`;
      langMessage += `   ⭐ ${sub.rating} | 📥 ${sub.downloads} downloads\n`;
      langMessage += `   [Download](${API_BASE_URL}${sub.proxy_download_url})\n\n`;
    });

    if (langSubtitles.length > 10) {
      langMessage += `... and ${langSubtitles.length - 10} more ${language} subtitles`;
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

  // Send quick actions
  const quickActions = `💡 *Quick Actions:*
  
You can download any subtitle by clicking the download links above, or use these commands:

/search <movie> - Search another movie
/tmdb <id> - Search by TMDB ID
/help - Show help`;

  await ctx.reply(quickActions, { parse_mode: 'Markdown' });
}

// Handle text messages for quick search
bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  
  // Ignore commands
  if (text.startsWith('/')) return;
  
  // If message is longer than 2 characters, treat as search
  if (text.length > 2) {
    try {
      ctx.reply('🔍 Searching for subtitles...');
      
      const data = await searchSubtitles(text);
      
      if (!data || !data.success) {
        return ctx.reply('❌ No subtitles found. Please try another movie name.');
      }

      // Store movie data in session
      userSessions.set(ctx.from.id, {
        movie: data.movie,
        subtitles: data.subtitles
      });

      await sendMovieResults(ctx, data);
      
    } catch (error) {
      console.error('Quick search error:', error);
      ctx.reply('❌ Error searching for subtitles. Please try again.');
    }
  }
});

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
  ctx.reply('❌ An error occurred. Please try again.');
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
