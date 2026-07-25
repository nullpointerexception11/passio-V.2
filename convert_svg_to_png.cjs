const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const { execSync } = require('child_process');

function renderSvgToPng(svgPath, outputPath, width) {
  const svg = fs.readFileSync(svgPath, 'utf8');
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: width,
    },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  fs.writeFileSync(outputPath, pngBuffer);
  console.log(`Rendered ${outputPath} (${width}x${width})`);
}

// Ensure folders exist
const folders = ['public/icons', 'public/passio-icon-pack', 'src-tauri/icons'];
folders.forEach(f => {
  if (!fs.existsSync(f)) fs.mkdirSync(f, { recursive: true });
});

// Render black pure transparent icon sizes
const sizes = [
  { name: '32x32.png', width: 32 },
  { name: '128x128.png', width: 128 },
  { name: '128x128@2x.png', width: 256 },
  { name: 'icon.png', width: 512 },
  { name: 'icon-1024.png', width: 1024 },
];

sizes.forEach(s => {
  renderSvgToPng('icon-black.svg', `public/icons/${s.name}`, s.width);
  // Also create white version in passio-icon-pack
  renderSvgToPng('icon-white.svg', `public/passio-icon-pack/white-${s.name}`, s.width);
});

// Copy black icons to passio-icon-pack and src-tauri/icons
sizes.forEach(s => {
  fs.copyFileSync(`public/icons/${s.name}`, `public/passio-icon-pack/black-${s.name}`);
  fs.copyFileSync(`public/icons/${s.name}`, `public/passio-icon-pack/${s.name}`);
  fs.copyFileSync(`public/icons/${s.name}`, `src-tauri/icons/${s.name}`);
});

// Convert 256x256 / 512x512 PNG to ico & icns via convert
execSync('convert public/icons/128x128@2x.png public/icons/icon.ico');
execSync('convert public/icons/icon.png public/icons/icon.icns');

// Copy ico & icns to passio-icon-pack and src-tauri/icons
['icon.ico', 'icon.icns'].forEach(file => {
  fs.copyFileSync(`public/icons/${file}`, `public/passio-icon-pack/${file}`);
  fs.copyFileSync(`public/icons/${file}`, `src-tauri/icons/${file}`);
});

console.log('All icons rendered and copied successfully.');
