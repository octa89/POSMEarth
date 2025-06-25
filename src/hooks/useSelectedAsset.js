import { jsx as _jsx } from "react/jsx-runtime";
// src/hooks/useSelectedAsset.ts
import { createContext, useContext, useState, useCallback, } from "react";
import axios from "axios";
/* ---------- env & types ---------- */
const ID_FIELD = import.meta.env.VITE_ID_FIELD; // e.g. "AssetID"
/* ---------- React context ---------- */
const SelectedCtx = createContext(null);
export function SelectedAssetProvider({ children }) {
    const [attrs, _setAttrs] = useState(null);
    const assetId = attrs && ID_FIELD in attrs ? attrs[ID_FIELD] : null;
    /* helper that posts to /launch */
    const postLaunch = async (id) => {
        try {
            await axios.post("http://localhost:3000/launch", { id });
        }
        catch (e) {
            console.error("Launch failed", e);
        }
    };
    /* keeps old behaviour */
    const idClicked = useCallback(async (id) => {
        _setAttrs({ [ID_FIELD]: id });
        await postLaunch(id);
    }, []);
    /* new behaviour: store attrs only, no auto-launch */
    const setAttrs = useCallback((a) => {
        _setAttrs(a);
    }, []);
    return (_jsx(SelectedCtx.Provider, { value: { attrs, assetId, idClicked, setAttrs }, children: children }));
}
/* ---------- consumer hook ---------- */
export default function useSelectedAsset() {
    const ctx = useContext(SelectedCtx);
    if (!ctx)
        throw new Error("useSelectedAsset() must be used inside <SelectedAssetProvider>");
    return ctx;
}
