import { useState, useEffect } from "react";
import useSelectedAsset from "../hooks/useSelectedAsset";

/* ------------ env helpers ------------ */
const env = {
  idField: import.meta.env.VITE_ID_FIELD || "AssetID",
  reportField: import.meta.env.VITE_REPORT_FIELD || "WebPathToReportIndex",
  exe: import.meta.env.VITE_POSM_EXECUTABLE_PATH || "",
  template: import.meta.env.VITE_TEMPLATE || "",
  posmWebReport: import.meta.env.VITE_POSM_WEB_REPORT || "",
};

export default function RightSidebar() {
  const { attrs } = useSelectedAsset();

  /* pull values (case-sensitive) */
  const assetId = attrs?.[env.idField] as string | undefined;
  const reportUrl = attrs?.[env.reportField] as string | undefined;

  /* -------- collapse state -------- */
  const [open, setOpen] = useState(false);

  /* auto-open when we get a new AssetID */
  useEffect(() => {
    if (assetId) setOpen(true);
  }, [assetId]);

  /* hide completely until we have a valid ID */
  if (!assetId) return null;

  /* -------- launch POSM -------- */
  async function launchPOSM() {
    const cmd = [env.exe, "/S", "/T", env.template, "/AID", assetId].filter(
      Boolean
    );
    console.log("Launching POSM with command:", cmd.join(" "));

    await fetch("http://localhost:3000/launch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cmd }),
    });
  }

  // open in posm
  async function OpenPOSM() {
    const cmd = [env.exe, "/SSM", "/AID", assetId].filter(Boolean);
    console.log("Launching POSM with command:", cmd.join(" "));

    await fetch("http://localhost:3000/launch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cmd }),
    });
  }

  /* -------- collapsed thumb -------- */
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="absolute right-0 top-1/2 -translate-y-1/2
                   bg-gray-800 text-[#fefefe] rounded-l px-2 py-1 text-sm"
      >
        ❯
      </button>
    );
  }

  /* -------- full sidebar -------- */
  return (
    <aside
      className="relative w-80 shrink-0 border-l border-[#323232]
                      bg-gray-800 text-[#fefefe] flex flex-col p-4 gap-6"
    >
      {/* collapse button */}
      <button
        onClick={() => setOpen(false)}
        className="absolute -left-4 top-4 bg-gray-800
                   rounded-r px-2 py-1 text-sm"
        title="Collapse"
      >
        ❮
      </button>

      <h2 className="text-lg font-semibold">Asset Details</h2>

      {/* ID */}
      <div>
        <p className="text-sm text-gray-300">
          ID&nbsp;(<span className="font-mono">{env.idField}</span>)
        </p>
        <p className="break-words">{assetId}</p>
      </div>

      {/* Report link */}
      <div>
        <p className="text-sm text-gray-300">
          Report&nbsp;(<span className="font-mono">{env.reportField}</span>)
        </p>

        {reportUrl ? (
          <button
            type="button"
            onClick={() =>
              window.open(
                reportUrl,
                "_blank", // name
                "popup=yes,width=900,height=600,noopener" // features
              )
            }
            className="text-cyan-300 underline break-all hover:text-cyan-200"
          >
            Open report
          </button>
        ) : (
          <p>—</p>
        )}
      </div>

      <div className="flex flex-col gap-2 mt-auto">
        <button
          onClick={OpenPOSM}
          className="rounded px-3 py-2 text-sm font-medium
                   bg-[#070925] text-[#fefefe] hover:bg-[#03b57b]/90"
        >
          Search in POSM Local
        </button>

        {/* Launch button */}
        <button
          onClick={launchPOSM}
          className="rounded px-3 py-2 text-sm font-medium
                   bg-[#0383b5] text-[#fefefe] hover:bg-[#03b57b]/90"
        >
          Start an Inspection on POSM
        </button>
      </div>
    </aside>
  );
}
