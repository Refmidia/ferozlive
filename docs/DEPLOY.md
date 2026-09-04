# Deploy

## Vercel

1. Publique o código em um repositório Git.
2. Importe o repositório em [vercel.com/new](https://vercel.com/new).
3. Framework Preset: Next.js.
4. Build Command: `next build`
5. Output: padrão do Next.js.
6. Cadastre as variáveis **antes** do primeiro deploy:

```text
LIVEKIT_URL
LIVEKIT_API_KEY
LIVEKIT_API_SECRET
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
CRON_SECRET
```

7. Execute a migration no Supabase.
8. Dispare um Redeploy.
9. Confirme o domínio em HTTPS.

## Cron

`vercel.json` agenda `GET /api/cron/cleanup` a cada hora. A rota exige `Authorization: Bearer CRON_SECRET`. A Vercel injeta esse header automaticamente quando o cron nativo está disponível.

Se o plano não disparar cron, chame a rota por um agendador externo ou manualmente.

## Domínio próprio

Aponte o DNS no painel da Vercel. WebRTC e `getDisplayMedia` exigem HTTPS.

## Depois do deploy

1. Abra a URL.
2. Crie uma sala.
3. Copie o convite e entre em uma janela anônima.
4. Compartilhe a tela no computador.
5. Encerre a sala e confirme o redirecionamento para `/room/[code]/ended`.
