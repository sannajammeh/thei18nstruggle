export function setCookie(name: string, value: string, maxAge: number) {
  // biome-ignore lint/suspicious/noDocumentCookie: sync write
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; samesite=lax`;
}

export function clearCookie(name: string) {
  // biome-ignore lint/suspicious/noDocumentCookie: sync write
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}
