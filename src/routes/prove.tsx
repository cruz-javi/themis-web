import { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Identity } from '@semaphore-protocol/identity';
import { Group } from '@semaphore-protocol/group';
import { generateProof } from '@semaphore-protocol/proof';

export const Route = createFileRoute('/prove')({
  component: ProvePage,
});

declare global {
  interface Window {
    ThemisProverChannel?: {
      postMessage: (message: string) => void;
    };
    generateSemaphoreProof?: (
      privateKey: string,
      members: string[],
      message: string,
      scope: string,
    ) => Promise<unknown>;
  }
}

function ProvePage() {
  const [status, setStatus] = useState<'ready' | 'generating' | 'done' | 'error'>('ready');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function runProver(
      privateKey: string,
      members: string[],
      message: string,
      scope: string,
    ) {
      setStatus('generating');
      setErrorMessage(null);
      try {
        const identity = new Identity(privateKey);
        const group = new Group(members);
        const proof = await generateProof(identity, group, message, scope);

        const formattedProof = {
          merkleTreeDepth: proof.merkleTreeDepth,
          merkleTreeRoot: proof.merkleTreeRoot.toString(),
          nullifier: proof.nullifier.toString(),
          message: proof.message.toString(),
          scope: proof.scope.toString(),
          points: proof.points.map((p) => p.toString()),
        };

        if (window.ThemisProverChannel) {
          window.ThemisProverChannel.postMessage(
            JSON.stringify({ ok: true, proof: formattedProof }),
          );
        }

        setStatus('done');
        return formattedProof;
      } catch (err: unknown) {
        const errorText = err instanceof Error ? err.message : String(err);
        setErrorMessage(errorText);
        setStatus('error');
        if (window.ThemisProverChannel) {
          window.ThemisProverChannel.postMessage(
            JSON.stringify({ ok: false, error: errorText }),
          );
        }
        throw err;
      }
    }

    window.generateSemaphoreProof = runProver;

    const handleMessage = async (event: MessageEvent) => {
      if (!event.data || event.data.type !== 'GENERATE_PROOF') return;
      const { privateKey, members, message, scope } = event.data;
      try {
        const proof = await runProver(privateKey, members, message, scope);
        if (event.source && 'postMessage' in event.source) {
          (event.source as Window).postMessage(
            { type: 'PROOF_GENERATED', ok: true, proof },
            '*',
          );
        }
      } catch (err: unknown) {
        if (event.source && 'postMessage' in event.source) {
          (event.source as Window).postMessage(
            { type: 'PROOF_GENERATED', ok: false, error: String(err) },
            '*',
          );
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      delete window.generateSemaphoreProof;
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 text-zinc-100 font-sans">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl backdrop-blur">
        <h1 className="text-xl font-semibold tracking-tight text-emerald-400">
          Themis Zero-Knowledge Prover
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Módulo criptográfico headless para generación de pruebas ZK-SNARK (Groth16 Semaphore).
        </p>

        <div className="mt-6 flex items-center gap-3">
          <div
            className={`h-3 w-3 rounded-full ${
              status === 'ready'
                ? 'bg-emerald-500 animate-pulse'
                : status === 'generating'
                ? 'bg-amber-500 animate-spin'
                : status === 'done'
                ? 'bg-blue-500'
                : 'bg-rose-500'
            }`}
          />
          <span className="text-sm font-medium capitalize text-zinc-200">
            {status === 'ready' && 'Prover listo (en espera de parámetros)'}
            {status === 'generating' && 'Generando prueba criptográfica Groth16...'}
            {status === 'done' && 'Prueba generada exitosamente'}
            {status === 'error' && 'Error al generar la prueba'}
          </span>
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-lg bg-rose-950/50 p-3 text-xs text-rose-300 border border-rose-800/50">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}
