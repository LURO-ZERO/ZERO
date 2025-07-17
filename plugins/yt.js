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
    if (!url || !isUrl(url)) {
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
    if (!url || !isUrl(url)) {
      return await message.reply("❗ Please provide a valid YouTube URL.");
    }
    await downloadAndSend(message, "video", url, true);
  }
);
