/**
 * Simple script to generate placeholder PNG icons for Expo app
 * Run: node scripts/generate-icons.js
 * 
 * Prerequisites: npm install canvas
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const BRAND_COLORS = {
  background: '#0D1B2A',
  accent: '#D4A574',
  white: '#FFFFFF'
};

function createIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = BRAND_COLORS.background;
  ctx.fillRect(0, 0, size, size);
  
  // Draw crescent moon
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.35;
  
  ctx.fillStyle = BRAND_COLORS.accent;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();
  
  // Cut out inner circle for crescent effect
  ctx.fillStyle = BRAND_COLORS.background;
  ctx.beginPath();
  ctx.arc(centerX + radius * 0.4, centerY - radius * 0.2, radius * 0.8, 0, Math.PI * 2);
  ctx.fill();
  
  // Add checkmark
  ctx.strokeStyle = BRAND_COLORS.accent;
  ctx.lineWidth = size * 0.06;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(centerX - radius * 0.3, centerY + radius * 0.1);
  ctx.lineTo(centerX - radius * 0.05, centerY + radius * 0.35);
  ctx.lineTo(centerX + radius * 0.35, centerY - radius * 0.15);
  ctx.stroke();
  
  // Save to file
  const outputPath = path.join(__dirname, '..', 'assets', 'images', filename);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Created: ${filename} (${size}x${size})`);
}

// Ensure assets/images directory exists
const imagesDir = path.join(__dirname, '..', 'assets', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Generate all required icons
console.log('🎨 Generating Maamulat app icons...\n');

createIcon(1024, 'icon.png');           // Main app icon
createIcon(512, 'splash-icon.png');     // Splash screen
createIcon(1024, 'adaptive-icon.png');  // Android adaptive icon
createIcon(64, 'favicon.png');          // Web favicon

console.log('\n✨ All icons generated successfully!');
console.log('📁 Location: assets/images/');
