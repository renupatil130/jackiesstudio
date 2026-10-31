# Free setup, no card: Google Drive + Cloudflare + Vercel

Everything here is on free plans that don't ask for a card.

| Part | Where | What it does |
| --- | --- | --- |
| Videos | **Google Drive**, a private folder | You upload the watermarked preview and the final video |
| Backend + admin page | **Cloudflare Worker** | One-time preview, codes, UPI, "Mark as paid", downloads; streams from Drive without showing the Drive link |
| Website | **Vercel** | Portfolio, Client delivery page, client video pages |

Do the three parts in this order. It takes about 30 minutes once.

---

## Part 1 · Google (about 10 minutes)

**1.1 Create a project**
1. Go to **console.cloud.google.com** and sign in with your Gmail.
2. Accept the terms if asked. You don't need to start a free trial or add billing.
3. At the top, click the project picker → **New Project** → name it `jackies-studio` → **Create**. Make sure it's selected at the top.

**1.2 Turn on Google Drive API**
1. Menu ☰ → **APIs & Services → Library**.
2. Search **Google Drive API** → open it → **Enable**.

**1.3 Create the "robot" account the Worker signs in with**
1. Menu ☰ → **IAM & Admin → Service Accounts** → **Create service account**.
2. Name: `jackies-delivery` → **Create and continue** → skip the roles → **Done**.
3. Click the new account. Copy its **email** (it ends in `.iam.gserviceaccount.com`). You need it in 1.4.
4. Open the **Keys** tab → **Add key → Create new key → JSON → Create**. A `.json` file downloads. **Keep it private.** Anyone with it can read the folder you share in 1.4.

**1.4 Make the private Drive folder**
1. Open **drive.google.com** → **New → New folder** → `Jackie's Studio deliveries`.
2. Right-click the folder → **Share** → paste the robot email from 1.3 → set it to **Viewer** → untick "Notify people" → **Share**.
3. Open the folder. The address ends in `/folders/XXXXXXXX`. Copy that last part: it's your **folder ID**.

Don't share this folder with anyone else, and don't turn on "Anyone with the link".

---

## Part 2 · Cloudflare (about 10 minutes)

**2.1 Sign up** at **dash.cloudflare.com** with your email. The free plan doesn't need a card. You don't need a domain.

**2.2 Create the database**
1. Left menu → **Storage & Databases → KV** (also called Workers KV) → **Create** (or **Create namespace**).
2. Name: `jackies-db` → **Add**.

**2.3 Create the Worker**
1. Left menu → **Workers & Pages → Create → Create Worker** (start from "Hello World").
2. Name: `jackiesstudio-api` → **Deploy**.
3. Click **Edit code**. Delete everything in the editor.
4. Open **github.com/renupatil130/jackiesstudio/blob/main/worker/dist/worker.js** → click **Raw** → select all (Ctrl+A) → copy → paste into the Cloudflare editor.
5. Click **Deploy**.

**2.4 Connect the database:** Worker → **Settings → Bindings → Add → KV namespace** → Variable name: `DB` → namespace: `jackies-db` → **Add / Deploy**.

**2.5 Add the settings:** Worker → **Settings → Variables and Secrets → Add**, one by one:

| Name | Type | Value |
| --- | --- | --- |
| `ADMIN_PATH` | Text | your own secret word + numbers, e.g. `jackie-studio-7429` |
| `ADMIN_PASSWORD` | **Secret** | a long password |
| `SESSION_SECRET` | **Secret** | any long random text (mash the keyboard, 30+ characters) |
| `GOOGLE_SERVICE_ACCOUNT` | **Secret** | open the `.json` key file from 1.3 in Notepad, copy **all** of it, paste |
| `DRIVE_FOLDER_ID` | Text | the folder ID from 1.4 |
| `FRONTEND_URL` | Text | `https://jackiesstudio.vercel.app` (fix it after Part 3 if Vercel gives a different address) |
| `UPI_ID` | Text | the UPI ID clients pay to |
| `UPI_NAME` | Text | `Jackie's Studio` |
| `WHATSAPP` | Text | `916363692408` |

Click **Deploy** (or **Save and deploy**).

**2.6 Your Worker address** is shown on the Worker's page, e.g. `https://jackiesstudio-api.yourname.workers.dev`.
Test it: open `https://jackiesstudio-api.yourname.workers.dev/jackie-studio-7429` (your ADMIN_PATH). You should see the admin login. Log in: the form should say "0 videos in your Drive folder".

---

## Part 3 · Vercel (about 5 minutes)

1. **vercel.com** → sign up with GitHub (free, no card) → **Add New → Project** → import `renupatil130/jackiesstudio`.
2. Framework preset: **Other**. Leave the build settings alone (`vercel.json` has them).
3. **Environment Variables** → add `BACKEND_URL` = your Worker address from 2.6.
4. **Deploy**. Copy the address Vercel gives you. If it isn't `https://jackiesstudio.vercel.app`, put the real one in `FRONTEND_URL` on Cloudflare (2.5) and deploy the Worker again.

---

## Using it

1. Export two files from your editor: a **watermarked preview** (lower quality is fine) and the **final video**.
2. Upload both to the `Jackie's Studio deliveries` folder in Google Drive.
3. Open your admin page (`https://jackiesstudio-api.yourname.workers.dev/your-secret-word`), enter client, title and price, then pick the preview and the final video from the list (or paste their Drive links) → **Create link**.
4. Press **Send on WhatsApp**: the client gets the link and the 6-character code.
5. The client watches the preview once, pays by UPI and enters the reference number. You check your UPI app, then press **Mark as paid**. Their download unlocks.

**Good to know**
- **Delete** in the admin page removes the delivery, not the files in Drive. Clean up Drive yourself when you like.
- Free limits are far above what a studio needs: about 100,000 requests and 1,000 saves a day on Cloudflare, and 15 GB in Drive.
- Videos are streamed from Drive through the Worker. Try one real full-length video first and check the preview and download feel fast enough for you.
- If I change the backend later, update it by pasting the new `worker/dist/worker.js` into **Edit code** again and deploying. Your settings and deliveries stay.
- Keep the `.json` key file, the admin password and the admin address private. If the key ever leaks, delete it in Google (1.3, Keys tab), make a new one and paste it into `GOOGLE_SERVICE_ACCOUNT`.
