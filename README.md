# مطاعم خميس

Digital menu, linktree, table QR, and admin dashboard for the Nablus Rafidia and Jenin branches.

## Run

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

Admin: [http://localhost:3001/admin](http://localhost:3001/admin)

Default login: `admin` / `admin123`

## Customer routes

- `/` branch picker (Jenin / Nablus)
- `/jenin` and `/nablus` linktree (menu, WhatsApp, social)
- `/jenin/menu` and `/nablus/menu` orderable menu + cart
- `/view/jenin` and `/view/nablus` table menu (view only)
- `/scan/jenin` and `/scan/nablus` printable Scan Me posters

## Environment

Copy `.env.example` to `.env.local` and set `DATABASE_URL`.
