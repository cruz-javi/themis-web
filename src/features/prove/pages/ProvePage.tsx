import { useEffect, useState } from 'react';
import { Group } from '@semaphore-protocol/group';
import { Identity } from '@semaphore-protocol/identity';
import { generateProof } from '@semaphore-protocol/proof';

// CU-10: esta pagina NO es una via de voto publico (regla 3 del CLAUDE.md
// raiz) -- solo existe para ser cargada dentro del WebView interno de
// themis-app, que llama `window.generateVoteProof(json)` (inyectado como JS,
// mismo patron que identity-entry.js para CU-05) y recibe la respuesta por
// `window.ThemisVoteChannel.postMessage`. Nunca esta linkeada desde el resto
// del portal (ver src/layout/nav-items.ts) y, si se abre en un navegador
// normal, no hace nada -- no hay channel al que postear, asi que no genera
// ni envia ningun voto.

interface GenerateVoteProofPayload {
  identityPrivateKey: string;
  electionId: string;
  optionId: string;
  apiBaseUrl: string;
}

interface VotingContextOption {
  id: string;
  onChainIndex: number;
}

interface VotingContextResponse {
  electionId: string;
  onChainGroupId: string;
  members: string[];
  options: VotingContextOption[];
}

declare global {
  interface Window {
    ThemisVoteChannel?: { postMessage: (message: string) => void };
    generateVoteProof?: (payloadJson: string) => Promise<void>;
  }
}

function post(type: string, payload: Record<string, unknown>): void {
  window.ThemisVoteChannel?.postMessage(JSON.stringify({ type, ...payload }));
}

async function handleGenerateVoteProof(payloadJson: string): Promise<void> {
  let payload: GenerateVoteProofPayload;
  try {
    payload = JSON.parse(payloadJson) as GenerateVoteProofPayload;
  } catch {
    post('vote-proof', { ok: false, error: 'Payload invalido: no es JSON valido' });
    return;
  }

  try {
    const { identityPrivateKey, electionId, optionId, apiBaseUrl } = payload;

    const response = await fetch(`${apiBaseUrl}/elections/${electionId}/voting-context`);
    if (!response.ok) {
      throw new Error(`voting-context respondio ${response.status}`);
    }
    const context = (await response.json()) as VotingContextResponse;

    const option = context.options.find((candidate) => candidate.id === optionId);
    if (!option) {
      throw new Error('La opcion elegida no esta en el contexto de votacion de esta eleccion');
    }

    // Semaphore v4: arbol de profundidad dinamica -- se reconstruye igual
    // que el on-chain, en el mismo orden de insercion real (ver
    // GetVotingContextUseCase en themis-core).
    const group = new Group(context.members.map((member) => BigInt(member)));
    const identity = Identity.import(identityPrivateKey);

    // scope = onChainGroupId (unico por eleccion), message = onChainIndex de
    // la opcion elegida -- decision de diseno fijada para CU-10, ver
    // docs/checkpoint-lote-multisig.md.
    const proof = await generateProof(
      identity,
      group,
      BigInt(option.onChainIndex),
      BigInt(context.onChainGroupId),
    );

    post('vote-proof', {
      ok: true,
      proof: {
        merkleTreeDepth: proof.merkleTreeDepth,
        merkleTreeRoot: proof.merkleTreeRoot,
        nullifier: proof.nullifier,
        message: proof.message,
        scope: proof.scope,
        points: proof.points,
      },
    });
  } catch (error) {
    post('vote-proof', {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export function ProvePage() {
  const [hasChannel, setHasChannel] = useState<boolean | null>(null);

  useEffect(() => {
    window.generateVoteProof = handleGenerateVoteProof;
    // El JavaScriptChannel de Flutter se inyecta despues de onPageFinished,
    // se da un margen antes de decidir "no hay channel" (navegador normal).
    const timer = setTimeout(() => {
      setHasChannel(typeof window.ThemisVoteChannel !== 'undefined');
    }, 300);
    return () => {
      clearTimeout(timer);
      delete window.generateVoteProof;
    };
  }, []);

  if (hasChannel === false) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Esta página solo funciona dentro de la app Themis.
        </p>
      </div>
    );
  }

  return null;
}
