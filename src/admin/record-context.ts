// What record is currently being edited.
//
// Image fields are rendered several layers deep (editor → group row → gallery →
// ImageField), so passing the surrounding record down as props would mean
// threading it through every one of them. A context keeps ImageField able to
// ask "what am I an image *of*?" — which is what makes the generated AI prompt
// specific to this product rather than generic filler.
//
// Lives in its own module so the component files keep exporting only components
// (react-refresh).
import { createContext, useContext } from "react";

export type EditingRecord = {
  /** Collection id ("products") or "page:<id>" for website-page content. */
  module: string;
  record: Record<string, unknown>;
};

export const RecordContext = createContext<EditingRecord | null>(null);

export const useEditingRecord = () => useContext(RecordContext);
