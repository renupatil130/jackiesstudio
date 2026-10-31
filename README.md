# Freefall

A single-page portfolio for an independent designer, told as one fall. Scrolling drives everything: two films play frame by frame under your scroll, type flies past in 3D, and the story ends at a door you walk through to get in touch.

This repository holds the code only. The films, frames and images are not included, so the page shows its layout and type but no footage until you add your own frames (see [Adding the films](#adding-the-films)). The full project with media is at [gireeshkumarreddy/freefall-portfolio](https://github.com/gireeshkumarreddy/freefall-portfolio).

## The story, in scroll order

1. **Loader.** A thin gold line fills while the first frames load, then you enter with or without sound.
2. **The leap.** A figure falls through a shaft of light. Words, short lines and buttons rise past him in 3D, tilt with the mouse, and stretch with scroll speed. An altitude readout counts down to zero.
3. **Impact.** At the hard cut the screen flashes white, shakes once and booms.
4. **The noise.** He lands in a crowd surrounded by grey voices ("make the logo bigger"). A ring of fire blows them away.
5. **Rise.** R-I-S-E assembles out of the depth as he stands up.
6. **Index.** The film shrinks into one tile among floating project covers. Click a cover to jump to its case.
7. **Selected work.** Four case screens stack and recede, each with a sliding title, a spinning disc and circular type.
8. **About and services.** A manifesto that lights up word by word, a client marquee that follows your scroll, and service rows with a cursor-following preview.
9. **The portal.** A man walks out of a burning doorway while arches fly past, then the closing call to action.
10. **Contact.** Email, links, a live Lisbon clock, and "Fall again", which rewinds the whole story.

## Adding the films

The page expects two WebP frame sequences, numbered from `000`:

| Folder | Frames | Source |
| --- | --- | --- |
| `assets/fall/` | `000.webp` to `464.webp`, 720×1280 | a 15.5 s vertical clip at 30 fps |
| `assets/portal/` | `000.webp` to `238.webp`, 1600×900 | a 10 s landscape clip at 24 fps |

Extract them from your clips with ffmpeg:

```bash
ffmpeg -i fall.mp4 -an -vf "fps=30,scale=720:1280" -c:v libwebp -quality 68 -start_number 0 assets/fall/%03d.webp
```

```bash
ffmpeg -i portal.mp4 -an -vf "scale=1600:900" -c:v libwebp -quality 66 -start_number 0 assets/portal/%03d.webp
```

If your clips have a different number of frames, change `FALL_N` and `PORTAL_N` at the top of `js/main.js`, and `FRAME_KEYS` to match where your cut happens.

## Client video delivery (admin upload, one-time preview, pay to download)

> **No card? Use the free setup:** videos in Google Drive, backend on a free Cloudflare Worker, site on Vercel. Step-by-step guide: [FREE-SETUP.md](FREE-SETUP.md). The rest of this section describes the Render version (paid, with automatic watermarking).

The site comes with a small Node.js server that adds the delivery pages. The portfolio's look is unchanged; the landing screen and the menu get a **Client delivery** link.

- **Your secret admin page** (the address you set in `ADMIN_PATH`, e.g. `/jackie-desk-8341`): there is no link to it anywhere on the site, `/admin` doesn't exist, and it still asks for your password. Upload an edited video and enter the client's name, project title and price. You get a private link and a 6-character code (like `K7Q2MX`), plus a **Send on WhatsApp** button with the message ready.
- **`/delivery`**: the public Client delivery page. Clients type the code from your message and their video opens.
- **The client link (`/v/…`)**: the client can watch a preview **once**. It's a lower-quality copy (480p) with "PREVIEW" and "JACKIE'S STUDIO · PAY TO DOWNLOAD" burned in, and rewinding is blocked. Reloading the page or opening the stream link anywhere else doesn't give a second view. Next to it they see the price, a UPI QR code and your UPI ID. After paying they type in the UPI reference (UTR) number.
- **You confirm**: in `/admin` the delivery shows "Client says paid · UTR …". Check that the money arrived in your UPI app, then press **Mark as paid**. The client's page unlocks by itself and they can download the full-quality original. Nobody can download before that.

Wrong codes are rate-limited, so nobody can guess their way in. Other admin buttons: **Allow one more preview** (if the client's connection dropped mid-preview), **Mark as unpaid**, **Copy link** and **Delete** (removes the files too).

No screen-recording protection is perfect, which is why the preview is watermarked and low-resolution: a recording is useless as a final video.

### Run it on your computer

Needs [Node.js](https://nodejs.org) 18 or newer. ffmpeg comes bundled.

```bash
npm install
ADMIN_PATH=jackie-desk-8341 ADMIN_PASSWORD=your-password UPI_ID=yourname@okaxis npm start
```

Open http://localhost:3000 for the site and http://localhost:3000/jackie-desk-8341 for your admin page (the server also prints the address when it starts). On Windows PowerShell, set the variables first: `$env:ADMIN_PATH="jackie-desk-8341"; $env:ADMIN_PASSWORD="your-password"; $env:UPI_ID="yourname@okaxis"; npm start`.

### Put it online: site on Vercel, backend on Render

The public site (portfolio, Client delivery page, client video pages) goes on **Vercel**. The backend (uploads, previews, payments, downloads) and your **secret admin page** go on **Render**. The admin page is never copied to Vercel.

First put this folder in a GitHub repository. Both services deploy from the same repository.

**1. Backend on Render (do this first)**

1. On [render.com](https://render.com), choose **New → Blueprint** and pick your repository. `render.yaml` sets up the server and a 20 GB disk for the videos. Disks need a paid instance; on the free plan uploads are deleted whenever the server restarts.
2. Render asks for these settings. Fill them in and deploy:
   - `FRONTEND_URL`: your Vercel address, e.g. `https://jackies-studio.vercel.app`. If you don't know it yet, put a guess and change it after step 2.
   - `ADMIN_PATH`: your secret admin address, e.g. `jackie-studio-7429`. Pick your own.
   - `ADMIN_PASSWORD`: a long password.
   - `UPI_ID`: the UPI ID clients pay to.
3. When it's live, copy the Render address, e.g. `https://jackies-studio.onrender.com`.

**2. Site on Vercel**

1. On [vercel.com](https://vercel.com), choose **Add New → Project** and import the same repository. Leave the framework as **Other**; `vercel.json` already has the build settings.
2. Under **Environment Variables**, add `BACKEND_URL` = your Render address from step 1.3.
3. Deploy. Copy the Vercel address and, if it differs from what you put in step 1, update `FRONTEND_URL` on Render (**Environment** tab). Render restarts by itself.

**Your addresses after that**

| What | Where |
| --- | --- |
| Portfolio | `https://jackies-studio.vercel.app` |
| Client delivery (clients type their code) | `https://jackies-studio.vercel.app/delivery` |
| A client's video link | `https://jackies-studio.vercel.app/v/…` |
| **Your admin page (keep private)** | `https://jackies-studio.onrender.com/<your ADMIN_PATH>` |

Your own domain (e.g. `jackiesstudio.in`) goes on Vercel under **Settings → Domains**. Then add it to `FRONTEND_URL` on Render, comma-separated if you keep the Vercel address too: `https://jackiesstudio.in,https://jackies-studio.vercel.app`. The first address is the one used in client links.

**Prefer one host?** Leave `FRONTEND_URL` empty and use only Render: it serves the whole site on its own.

All Render settings are listed in `.env.example`: `FRONTEND_URL`, `ADMIN_PATH`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `UPI_ID`, `UPI_NAME`, `WHATSAPP`, `DATA_DIR`, `MAX_UPLOAD_MB`, `PORT`. Any host that runs Node.js with a persistent disk works the same way (Railway with a volume, a VPS, Hostinger VPS).

### Where things live

```
server/server.js      routes: the portfolio, secret admin page, /delivery, client pages, streaming, downloads
server/preview.js     makes the watermarked preview with ffmpeg
server/store.js       the delivery list, saved as data/db.json
server/watermark/     the transparent watermark images
app/                  admin and client pages (same look as the portfolio)
scripts/build-frontend.js   Vercel build: copies the public site to ./public (never the admin page)
vercel.json           Vercel settings and page routes
render.yaml           Render settings
data/                 uploaded originals and previews (created on first run, never committed)
```

## Run it (portfolio only, no delivery feature)

Serve the folder with any static server and open it in a browser:

```bash
python -m http.server 8000
```

Then open http://localhost:8000. Fonts (Google Fonts) and smooth scrolling ([Lenis](https://github.com/darkroomengineering/lenis)) load from CDNs, so you need a connection.

## Project layout

```
index.html            all page markup and copy
css/style.css         styles; colours and type are tokens at the top
js/main.js            the scroll engine: frame scrubbing, 3D type, every section
showcase/             scripts that record the site and put it on a monitor photo
```

## Making it yours

The name **Arin Vale**, the email, the clients and the four projects are placeholders.

- **Name, email, projects, services:** `index.html`.
- **Words that fly past during the story:** `WORLD`, `LINES` and `CTAS` near the top of `js/main.js`.
- **Story timing** (which scroll position shows which frame, where the flash and shockwave land): `FRAME_KEYS`, `CUT` and `SHOCK` in `js/main.js`.
- **Colours and fonts:** the `:root` block at the top of `css/style.css`.

From the browser console, `freefall.jump('work')` scrolls to a section (`top`, `work`, `about`, `services`, `portal`, `contact`, or `story:0.5` for a point in the story).

## Showcase video scripts

`showcase/record.mjs` drives headless Chrome through the whole site on a virtual clock, so every animation is captured frame-perfect. `showcase/composite.py` places that recording on a monitor photo (`showcase/monitor.webp`, not included), adds glass and light spill, and generates a soundtrack from the scroll. They need Node 22 or newer, Google Chrome, ffmpeg, and Python with Pillow, NumPy and SciPy. Run both from the repository root:

```bash
node showcase/record.mjs
```

```bash
python -I showcase/composite.py
```
