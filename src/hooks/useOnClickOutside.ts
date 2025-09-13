import { useEffect } from "react";

export function useOnClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>, // ✅ accept nullable ref
  handler: (ev: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (ev: MouseEvent | TouchEvent) => {
      const el = ref.current; // el: T | null
      if (!el || el.contains(ev.target as Node)) return;
      handler(ev);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener, { passive: true });

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}
