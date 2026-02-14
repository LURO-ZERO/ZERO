const plugins = require("../lib/plugins");
const { bot, isPrivate, clockString, pm2Uptime } = require("../lib");
const { OWNER_NAME, BOT_NAME, HANDLERS } = require("../config");
const { hostname } = require("os");

 bot(
  {
    pattern: "test",
    fromMe: isPrivate,
    desc: "Show All Commands by Category",
    type: "user",
    dontAddCommandList: true,
  },
  async (message, match) => {
    let { prefix } = message;

    const contextInfo = {
      forwardingScore: 1,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363401718648491@newsletter',
        newsletterName: BOT_NAME,
        serverMessageId: -1
      }
    };

    let categories = {};
    plugins.commands.forEach((command) => {
      let cmd;
      if (command.pattern instanceof RegExp) {
        cmd = command.pattern.toString().split(/\W+/)[1];
      }

      if (!command.dontAddCommandList && cmd !== undefined) {
        let type = command.type ? command.type.toLowerCase() : "misc";
        if (!categories[type]) categories[type] = [];
        categories[type].push({ cmd, desc: command.desc });
      }
    });

    let selectedCategory = match ? match.trim().toLowerCase() : "";
    if (selectedCategory && categories[selectedCategory]) {
      let menu = `╭━━━ [ *${selectedCategory.toUpperCase()}* ] ━━━\n`;
      
      categories[selectedCategory].sort((a, b) => a.cmd.localeCompare(b.cmd)).forEach(({ cmd, desc }, num) => {
        menu += `┃ ${num + 1}. *${cmd.trim()}*\n`;
        if (desc) menu += `┃ Use: ${desc}\n`;
      });
      menu += `╰━━━━━━━━━━━━━━━\n`;

      return await message.client.sendMessage(
        message.jid,
        {
          text: menu,
          contextInfo
        },
        { quoted: message.data || message }
      );
    }

    let rows = Object.keys(categories).sort().map((type) => {
      return {
        header: '',
        title: type.charAt(0).toUpperCase() + type.slice(1),
        description: `View commands for ${type}`,
        id: `${prefix}list ${type}`
      };
    });

    return await message.client.sendMessage(
      message.jid,
      {
        text: `Hello! Please select a command category from the menu below to view its commands.`,
        title: "Command List",
        footer: "©ZERO 2K26",
        interactiveButtons: [
          {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
              title: "Select Category",
              sections: [
                {
                  title: `${BOT_NAME} - Categories`,
                  highlight_label: "📋",
                  rows: rows
                }
              ]
            })
          }
        ],
        contextInfo,
        viewOnce: true
      },
      {
        quoted: {
          key: message.key,
          message: {
            conversation: message.text || message.body || ''
          }
        }
      }
    );
  }
);
