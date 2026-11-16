import { useCallback, useId, useRef, useState } from "react";

/**
 * L'état d'un bouton et de son panneau : ouvert ou fermé, et ce qui les relie l'un à l'autre pour le
 * navigateur et les lecteurs d'écran. Le bouton reçoit `trigger`, le Popover reçoit `panel`.
 */
export function usePopover() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const id = useId();

  const show = useCallback(() => setOpen(true), []);
  // le panneau rend lui-même le focus au bouton en se fermant
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((wasOpen) => !wasOpen), []);

  return {
    open,
    show,
    close,
    toggle,
    trigger: {
      ref: button,
      "aria-haspopup": "dialog",
      "aria-expanded": open,
      "aria-controls": open ? id : undefined,
    },
    panel: { id, open, anchor: button, onClose: close },
  } as const;
}
