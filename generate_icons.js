const fs = require('fs');
const { execSync } = require('child_process');

// Clean monochrome SVG - Pure black ink nib & wave on transparent background
const svgMonochromeBlack = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <g fill="none" stroke="#18181B" stroke-linecap="round" stroke-linejoin="round">
    <!-- Ink Nib Outer Contour -->
    <path d="M 512,160 
             C 610,340 650,490 650,610 
             C 650,686 588,748 512,748 
             C 436,748 374,686 374,610 
             C 374,490 414,340 512,160 Z" 
          fill="#18181B" stroke="none" />
    
    <!-- Cutout Slit & Breather Hole (Transparent cutout) -->
    <path d="M 512,180 L 512,480" stroke="#FFFFFF" stroke-width="24" stroke-linecap="round" />
    <circle cx="512" cy="480" r="32" fill="#FFFFFF" stroke="none" />

    <!-- Pure Zen Wave underneath Nib -->
    <path d="M 220,820 C 340,770 420,870 512,820 C 604,770 684,870 804,820" 
          stroke="#18181B" stroke-width="40" fill="none" />
    <path d="M 310,890 C 390,855 450,915 512,890 C 574,865 634,925 714,890" 
          stroke="#18181B" stroke-width="24" fill="none" opacity="0.8" />
  </g>
</svg>`;

// Also a pure white version for dark backgrounds
const svgMonochromeWhite = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <g fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 512,160 C 610,340 650,490 650,610 C 650,686 588,748 512,748 C 436,748 374,686 374,610 C 374,490 414,340 512,160 Z" fill="#FFFFFF" stroke="none" />
    <path d="M 512,180 L 512,480" stroke="#000000" stroke-width="24" stroke-linecap="round" />
    <circle cx="512" cy="480" r="32" fill="#000000" stroke="none" />
    <path d="M 220,820 C 340,770 420,870 512,820 C 604,770 684,870 804,820" stroke="#FFFFFF" stroke-width="40" fill="none" />
    <path d="M 310,890 C 390,855 450,915 512,890 C 574,865 634,925 714,890" stroke="#FFFFFF" stroke-width="24" fill="none" opacity="0.8" />
  </g>
</svg>`;

fs.writeFileSync('icon-black.svg', svgMonochromeBlack);
fs.writeFileSync('icon-white.svg', svgMonochromeWhite);
console.log('SVGs created');
