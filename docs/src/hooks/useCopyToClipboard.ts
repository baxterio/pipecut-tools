import { useCallback, useState } from "react";

interface CopyToClipboard {
  /** Vrai après une copie réussie, jusqu'à l'appel de `reset`. */
  copied: boolean;
  /** Copie le texte dans le presse-papiers. Renvoie faux si le navigateur refuse. */
  copy: (text: string) => Promise<boolean>;
  /** Revient à l'état de départ. */
  reset: () => void;
}

export function useCopyToClipboard(): CopyToClipboard {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return false;
    }
    setCopied(true);
    return true;
  }, []);

  const reset = useCallback(() => setCopied(false), []);

  return { copied, copy, reset };
}
