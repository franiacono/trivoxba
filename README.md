# EntresD — Tienda de impresión 3D

## Stack
- Next.js 14 (App Router)
- Tailwind CSS
- Firebase Firestore (base de datos)
- Cloudinary (imágenes)
- Vercel (hosting)

## Setup local

```bash
npm install
npm run dev
```

## Variables de entorno

Copiá `.env.example` a `.env.local` y completá los valores.

En Vercel, configurá las mismas variables en Settings → Environment Variables.

## Panel admin

Accedé a `/admin` con la contraseña configurada en `ADMIN_PASSWORD`.

## Deploy

1. Push a GitHub
2. Importar proyecto en vercel.com
3. Configurar variables de entorno en Vercel
4. Deploy automático en cada push a main
