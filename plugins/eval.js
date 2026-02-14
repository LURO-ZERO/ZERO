const {
	toAudio,
	isAdmin,
	serialize,
	readQr,
	downloadMedia,
	getRandom,
	bot,
	commands,
	getBuffer,
	decodeJid,
	parseJid,
	parsedJid,
	getJson,
	isUrl,
	getUrl,
	validateQuality,
	qrcode,
	secondsToDHMS,
	formatBytes,
	sleep,
	clockString,
	runtime,
	AddMp3Meta,
	isNumber,
} = require("../lib/");

const {
	saveMessage,
	loadMessage,
	saveChat,
	getName
} = require("../lib/database/StoreDb");

const util = require('util');
const config = require('../config');

bot({
    pattern: 'eval', on: "text", fromMe: true, dontAddCommandList: true
}, async (message, match) => {
    if (!match.startsWith(">")) return;
        //const m = message;
        try {
            let evaled = await eval(`(async()=> { ${match.replace(">", "")} }) ()`);
            if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
            return await message.reply(evaled);
        } catch (err) {
           return await message.reply(util.format(err));
        }
    
});
