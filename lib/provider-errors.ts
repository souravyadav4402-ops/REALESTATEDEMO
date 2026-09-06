export class ProviderDeliveryError extends Error {
  constructor(readonly code: string, readonly uncertain = false) {
    super(code);
    this.name = "ProviderDeliveryError";
  }
}

export function uncertainProviderFailure(provider: string, error: unknown) {
  if (error instanceof ProviderDeliveryError) return error;
  const name = error instanceof Error ? error.name : "UnknownError";
  return new ProviderDeliveryError(`${provider}${name}`.slice(0, 80), true);
}
