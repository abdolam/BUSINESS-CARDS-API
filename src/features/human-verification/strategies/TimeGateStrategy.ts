export function createTimeGate(minDwellMs: number) {
  const startedAt = Date.now();
  const isOpen = () => Date.now() - startedAt >= minDwellMs;
  return { startedAt, isOpen };
}
