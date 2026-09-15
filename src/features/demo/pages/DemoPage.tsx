import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LogoutButton } from '@/features/auth/components/LogoutButton';
import { apiBaseUrl } from '@/api/client';
import {
  useChainPing,
  useCreatePing,
  useForecast,
  useHealth,
  usePings,
} from '../hooks/use-demo';

export function DemoPage() {
  const [note, setNote] = useState('');
  const health = useHealth();
  const pings = usePings();
  const forecast = useForecast();
  const createPing = useCreatePing();
  const chainPing = useChainPing();

  const deps = health.data?.dependencies;

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Themis - verificacion de conectividad
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Andamiaje temporal. Confirma que themis-web alcanza themis-core, y
            que este alcanza Neon, la blockchain y themis-ai.
          </p>
          <p className="mt-1 text-xs text-slate-500">API: {apiBaseUrl}</p>
        </div>
        <LogoutButton />
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Estado de themis-core</CardTitle>
          <CardDescription>Se refresca cada 10 segundos</CardDescription>
        </CardHeader>
        <CardContent>
          {health.isPending ? (
            <p className="text-sm text-slate-600" role="status">
              Consultando...
            </p>
          ) : health.isError ? (
            <p className="text-sm text-red-700" role="alert">
              No se pudo contactar a themis-core. Revisa que este corriendo en{' '}
              {apiBaseUrl}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <StatusBadge
                ok={deps?.database.reachable ?? false}
                label="Neon"
              />
              <StatusBadge ok={deps?.chain.connected ?? false} label="Blockchain" />
              <StatusBadge ok={deps?.ai.reachable ?? false} label="themis-ai" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Escritura en Neon</CardTitle>
          <CardDescription>
            POST /demo/pings pasa por caso de uso y repositorio Prisma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              createPing.mutate(note || 'sin nota');
              setNote('');
            }}
          >
            <div className="flex-1">
              <label
                htmlFor="note"
                className="block text-sm font-medium text-slate-700"
              >
                Nota
              </label>
              <input
                id="note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="prueba de conectividad"
              />
            </div>
            <button
              type="submit"
              disabled={createPing.isPending}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50"
            >
              {createPing.isPending ? 'Guardando...' : 'Guardar ping'}
            </button>
          </form>

          <p className="mt-4 text-sm text-slate-600">
            Total en base de datos: {pings.data?.total ?? '-'}
          </p>
          <ul className="mt-2 divide-y divide-slate-100 text-sm">
            {pings.data?.items.map((ping) => (
              <li key={ping.id} className="py-2">
                <span className="font-medium text-slate-900">{ping.source}</span>
                <span className="text-slate-600"> - {ping.note ?? 'sin nota'}</span>
                <span className="block text-xs text-slate-500">
                  {new Date(ping.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaccion firmada por el relayer</CardTitle>
          <CardDescription>
            El relayer paga el gas contra el nodo local
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            onClick={() => chainPing.mutate()}
            disabled={chainPing.isPending}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50"
          >
            {chainPing.isPending ? 'Enviando...' : 'Enviar transaccion'}
          </button>

          {chainPing.isError ? (
            <p className="mt-3 text-sm text-red-700" role="alert">
              Fallo el envio. Revisa CONTRACT_ADDRESS en el .env de themis-core.
            </p>
          ) : null}

          {chainPing.data ? (
            <p className="mt-3 break-all text-sm text-slate-700">
              txHash: {chainPing.data.txHash}
            </p>
          ) : null}

          <dl className="mt-4 space-y-1 text-sm text-slate-600">
            <div>
              <dt className="inline font-medium">Contrato: </dt>
              <dd className="inline break-all">
                {deps?.chain.contractAddress ?? 'sin desplegar'}
              </dd>
            </div>
            <div>
              <dt className="inline font-medium">Version: </dt>
              <dd className="inline">{deps?.chain.contractVersion ?? '-'}</dd>
            </div>
            <div>
              <dt className="inline font-medium">Bloque: </dt>
              <dd className="inline">{deps?.chain.blockNumber ?? '-'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Proyeccion calculada en themis-ai</CardTitle>
          <CardDescription>
            themis-core agrega los conteos y los envia a Python
          </CardDescription>
        </CardHeader>
        <CardContent>
          {forecast.isPending ? (
            <p className="text-sm text-slate-600" role="status">
              Calculando...
            </p>
          ) : forecast.data?.source === 'unavailable' ? (
            <p className="text-sm text-amber-800" role="status">
              themis-ai no responde. themis-core degrada la respuesta en lugar de
              fallar.
            </p>
          ) : (
            <div className="text-sm text-slate-700">
              <p>Modelo: {forecast.data?.model}</p>
              <p>Total proyectado: {forecast.data?.projectedTotal}</p>
              <table className="mt-3 w-full text-left">
                <caption className="sr-only">
                  Proyeccion de conteos por paso temporal
                </caption>
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th scope="col" className="py-1">
                      Paso
                    </th>
                    <th scope="col" className="py-1">
                      Conteo proyectado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.data?.projection.map((point) => (
                    <tr key={point.t} className="border-b border-slate-100">
                      <td className="py-1">{point.t}</td>
                      <td className="py-1">{point.votes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
