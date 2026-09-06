const placeholderPatterns = [
  /^replace[-_ ]?me$/i,
  /^change[-_ ]?me$/i,
  /^demo-project$/i,
  /api-inx+/i,
  /^vxx(?:\.x)?$/i,
  /your[-_ ]studio/i,
  /(?:^|[./:@_-])example(?:[./:@_-]|$)/i,
  /postgres(?:ql)?:\/\/(?:user|username):(?:password|pass)@(?:host|hostname)(?=[:/]|$)/i,
];

export function isConfiguredValue(value: string | undefined | null): value is string {
  const normalized = value?.trim();
  return Boolean(normalized && !placeholderPatterns.some((pattern) => pattern.test(normalized)));
}

export function hasConfiguredValues(...names: string[]) {
  return names.every((name) => isConfiguredValue(process.env[name]));
}

export function configuredValue(name: string) {
  const value = process.env[name]?.trim();
  if (!isConfiguredValue(value)) throw new Error(`${name} is not configured.`);
  return value;
}
