const axios = require("axios");
const { getStreamFromURL } = global.utils;

async function fetchTikTokVideos(query) {
  try {
    const res = await axios.get("https://tikwm.com/api/feed/search", {
      params: {
        keywords: query,
        count: 20,
        cursor: 0,
        HD: 1
      }
    });

    return res.data?.data?.videos || [];
  } catch (e) {
    console.log("Search Error:", e);
    return [];
  }
}

module.exports = {
  config: {
    name: "lyricvideo",
    aliases: ["lv"],
    author: "Nazim Fixed",
    version: "3.0",
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
      let query = "";

      if (args.length > 0) {
        query = args.join(" ");
      } else {
        return api.sendMessage("❌ Song name dao", event.threadID, event.messageID);
      }

      query += " lyrics edit";

      const videos = await fetchTikTokVideos(query);

      if (!videos.length) {
        return api.sendMessage("❌ Latest lyric video pawa jai nai!", event.threadID, event.messageID);
      }

      let videoUrl = null;

      for (let vid of videos) {
        videoUrl =
          vid.play ||
          vid.wmplay ||
          vid.hdplay ||
          vid?.play_addr?.url_list?.[0];

        if (videoUrl) break;
      }

      if (!videoUrl) {
        return api.sendMessage("❌ Video URL pawa jai nai!", event.threadID, event.messageID);
      }

      const stream = await getStreamFromURL(videoUrl);

      return api.sendMessage({
        body: `🎧 ${query}`,
        attachment: stream
      }, event.threadID, event.messageID);

    } catch (err) {
      console.log("Main Error:", err);
      api.sendMessage("⚠️ Error hoise, abar try kor", event.threadID, event.messageID);
    }
  }
};
