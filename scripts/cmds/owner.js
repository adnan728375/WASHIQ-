const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

const W = 490, H = 840;

const AVATAR1 = "https://files.catbox.moe/x0uu6r.jpg";
const FALLBACK_AVATAR = "https://i.ibb.co/MC6bT5V/default-avatar.png";

// 🔷 Dodecagon Avatar
async function drawDodecagonAvatar(ctx, url, x, y, size, ringColors) {
  const sides = 12;
  const radius = size / 2;

  // Glow Rings
  for (let i = 0; i < ringColors.length; i++) {
    ctx.beginPath();
    for (let j = 0; j < sides; j++) {
      const a = (Math.PI * 2 / sides) * j;
      const rx = x + radius + Math.cos(a) * (radius + i * 8);
      const ry = y + radius + Math.sin(a) * (radius + i * 8);
      j === 0 ? ctx.moveTo(rx, ry) : ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.strokeStyle = ringColors[i];
    ctx.lineWidth = 4;
    ctx.shadowColor = ringColors[i];
    ctx.shadowBlur = 22;
    ctx.stroke();
  }

  // Safe Image Load
  let img;
  try {
    img = await loadImage(url);
  } catch {
    img = await loadImage(FALLBACK_AVATAR);
  }

  // Clip Shape
  ctx.save();
  ctx.beginPath();
  for (let j = 0; j < sides; j++) {
    const a = (Math.PI * 2 / sides) * j;
    const rx = x + radius + Math.cos(a) * radius;
    const ry = y + radius + Math.sin(a) * radius;
    j === 0 ? ctx.moveTo(rx, ry) : ctx.lineTo(rx, ry);
  }
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, x, y, size, size);
  ctx.restore();
}

// 🔷 Main Page
async function drawPage(ctx) {
  // 🌌 Unique Background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#12001f"); // Royal Purple
  bg.addColorStop(0.5, "#050014");
  bg.addColorStop(1, "#000000");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Avatar
  await drawDodecagonAvatar(
    ctx,
    AVATAR1,
    W / 2 - 90,
    60,
    180,
    ["#00f5ff", "#7b2cff", "#ff4fd8"] // UNIQUE THEME
  );

  // 🔹 Title
  ctx.textAlign = "center";
  ctx.font = "bold 42px Arial";
  ctx.fillStyle = "#00f5ff";
  ctx.shadowColor = "#7b2cff";
  ctx.shadowBlur = 30;
  ctx.fillText("Raha Ai", W / 2, 300);

  // 🔹 Subtitle
  ctx.font = "italic 22px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#00f5ff";
  ctx.shadowBlur = 15;
  ctx.fillText("Developer Information", W / 2, 335);
  ctx.shadowBlur = 0;

  // 🔹 Info Box
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fillRect(40, 365, W - 80, 390);

  ctx.strokeStyle = "#7b2cff";
  ctx.lineWidth = 2.5;
  ctx.shadowColor = "#00f5ff";
  ctx.shadowBlur = 15;
  ctx.strokeRect(40, 365, W - 80, 390);
  ctx.shadowBlur = 0;

  // 🔹 Info Text
  ctx.font = "20px Arial";
  ctx.fillStyle = "#eafcff";

  const lines = [
    "Name: Washiq Adnan",
    "Address: Dinajpur, Bangladesh",
    "Date of Birth: 27 July 2007",
    "Religion: Islam",
    "",
    "🎀 Profession 🎀",
    "Student: HSC 2nd Year",
    "Chatbot Developer"
  ];

  let y = 415;
  for (const line of lines) {
    ctx.fillText(line, W / 2, y);
    y += line === "" ? 22 : 40;
  }

  // 🔹 Footer
  ctx.font = "italic 17px Arial";
  ctx.fillStyle = "#ff4fd8";
  ctx.fillText("© Raha Ai Development", W / 2, H - 35);
}

module.exports = {
  config: {
    name: "info",
    aliases: ["raha", "owner"],
    version: "FINAL",
    author: "Washiq Adnan",
    countDown: 5,
    role: 0,
    shortDescription: "Developer Info",
    category: "info"
  },

  onStart: async function ({ message }) {
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    await drawPage(ctx);

    const buffer = canvas.toBuffer("image/png");
    const dir = path.join(__dirname, "cache");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, "raha_info.png");
    fs.writeFileSync(filePath, buffer);

    return message.reply({
      attachment: fs.createReadStream(filePath)
    });
  }
};
