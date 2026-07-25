const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const { execSync } = require('child_process');

// 1. Option 1: Hokka & Dalga (Inkwell & Wave)
const svgOpt1Black = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <g fill="none" stroke="#18181B" stroke-linecap="round" stroke-linejoin="round">
    <!-- Ink Nib -->
    <path d="M 512 160 C 620 340 660 500 660 620 C 660 702 594 768 512 768 C 430 768 364 702 364 620 C 364 500 404 340 512 160 Z" fill="#18181B" stroke="none" />
    <path d="M 512 190 L 512 480" stroke="#FFFFFF" stroke-width="20" />
    <circle cx="512" cy="480" r="28" fill="#FFFFFF" stroke="none" />
    <!-- Wave -->
    <path d="M 200 830 C 330 780 410 880 512 830 C 614 780 694 880 824 830" stroke="#18181B" stroke-width="36" fill="none" />
    <path d="M 290 900 C 380 865 440 925 512 895 C 584 865 644 925 734 890" stroke="#18181B" stroke-width="22" fill="none" opacity="0.8" />
  </g>
</svg>`;

const svgOpt1White = svgOpt1Black.replace(/#18181B/g, '#FFFFFF').replace(/#FFFFFF/g, '#000000');

// 2. Option 2: Kitap & Ginkgo Yaprağı (Open Book & Ginkgo Leaf)
const svgOpt2Black = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <g fill="none" stroke="#18181B" stroke-linecap="round" stroke-linejoin="round">
    <!-- Open Book Base -->
    <path d="M 512 420 C 410 380 280 390 180 440 L 180 800 C 280 750 410 740 512 780 C 614 740 744 750 844 800 L 844 440 C 744 390 614 380 512 420 Z" stroke="#18181B" stroke-width="36" fill="#18181B" fill-opacity="0.05" />
    <path d="M 512 420 L 512 780" stroke="#18181B" stroke-width="32" />
    
    <!-- Ginkgo Leaf Above Book -->
    <path d="M 512 360 Q 420 220 340 280 Q 280 330 380 410 Q 512 360 512 360 Q 512 360 644 410 Q 744 330 684 280 Q 604 220 512 360 Z" fill="#18181B" />
    <path d="M 512 360 L 512 180" stroke="#18181B" stroke-width="24" stroke-linecap="round" />
  </g>
</svg>`;

