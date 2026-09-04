# ScreenParty

Compartilhe sua tela e seu microfone em tempo real com amigos. Sem instalação, sem gravação e com um código de convite no formato `XXXX-XXXX`.

## 1. Visão geral

O ScreenParty é uma aplicação web em que uma pessoa cria uma sala, recebe um código e um link, e transmite a tela pelo navegador. Os amigos entram pelo código ou pelo convite e assistem ao vivo.

A mídia circula apenas durante a sessão, via WebRTC no LiveKit Cloud. O Supabase guarda metadados da sala e uma trilha administrativa básica. Nada de áudio, vídeo ou captura é armazenado.

## 2. Tecnologias

- Next.js 16 (App Router) + React 19 + TypeScript strict
- Tailwind CSS 4
- LiveKit Cloud, `livekit-client`, `livekit-server-sdk` e `@livekit/components-react`
- Supabase (Postgres + RLS)
- Zod, Lucide React, Vitest, ESLint
- Deploy previsto na Vercel

## 3. Arquitetura

A interface nunca fala direto com o LiveKit Secret nem com a service role do Supabase. O navegador chama as rotas `/api/*`. O servidor valida, aplica rate limit, confirma a senha, verifica o cookie do anfitrião e só então emite o token WebRTC.

Detalhes em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## 4. Requisitos

- Node.js 20+
- npm
- Conta gratuita no [LiveKit Cloud](https://cloud.livekit.io)
- Projeto no [Supabase](https://supabase.com)
- Chrome ou Edge no computador para transmitir a tela
- HTTPS em produção

## 5. Instalação local

```bash
npm install
copy .env.example .env.local
```

No macOS/Linux use `cp .env.example .env.local`. Preencha as variáveis e depois:

```bash
npm run dev
```

Abra `http://localhost:3000`.

## 6. Como criar o projeto no LiveKit Cloud

1. Acesse [cloud.livekit.io](https://cloud.livekit.io) e crie uma conta.
2. Crie um projeto no plano gratuito.
3. Não ative Recording, Egress, SIP nem qualquer recurso pago.
4. Abra o projeto recém-criado.

## 7. Onde encontrar cada variável do LiveKit

No painel do projeto LiveKit Cloud:

- `LIVEKIT_URL`: WebSocket URL, algo como `wss://seu-projeto.livekit.cloud`
- `LIVEKIT_API_KEY`: Keys → API Key
- `LIVEKIT_API_SECRET`: Keys → API Secret

Esses valores ficam só no servidor. O navegador recebe o URL no momento de emitir o token, nunca o secret.

## 8. Como criar e configurar o Supabase

1. Crie um projeto em [supabase.com/dashboard](https://supabase.com/dashboard).
2. Espere o banco ficar pronto.
3. Em **Project Settings → API**, copie a URL e as chaves.
4. Não use a service role no frontend.

## 9. Como executar as migrations

No dashboard do Supabase, abra **SQL Editor** e execute o arquivo:

`supabase/migrations/20260904000001_init_screenparty.sql`

Ou, com a CLI oficial:

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

## 10. Como preencher `.env.local`

```env
LIVEKIT_URL=wss://seu-projeto.livekit.cloud
LIVEKIT_API_KEY=APIxxxxxxxx
LIVEKIT_API_SECRET=****************
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
CRON_SECRET=um-segredo-longo-e-aleatorio
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` existe para compatibilidade, mas o app não consulta o banco pelo navegador. A service role nunca pode ir para o cliente.

## 11. Como rodar o projeto

```bash
npm run dev
```

Crie uma sala na página inicial. Em outra janela anônima, entre com o código.

## 12. Como executar os testes

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Os testes que dependem de LiveKit e Supabase usam mocks. O código de produção não é substituído por simulação.

## 13. Como publicar na Vercel

1. Envie o repositório para o GitHub.
2. Em [vercel.com](https://vercel.com), importe o projeto.
3. Framework: Next.js.
4. Não altere o comando de build (`next build`).
5. Preencha as variáveis de ambiente antes do primeiro deploy.

Passo a passo expandido em [docs/DEPLOY.md](docs/DEPLOY.md).

## 14. Como configurar as variáveis na Vercel

Em **Project → Settings → Environment Variables**, adicione as mesmas chaves do `.env.example` para Production e Preview. Não marque nenhuma secret como `NEXT_PUBLIC_`, exceto a URL e a anon key do Supabase.

Depois de salvar, faça um Redeploy.

## 15. Limitações de navegadores e celulares

- **Chrome e Edge no computador**: transmissão de tela, janela ou aba, com áudio da aba quando o navegador oferecer.
- **Safari no macOS**: pode transmitir, com resoluções mais limitadas.
- **Celulares**: em geral dá para assistir. Compartilhar a própria tela costuma ser bloqueado pelo sistema, principalmente no iPhone.
- A aplicação avisa quando `getDisplayMedia` não existe. Ela não promete transmissão nesses ambientes.
- Produção exige HTTPS para microfone e tela.

## 16. Limites dos planos gratuitos

Valores típicos, sujeitos a mudança nos painéis oficiais:

- **LiveKit Cloud free**: minutos de conexão e largura de banda limitados.
- **Supabase free**: banco pequeno e pausa de projeto inativo.
- **Vercel hobby**: bandwidth e cron limitados.

O app já começa conservador: no máximo 5 participantes e 2 horas por sala.

## 17. Como evitar cobranças inesperadas

- Não ative Recording, Egress, Ingress ou SIP no LiveKit.
- Não coloque cartão só para “garantir” o plano.
- Acompanhe o uso em LiveKit Cloud → Usage e no Supabase → Reports.
- Mantenha `limits` em `src/config/limits.ts` baixo.
- Configure `CRON_SECRET` para o job horário marcar salas expiradas.
- Se o uso crescer, diminua `roomTtlHours` ou `maxParticipantsPerRoom` antes de subir de plano.

## 18. Checklist final de produção

- [ ] Variáveis preenchidas na Vercel
- [ ] Migration executada no Supabase
- [ ] RLS ativo (já vem na migration)
- [ ] Recording/Egress desligados no LiveKit
- [ ] `CRON_SECRET` definido
- [ ] Site aberto em HTTPS
- [ ] Teste de criar sala, copiar convite e entrar em outro navegador
- [ ] Teste de senha inválida
- [ ] Teste de encerrar sala
- [ ] Confirmar que o celular consegue assistir

## 19. Solução de problemas comuns

**“O serviço de transmissão ainda não está configurado”**  
Faltam `LIVEKIT_URL`, `LIVEKIT_API_KEY` ou `LIVEKIT_API_SECRET`.

**“O banco ainda não está configurado”**  
Faltam `NEXT_PUBLIC_SUPABASE_URL` ou `SUPABASE_SERVICE_ROLE_KEY`.

**Sala não encontrada depois da migration**  
O SQL não foi executado ou o `public_code` está com formato diferente.

**Conecta mas não aparece a tela**  
O anfitrião precisa clicar em **Compartilhar tela** e autorizar o navegador.

**Celular não transmite**  
Esperado em vários aparelhos. Quem está no celular deve assistir; quem transmite usa o computador.

**429 / muitas tentativas**  
O rate limit em memória bloqueou o IP. Espere alguns minutos.

**Cron não limpa salas**  
A Vercel só dispara cron em planos que suportam. Você pode chamar `GET /api/cron/cleanup` com `Authorization: Bearer CRON_SECRET`.

Mais segurança em [docs/SECURITY.md](docs/SECURITY.md).
