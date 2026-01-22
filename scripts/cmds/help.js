const fs = require("fs-extra");
const path = require("path");

const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    aliases: ["menu", "commands"],
    version: "5.0-converted",
    author: "AKASH",
    countDown: 5,
    role: 0,
    shortDescription: { en: "View command list with pages + command details" },
    longDescription: { en: "Shows all commands by category with page system and fancy style" },
    category: "info",
    guide: { en: "{pn} [page] / {pn} <cmdName>" },
    priority: 1
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;

    // Prefix (global + box)
    const threadData = await threadsData.get(threadID);
    const globalPrefix = global.GoatBot.config.prefix;
    const boxPrefix = threadData.data?.prefix || globalPrefix;

    // Fancy font converter (𝐀𝐁𝐂…)
    const fancyFont = (text) => {
      const fonts = {
        a: "𝐚", b: "𝐛", c: "𝐜", d: "𝐝", e: "𝐞", f: "𝐟", g: "𝐠", h: "𝐡", i: "𝐢", j: "𝐣", k: "𝐤", l: "𝐥", m: "𝐦",
        n: "𝐧", o: "𝐨", p: "𝐩", q: "𝐪", r: "𝐫", s: "𝐬", t: "𝐭", u: "𝐮", v: "𝐯", w: "𝐰", x: "𝐱", y: "𝐲", z: "𝐳",
        A: "𝐀", B: "𝐁", C: "𝐂", D: "𝐃", E: "𝐄", F: "𝐅", G: "𝐆", H: "𝐇", I: "𝐈", J: "𝐉", K: "𝐊", L: "𝐋", M: "𝐌",
        N: "𝐍", O: "𝐎", P: "𝐏", Q: "𝐐", R: "𝐑", S: "𝐒", T: "𝐓", U: "𝐔", V: "𝐕", W: "𝐖", X: "𝐗", Y: "𝐘", Z: "𝐙",
        "0": "𝟎", "1": "𝟏", "2": "𝟐", "3": "𝟑", "4": "𝟒", "5": "𝟓", "6": "𝟔", "7": "𝟕", "8": "𝟖", "9": "𝟗"
      };
      return String(text).split("").map(ch => fonts[ch] || ch).join("");
    };

    // role text
    const roleTextToString = (r) => {
      switch (r) {
        case 0: return "𝟎 (𝐀𝐥𝐥 𝐮𝐬𝐞𝐫𝐬)";
        case 1: return "𝟏 (𝐆𝐫𝐨𝐮𝐩 𝐚𝐝𝐦𝐢𝐧𝐬)";
        case 2: return "𝟐 (𝐁𝐨𝐭 𝐚𝐝𝐦𝐢𝐧)";
        default: return "𝐔𝐧𝐤𝐧𝐨𝐰𝐧";
      }
    };

    // Collect categories (like 2nd style)
    const getCommandCategories = () => {
      const cats = {};
      for (const [name, cmd] of commands) {
        // role filter
        if (cmd.config?.role > 0 && role < cmd.config.role) continue;

        const category = cmd.config?.category || "Uncategorized";
        cats[category] = cats[category] || { commands: [] };
        cats[category].commands.push(name);
      }
      return cats;
    };

    // Pagination generator (category based)
    const generateCommandList = (page = 1, categories) => {
      const categoryKeys = Object.keys(categories).sort((a, b) => a.localeCompare(b));
      const categoriesPerPage = 10; // like 2nd style
      const totalPages = Math.max(1, Math.ceil(categoryKeys.length / categoriesPerPage));

      const currentPage = Math.max(1, Math.min(page, totalPages));
      const startIndex = (currentPage - 1) * categoriesPerPage;
      const endIndex = startIndex + categoriesPerPage;
      const currentCategories = categoryKeys.slice(startIndex, endIndex);

      const totalCommands = commands.size;

      let msg = "";
      msg += "୨୧ ─·· 🍰 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐌𝐞𝐧𝐮 🍰 ··─ ୨୧\n\n";
      msg += `🍓 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬: ${totalCommands}\n`;
      msg += `🌐 𝐒𝐲𝐬𝐭𝐞𝐦 𝐩𝐫𝐞𝐟𝐢𝐱: ${globalPrefix}\n`;
      msg += `🛸 𝐘𝐨𝐮𝐫 𝐛𝐨𝐱 𝐜𝐡𝐚𝐭 𝐩𝐫𝐞𝐟𝐢𝐱: ${boxPrefix}\n`;
      msg += `📖 𝐏𝐚𝐠𝐞: ${currentPage} / ${totalPages}\n\n`;

      for (const category of currentCategories) {
        msg += `╭・─「 🌸 ${fancyFont(String(category).toUpperCase())} 🌸 」\n`;

        const names = categories[category].commands.sort((a, b) => a.localeCompare(b));
        const fancyNames = names.map(n => fancyFont(n));

        // show in groups of 3 (same as 2nd)
        for (let i = 0; i < fancyNames.length; i += 3) {
          const group = fancyNames.slice(i, i + 3);
          msg += `│  🎀 ${group.join(" ✧ ")}\n`;
        }

        msg += `╰・─── ⬦ 🍓 ⬦ ───・\n\n`;
      }

      // Footer nav + creator
      msg += `╭─⋅──⋅୨♡୧⋅──⋅─\n`;
      if (totalPages > 1) {
        if (currentPage > 1) msg += `│ ⏪ 𝐔𝐬𝐞: ${boxPrefix}help ${currentPage - 1}\n`;
        if (currentPage < totalPages) msg += `│ ⏩ 𝐔𝐬𝐞: ${boxPrefix}help ${currentPage + 1}\n`;
      }
      msg += `│ 🔍 𝐔𝐬𝐞: ${boxPrefix}help <cmd> for details\n`;
      msg += `│ 👑 𝐂𝐫𝐞𝐚𝐭𝐨𝐫: ${fancyFont("AKASH")} ッ\n`;
      msg += `╰─⋅──⋅୨♡୧⋅──⋅─\n`;
      msg += `‧₊˚ ☁️⋅♡𓂃 ࣪ ִֶָ☾. 𝐏𝐚𝐠𝐞 ${currentPage}/${totalPages} ‧₊˚ ☁️⋅♡𓂃 ࣪ ִֶָ☾.`;

      return { message: msg, totalPages, currentPage };
    };

    // attachments (same vibe as 2nd, easy)
    const helpImages = [
      "https://files.catbox.moe/5kb6w8.jpg"
    ];
    const randomImage = helpImages[Math.floor(Math.random() * helpImages.length)];

    // 1) If user typed a page number
    if (args.length > 0 && !isNaN(args[0])) {
      const pageNum = parseInt(args[0]);
      const categories = getCommandCategories();
      const result = generateCommandList(pageNum, categories);

      if (pageNum < 1 || pageNum > result.totalPages) {
        return message.reply(`❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐩𝐚𝐠𝐞 𝐧𝐮𝐦𝐛𝐞𝐫! 𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞: 1-${result.totalPages}`);
      }

      return message.reply({
        body: result.message,
        attachment: await global.utils.getStreamFromURL(randomImage)
      });
    }

    // 2) If user typed a command name
    if (args.length > 0 && isNaN(args[0])) {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        return message.reply(`❌ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 "${commandName}" 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝.`);
      }

      const cfg = command.config || {};
      const author = cfg.author || "Unknown";
      const roleText = roleTextToString(cfg.role ?? 0);

      // Support both string + {en:""} formats
      const longDesc =
        typeof cfg.longDescription === "string"
          ? cfg.longDescription
          : (cfg.longDescription?.en || "No description.");

      // guide support
      const guideRaw =
        typeof cfg.guide === "string"
          ? cfg.guide
          : (cfg.guide?.en || "No guide available.");

      const usage = guideRaw
        .replace(/{pn}/g, boxPrefix + (cfg.name || commandName))
        .replace(/{p}/g, boxPrefix)
        .replace(/{n}/g, cfg.name || commandName);

      const response =
`╭────⊙『 **${fancyFont(String(cfg.name || commandName).toUpperCase())}** 』
│ 📝 𝐃𝐞𝐬𝐜𝐫𝐢𝐩𝐭𝐢𝐨𝐧: ${longDesc}
│ 👑 𝐀𝐮𝐭𝐡𝐨𝐫: ${author}
│ ⚙️ 𝐆𝐮𝐢𝐝𝐞: ${usage}
│ 🔯 𝐕𝐞𝐫𝐬𝐢𝐨𝐧: ${cfg.version || "1.0"}
│ ♻️ 𝐑𝐨𝐥𝐞: ${roleText}
╰────────────⊙`;

      return message.reply(response);
    }

    // 3) Default: show page 1
    const categories = getCommandCategories();
    const result = generateCommandList(1, categories);

    return message.reply({
      body: result.message,
      attachment: await global.utils.getStreamFromURL(randomImage)
    });
  }
};
