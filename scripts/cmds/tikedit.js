const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

/**
* @author MahMUD
* @author: do not delete it
*/

module.exports = {
  config: {
    name: "tikedit",
    version: "1.7",
    author: "MahMUD",
    role: 0,
    category: "media",
    guide: {
      en: "{pn} [keyword]\nExample: {pn} naruto"
    },
    coolDowns: 5
  },

   onStart: async function ({ api, event, args, message }) {
       const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);  
       if (module.exports.config.author !== obfuscatedAuthor) { return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID); }
       if (!args.length) { 
       return message.reply("⚠️ Usage: !tikedit [search]");
     }

       const keyword = args.join(" ");
       const cacheDir = path.join(__dirname, "cache");
       if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
       const videoPath = path.join(cacheDir, `tiksr_${Date.now()}.mp4`);
       api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const MahmudApi = await baseApiUrl();
      const res = await axios({
        method: "GET",
        url: `${MahmudApi}/api/tiksr`,
        params: { sr: keyword },
        responseType: "stream"
      });

        const writer = fs.createWriteStream(videoPath);
        res.data.pipe(writer);
        await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

        const stats = fs.statSync(videoPath);
        if (stats.size > 26214400) {
        if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply("Video too large (25MB+). Try another keyword.");
      }

       await message.reply({ body: `•𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐓𝐢𝐤𝐓𝐨𝐤 𝐄𝐝𝐢𝐭 𝐕𝐢𝐝𝐞𝐨.\n•𝐒𝐞𝐚𝐫𝐜𝐡: ${keyword}`,
       attachment: fs.createReadStream(videoPath)  });
       api.setMessageReaction("🪽", event.messageID, () => {}, true);

     } catch (err) {
       console.error("tiksr cmd error:", err);
       api.setMessageReaction("❌", event.messageID, () => {}, true);
       message.reply("🥹error, contact MahMUD.");
     } finally {
       if (fs.existsSync(videoPath)) {
       setTimeout(() => {
       if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
        }, 2000);
      }
    }
  }
};
