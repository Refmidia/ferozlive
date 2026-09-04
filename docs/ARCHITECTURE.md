# Arquitetura do ScreenParty

## Camadas

```text
Navegador
  └─ UI (App Router + componentes)
       └─ /api/* (Next.js Route Handlers)
            ├─ Validação Zod + rate limit
            ├─ Autorização do anfitrião (cookie HttpOnly)
            ├─ Supabase (service role, servidor)
            └─ LiveKit (token + RoomService)
```

A pasta `src/` separa essas responsabilidades:

| Pasta | Papel |
| --- | --- |
| `app/` | Páginas e endpoints |
| `components/` | Peças visuais reutilizáveis |
| `features/` | Fluxos de início, sala e encerramento |
| `lib/` | Regras de negócio, banco, LiveKit, auth, HTTP |
| `hooks/` | Estado de cliente |
| `types/` | Contratos TypeScript |
| `config/` | Identidade, limites e ambiente |
| `styles/` | Tema visual complementar |

## Identidade da sala

- `id`: UUID interno
- `public_code`: código amigável `XXXX-XXXX`, imprevisível
- `livekit_room_name`: nome interno `sp_...`, separado do código público

O anfitrião recebe um segredo aleatório gravado em cookie `HttpOnly`. O banco guarda só o SHA-256. Nenhuma ação administrativa aceita um parâmetro `isHost` enviado pelo cliente.

## Fluxo de mídia

1. O servidor cria o registro no Supabase e provisiona a sala no LiveKit com teto de participantes.
2. O cliente pede um JWT em `POST /api/livekit/token`.
3. O LiveKit Room conecta com `adaptiveStream`, `dynacast` e simulcast.
4. A tela é capturada por `getDisplayMedia`. Microfone e áudio da aba são trilhas independentes.
5. Só um compartilhamento principal permanece ativo. O anfitrião pode interromper pelo servidor.

Nenhum frame é gravado. Recording e egress não são inicializados.

## Persistência

`rooms` e `room_events` guardam metadados. `room_events` é auditoria básica (`created`, `joined`, `kicked`, `ended`...). Não há bucket de mídia.

## Limpeza

Salas ativas passam a `expired` quando `expires_at` vence. O registro permanece para auditoria. A exclusão física deve ocorrer só depois de `ROOM_RETENTION_MS` (7 dias), de forma manual ou por um job futuro. O cron `GET /api/cron/cleanup` apenas marca, nunca apaga.

## Rate limit

A interface `RateLimiter` tem implementação em memória para desenvolvimento. Em produção com várias instâncias da Vercel, o indicado é Upstash Redis (`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`), sem mudar as rotas.
