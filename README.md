# themis-web

Portal administrativo y votacion por navegador de Themis.

## Requisitos

| Herramienta | Version |
|---|---|
| Node | 22 LTS (ver `.nvmrc`) |
| pnpm | 11.x (`corepack enable`) |

## Arranque

```bash
pnpm install
cp .env.example .env
pnpm dev
```

http://localhost:5173

Necesitas `themis-core` corriendo en http://localhost:3000. Su `CORS_ORIGINS` debe incluir `http://localhost:5173`.

## Variables de entorno

| Variable | Para que sirve |
|---|---|
| `VITE_API_BASE_URL` | URL base de la API de themis-core |

Vite solo expone al navegador las variables con prefijo `VITE_`. No pongas secretos aqui: todo lo que entra acaba en el bundle publico.

## Estructura

```
public/zk/              Artefactos criptograficos autoalojados (.wasm, .zkey)
src/api/client.ts       Cliente HTTP (fetch con credentials: 'include' para la cookie de sesion)
src/api/generated/      Tipos generados desde el OpenAPI de themis-core
src/features/           Una carpeta por feature
src/components/ui/      Componentes shadcn/ui (Button, Input, Label, Card) + reutilizables propios
src/lib/utils.ts        Helper cn() de shadcn (clsx + tailwind-merge)
src/lib/                Resto de utilidades y, a futuro, la capa Semaphore
src/routes/             Rutas de TanStack Router, file-based (ver seccion "Ruteo")
src/routeTree.gen.ts    Generado por @tanstack/router-plugin — NO editar, no se commitea
src/router.tsx          Instancia del router (createRouter), no un archivo de ruta
```

Cada feature agrupa sus `hooks/`, `pages/`, `components/`, `schemas/` (validacion con `zod`) y
`types/` (contrato TS a mano del DTO del backend, hasta que exista codegen). `src/features/demo/`
es la plantilla original del bootstrap. `src/features/auth/` (HU00_1) ya es real, no andamiaje:
login de Administrador/Autoridad/Auditor, sesion por cookie `httpOnly` (sin `localStorage`),
logout, y el guard `requireAuth` que usan las rutas protegidas.

## Ruteo: TanStack Router, file-based

`react-router-dom` fue reemplazado por completo por `@tanstack/react-router`. Las rutas son
archivos bajo `src/routes/`:

```
src/routes/
├── __root.tsx           Layout raiz + tipo del contexto del router (RouterContext: { auth })
├── index.tsx            "/"     -> redirige a "/demo"
├── login.tsx             "/login" -> LoginPage
├── _authenticated.tsx    Layout "pathless" (el "_" no agrega segmento a la URL): guard unico
│                         para todo lo que cuelga de la carpeta de abajo
└── _authenticated/
    └── demo.tsx           "/demo" -> DemoPage (hereda el guard del layout)
```

`@tanstack/router-plugin/vite` (configurado en `vite.config.ts`, antes del plugin de `react()`)
regenera `src/routeTree.gen.ts` automaticamente en cada `pnpm dev`/`pnpm build` — nunca se edita
ni se commitea a mano.

**Toda ruta administrativa protegida va dentro de `src/routes/_authenticated/`.** El guard vive
una sola vez en el layout, no en cada ruta:

```ts
// src/routes/_authenticated.tsx
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context }) => requireAuth(context.auth),
  component: () => <Outlet />,
});

// src/routes/_authenticated/demo.tsx — no repite el beforeLoad, lo hereda
export const Route = createFileRoute('/_authenticated/demo')({
  component: DemoPage,
});
```

Agregar una ruta protegida nueva (ej. `/admin/elections`) es crear el archivo dentro de
`_authenticated/` — no hace falta volver a escribir el guard.

`requireAuth` (`src/features/auth/lib/require-auth.ts`) lee `context.auth.getSession()` — una
lectura **sincrona** vía `useRef`, no el `session` de estado de React. Es deliberado: un
`navigate()` llamado en el mismo callback que `login()` corre antes de que el `setState` de React
(por lotes en React 18) llegue al contexto del router: leer el estado en vez de la `ref` ahí
puede rebotar de vuelta a `/login` justo después de un login exitoso. Fue un bug real, no una
precaución teórica.

## Rutas previstas

| Ruta | Para quien | Estado |
|---|---|---|
| `/login` | Administrador / Autoridad de Registro / Auditor | Implementada (HU00_1) |
| `/demo` | Cualquier cuenta de plataforma logueada | Implementada, en `routes/_authenticated/` |
| `/admin/*` | Autoridades electorales | Prevista — va en `routes/_authenticated/admin/` |
| `/admin/users` | Superusuario | Implementada — crea cuentas de ADMIN/AUTORIDAD_REGISTRO/AUDITOR |
| `/vote/*` | Votantes por navegador | Prevista, sin implementar |
| `/prove` | Pagina headless que consume el WebView de themis-app | Prevista, sin implementar |

`/prove` es el punto de integracion con la app movil: genera la prueba ZK y la devuelve por `postMessage`. Asi la criptografia existe una sola vez, no duplicada en Dart.

## shadcn/ui

`components.json` en la raiz del repo + `src/lib/utils.ts` (`cn`) + variables de tema en
`src/styles/index.css` (Tailwind v4, `oklch`). Componentes agregados hasta ahora:
`Button`, `Input`, `Label`, `Card` (con `CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/
`CardFooter`) en `src/components/ui/`.

**Todo componente que pueda recibir un `ref` de `react-hook-form` debe usar `React.forwardRef`**
— este proyecto está en React 18, no 19, y sin `forwardRef` el `ref` nunca llega al DOM real. Un
`Input` sin `forwardRef` rompió silenciosamente la lectura de valores del formulario de login (los
tests lo atraparon, no fue obvio a simple vista) — ver
`docs/UT/HU00_1/UT-WEB/UT-WEB-HU00_1-03.md`.

## Sobre la criptografia (aun no implementada)

Cuando llegue el momento de integrar Semaphore, tres cosas importan:

1. Autoalojar `.wasm` y `.zkey` en `public/zk/` y pasarlos explicitamente. Por defecto se descargan de un CDN, y depender de eso el dia de la demo es un riesgo evitable.
2. Generar la prueba en un **Web Worker**. Tarda segundos y congelaria la interfaz.
3. Vite necesita polyfills para snarkjs (`global`, `buffer`).

## Pagina de verificacion

`/demo` es andamiaje temporal. Comprueba que la web alcanza el core, y que el core alcanza Neon, la blockchain y themis-ai. Borrala al empezar las features reales.

## Scripts

| Comando | Que hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Chequeo de tipos y build de produccion |
| `pnpm preview` | Sirve el build |
| `pnpm lint` | Solo chequeo de tipos |
| `pnpm run test` | Tests (Vitest + Testing Library) |

## Docker

```bash
docker compose up --build
```

Sirve el build estatico con nginx en http://localhost:8080. `VITE_API_BASE_URL` se inyecta en tiempo de build, no de arranque: si cambia la URL de la API hay que reconstruir la imagen.
