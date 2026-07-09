# GearUp 🏋️ — Backend API

Rent Sports & Outdoor Gear Instantly. Node.js + Express + TypeScript + PostgreSQL (Prisma) + JWT + Stripe.

This README is written as a **complete step-by-step guide**, assuming you've never done this before. Follow it top to bottom, in order.

---

## 0. Install prerequisites (once, on your computer)

1. **Node.js** (v18 or newer) → https://nodejs.org (download the LTS version, click through the installer)
2. **Git** → https://git-scm.com/downloads
3. **VS Code** (or any code editor) → https://code.visualstudio.com
4. A **GitHub account** → https://github.com
5. A **free Postgres database**. Easiest option: **Neon** → https://neon.tech (sign up free, create a project, copy the connection string — looks like `postgresql://user:pass@host/dbname?sslmode=require`)
6. A **free Stripe account** → https://dashboard.stripe.com/register (sign up, you'll grab test API keys in Step 4)

Check installs worked by opening a terminal (Command Prompt / Terminal / VS Code's terminal) and running:
```bash
node -v
git -v
```
Both should print version numbers.

---

## 1. Get the project onto your computer

If you downloaded this as a zip from Claude, extract it, then open the folder in VS Code (`File > Open Folder`).

Open a terminal inside that folder (VS Code: `Terminal > New Terminal`) and run:
```bash
npm install
```
This downloads all the packages the project needs. It will take a minute.

---

## 2. Set up your environment variables

Copy the example env file:
```bash
cp .env.example .env
```
(On Windows Command Prompt use `copy .env.example .env` instead.)

Open the new `.env` file and fill in:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Paste your Neon connection string from Step 0.5 |
| `JWT_SECRET` | Any long random string, e.g. run `openssl rand -hex 32` in terminal, or just mash your keyboard for 40 characters |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys → copy the **Secret key** (starts with `sk_test_`) |
| `STRIPE_WEBHOOK_SECRET` | Leave as-is for now — you'll fill this in Step 7 |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Choose your own admin login — this becomes your submission's "Admin Credentials" |

---

## 3. Create the database tables

```bash
npx prisma migrate dev --name init
```
This reads `prisma/schema.prisma` and creates all the tables (users, gear_items, categories, rental_orders, payments, reviews) in your Neon database.

Then seed it with an admin account, sample categories, and sample gear:
```bash
npm run seed
```
You should see output confirming the admin email/password you set in `.env`.

---

## 4. Run the server locally

```bash
npm run dev
```
You should see:
```
✅ Database connected
🚀 GearUp API running on port 5000 [development]
```
Open http://localhost:5000 in a browser — you should see a JSON welcome message. Your API is alive.

---

## 5. Test it with Postman

1. Install Postman → https://www.postman.com/downloads
2. Import `postman_collection.json` (in this project) → Postman → `Import` → drag the file in
3. Try requests in this order:
   - `Auth > Register Customer` → copy the `token` from the response
   - In the collection variables (top right, "Environment quick look"), paste it into `customerToken`
   - `Gear (Public) > Get All Gear` → copy a gear item's `id` into the `gearId` variable
   - `Rentals > Create Rental Order` → copy the returned order `id` into `rentalId`
   - `Payments > Create Payment (Stripe Checkout)` → open the returned `checkoutUrl` in your browser, pay with Stripe's test card `4242 4242 4242 4242`, any future expiry, any CVC
   - After paying, Stripe redirects you with `?session_id=...` in the URL — copy that into the `sessionId` variable
   - `Payments > Confirm Payment` → run it → your order status becomes `PAID`

Do the same for a Provider account (`Register Provider`, use `providerToken`) to test `Add Gear`, `Update Order Status`, etc. Register an admin manually isn't possible via the API on purpose (admins are only created via seed) — log in with the credentials from Step 2/3 to get `adminToken`.

---

## 6. Put it on GitHub (for your 20-commit requirement)

```bash
git init
git add .
git commit -m "chore: initial project setup with Express, TypeScript, Prisma"
```
Then create a new **empty** repo on GitHub (no README/gitignore — you already have them), and:
```bash
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/gearup-backend.git
git push -u origin main
```

From here, as you make changes (even small ones), commit often with descriptive messages, e.g.:
```bash
git add .
git commit -m "feat: add rental order creation with stock validation"
git push
```
Aim for at least 20 such commits over the life of the project — this is graded, so don't do it all as one commit.

---

## 7. Set up the Stripe webhook (for automatic payment confirmation)

The `/api/payments/confirm` endpoint (manual, via Postman) already works for testing. For a "real" production setup, Stripe also needs to call your server directly:

1. Deploy first (Step 8), then come back here.
2. Stripe Dashboard → Developers → Webhooks → **Add endpoint**
3. Endpoint URL: `https://YOUR-RENDER-URL.onrender.com/api/payments/webhook`
4. Select event: `checkout.session.completed`
5. Copy the **Signing secret** (starts with `whsec_`) into `STRIPE_WEBHOOK_SECRET` in your Render environment variables (Step 8)

---

## 8. Deploy to Render (free hosting)

1. Go to https://render.com, sign up, connect your GitHub account
2. **New > Web Service** → pick your `gearup-backend` repo
3. Settings:
   - **Build Command:** `npm install && npm run build && npx prisma migrate deploy`
   - **Start Command:** `npm start`
4. Under **Environment**, add every variable from your `.env` file (DATABASE_URL, JWT_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, CLIENT_SUCCESS_URL, CLIENT_CANCEL_URL, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME) — use the same Neon `DATABASE_URL` so your seeded data carries over
5. Click **Create Web Service**. Wait for the build to finish.
6. Once live, run the seed once against production (Render Shell tab, or run locally pointing at the same `DATABASE_URL`):
   ```bash
   npm run seed
   ```
7. Test your live URL the same way you tested locally in Postman, just swap `baseUrl` to `https://YOUR-RENDER-URL.onrender.com/api`

---

## 9. Generate API docs to submit

You already have `postman_collection.json` in this repo — that satisfies the "Postman collection" requirement directly. To get a shareable link instead:
1. Postman → import the collection → click the collection → **Share** → **Via Postman Cloud** → get a public link
   (or **Export** the updated collection and commit it back to your repo)

---

## 10. Record your demo video (3–5 min)

Cover, in order:
1. Quick architecture overview (say it out loud: Express + TypeScript + Prisma + Postgres, JWT auth, Stripe payments)
2. Register + login as Customer, Provider, and Admin (show tokens)
3. Provider adds gear → Customer browses/rents it → pays via Stripe → Provider marks picked up → returns → Customer reviews it
4. Trigger a validation error (e.g. missing field) and show the structured `{ success: false, message, errorDetails }` response
5. One technical challenge you'd mention: e.g. "handling the Stripe webhook required raw request body parsing before the JSON parser, since signature verification needs the untouched payload."

Record with Loom (https://loom.com) or OBS, upload, set link sharing to "Anyone with the link."

---

## Project Structure
```
src/
  config/       # env, prisma client, stripe client
  middleware/    # auth, role guard, validation, error handling
  controllers/   # route handlers, one file per resource
  routes/        # route definitions, one file per resource
  validations/   # zod schemas
  utils/         # ApiError, ApiResponse, JWT, catchAsync
  app.ts         # express app assembly
  server.ts      # entry point
prisma/
  schema.prisma  # database schema
  seed.ts        # admin + sample data seeder
postman_collection.json
```

## Roles
| Role | How to get it |
|---|---|
| CUSTOMER | Register with `"role": "CUSTOMER"` |
| PROVIDER | Register with `"role": "PROVIDER"` |
| ADMIN | Only created via `npm run seed` (credentials from `.env`) |

## Error Response Shape (all errors)
```json
{
  "success": false,
  "message": "Human readable message",
  "errorDetails": null
}
```

## Success Response Shape
```json
{
  "success": true,
  "message": "Human readable message",
  "data": { }
}
```

## Rental Order Status Flow
```
PLACED → CONFIRMED (provider) → PAID (Stripe) → PICKED_UP (provider) → RETURNED (provider)
PLACED / CONFIRMED → CANCELLED
```

## Troubleshooting
- **"Missing required environment variable"** → you forgot to fill in `.env`
- **Prisma errors on `npx prisma migrate dev`** → double check `DATABASE_URL` is correct and your Neon project is active (free tier sleeps after inactivity, just wait a few seconds and retry)
- **Stripe checkout session fails** → make sure `STRIPE_SECRET_KEY` is a valid **test** key (`sk_test_...`)
- **401 on every request** → check you're sending `Authorization: Bearer <token>` header, and the token hasn't expired (default 7 days)
