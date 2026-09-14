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
src/api/client.ts       Cliente HTTP
src/api/generated/      Tipos generados desde el OpenAPI de themis-core
src/features/           Una carpeta por feature
src/components/ui/      Componentes reutilizables
src/lib/                Utilidades y capa Semaphore
src/router.tsx          Rutas
```

Cada feature agrupa sus `hooks/`, `pages/` y `components/`. `src/features/demo/` es la plantilla.

## Rutas previstas

| Ruta | Para quien |
|---|---|
| `/admin/*` | Autoridades electorales |
| `/vote/*` | Votantes por navegador |
| `/prove` | Pagina headless que consume el WebView de themis-app |

`/prove` es el punto de integracion con la app movil: genera la prueba ZK y la devuelve por `postMessage`. Asi la criptografia existe una sola vez, no duplicada en Dart.

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

## Docker

```bash
docker compose up --build
```

Sirve el build estatico con nginx en http://localhost:8080. `VITE_API_BASE_URL` se inyecta en tiempo de build, no de arranque: si cambia la URL de la API hay que reconstruir la imagen.
