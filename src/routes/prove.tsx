import { createFileRoute } from '@tanstack/react-router';
import { ProvePage } from '@/features/prove/pages/ProvePage';

// Publica (fuera de _authenticated) pero deliberadamente no linkeada desde
// ningun lado del portal (ver src/layout/nav-items.ts) -- solo la carga el
// WebView interno de themis-app. Ver ProvePage para el detalle de por que
// abrirla en un navegador normal no hace nada.
export const Route = createFileRoute('/prove')({
  component: ProvePage,
});
