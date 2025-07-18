const axios = require("axios");
const yts = require("yt-search");
const config = require("../config");
const { bot, isPrivate } = require("../lib/");
const ytd = require("../lib/scrape").ytd;

// --- VIDEO FUNCTION ---
async function downloadAndSendVideo(message, videoUrl) {
  try {
    const video = await ytd(videoUrl);
    if (!video?.url) return await message.reply("❌ Failed to get video link.");

    const videoIdMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/|v=))([a-zA-Z0-9_-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

    const jpegThumbnail = thumbnailUrl
      ? await axios.get(thumbnailUrl, { responseType: "arraybuffer" }).then(res => res.data)
      : null;

    await message.client.sendMessage(message.jid, {
      video: { url: video.url },
      mimetype: "video/mp4",
      caption: `*${video.title}*`
    }, { quoted: message.data });

    await message.client.sendMessage(message.jid, {
      document: { url: video.url },
      fileName: `${video.title}.mp4`,
      mimetype: "video/mp4",
      caption: `*${video.title}*`,
      jpegThumbnail
    }, { quoted: message.data });

  } catch (err) {
    console.error("Video Error:", err);
    await message.reply("❌ Failed to process video.\n" + err.message);
  }
}

// --- AUDIO FUNCTION ---
async function downloadAndSendAudio(message, videoUrl) {
  try {
    const video = await ytd(videoUrl);
    if (!video?.url) return await message.reply("❌ Failed to get audio link.");

    const videoIdMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/|v=))([a-zA-Z0-9_-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

    const jpegThumbnail = thumbnailUrl
      ? await axios.get(thumbnailUrl, { responseType: "arraybuffer" }).then(res => res.data)
      : null;

    const artist = config.BOT_NAME || "Bot";

    await message.client.sendMessage(message.jid, {
      audio: { url: video.url },
      mimetype: "audio/mp4",
      ptt: false,
      contextInfo: {
        externalAdReply: {
          title: video.title,
          body: artist,
          mediaType: 2,
          thumbnail: jpegThumbnail,
          mediaUrl: videoUrl,
          sourceUrl: videoUrl,
          showAdAttribution: false
        }
      }
    }, { quoted: message.data });

    await message.client.sendMessage(message.jid, {
      document: { url: video.url },
      fileName: `${video.title}.mp3`,
      mimetype: "audio/mp3",
      caption: `🎵 *${video.title}*`,
      jpegThumbnail
    }, { quoted: message.data });

  } catch (err) {
    console.error("Audio Error:", err);
    await message.reply("❌ Failed to process audio.\n" + err.message);
  }
}

// --- SEARCH HANDLER ---
async function searchYouTube(query) {
  const results = await yts.search(query);
  if (!results || !results.videos || !results.videos.length) return null;
  return results.videos[0].url;
}

// --- UNIVERSAL HANDLER ---
async function downloadAndSend(message, type, input, isUrlFlag) {
  if (!input) return await message.reply("❗ Please provide a query or YouTube link.");

  let url = input;
  if (!isUrlFlag) {
    const searchResult = await searchYouTube(input);
    if (!searchResult) return await message.reply("❌ No results found on YouTube.");
    url = searchResult;
  }

  if (type === "audio") {
    await downloadAndSendAudio(message, url);
  } else {
    await downloadAndSendVideo(message, url);
  }
}

// --- PLUGINS ---
bot(
  {
    pattern: "song ?(.*)",
    fromMe: isPrivate,
    desc: "🎵 Download YouTube audio via search",
    type: "download",
  },
  async (message, match) => {
    const query = match || message.reply_message?.text;
    await downloadAndSend(message, "audio", query, false);
  }
);

bot(
  {
    pattern: "video ?(.*)",
    fromMe: isPrivate,
    desc: "🎬 Download YouTube video via search",
    type: "download",
  },
  async (message, match) => {
    const query = match || message.reply_message?.text;
    await downloadAndSend(message, "video", query, false);
  }
);

bot(
  {
    pattern: "yta ?(.*)",
    fromMe: isPrivate,
    desc: "🔗 Download YouTube audio via URL",
    type: "download",
  },
  async (message, match) => {
    const url = match || message.reply_message?.text;
    if (!url || !url.includes("youtube.com") && !url.includes("youtu.be")) {
      return await message.reply("❗ Please provide a valid YouTube URL.");
    }
    await downloadAndSend(message, "audio", url, true);
  }
);

bot(
  {
    pattern: "ytv ?(.*)",
    fromMe: isPrivate,
    desc: "📥 Download YouTube video via URL",
    type: "download",
  },
  async (message, match) => {
    const url = match || message.reply_message?.text;
    if (!url || !url.includes("youtube.com") && !url.includes("youtu.be")) {
      return await message.reply("❗ Please provide a valid YouTube URL.");
    }
    await downloadAndSend(message, "video", url, true);
  }
);
