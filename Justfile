setup:
    pnpm install
    cp .env.example .env.local
    vercel pull
    echo 'SITE_PASSWORD=your-password' >> .env.local

# Jalankan studio nota (:3001) + Joyco Mart (:3002) sekaligus
dev:
    pnpm dev:all
