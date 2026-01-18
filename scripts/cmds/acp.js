const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "accept",
    aliases: ["acp", "friend"],
    version: "2.5",
    author: "Washiq", // Modified for Washiq AI
    countDown: 10,
    role: 2, // Admin only logic
    shortDescription: "Accept/Delete friend requests",
    longDescription: "Manage your pending friend requests easily.",
    category: "Utility",
  },

  onReply: async function ({ message, Reply, event, api, commandName }) {
    const { author, listRequest, messageID } = Reply;
    if (author !== event.senderID) return;

    const args = event.body.replace(/ +/g, " ").toLowerCase().split(" ");
    clearTimeout(Reply.unsendTimeout);

    const form = {
      av: api.getCurrentUserID(),
      fb_api_caller_class: "RelayModern",
      variables: {
        input: {
          source: "friends_tab",
          actor_id: api.getCurrentUserID(),
          client_mutation_id: Math.floor(Math.random() * 100000).toString()
        },
        scale: 3,
        refresh_num: 0
      }
    };

    const success = [];
    const failed = [];

    if (args[0] === "add") {
      form.fb_api_req_friendly_name = "FriendingCometFriendRequestConfirmMutation";
      form.doc_id = "3147613905362928";
    }
    else if (args[0] === "del") {
      form.fb_api_req_friendly_name = "FriendingCometFriendRequestDeleteMutation";
      form.doc_id = "4108254489275063";
    }
    else {
      api.unsendMessage(messageID);
      return api.sendMessage("❌ Invalid! Use: add <number> or del <number>", event.threadID);
    }

    let targetIDs = args.slice(1);
    if (args[1] === "all") {
      targetIDs = listRequest.map((_, i) => i + 1);
    }

    const newTargetIDs = [];
    const promiseFriends = [];

    for (const stt of targetIDs) {
      const u = listRequest[parseInt(stt) - 1];
      if (!u) continue;

      form.variables.input.friend_requester_id = u.node.id;
      const tempVars = form.variables;
      form.variables = JSON.stringify(form.variables);

      newTargetIDs.push(u);
      promiseFriends.push(api.httpPost("https://www.facebook.com/api/graphql/", form));
      form.variables = tempVars;
    }

    for (let i = 0; i < newTargetIDs.length; i++) {
      try {
        const friendRequest = await promiseFriends[i];
        const json = JSON.parse(friendRequest);
        if (json.errors) failed.push(newTargetIDs[i].node.name);
        else success.push(newTargetIDs[i].node.name);
      } catch {
        failed.push(newTargetIDs[i].node.name);
      }
    }

    let box = `✨ ${args[0] === "add" ? "𝐀𝐂𝐂𝐄𝐏𝐓𝐄𝐃" : "𝐃𝐄𝐋𝐄𝐓𝐄𝐃"} ✨\n`;
    box += "━━━━━━━━━━━━━━━━━━\n";
    box += `✅ Success: ${success.length}\n`;
    if (failed.length > 0) box += `❌ Failed: ${failed.length}\n`;
    box += "━━━━━━━━━━━━━━━━━━\n";
    box += success.map(u => `👤 ${u}`).join("\n");

    api.sendMessage(box, event.threadID, event.messageID);
    api.unsendMessage(messageID);
  },

  onStart: async function ({ event, api, commandName }) {
    const form = {
      av: api.getCurrentUserID(),
      fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
      fb_api_caller_class: "RelayModern",
      doc_id: "4499164963466303",
      variables: JSON.stringify({ input: { scale: 3 } })
    };

    try {
      const data = JSON.parse(await api.httpPost("https://www.facebook.com/api/graphql/", form));
      const listRequest = data.data.viewer.friending_possibilities.edges;

      if (!listRequest || listRequest.length === 0)
        return api.sendMessage("📭 No pending friend requests found!", event.threadID);

      let msg = "╭─────────────╮\n     𝐑𝐄𝐐𝐔𝐄𝐒𝐓 𝐋𝐈𝐒𝐓\n╰─────────────╯\n\n";

      listRequest.forEach((user, index) => {
        msg += `◈ ${index + 1}. ${user.node.name}\n`;
        msg += `◈ ID: ${user.node.id}\n`;
        msg += `◈ Time: ${moment(user.time * 1000).tz("Asia/Dhaka").format("hh:mm A | DD/MM/YY")}\n`;
        msg += "─────── ♢ ───────\n";
      });

      msg += "\n💡 Reply 'add <number>' to Accept\n💡 Reply 'del <number>' to Delete";

      api.sendMessage(msg, event.threadID, (e, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          listRequest,
          author: event.senderID,
          unsendTimeout: setTimeout(() => {
            api.unsendMessage(info.messageID);
          }, 60000) // 1 minute auto unsend
        });
      }, event.messageID);
    } catch (e) {
      api.sendMessage("⚠️ Error fetching requests.", event.threadID);
    }
  }
};
      
