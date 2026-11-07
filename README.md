# 🛍️ ShopNow — Customer Storefront

The public-facing e-commerce storefront built with React + Vite.

## Features
- Amazon-style category navigation with photo thumbnails
- Hero banners with promotional deals
- Product catalog with filters & search
- Product detail pages with image gallery
- Shopping cart & wishlist
- User login / registration
- Order history

## Development

```bash
npm install
npm run dev
# → http://localhost:5173
```

## Environment Variables

Create a `.env` file in this directory:
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_ADMIN_URL=http://localhost:5174
```

For production, replace with your hosted backend and admin panel URLs.

## Build for Production

```bash
npm run build
# Output → dist/
```

## Deploy to Vercel

1. Push this folder as a separate Vercel project
2. Set the two environment variables above in Vercel dashboard
3. The `vercel.json` handles SPA routing automatically
