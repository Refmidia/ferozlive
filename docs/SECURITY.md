# Segurança

## Segredos

- `LIVEKIT_API_SECRET` e `SUPABASE_SERVICE_ROLE_KEY` existem só no servidor.
- Não há credenciais no repositório. Use `.env.local` e as variáveis da Vercel.
- O cliente recebe apenas o JWT de curta duração e o `LIVEKIT_URL` na resposta do token.

## Autorização

Ações de anfitrião (encerrar, remover, interromper compartilhamento) leem o cookie `sp_host_*`. O valor é comparado em tempo constante com `host_token_hash`. Um convidado não se torna anfitrião enviando um campo no JSON.

## Senhas

Senhas opcionais da sala passam por bcrypt. O banco nunca guarda a senha em texto. Mensagens de erro de entrada não distinguem “sala inexistente” de “já encerrada”.

## Validação e abuso

- Zod em todas as entradas.
- Nomes sanitizados e limitados.
- Códigos gerados com `crypto.randomInt` e alfabeto sem caracteres ambíguos.
- Rate limit em criação, entrada, token e ações administrativas.
- Cabeçalhos `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` e `Permissions-Policy`.

## Banco

RLS está ligado. `anon` e `authenticated` não têm privilégio nas tabelas. A aplicação usa a service role apenas em Route Handlers Node.js.

## Mídia

Não há recording, egress nem storage de arquivo. Encerrar a sala apaga a sala LiveKit e marca o registro como `ended`.

## Rate limit em produção

O fallback local é suficiente em uma instância. Para várias lambdas da Vercel, implemente a interface `RateLimiter` com Upstash Redis. Não é obrigatório no primeiro dia, mas é a opção documentada quando o abuso aparecer.

## Cookies

O cookie do anfitrião é `HttpOnly`, `SameSite=Lax`, `Path=/` e `Secure` em produção.
