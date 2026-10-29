/**
 * Build a demo JPEG that carries realistic (but fake) privacy metadata.
 * Usage: node make-demo-photo.cjs <input.jpg> <output.jpg>
 */
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const piexif = require('piexifjs')

const input = process.argv[2] || path.join(__dirname, 'demo-photo-base.jpg')
const output = process.argv[3] || path.join(__dirname, 'demo-photo-exif.jpg')

function toDms(value) {
  const abs = Math.abs(value)
  const deg = Math.floor(abs)
  const minFloat = (abs - deg) * 60
  const min = Math.floor(minFloat)
  const sec = (minFloat - min) * 60
  return [[deg, 1], [min, 1], [Math.round(sec * 100), 100]]
}

async function main() {
  const jpeg = fs.readFileSync(input)

  // 220px thumbnail, used to demonstrate the embedded-thumbnail privacy warning
  const thumb = await sharp(jpeg)
    .resize({ width: 220, height: 147, fit: 'cover' })
    .jpeg({ quality: 70 })
    .toBuffer()

  const exifObj = {
    '0th': {},
    Exif: {},
    GPS: {},
    '1st': {},
    thumbnail: thumb.toString('binary'),
  }

  const lat = 46.6863
  const lon = 7.8632
  const date = '2026:10:01 18:32:11'

  Object.assign(exifObj['0th'], {
    [piexif.ImageIFD.Make]: 'Xiaomi',
    [piexif.ImageIFD.Model]: 'Xiaomi 14 Ultra',
    [piexif.ImageIFD.Software]: 'Adobe Lightroom 13.2 (Windows)',
    [piexif.ImageIFD.DateTime]: date,
    [piexif.ImageIFD.Artist]: 'Lin Tao',
    [piexif.ImageIFD.Copyright]: '(c) 2026 Lin Tao. All rights reserved.',
    [piexif.ImageIFD.ImageDescription]: 'Golden hour by the lake, Interlaken',
    [piexif.ImageIFD.Orientation]: 1,
    [piexif.ImageIFD.XResolution]: [300, 1],
    [piexif.ImageIFD.YResolution]: [300, 1],
    [piexif.ImageIFD.ResolutionUnit]: 2,
  })

  Object.assign(exifObj.Exif, {
    [piexif.ExifIFD.DateTimeOriginal]: date,
    [piexif.ExifIFD.DateTimeDigitized]: date,
    [piexif.ExifIFD.ExposureTime]: [1, 500],
    [piexif.ExifIFD.FNumber]: [18, 10],
    [piexif.ExifIFD.ISOSpeedRatings]: 100,
    [piexif.ExifIFD.FocalLength]: [230, 10],
    [piexif.ExifIFD.LensModel]: 'Leica Summilux 23mm f/1.8',
    [piexif.ExifIFD.UserComment]: 'ASCII\u0000\u0000\u0000Shot handheld at golden hour',
    [piexif.ExifIFD.ColorSpace]: 1,
    [piexif.ExifIFD.PixelXDimension]: 1600,
    [piexif.ExifIFD.PixelYDimension]: 1067,
  })

  Object.assign(exifObj.GPS, {
    [piexif.GPSIFD.GPSVersionID]: [2, 3, 0, 0],
    [piexif.GPSIFD.GPSLatitudeRef]: 'N',
    [piexif.GPSIFD.GPSLatitude]: toDms(lat),
    [piexif.GPSIFD.GPSLongitudeRef]: 'E',
    [piexif.GPSIFD.GPSLongitude]: toDms(lon),
    [piexif.GPSIFD.GPSAltitudeRef]: 0,
    [piexif.GPSIFD.GPSAltitude]: [568, 1],
    [piexif.GPSIFD.GPSDateStamp]: '2026:10:01',
    [piexif.GPSIFD.GPSTimeStamp]: [[16, 1], [32, 1], [11, 1]],
  })

  const exifBytes = piexif.dump(exifObj)
  const out = piexif.insert(exifBytes, jpeg.toString('binary'))
  fs.writeFileSync(output, Buffer.from(out, 'binary'))
  console.log('wrote', output, fs.statSync(output).size, 'bytes')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
