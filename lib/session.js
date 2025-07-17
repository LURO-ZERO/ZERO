const fs = require('fs');
const path = require('path');
const axios = require('axios');

const token = "0aac504c0a228733997e94f4ca7c57e469379ef3c516588c84c2c02a6496177951b945af5aa44fbfacbd58297c8b1a4caf0b4447dcc2d2f4624dfcf5f4a49475";

async function MakeSession(sessionId, folderPath) {
    try {
        const pasteId = sessionId.split("~")[1];
        const rawUrl = `https://hastebin.com/raw/${pasteId}`;

        const config = {
            method: 'get',
            url: rawUrl,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        const response = await axios(config);

        if (!response.data || !response.data.content) {
            throw new Error("Empty or invalid response from Hastebin.");
        }

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        const outputPath = path.join(folderPath, "creds.json");

        const dataToWrite = typeof response.data.content === "string"
            ? response.data.content
            : JSON.stringify(response.data.content);

        fs.writeFileSync(outputPath, dataToWrite);
        console.log("Session file saved successfully!");

    } catch (error) {
        console.error("An error occurred while saving session:", error.message);
    }
}

module.exports = { MakeSession };
