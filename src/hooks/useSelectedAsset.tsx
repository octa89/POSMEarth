// src/hooks/useSelectedAsset.ts
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import axios from "axios";

/* ---------- env & types ---------- */
const ID_FIELD = import.meta.env.VITE_ID_FIELD as string; // e.g. "AssetID"
export type FeatureAttrs = Record<string, any> | null;

type Ctx = {
  attrs: FeatureAttrs;                // full attributes or null
  assetId: string | null;             // derived from attrs[ID_FIELD]
  /** legacy helper – launches immediately */
  idClicked: (id: string) => Promise<void>;
  /** new helper – just stores attrs (no auto-launch) */
  setAttrs:  (a: FeatureAttrs) => void;
};

/* ---------- React context ---------- */
const SelectedCtx = createContext<Ctx | null>(null);

export function SelectedAssetProvider({ children }: { children: ReactNode }) {
  const [attrs, _setAttrs] = useState<FeatureAttrs>(null);
  const assetId =
    attrs && ID_FIELD in attrs ? (attrs[ID_FIELD] as string) : null;

  /* helper that posts to /launch */
  const postLaunch = async (id: string) => {
    try {
      await axios.post("http://localhost:3000/launch", { id });
    } catch (e) {
      console.error("Launch failed", e);
    }
  };

  /* keeps old behaviour */
  const idClicked = useCallback(async (id: string) => {
    _setAttrs({ [ID_FIELD]: id });
    await postLaunch(id);
  }, []);

  /* new behaviour: store attrs only, no auto-launch */
  const setAttrs = useCallback((a: FeatureAttrs) => {
    _setAttrs(a);
  }, []);

  return (
    <SelectedCtx.Provider value={{ attrs, assetId, idClicked, setAttrs }}>
      {children}
    </SelectedCtx.Provider>
  );
}

/* ---------- consumer hook ---------- */
export default function useSelectedAsset() {
  const ctx = useContext(SelectedCtx);
  if (!ctx)
    throw new Error(
      "useSelectedAsset() must be used inside <SelectedAssetProvider>"
    );
  return ctx;
}
