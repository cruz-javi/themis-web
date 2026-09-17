# Checkpoint — inserción por lote con multisig (CU-06 a CU-09)

> Backend implementado en `themis-core` (detalle completo:
> `themis-core/docs/checkpoint-lote-multisig.md`). **En `themis-web` todavía no se escribió código
> para esto** — este documento describe el contrato de API ya disponible y el trabajo de UI
> pendiente (CU-08, la única parte de este bloque marcada como "Web" en el diseño).
>
> **Por qué esto bloquea probar el diagrama completo desde una UI**: sin esta pantalla, ninguna
> autoridad tiene forma de aprobar un lote desde el navegador — solo hablando con la API a mano
> (`curl`/Swagger). Es, junto con el registro (CU-05, exclusivo de `themis-app`, fuera de este
> repo), una de las dos piezas que faltan para ver el ciclo completo de FASE 1 sin usar la API
> directamente. Implementar esta pantalla es el paso que **más directamente** desbloquea eso, ya que
> no depende de `themis-app` ni de que exista la integración on-chain real.

## Qué ya existe en el backend (consumible desde ahora)

`themis-core` expone, detrás de la cookie de sesión (`credentials: 'include'`, igual que el resto de
`src/api/`):

| Método | Ruta | Rol requerido | Para qué |
|---|---|---|---|
| `GET` | `/elections/mine/authority` | `AUTORIDAD_REGISTRO` | Descubrir en qué elecciones está designada la cuenta logueada (necesario antes de poder listar lotes — `GET /elections/:id/authorities` es ADMIN-only) |
| `GET` | `/elections/:electionId/batches` | `ADMIN`, `AUTORIDAD_REGISTRO`, `AUDITOR` | Lista de lotes de una elección, con `yaAprobado` calculado para la cuenta logueada |
| `GET` | `/elections/:electionId/batches/:batchId` | `ADMIN`, `AUTORIDAD_REGISTRO`, `AUDITOR` | Detalle: tamaño del lote, estado, aprobaciones (por `rolDescriptivo`, nunca identidad real), root/tx si ya insertó |
| `POST` | `/elections/:electionId/batches/:batchId/approvals` | `AUTORIDAD_REGISTRO` | Aprueba el lote. La respuesta ya trae el estado actualizado (incluido `INSERTED` si esta aprobación fue la 3ra) |
| `GET` | `/elections/:electionId/rate-alerts` | `ADMIN`, `AUDITOR` | Alertas de ritmo (CU-06) — sin UI planeada todavía, ver abajo |

`RegistrationBatch.status`: `PENDING_APPROVAL | APPROVED | INSERTED | INSERTION_FAILED`. En
`INSERTION_FAILED` la aprobación de la autoridad sí quedó registrada — lo que falló es el paso
on-chain, y un cron de reintento lo reintenta solo; la UI no necesita ofrecer un botón de reintento
manual.

**Importante**: la inserción on-chain real (Semaphore) todavía no está hecha del lado de
`themis-core` — hoy usa un stub que simula el resultado. Los campos `merkleRootAfter`/`onChainTxHash`
que devuelve la API son sintéticos por ahora, pero la forma del contrato ya es la definitiva.

## Qué falta construir acá (`themis-web`)

Carpeta nueva `src/features/batch-approval/` (patrón `admin-roll/`: una lista, un detalle, una
acción — más simple que `admin-elections/`):

```
types/batch.types.ts
hooks/use-my-authority-elections.ts   (GET /elections/mine/authority)
hooks/use-batches.ts                  (GET /elections/:id/batches)
hooks/use-batch-detail.ts             (GET /elections/:id/batches/:batchId)
hooks/use-approve-batch.ts            (POST .../approvals, invalida detail + list)
pages/PendingBatchesPage.tsx
pages/BatchDetailPage.tsx
```

Rutas TanStack Router nuevas, mismo patrón que `_authenticated/admin/elections/`:

```
src/routes/_authenticated/authority/elections/$electionId/batches/index.tsx
src/routes/_authenticated/authority/elections/$electionId/batches/$batchId.tsx
```

`beforeLoad` usa `requireAutoridadRegistro` — **ya existe** en `src/features/auth/lib/role-guards.ts`,
se reutiliza tal cual, sin tocarlo.

`BatchDetailPage`: tamaño del lote, fecha de cierre, badge de estado (reusar `StatusBadge` de
`src/components/ui/`), progreso "X de 3" listando `rolDescriptivo` de cada aprobación (nunca
identidad real ni commitments), botón Aprobar deshabilitado si `yaAprobado` o si
`status !== 'PENDING_APPROVAL'`. En `INSERTED` mostrar `onChainTxHash`/`merkleRootAfter` de solo
lectura. En `INSERTION_FAILED` un mensaje simple ("tu aprobación quedó registrada, el sistema
reintentará") sin botón de reintento.

**Fuera de alcance de esta pasada**: pantalla para `GET /elections/:id/rate-alerts` (CU-06) — el
endpoint ya existe, pero no hay pantalla planeada todavía; candidato natural para una futura pestaña
"Alertas" en `ElectionDetailPage`.

## Ver también

- `themis-core/docs/checkpoint-lote-multisig.md` — detalle completo del backend (modelo de datos,
  casos de uso, cron, tests, qué falta del lado de `themis-core`).
- `docs/docs/modelo-bd-registro.md` (a nivel workspace) — diseño de datos de referencia.
