import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import useSelectedAsset from "../hooks/useSelectedAsset";
/* ------------ env helpers ------------ */
const env = {
    idField: import.meta.env.VITE_ID_FIELD || "AssetID",
    reportField: import.meta.env.VITE_REPORT_FIELD || "WebPath2ReportIndex",
    exe: import.meta.env.VITE_POSM_EXECUTABLE_PATH || "",
    template: import.meta.env.VITE_TEMPLATE || "",
};
export default function RightSidebar() {
    const { attrs } = useSelectedAsset();
    /* pull values (case-sensitive) */
    const assetId = attrs?.[env.idField];
    const reportUrl = attrs?.[env.reportField];
    /* -------- collapse state -------- */
    const [open, setOpen] = useState(false);
    /* auto-open when we get a new AssetID */
    useEffect(() => {
        if (assetId)
            setOpen(true);
    }, [assetId]);
    /* hide completely until we have a valid ID */
    if (!assetId)
        return null;
    /* -------- launch POSM -------- */
    async function launchPOSM() {
        const cmd = [
            env.exe,
            "/S",
            "/T",
            env.template,
            "/AID",
            assetId
        ].filter(Boolean);
        console.log("Launching POSM with command:", cmd.join(" "));
        await fetch("http://localhost:3000/launch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cmd }),
        });
    }
    // open in posm
    async function OpenPOSM() {
        const cmd = [
            env.exe,
            "/SSM",
            "/AID",
            assetId
        ].filter(Boolean);
        console.log("Launching POSM with command:", cmd.join(" "));
        await fetch("http://localhost:3000/launch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cmd }),
        });
    }
    /* -------- collapsed thumb -------- */
    if (!open) {
        return (_jsx("button", { onClick: () => setOpen(true), className: "absolute right-0 top-1/2 -translate-y-1/2\r\n                   bg-gray-800 text-[#fefefe] rounded-l px-2 py-1 text-sm", children: "\u276F" }));
    }
    /* -------- full sidebar -------- */
    return (_jsxs("aside", { className: "relative w-80 shrink-0 border-l border-[#323232]\r\n                      bg-gray-800 text-[#fefefe] flex flex-col p-4 gap-6", children: [_jsx("button", { onClick: () => setOpen(false), className: "absolute -left-4 top-4 bg-gray-800\r\n                   rounded-r px-2 py-1 text-sm", title: "Collapse", children: "\u276E" }), _jsx("h2", { className: "text-lg font-semibold", children: "Asset Details" }), _jsxs("div", { children: [_jsxs("p", { className: "text-sm text-gray-300", children: ["ID\u00A0(", _jsx("span", { className: "font-mono", children: env.idField }), ")"] }), _jsx("p", { className: "break-words", children: assetId })] }), _jsxs("div", { children: [_jsxs("p", { className: "text-sm text-gray-300", children: ["Report\u00A0(", _jsx("span", { className: "font-mono", children: env.reportField }), ")"] }), reportUrl ? (_jsx("button", { type: "button", onClick: () => window.open(reportUrl, "_blank", // name
                        "popup=yes,width=900,height=600,noopener" // features
                        ), className: "text-cyan-300 underline break-all hover:text-cyan-200", children: "Open report" })) : (_jsx("p", { children: "\u2014" }))] }), _jsxs("div", { className: "flex flex-col gap-2 mt-auto", children: [_jsx("button", { onClick: OpenPOSM, className: "rounded px-3 py-2 text-sm font-medium\r\n                   bg-[#070925] text-[#fefefe] hover:bg-[#03b57b]/90", children: "Search in POSM Local" }), _jsx("button", { onClick: launchPOSM, className: "rounded px-3 py-2 text-sm font-medium\r\n                   bg-[#0383b5] text-[#fefefe] hover:bg-[#03b57b]/90", children: "Launch\u00A0POSM" })] })] }));
}
