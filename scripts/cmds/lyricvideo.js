const axios = require("axios");
const { getStreamFromURL, shortenURL } = global.utils;

async function fetchTikTokVideos(query) {
  try {
    const res = await axios.get(`https://tikwm.com/api/feed/search`, {
      params: {
        keywords: query,
        count: 20,
        cursor: 0,
        HD: 1
      }
    });

    return res.data.data.videos;
  } catch (e) {
    console.log(e);
    return null;
  }
}

module.exports = {
  config: {
    name: "lyricvideo",
    aliases: ["lv"],
    author: "Nazim Fixed",
    version: "2.0",
    shortDescription: {
      en: "Play latest lyric video",
    },
    longDescription: {
      en: "Search latest lyrical edit video",
    },
    category: "fun",
    guide: {
      en: "{p}{n} [song name]",
    },
  },

  onStart: async function ({ api, event, args }) {
    api.setMessageReaction("✨", event.messageID, () => {}, true);

    try {
      let query = '';

      if (event.messageReply && event.messageReply.attachments?.length > 0) {
        const shortUrl = event.messageReply.attachments[0].url;

        const reco = await axios.get(`https://audio-reco.onrender.com/kshitiz?url=${encodeURIComponent(shortUrl)}`);
        query = reco.data.title;
      } 
      else if (args.length > 0) {
        query = args.join(" ");
      } 
      else {
        return api.sendMessage("❌ Song name dao or audio/video reply koro", event.threadID, event.messageID);
      }

      query += " lyrics edit";

      const videos = await fetchTikTokVideos(query);

      if (!videos || videos.length === 0) {
        return api.sendMessage("❌ Latest lyric video pawa jai nai!", event.threadID, event.messageID);
      }

      const random = videos[Math.floor(Math.random() * videos.length)];
      const videoUrl = random.play;

      const stream = await getStreamFromURL(videoUrl);

      api.sendMessage({
        body: `🎧 ${query}`,
        attachment: stream
      }, event.threadID, event.messageID);

    } catch (err) {
      console.log(err);
      api.sendMessage("⚠️ Error hoise, abar try kor", event.threadID, event.messageID);
    }
  }
};
