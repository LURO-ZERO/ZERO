const { bot, isPrivate } = require("../lib/");
const fetch = require("node-fetch");

bot({
  pattern: "insta ?(.*)",
  fromMe: isPrivate,
  desc: "Download Instagram videos/images.",
  type: "downloader",
}, async (message, match) => {
  if (!match) return;

  const apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${encodeURIComponent(match)}`;

  try {
    const response = await fetch(apiUrl);
    const result = await response.json();

    if (!result.status || !result.data || result.data.length === 0) return;

    const quotedObj = {
      quoted: {
        key: message.key,
        message: { conversation: message.text || message.body || "" },
      },
    };

    for (const item of result.data) {
      if (item.type === "video") {
        await message.client.sendMessage(
          message.jid,
          {
            video: { url: item.url },
            caption: "Here is your Instagram video",
            mimetype: "video/mp4",
          },
          quotedObj
        );
      } else if (item.type === "image") {
        await message.client.sendMessage(
          message.jid,
          {
            image: { url: item.url },
            caption: "Here is your Instagram image",
          },
          quotedObj
        );
      }
    }
  } catch (error) {
    console.error("Error fetching Instagram media:", error);
  }
});
