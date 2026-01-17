const axios = require("axios");
const { createCanvas, loadImage, registerFont } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

// Custom font register (if you have custom fonts)
try {
  registerFont(path.join(__dirname, "fonts", "Poppins-Bold.ttf"), { family: "Poppins", weight: "bold" });
  registerFont(path.join(__dirname, "fonts", "CourierPrime-Regular.ttf"), { family: "CourierPrime" });
} catch (e) {
  console.log("Custom fonts not loaded, using fallback fonts.");
}

module.exports = {
  config: {
    name: "balance",
    aliases: ["bal", "money"],
    version: "3.0",
    author: "Washiq & Gemini",
    countDown: 5,
    role: 0,
    description: {
      en: "View your premium Raha Bank card with enhanced design"
    },
    category: "economy",
    guide: {
      en: "{pn} or {pn} @mention"
    }
  },

  onStart: async function ({ message, usersData, event }) {
    const { senderID, mentions } = event;
    const targetID = Object.keys(mentions).length > 0 ? Object.keys(mentions)[0] : senderID;
    
    try {
      const userData = await usersData.get(targetID);
      const userName = (userData.name || "User").toUpperCase();
      const balance = userData.money.toLocaleString();
      
      // Fallback avatar if Facebook API fails
      const avatarURL = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      
      // Card Template - You can change this URL
      const cardTemplateURL = "https://files.catbox.moe/hbulmj.jpg";
      
      // Create canvas
      const canvas = createCanvas(1000, 630);
      const ctx = canvas.getContext("2d");

      // 1. Load Background with error handling
      try {
        const baseImage = await loadImage(cardTemplateURL);
        ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      } catch (bgError) {
        console.error("Background load error:", bgError);
        // Fallback: Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#0c2461");
        gradient.addColorStop(1, "#1e3799");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 2. Stylish Profile Picture with Neon Border
      try {
        const avatar = await loadImage(avatarURL);
        ctx.save();
        
        // Draw neon glow circle
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#00fbff';
        ctx.shadowColor = '#00fbff';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(555, 230, 105, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Clip and draw avatar
        ctx.beginPath();
        ctx.arc(555, 230, 100, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 455, 130, 200, 200);
        ctx.restore();
      } catch (avatarError) {
        console.error("Avatar load error:", avatarError);
        // Draw default avatar
        ctx.fillStyle = '#1e3799';
        ctx.beginPath();
        ctx.arc(555, 230, 100, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('👤', 555, 250);
      }

      // 3. Balance Display with Enhanced Effects
      ctx.textAlign = "center";
      
      // Text shadow for balance
      ctx.shadowColor = "rgba(0, 251, 255, 0.5)";
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      // Balance amount
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 85px 'Trebuchet MS', 'Poppins', sans-serif";
      ctx.fillText(`$${balance}`, 500, 520);
      
      // Reset shadow
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Currency symbol decoration
      ctx.fillStyle = "rgba(0, 251, 255, 0.3)";
      ctx.font = "40px Arial";
      ctx.fillText("╰┈➤ RAHA BANK PREMIUM", 500, 570);

      // 4. Cardholder Name (Stylish)
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.font = "bold 35px 'Courier New', 'CourierPrime', monospace";
      
      // Add background to name for better readability
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fillRect(100, 540, 400, 50);
      
      ctx.fillStyle = "#00fbff";
      ctx.font = "bold 32px 'Courier New', monospace";
      const displayName = userName.length > 20 ? userName.substring(0, 20) + "..." : userName;
      ctx.fillText(`HOLDER: ${displayName}`, 110, 575);

      // 5. Raha Bank Title with Glow
      ctx.textAlign = "left";
      ctx.shadowColor = "#00fbff";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 50px 'Arial', sans-serif";
      ctx.fillText("💳 RAHA BANK", 50, 85);
      ctx.shadowBlur = 0;

      // 6. Add decorative elements
      ctx.strokeStyle = "rgba(0, 251, 255, 0.2)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, 100);
      ctx.lineTo(300, 100);
      ctx.stroke();

      // 7. Add card type badge
      ctx.fillStyle = "rgba(0, 251, 255, 0.9)";
      ctx.fillRect(800, 50, 150, 40);
      ctx.fillStyle = "#000";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.fillText("PLATINUM", 875, 78);

      // Save image
      const pathImg = path.join(__dirname, "cache", `rahabank_pro_${targetID}.png`);
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(pathImg, buffer);

      // Send message
      await message.reply({
        body: `✨ **RAHA BANK** ✨\n👤 Account Holder: ${userName}\n💰 Total Balance: $${balance}\n📊 Status: PREMIUM MEMBER`,
        attachment: fs.createReadStream(pathImg)
      });

      // Clean up after sending
      setTimeout(() => {
        if (fs.existsSync(pathImg)) {
          fs.unlinkSync(pathImg);
        }
      }, 5000);

    } catch (error) {
      console.error("Balance card error:", error);
      return message.reply("❌ Card design korar somoy somossa hoyeche. Please try again later.");
    }
  }
};
