// Auto-generated backend stub - replaced with actual declarations during full build
// This stub provides minimal type compatibility for the mock backend system

import type { HttpAgentOptions, ActorConfig } from "@dfinity/agent";

export class ExternalBlob {
  private _bytes: Uint8Array = new Uint8Array();
  private _url: string = "";

  onProgress?: (progress: number) => void;

  async getBytes(): Promise<Uint8Array> {
    if (this._url) {
      const res = await fetch(this._url);
      const buf = await res.arrayBuffer();
      return new Uint8Array(buf);
    }
    return this._bytes;
  }

  static fromURL(url: string): ExternalBlob {
    const blob = new ExternalBlob();
    blob._url = url;
    return blob;
  }

  static fromBytes(bytes: Uint8Array): ExternalBlob {
    const blob = new ExternalBlob();
    blob._bytes = bytes;
    return blob;
  }
}

// biome-ignore lint/suspicious/noExplicitAny: backend interface is dynamically typed
export type backendInterface = Record<string, (...args: any[]) => Promise<any>>;

export interface CreateActorOptions {
  agentOptions?: HttpAgentOptions;
  actorOptions?: Omit<ActorConfig, "canisterId">;
}

export function createActor(
  _canisterId: string,
  _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
  _downloadFile: (bytes: Uint8Array) => Promise<ExternalBlob>,
  _options?: CreateActorOptions,
): Promise<backendInterface> {
  return Promise.resolve({} as backendInterface);
}

export const idlFactory = () => {};
export const canisterId = "";
