const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "2.0",
		author: "Modified by Nazim",
		category: "events"
	},

	langs: {
		en: {
			session1: "morning",
			session2: "noon",
			session3: "afternoon",
			session4: "evening",
			multiple1: "you",
			multiple2: "you guys",
			defaultWelcomeMessage: `🥰 𝐀𝐬𝐬𝐚𝐥𝐚𝐦𝐮𝐥𝐚𝐢𝐤𝐮𝐦 🥰

🎀 {userName}

Welcome {multiple} to
[ {boxName} ] Group

Have a nice {session} 😊
⚠ Follow all rules ♻`
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType == "log:subscribe")
			return async function () {

				const hours = getTime("HH");
				const { threadID } = event;
				const { nickNameBot } = global.GoatBot.config;
				const prefix = global.utils.getPrefix(threadID);
				const dataAddedParticipants = event.logMessageData.addedParticipants;

				if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
					if (nickNameBot)
						api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
					return message.send(getLang("welcomeMessage", prefix));
				}

				let addedByName = "Unknown";
				let addedByID = event.author;
				let addedByMention = [];

				try {
					const userInfo = await api.getUserInfo(event.author);
					addedByName = userInfo[event.author].name;
					addedByMention.push({
						tag: addedByName,
						id: addedByID
					});
				} catch (e) {}

				if (!global.temp.welcomeEvent[threadID])
					global.temp.welcomeEvent[threadID] = {
						joinTimeout: null,
						dataAddedParticipants: []
					};

				global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
				clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

				global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {

					const threadData = await threadsData.get(threadID);
					if (threadData.settings.sendWelcomeMessage == false)
						return;

					const threadName = threadData.threadName;
					const totalMem = threadData.participantIDs.length;

					const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
					const userName = [],
					mentions = [],
					userIDs = [];

					let multiple = false;
					if (dataAddedParticipants.length > 1)
						multiple = true;

					for (const user of dataAddedParticipants) {
						userName.push(user.fullName);
						userIDs.push(user.userFbId);
						mentions.push({
							tag: user.fullName,
							id: user.userFbId
						});
					}

					if (userName.length == 0) return;

					let { welcomeMessage = getLang("defaultWelcomeMessage") } =
						threadData.data;

					const form = {
						mentions: mentions.concat(addedByMention)
					};

					welcomeMessage = welcomeMessage
						.replace(/\{userName\}/g, userName.join(", "))
						.replace(/\{boxName\}/g, threadName)
						.replace(
							/\{multiple\}/g,
							multiple ? getLang("multiple2") : getLang("multiple1")
						)
						.replace(
							/\{session\}/g,
							hours <= 10
								? getLang("session1")
								: hours <= 12
									? getLang("session2")
									: hours <= 18
										? getLang("session3")
										: getLang("session4")
						);

					form.body = welcomeMessage + `

━━━━━━━━━━━━━━━
👤 UID: ${userIDs.join(", ")}
👥 Joined: ${userIDs.length}
👨‍👩‍👧‍👦 Total Member: ${totalMem}

➤ Added By: ${addedByName}

                       ᴀᴅᴍɪɴ
                 ─ Mehedi Hasan
━━━━━━━━━━━━━━━`;

					message.send(form);
					delete global.temp.welcomeEvent[threadID];
				}, 1500);
			};
	}
};
