export function isSuccessStatus(status: unknown): boolean {
  return status === 'OK' || status === '200' || status === 200;
}
