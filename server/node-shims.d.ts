declare const process: {
  env: Record<string, string | undefined>
  cwd(): string
}

declare class Buffer extends Uint8Array {
  static from(value: string | ArrayBuffer | ArrayBufferView, encoding?: string): Buffer
  static concat(list: readonly Uint8Array[]): Buffer
  toString(encoding?: string): string
}

declare module 'node:crypto' {
  export function createHmac(algorithm: string, key: string | Uint8Array): {
    update(data: string | Uint8Array): any
    digest(encoding: string): string
  }
  export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean
}
