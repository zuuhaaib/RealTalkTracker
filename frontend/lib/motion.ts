import type { CSSProperties } from "react";

// Staggers data-reveal siblings: the nth one waits n × 75ms.
export function stagger(index: number) {
  return { "--i": index } as CSSProperties;
}
