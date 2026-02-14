const axios = require("axios");
const config = require("../config");
const { bot, isPrivate } = require("../lib/");

async function searchYouTube(query) {
  try {
    const res = await axios.get(`https://abhi-api.vercel.app/api/search/yts?text=${encodeURIComponent(query)}`);
    if (res.data && res.data.status && res.data.result) {
      return res.data.result.url; 
    }
    return null;
  } catch (error) {
    console.error("Search Error:", error.message);
    return null;
  }
}

async function downloadAndSendVideo(message, videoUrl) {
  try {
    await message.reply("_Downloading Video..._");
    
    const res = await axios.get(`https://api-aswin-sparky.koyeb.app/api/downloader/ytv?url=${encodeURIComponent(videoUrl)}`);
    if (!res.data || !res.data.status || !res.data.data) {
      return await message.reply("❌ Failed to get video link from API.");
    }
    
    const video = res.data.data;

    const videoIdMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/|v=))([a-zA-Z0-9_-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

    let jpegThumbnail = null;
    if (thumbnailUrl) {
      try {
        jpegThumbnail = await axios.get(thumbnailUrl, { responseType: "arraybuffer" }).then(res => res.data);
      } catch (e) {
        console.error("Thumbnail fetch error:", e.message);
      }
    }

    await message.client.sendMessage(message.jid, {
      video: { url: video.url },
      mimetype: "video/mp4",
      caption: `🎬 *${video.title}*`
    }, { quoted: message.data });

    await message.client.sendMessage(message.jid, {
      document: { url: video.url },
      fileName: `${video.title}.mp4`,
      mimetype: "video/mp4",
      caption: `🎬 *${video.title}*`,
      jpegThumbnail
    }, { quoted: message.data });

  } catch (err) {
    console.error("Video Error:", err);
    await message.reply("❌ Failed to process video.\n" + err.message);
  }
}

async function downloadAndSendAudio(message, videoUrl) {
  try {
    await message.reply("_Downloading Audio..._");
    
    const res = await axios.get(`https://api-aswin-sparky.koyeb.app/api/downloader/song?search=${encodeURIComponent(videoUrl)}`);
    if (!res.data || !res.data.status || !res.data.data) {
      return await message.reply("❌ Failed to get audio link from API.");
    }

    const audio = res.data.data; 

    const videoIdMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/|v=))([a-zA-Z0-9_-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

    let jpegThumbnail = null;
    if (thumbnailUrl) {
      try {
        jpegThumbnail = await axios.get(thumbnailUrl, { responseType: "arraybuffer" }).then(res => res.data);
      } catch (e) {
        console.error("Thumbnail fetch error:", e.message);
      }
    }

    const artist = config.BOT_NAME || "Bot";

    await message.client.sendMessage(message.jid, {
      audio: { url: audio.url },
      mimetype: "audio/mpeg",
      ptt: false,
      contextInfo: {
        externalAdReply: {
          title: audio.title,
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
      document: { url: audio.url },
      fileName: `${audio.title}.mp3`,
      mimetype: "audio/mpeg",
      caption: `🎵 *${audio.title}*`,
      jpegThumbnail
    }, { quoted: message.data });

  } catch (err) {
    console.error("Audio Error:", err);
    await message.reply("❌ Failed to process audio.\n" + err.message);
  }
}

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

bot(
  {
    pattern: "song ?(.*)",
    fromMe: isPrivate,
    desc: "🎵 Download YouTube audio via search",
    type: "download",
  },
  async (message, match) => {
    let query = match || message.reply_message?.text;
    if (!query) return await message.reply("❗ Please provide a song name.");
    
    query = `${query.trim()} song`;
    
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
    if (!query) return await message.reply("❗ Please provide a video name.");
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
    if (!url || (!url.includes("youtube.com") && !url.includes("youtu.be"))) {
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
    if (!url || (!url.includes("youtube.com") && !url.includes("youtu.be"))) {
      return await message.reply("❗ Please provide a valid YouTube URL.");
    }
    await downloadAndSend(message, "video", url, true);
  }
);
