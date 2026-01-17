const axios = require("axios");

// ================= STATE =================
const activeUsers = new Set();   // who is ON
const memory = {};               // user-based memory (RAM)

// ================= BOT INFO =================
const BOT = {
  name: "Raha AI",
  creator: "Washiq Adnan"
};

const HEADER = "🎀˚₊· ͟͟͞͞➳❥ 𝐑𝐚𝐡𝐚 𝐀𝐈 ࿐🎀\n\n";

module.exports = {
  config: {
    name: "raha",
    aliases: ["rahaai"],
    version: "FINAL-RAM-MEMORY",
    author: BOT.creator,
    role: 0,
    category: "ai",
    guide: {
      en: "/raha on | /raha off"
    }
  },

  // ================= COMMAND =================
  onStart: async function ({ message, args, event }) {
    const uid = event.senderID;
    const cmd = (args[0] || "").toLowerCase();

    if (cmd === "on") {
      activeUsers.add(uid);
      if (!memory[uid]) memory[uid] = []; // DO NOT RESET
      return message.reply(
        `${HEADER}✅ Raha AI is now ON.\nI’ll remember our conversation until bot restart.`
      );
    }

    if (cmd === "off") {
      activeUsers.delete(uid); // memory stays
      return message.reply(
        `${HEADER}🚫 Raha AI is now OFF.\nI’ll stay silent, but I still remember you.`
      );
    }

    return message.reply(`${HEADER}Use:\n/raha on\n/raha off`);
  },

  // ================= CHAT =================
  onChat: async function ({ message, event }) {
    const uid = event.senderID;

    // Only talk if user turned ON
    if (!activeUsers.has(uid)) return;
    if (!event.body || event.body.startsWith("/")) return;

    const userText = event.body.trim();
    if (!memory[uid]) memory[uid] = [];

    const lower = userText.toLowerCase();

    // ================= CREATOR LOCK =================
    const creatorTriggers = [
      "who made you",
      "who created you",
      "who is your developer",
      "who is your owner",
      "your creator",
      "your developer",
      "developer",
      "creator",
      "owner",
      "ডেভেলপার",
      "কে বানাইছে",
      "কে বানাইসে",
      "তোমাকে কে বানিয়েছে",
      "তোর ডেভেলপার কে"
    ];

    if (creatorTriggers.some(k => lower.includes(k))) {
      return message.reply(
        `${HEADER}` +
        `🤖 Name: ${BOT.name}\n` +
        `👤 Creator & Developer: ${BOT.creator}\n\n` +
        `I was personally created and maintained by ${BOT.creator}.`
      );
    }

    // ================= MEMORY SAVE =================
    memory[uid].push(`User: ${userText}`);
    if (memory[uid].length > 12) memory[uid].shift();

    // ================= LANGUAGE =================
    const hasBangla = /[\u0980-\u09FF]/.test(userText);
    const langRule = hasBangla
      ? "Reply in Bengali."
      : "Reply in the same language as the user.";

    // ================= PROMPT =================
    const prompt = `
You are Raha AI, a consistent, friendly AI assistant.

Rules:
- ${langRule}
- Remember previous messages.
- Be natural and human-like.
- No random personality changes.
- Your creator is ${BOT.creator}.

Conversation:
${memory[uid].join("\n")}

Assistant:
`;

    try {
      const apiUrl =
        "https://betadash-api-swordslush-production.up.railway.app/you?chat=" +
        encodeURIComponent(prompt);

      const res = await axios.get(apiUrl);
      if (!res.data || !res.data.response) return;

      const reply = res.data.response.trim();

      // save assistant reply
      memory[uid].push(`Assistant: ${reply}`);
      if (memory[uid].length > 12) memory[uid].shift();

      return message.reply(HEADER + reply);
    } catch (err) {
      console.error("Raha AI Error:", err.message);
    }
  }
};
