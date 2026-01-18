const os = require("os");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

const W = 490, H = 840;
// Eikhane amar dewa default chobi thakbe, tumi chaile pore link bodle nite paro
const AVATAR1 = "https://i.ibb.co/MC6bT5V/default-avatar.png"; 
const FALLBACK_AVATAR = "https://i.ibb.co/MC6bT5V/default-avatar.png";

function formatUptime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

async function drawDodecagonAvatar(ctx, url, x, y, size, ringColors) {
  const sides = 12;
  const radius = size / 2;

  for (let i = 0; i < ringColors.length; i++) {
    ctx.beginPath();
    for (let j = 0; j < sides; j++) {
      const angle = (Math.PI * 2 / sides) * j;
      const rx = x + radius + Math.cos(angle) * (radius + i * 8);
      const ry = y + radius + Math.sin(angle) * (radius + i * 8);
      if (j === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.strokeStyle = ringColors[i];
    ctx.lineWidth = 4;
    ctx.shadowColor = ringColors[i];
    ctx.shadowBlur = 20;
    ctx.stroke();
  }

  let img;
  try { img = await loadImage(url); }
  catch { img = await loadImage(FALLBACK_AVATAR); }

  ctx.save();
  ctx.beginPath();
  for (let j = 0; j < sides; j++) {
    const angle = (Math.PI * 2 / sides) * j;
    const rx = x + radius + Math.cos(angle) * radius;
    const ry = y + radius + Math.sin(angle) * radius;
    if (j === 0) ctx.moveTo(rx, ry);
    else ctx.lineTo(rx, ry);
  }
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, x, y, size, size);
  ctx.restore();
}

async function drawPage1(ctx) {
  // Background: Deep Blue to Black for a pro look
  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, "#001a33");
  gradient.addColorStop(1, "#000000");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  // Cool particles
  for (let i = 0; i < 15; i++) {
    ctx.beginPath();
    ctx.fillStyle = "rgba(0, 212, 255, 0.2)";
    ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  await drawDodecagonAvatar(ctx, AVATAR1, W / 2 - 90, 60, 180, [
    "#00d4ff", "#0055ff", "#0022ff"
  ]);

  ctx.font = "bold 40px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "#00d4ff";
  ctx.shadowColor = "#00d4ff";
  ctx.shadowBlur = 15;
  ctx.fillText("Washiq", W / 2, 295);

  ctx.font = "italic 22px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.shadowBlur = 5;
  ctx.fillText("Developer & Creator", W / 2, 330);

  // Info Box
  ctx.fillStyle = "rgba(0, 212, 255, 0.05)";
  ctx.fillRect(40, 365, W - 80, 385);
  ctx.strokeStyle = "#00d4ff";
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 365, W - 80, 385);

  ctx.font = "20px Arial";
  ctx.fillStyle = "#e6f7ff";
  ctx.textAlign = "left";

  const info = [
    "● Name: Washiq",
    "● Spouse: Raha Jannat Megh",
    "● Project: Washiq Ai Chatbot",
    "● Role: Full Stack Developer",
    "● Platform: FB Messenger",
    "● Nationality: Bangladeshi",
    "● FB: facebook.com/61574715983842",
    `● Date: ${new Date().toLocaleDateString("en-BD")}`
  ];

  let y = 415;
  for (const line of info) {
    ctx.fillText(line, 70, y);
    y += 45;
  }

  ctx.font = "italic 16px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "#555";
  ctx.fillText("Created by Washiq Ai Development", W / 2, H - 30);
}

module.exports = {
  config: {
    name: "info",
    aliases: ["owner", "washiq", "in4"],
    version: "2.1",
    author: "Washiq",
    countDown: 5,
    role: 0,
    shortDescription: "Shows Developer Info Card",
    category: "system"
  },

  onStart: async function ({ message }) {
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    await drawPage1(ctx);

    const buffer = canvas.toBuffer("image/png");
    const dir = path.join(__dirname, "cache");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    const filePath = path.join(dir, `washiq_info.png`);
    fs.writeFileSync(filePath, buffer);
    
    return message.reply({ 
      body: "Here is my Master's Information!",
      attachment: fs.createReadStream(filePath) 
    });
  }
};
      