const svgOpt2White = svgOpt2Black.replace(/#18181B/g, '#FFFFFF');

// 3. Option 3: Zen Enso Halkası (Enso Brush Circle & Ink Nib)
const svgOpt3Black = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <g fill="none" stroke="#18181B" stroke-linecap="round" stroke-linejoin="round">
    <!-- Calligraphy Enso Circle with open gap -->
    <path d="M 720 280 A 340 340 0 1 0 780 620" stroke="#18181B" stroke-width="60" stroke-dasharray="1000" stroke-dashoffset="0" />
    <!-- Center Nib -->
    <path d="M 512 300 C 580 420 600 520 600 600 C 600 650 560 690 512 690 C 464 690 424 650 424 600 C 424 520 444 420 512 300 Z" fill="#18181B" />
    <path d="M 512 320 L 512 510" stroke="#FFFFFF" stroke-width="16" />
    <circle cx="512" cy="510" r="20" fill="#FFFFFF" stroke="none" />
  </g>
</svg>`;

const svgOpt3White = svgOpt3Black.replace(/#18181B/g, '#FFFFFF').replace(/#FFFFFF/g, '#000000');

// 4. Option 4: Mum & Defter Omurgası (Candle Flame & Spine)
const svgOpt4Black = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <g fill="none" stroke="#18181B" stroke-linecap="round" stroke-linejoin="round">
    <!-- Notebook Spine & Pages -->
    <rect x="360" y="380" width="304" height="460" rx="20" stroke="#18181B" stroke-width="36" fill="#18181B" fill-opacity="0.05" />
    <line x1="440" y1="480" x2="600" y2="480" stroke="#18181B" stroke-width="24" />
    <line x1="440" y1="560" x2="600" y2="560" stroke="#18181B" stroke-width="24" />
    <line x1="440" y1="640" x2="540" y2="640" stroke="#18181B" stroke-width="24" />
    
    <!-- Candle Flame Top -->
    <path d="M 512 160 C 550 220 560 270 512 320 C 464 270 474 220 512 160 Z" fill="#18181B" />
    <line x1="512" y1="320" x2="512" y2="380" stroke="#18181B" stroke-width="20" />
  </g>
</svg>`;

const svgOpt4White = svgOpt4Black.replace(/#18181B/g, '#FFFFFF');

const options = [
  { id: 'opt1', name: 'option1_hokka_dalga', svgBlack: svgOpt1Black, svgWhite: svgOpt1White },
  { id: 'opt2', name: 'option2_kitap_ginkgo', svgBlack: svgOpt2Black, svgWhite: svgOpt2White },
  { id: 'opt3', name: 'option3_zen_enso', svgBlack: svgOpt3Black, svgWhite: svgOpt3White },
  { id: 'opt4', name: 'option4_mum_defter', svgBlack: svgOpt4Black, svgWhite: svgOpt4White },
];

function renderSvgToBuffer(svgStr, width) {
  const resvg = new Resvg(svgStr, { fitTo: { mode: 'width', value: width } });
  return resvg.render().asPng();
}

// Ensure output dirs
const publicDir = path.join(__dirname, 'public', 'passio-icons');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

const tauriIconsDir = path.join(__dirname, 'src-tauri', 'icons');
if (!fs.existsSync(tauriIconsDir)) fs.mkdirSync(tauriIconsDir, { recursive: true });

const publicTauriIconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(publicTauriIconsDir)) fs.mkdirSync(publicTauriIconsDir, { recursive: true });

options.forEach(opt => {
  // Save SVG files directly
  fs.writeFileSync(path.join(publicDir, `${opt.name}_black.svg`), opt.svgBlack);
  fs.writeFileSync(path.join(publicDir, `${opt.name}_white.svg`), opt.svgWhite);

  // Render PNGs (512x512 transparent)
  fs.writeFileSync(path.join(publicDir, `${opt.name}_black_512.png`), renderSvgToBuffer(opt.svgBlack, 512));
  fs.writeFileSync(path.join(publicDir, `${opt.name}_white_512.png`), renderSvgToBuffer(opt.svgWhite, 512));
});

// For Option 1 (Hokka & Dalga - Primary Default Icon for Tauri), generate full set of Tauri icon sizes
const tauriSizes = [
  { name: '32x32.png', size: 32 },
  { name: '128x128.png', size: 128 },
  { name: '128x128@2x.png', size: 256 },
  { name: 'icon.png', size: 512 },
  { name: 'icon-1024.png', size: 1024 },
];

tauriSizes.forEach(s => {
  const buf = renderSvgToBuffer(svgOpt1Black, s.size);
  fs.writeFileSync(path.join(tauriIconsDir, s.name), buf);
  fs.writeFileSync(path.join(publicTauriIconsDir, s.name), buf);
});

// Create ICO and ICNS for Tauri
execSync(`convert ${path.join(tauriIconsDir, '128x128@2x.png')} ${path.join(tauriIconsDir, 'icon.ico')}`);
execSync(`convert ${path.join(tauriIconsDir, 'icon.png')} ${path.join(tauriIconsDir, 'icon.icns')}`);
execSync(`convert ${path.join(publicTauriIconsDir, '128x128@2x.png')} ${path.join(publicTauriIconsDir, 'icon.ico')}`);
execSync(`convert ${path.join(publicTauriIconsDir, 'icon.png')} ${path.join(publicTauriIconsDir, 'icon.icns')}`);

console.log('Generated all SVGs, PNGs, and Tauri icon files successfully.');
