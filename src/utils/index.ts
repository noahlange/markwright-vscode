export function throttleRAF<T extends (...args: unknown[]) => unknown>(
  fn: T
): (...args: Parameters<T>) => void {
  let frame: number | null = null;
  return (...args: Parameters<T>) => {
    if (frame) {
      cancelAnimationFrame(frame);
    }
    frame = requestAnimationFrame(() => {
      frame = null;
      fn(...args);
    });
  };
}
