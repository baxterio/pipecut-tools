import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FillText } from "./FillText";

describe("FillText", () => {
  it.each(["Télécharge.", "Download.", "ダウンロード。"])(
    "affiche le mot « %s » tel quel, en un seul élément",
    (text) => {
      const { container } = render(<FillText text={text} />);

      expect(container.querySelectorAll("[data-fill-text]")).toHaveLength(1);
      expect(container).toHaveTextContent(text);
      // le remplissage est un fond en pourcentage : le mot n'est jamais découpé en lettres
      expect(container.querySelector("[data-fill-text]")?.childElementCount).toBe(0);
    }
  );
});
