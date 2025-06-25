import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/ConfigForm.tsx
import { useEffect, useState } from "react";
const TEMPLATE_OPTS = [
    "NASSCO PACP",
    "NASSCO LACP",
    "NASSCO MACP Level 1",
    "NASSCO MACP Level 2",
    "POSM",
    "Custom",
];
export default function ConfigForm({ onClose, }) {
    const [cfg, setCfg] = useState(null);
    const [saving, setSaving] = useState(false);
    const [draftTemplate, setDraftTemplate] = useState("");
    useEffect(() => {
        fetch("http://localhost:3000/api/config")
            .then((r) => r.json())
            .then((env) => setCfg({
            apiKey: env.VITE_ARCGIS_API_KEY,
            posmExecutablePath: env.VITE_POSM_EXECUTABLE_PATH,
            connectionType: "Access Connection",
            SQLInstance: env.VITE_SQL_INSTANCE,
            databaseName: env.VITE_DB_NAME,
            SQLUser: env.SQL_USER,
            SQLPass: env.SQL_PASS,
            mapId: env.VITE_MAP_ID,
            idField: env.VITE_ID_FIELD,
            template: env.VITE_TEMPLATE || TEMPLATE_OPTS[0],
        }))
            .catch((e) => console.error("Config load failed:", e));
    }, []);
    const handleChange = (e) => setCfg((p) => ({ ...p, [e.target.name]: e.target.value }));
    const handleRadio = (e) => setCfg((p) => ({ ...p, connectionType: e.target.value }));
    const handleSave = async () => {
        setSaving(true);
        const res = await fetch("http://localhost:3000/api/config", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                VITE_ARCGIS_API_KEY: cfg.apiKey,
                VITE_MAP_ID: cfg.mapId,
                VITE_SQL_INSTANCE: cfg.SQLInstance,
                VITE_DB_NAME: cfg.databaseName,
                VITE_POSM_EXECUTABLE_PATH: cfg.posmExecutablePath,
                SQL_USER: cfg.SQLUser,
                SQL_PASS: cfg.SQLPass,
                VITE_ID_FIELD: cfg.idField,
                VITE_TEMPLATE: cfg.template,
            }),
        });
        setSaving(false);
        if (res.ok && onClose)
            onClose();
        if (!res.ok)
            alert("Save failed: " + (await res.text()));
    };
    const isPreset = cfg && TEMPLATE_OPTS.includes(cfg.template);
    if (!cfg)
        return _jsx("p", { className: "p-8", children: "Loading configuration\u2026" });
    return (_jsxs("div", { className: "max-w-xl mx-auto my-4 space-y-6 px-4 overflow-y-auto max-h-[70vh]", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Edit Configuration" }), [{ n: "apiKey", label: "API Key" }, { n: "posmExecutablePath", label: "POSM Executable Path" }].map(({ n, label }) => (_jsxs("label", { className: "block", children: [_jsx("span", { className: "font-medium", children: label }), _jsx("input", { className: "mt-1 w-full border rounded px-2 py-1", name: n, value: cfg[n], onChange: handleChange })] }, n))), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Connection Type" }), _jsx("div", { className: "space-x-4 mt-1", children: ["Access Connection", "SQL Connection"].map((opt) => (_jsxs("label", { children: [_jsx("input", { type: "radio", value: opt, checked: cfg.connectionType === opt, onChange: handleRadio }), " ", opt === "Access Connection"
                                    ? "POSM truck – Access"
                                    : "POSM server – SQL Server"] }, opt))) })] }), cfg.connectionType === "SQL Connection" && (_jsx("div", { className: "space-y-4 border p-4 rounded bg-gray-50", children: [
                    { n: "SQLInstance", label: "SQL Server Instance" },
                    { n: "databaseName", label: "Database Name" },
                    { n: "SQLUser", label: "Username" },
                    { n: "SQLPass", label: "Password", type: "password" },
                ].map(({ n, label, type }) => (_jsxs("label", { className: "block", children: [_jsx("span", { className: "font-medium", children: label }), _jsx("input", { className: "mt-1 w-full border rounded px-2 py-1", name: n, type: type ?? "text", value: cfg[n], onChange: handleChange })] }, n))) })), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "POSM Template" }), _jsxs("select", { className: "mt-1 w-full border rounded px-2 py-1", value: isPreset ? cfg.template : "Custom…", onChange: (e) => {
                            const val = e.target.value;
                            if (val === "Custom…") {
                                setDraftTemplate("");
                                setCfg((p) => ({ ...p, template: "" }));
                            }
                            else {
                                setCfg((p) => ({ ...p, template: val }));
                            }
                        }, children: [TEMPLATE_OPTS.map((opt) => (_jsx("option", { value: opt, children: opt }, opt))), _jsx("option", { value: "Custom\u2026", children: "Custom\u2026" })] }), cfg.template === "" && (_jsxs("div", { className: "mt-2 flex gap-2", children: [_jsx("input", { className: "flex-1 border rounded px-2 py-1", placeholder: "Enter custom template name", value: draftTemplate, onChange: (e) => setDraftTemplate(e.target.value) }), _jsx("button", { type: "button", className: "px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50", disabled: !draftTemplate.trim(), onClick: () => setCfg((p) => ({ ...p, template: draftTemplate.trim() })), children: "OK" })] }))] }), [{ n: "mapId", label: "Web Map ID" }, { n: "idField", label: "Unique ID Field" }].map(({ n, label }) => (_jsxs("label", { className: "block", children: [_jsx("span", { className: "font-medium", children: label }), _jsx("input", { className: "mt-1 w-full border rounded px-2 py-1", name: n, value: cfg[n], onChange: handleChange })] }, n))), _jsx("button", { onClick: handleSave, disabled: saving, className: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50", children: saving ? "Saving…" : "Save Configuration" })] }));
}
