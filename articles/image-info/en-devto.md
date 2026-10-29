![This photo knows where you were](https://i0.hdslb.com/bfs/new_dyn/cb7b119aa7a6afcc405d4805987535e51127206971.jpg)

We send photos all day: into group chats, onto forums, into cloud drives, as email attachments. Most people assume they are sending the picture they see. But a JPEG often carries a whole file folder of extras — GPS coordinates, device model, a timestamp accurate to the second, the author's name, and even a hidden thumbnail of the original.

This article covers two things:

1. how to read an image's **URL and file information** (what it actually is);
2. what **privacy data** a photo carries, and how to remove it.

All screenshots come from [OnliTool's Image Info Viewer](https://onlitools.com/image-info). It parses files locally in the browser — your image is never uploaded.

---

## 1. "Image address" means two different things

People say "check the image address" and usually mean one of two things.

**A. The image URL.** Right-click an image in a browser and choose "Copy image address" (or "Open image in new tab"). You get something like:

```
https://i0.hdslb.com/bfs/new_dyn/d1361d77a78bdc96c6d72f63f41de2d81127206971.png
```

Even that string says a lot. The hostname tells you which CDN and platform serve the file. The path (`bfs/new_dyn`) hints at the upload pipeline. The filename is a hash, meaning the platform renamed it server-side. Query parameters often encode size, crop mode, or an expiry time.

**B. The file itself.** This is the local identity of the image: file name, file size, pixel dimensions, aspect ratio, format, color mode. None of it requires a network request.

The Image Info Viewer handles B — and reads EXIF alongside it.

![File info: name, size, dimensions, aspect ratio, format](https://i0.hdslb.com/bfs/new_dyn/bf0ff88aa2e5776c2c348d78f99694801127206971.png)

The screenshot above is a 309.1 KB JPEG, 1600 × 1067 px, aspect ratio 1600:1067. Boring numbers, useful answers:

- A forum caps uploads at 2 MB? Check the size first instead of re-compressing blindly.
- Layout needs 16:9? Confirm the aspect ratio before cropping away the subject.
- A `.jpg` that refuses to open? Check the real format — the extension may be lying.

---

## 2. What privacy data is actually inside

EXIF is data the camera writes at capture time: aperture, shutter, ISO, white balance. It exists to make editing easier. But phone makers also write location, device and time into it.

The viewer flags this immediately: **Potentially sensitive metadata detected.**

![Sensitive metadata: location, camera model, date, author info, embedded thumbnail](https://i0.hdslb.com/bfs/new_dyn/7a7353d2d6cab3e3c4edbff56ec44c2b1127206971.png)

It lists five categories.

**1. Location (GPS).** The most dangerous one. EXIF stores latitude and longitude as decimals precise enough to identify a single building. This demo photo reads `46.6863, 7.8632` — near Interlaken, Switzerland. Post an untouched photo taken on your balcony and you have posted your home address.

Worse, GPS accumulates. Several originals from the same person, posted over time, reconstruct a movement track: when they are at the office, when they go home, where they spent the weekend.

**2. Camera and device info.** Make, model, lens, software version. Harmless on its own, but it works as a device fingerprint: a Xiaomi 14 Ultra plus Adobe Lightroom 13.2 plus a shooting style is often enough to link accounts.

**3. Capture time.** A timestamp to the second, combined with GPS, answers "who was where, and when." If the photo was taken at home, it also leaks your daily routine.

**4. Author and copyright.** Artist and Copyright fields. When a photographer fills them in, they are a license notice. When the image was re-saved from someone else, the original author's name may still be there — an accidental source leak.

**5. Embedded thumbnail.** A JPEG can contain a small preview (IFD1). You may have blurred or cropped the sensitive part, but the thumbnail can still be the untouched original. Most viewers never show it, which makes this the sneakiest category.

---

## 3. Technical details: 35 fields

The default view shows the common fields. Expanding "技术详情" (technical details) reveals all 35 metadata entries, grouped by IFD0, thumbnail, EXIF capture data, GPS and XMP.

![Technical details grouped by IFD0 / thumbnail / EXIF / GPS / XMP](https://i0.hdslb.com/bfs/new_dyn/08d5455a6aaf4c06a365e2c655532e0f1127206971.png)

Group by group:

- **Image information (IFD0)** — dimensions, resolution units, orientation, color space;
- **Thumbnail information** — whether an embedded preview exists, and its size;
- **Capture information (EXIF)** — exposure time, f-number, ISO, focal length, metering, flash;
- **GPS location** — latitude, longitude, altitude, direction, GPS timestamp;
- **XMP metadata** — Adobe-side extras such as edit history, ratings, keywords.

There is also a "look up address" action that reverse-geocodes the coordinates, which helps you judge how precise a position really is.

---

## 4. How the data gets out

The key point: **channels treat EXIF very differently.**

- **Social platforms** usually re-encode uploads server-side and strip most EXIF, including GPS. Risk is lower — but that is the platform's policy, not your control.
- **Email attachments, cloud drives, forum attachments, "send as file"** typically transfer bytes untouched. EXIF survives intact.
- **Self-hosted image hosts, Git repos, static sites** keep originals by default.
- **Screenshots** are newly generated images with no camera EXIF. The simplest reliable fix.

So "I only posted a photo, not my location" does not hold when the original file travels.

---

## 5. Check it, then clean it

**To check (three steps)**

1. Open the [Image Info Viewer](https://onlitools.com/image-info);
2. Drag the image in, or click "Add images";
3. Read name/size/dimensions, then the privacy warning, then expand technical details if needed.

Everything runs locally in the browser. That matters most for exactly this use case: you should not have to hand your private photo to an unknown server just to find out whether it is private.

**To clean (most reliable first)**

1. **Screenshot instead of original** — regenerates the file with no metadata;
2. **Strip on export** — Lightroom's "remove location" option, Photoshop's "Export As" instead of "Save As";
3. **Batch-clear with system tools** — Windows Explorer → Properties → Details → "Remove Properties and Personal Information"; macOS can use `exiftool -all= photo.jpg`;
4. **Turn off location tagging in the camera app** — fix the source instead of patching every file.

A practical habit: **look before you send.** The check takes seconds; a location leak cannot be undone.

---

## 6. Tool details

- URL: [https://onlitools.com/image-info](https://onlitools.com/image-info)
- Processing: local, in-browser; no upload
- Reads: EXIF, GPS, XMP, embedded thumbnails in common formats such as JPEG, PNG and WebP
- Useful for: pre-publish self-checks, debugging files that will not open, confirming dimensions and format, spotting leftover author fields

---

**Note:** the photo in these screenshots is a generated demo image. Its GPS coordinates, device model, timestamp and author name are fictional and exist only to show the shape of the metadata fields.
