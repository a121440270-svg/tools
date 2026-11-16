const sharp = require('sharp')

const svg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <circle cx="200" cy="150" r="110" fill="#e11d48"/>
</svg>`

sharp({ create: { width: 400, height: 300, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
  .png()
  .toFile('articles/image-info/assets/alpha-test.png')
  .then((info) => console.log(info))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
