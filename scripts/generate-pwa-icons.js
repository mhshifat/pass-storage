// Script to generate PWA icons from SVG
// This requires sharp: npm install -D sharp
// Run: node scripts/generate-pwa-icons.js

const fs = require('fs')
const path = require('path')

// SVG content matching the logo
const svgContent = `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 10L15 25V45C15 65 25 80 50 90C75 80 85 65 85 45V25L50 10Z" fill="#1a1a1a" opacity="0.2"/>
  <path d="M50 10L15 25V45C15 65 25 80 50 90C75 80 85 65 85 45V25L50 10Z" stroke="#1a1a1a" stroke-width="3" fill="none"/>
  <rect x="35" y="50" width="30" height="25" rx="3" fill="#1a1a1a"/>
  <path d="M42 50V42C42 37.5817 45.5817 34 50 34C54.4183 34 58 37.5817 58 42V50" stroke="#1a1a1a" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <circle cx="50" cy="60" r="3.5" fill="#ffffff"/>
  <rect x="48.5" y="62" width="3" height="7" rx="1.5" fill="#ffffff"/>
  <circle cx="28" cy="35" r="2" fill="#1a1a1a" opacity="0.4"/>
  <circle cx="72" cy="35" r="2" fill="#1a1a1a" opacity="0.4"/>
  <circle cx="50" cy="20" r="2" fill="#1a1a1a" opacity="0.6"/>
</svg>`

async function generateIcons() {
  try {
    // Check if sharp is available
    let sharp
    try {
      sharp = require('sharp')
    } catch (e) {
      console.error('Error: sharp is not installed. Please run: npm install -D sharp')
      console.log('\nAlternatively, you can manually create the icon files:')
      console.log('- public/icon-192.png (192x192)')
      console.log('- public/icon-512.png (512x512)')
      console.log('- public/apple-icon.png (180x180)')
      console.log('\nYou can use online tools like:')
      console.log('- https://realfavicongenerator.net/')
      console.log('- https://www.pwabuilder.com/imageGenerator')
      return
    }

    const publicDir = path.join(process.cwd(), 'public')
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true })
    }

    const svgBuffer = Buffer.from(svgContent)

    // Generate icon-192.png
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, 'icon-192.png'))
    console.log('✓ Generated icon-192.png')

    // Generate icon-512.png
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'icon-512.png'))
    console.log('✓ Generated icon-512.png')

    // Generate apple-icon.png
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(publicDir, 'apple-icon.png'))
    console.log('✓ Generated apple-icon.png')

    console.log('\n✅ All PWA icons generated successfully!')
  } catch (error) {
    console.error('Error generating icons:', error)
    console.log('\nYou can manually create the icon files or use online tools.')
  }
}

generateIcons()

