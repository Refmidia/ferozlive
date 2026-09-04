# Limpeza de salas expiradas

Salas temporárias duram `limits.roomTtlHours` horas (padrão: 2).

## O que o sistema faz automaticamente

`GET /api/cron/cleanup` marca salas `active` com `expires_at` vencido como `expired` e preenche `ended_at`. Os registros **não são apagados**.

Isso preserva auditoria básica (`rooms` + `room_events`) sem guardar mídia.

## Retenção

Depois de `limits.roomRetentionDays` dias (padrão: 7), um operador pode remover ou arquivar os registros expirados/encerrados com um SQL manual, por exemplo:

```sql
delete from public.room_events
where room_id in (
  select id from public.rooms
  where status in ('ended', 'expired')
    and coalesce(ended_at, expires_at) < now() - interval '7 days'
);

delete from public.rooms
where status in ('ended', 'expired')
  and coalesce(ended_at, expires_at) < now() - interval '7 days';
```

Execute isso só quando quiser reduzir volume. Não faz parte do fluxo ao vivo.
