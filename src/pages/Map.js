import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import "@arcgis/core/assets/esri/themes/light/main.css";
import WebMap from "@arcgis/core/WebMap";
import MapView from "@arcgis/core/views/MapView";
import Expand from "@arcgis/core/widgets/Expand";
import Editor from "@arcgis/core/widgets/Editor";
import ScaleBar from "@arcgis/core/widgets/ScaleBar";
import Legend from "@arcgis/core/widgets/Legend";
import Search from "@arcgis/core/widgets/Search";
import BasemapGallery from "@arcgis/core/widgets/BasemapGallery";
import Locate from "@arcgis/core/widgets/Locate";
import LayerList from "@arcgis/core/widgets/LayerList";
import esriConfig from "@arcgis/core/config";
import TopNav from "../components/TopNav";
import EditorPanel from "../components/EditorPanel";
import RightSidebar from "../components/RightSidebar";
import useSelectedAsset from "../hooks/useSelectedAsset";
/* helper: test for a graphic hit-result */
function isGraphicHit(r) {
    return "graphic" in r;
}
export default function Map() {
    const mapDiv = useRef(null);
    const viewRef = useRef(null);
    const { setAttrs } = useSelectedAsset();
    useEffect(() => {
        if (!mapDiv.current || viewRef.current)
            return; // StrictMode 2nd mount
        /* optional ArcGIS API key */
        if (import.meta.env.VITE_ARCGIS_API_KEY) {
            esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY;
        }
        /* ── build map & view ─────────────────────────── */
        const webmap = new WebMap({
            portalItem: { id: import.meta.env.VITE_MAP_ID },
        });
        webmap.when(() => {
            webmap.allLayers.forEach((l) => {
                if (l.type === "feature")
                    l.outFields = ["*"];
            });
        });
        const view = new MapView({ container: mapDiv.current, map: webmap });
        viewRef.current = view;
        /* ── widget stack (top-right) ─────────────────── */
        const editorExpand = new Expand({
            view,
            content: new Editor({ view }),
            expandIconClass: "esri-icon-hollow-eye",
            expandTooltip: "Edit geometry / attachments",
            group: "top-right",
            index: 0,
        });
        view.ui.add(editorExpand, "top-right");
        const searchExpand = new Expand({
            view,
            content: new Search({ view }),
            expandIconClass: "esri-icon-search",
            group: "top-right",
            index: 1,
        });
        view.ui.add(searchExpand, "top-right");
        const bmGallery = new BasemapGallery({ view });
        const bmExpand = new Expand({
            view,
            content: bmGallery,
            expandIconClass: "esri-icon-basemap",
            group: "top-right",
            index: 2,
        });
        bmGallery.watch("activeBasemap", () => bmExpand.collapse());
        view.ui.add(bmExpand, "top-right");
        const layerListExpand = new Expand({
            view,
            content: new LayerList({ view }),
            expandIconClass: "esri-icon-hollow-eye",
            group: "top-right",
            index: 3,
        });
        view.ui.add(layerListExpand, "top-right");
        /* ── other widgets ────────────────────────────── */
        view.ui.add(new ScaleBar({ view, unit: "imperial" }), "bottom-left");
        // Legend Expand widget (similar to LayerList)
        const legendExpand = new Expand({
            view,
            content: new Legend({ view }),
            expandIconClass: "esri-icon-legend",
            group: "botton-left",
            index: 4,
        });
        view.ui.add(legendExpand, "bottom-left");
        view.ui.add(new Locate({ view }), "top-left");
        /* ── click → update sidebar attributes ────────── */
        const clickHandle = view.on("click", async (evt) => {
            const hit = await view.hitTest(evt);
            const g = hit.results.find(isGraphicHit);
            console.log("Map click → graphic attributes:", g?.graphic?.attributes);
            setAttrs(g?.graphic?.attributes ?? null);
        });
        /* ── cleanup ──────────────────────────────────── */
        return () => {
            clickHandle.remove();
            [editorExpand, searchExpand, bmExpand, layerListExpand].forEach((w) => {
                if (w.destroy)
                    w.destroy();
            });
            view.destroy();
            viewRef.current = null;
        };
    }, [setAttrs]);
    /* ── page layout ───────────────────────────────── */
    return (_jsxs("div", { className: "flex flex-col h-screen", children: [_jsx(TopNav, {}), _jsxs("div", { className: "flex flex-1 min-h-0", children: [_jsx("div", { ref: mapDiv, className: "flex-1 min-h-0" }), _jsx(RightSidebar, {})] }), _jsx(EditorPanel, {})] }));
}
