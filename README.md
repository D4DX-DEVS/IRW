# IRW Kerala — website + admin (Next.js 16)

Public site and admin panel for Ideal Relief Wing Kerala. Server-rendered pages, Prisma on Cloudflare D1 (local SQLite fallback), uploads on Cloudflare R2, Radix UI, Tailwind v4.

## Run

```bash
npm install
cp .env.example .env     # set AUTH_SECRET
npm run db:push          # create the database
npm run db:seed          # admin user + content from the old site
npm run dev              # http://localhost:3111
```

Admin: http://localhost:3111/admin — seed login `admin@irwkerala.org` / `ChangeMe123!` (**change it**; set `SEED_ADMIN_PASSWORD` before seeding).

Production: `npm run build && npm start` (port 3111).

## Cloudflare D1 + R2

Set in `.env` (when unset the app falls back to `DATABASE_URL` SQLite and the local `uploads/` folder):

| Variable | Purpose |
| --- | --- |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account |
| `CLOUDFLARE_API_TOKEN` | API token with **D1 Edit** |
| `D1_DATABASE_ID` | D1 database id |
| `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | R2 API token (Object Read & Write on the bucket) |
| `R2_BUCKET_NAME` | bucket name |
| `R2_ENDPOINT` | `https://<account>.r2.cloudflarestorage.com` |
| `R2_PUBLIC_URL` | public base URL of the bucket — custom CDN domain or `https://pub-….r2.dev` |

```bash
npm run d1:migrate   # apply prisma/d1/*.sql to D1 (tracked in _d1_migrations)
npm run wp:import    # copy logo, favicon, posts, photos, team, reports, banners from irwkerala.org into D1 + R2
npm run db:seed      # admin user (sample content is skipped once the import has run)
```

`wp:import` is idempotent: files already in R2 (`wp/<yyyy>/<mm>/…`) are skipped and rows are matched, not duplicated.

Schema change: edit `prisma/schema.prisma`, then
`npm run d1:diff -- -o prisma/d1/000N_<name>.sql`, copy `schema.prisma` over `prisma/d1/schema.snapshot.prisma`, and `npm run d1:migrate`.

D1 has no transactions over HTTP — Prisma runs `$transaction` batches as individual queries.

## Structure

- `src/app/(site)` public pages, same URLs as the old WordPress site (`/about-us`, `/articles`, `/news-events`, …)
- `src/app/admin` sign-in, dashboard, content managers, server actions in `admin/actions`
- `src/app/api/admin/live` server-sent events stream behind the live dashboard
- `src/components/ui` Radix wrappers (Select, DropdownMenu, AlertDialog confirm, Drawer, Switch, Tabs, Toast)
- `uploads/` local uploads when R2 is not configured, served through `/files/*`
- `scripts/` D1 migration runner and the WordPress importer

## Production notes

- Article bodies are plain text (blank line = paragraph, `## ` heading, `> ` quote). No raw HTML is ever rendered.
- Add a real rate limiter / WAF in front for the contact form and sign-in; the built-in limits are per-process.
