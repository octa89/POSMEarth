// src/components/TopNav.tsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, KeyboardEvent, MouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { getSession, signOut as agolSignOut } from "../auth/arcgis-oauth";
import PosmLogo from "../assets/POSMBlack.png";
import gear from "../assets/settings-svgrepo-com.svg";
import POSMIco from "../assets/POSM 11 Application Icon cg11.ico";
import Analytics from "../assets/analytics (1).svg";
import POSMEarth from "../assets/posmearthlogos/POSM Earth Full Logo cg11.svg";

import ConfigForm from "./ConfigForm";

export default function TopNav() {
  /* ------------------------------------------------------------------ */
  /* routing & auth                                                     */
  /* ------------------------------------------------------------------ */
  const nav = useNavigate();
  const session = getSession(); // UserSession | "local" | null

  /* display-name fetch once per session ------------------------------ */
  const [displayName, setDisplayName] = useState("Unknown User");

  useEffect(() => {
    /* local login via your own backend */
    if (session === "local") {
      setDisplayName("Local User");
      return;
    }

    /* no session at all */
    if (!session) {
      setDisplayName("Unknown User");
      return;
    }

    /* immediate fallback to username */
    setDisplayName(session.username ?? "Unknown User");

    /* try to fetch the profile for fullName */
    session
      .getUser()
      .then((u) => {
        if (u?.fullName) setDisplayName(u.fullName);
      })
      .catch(() => {
        /* network error → ignore */
      });
  }, [session]);

  /* ------------------------------------------------------------------ */
  /* panel open / close helpers                                         */
  /* ------------------------------------------------------------------ */
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  /* ESC key */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setShowPanel(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* click-away */
  useEffect(() => {
    if (!showPanel) return;

    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowPanel(false);
      }
    };

    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [showPanel]);

  /* sign-out */
  function handleLogout() {
    agolSignOut(); // clears AGOL + jwt + redirects to /login
  }

  /* ------------------------------------------------------------------ */
  /*  UI                                                                */
  /* ------------------------------------------------------------------ */
  return (
    <>
      {/* Top bar ----------------------------------------------------- */}
      <header
        className="
          flex items-center justify-between gap-4 px-4 py-2
          bg-gradient-to-r from-[#2C3E50] to-black
          border-b border-[#323232] text-[#fefefe] relative"
        slot="header"
      >
        {/* logo + name */}
        <div className="flex items-center gap-4">
          <img src={PosmLogo} alt="POSM logo" className="h-8 w-auto" />
          <div className="flex flex-col">
            <span className="text-lg font-semibold leading-none">Earth</span>
            <span className="text-xs text-white leading-none">
              Signed&nbsp;in&nbsp;as:&nbsp;{displayName}
            </span>
          </div>
        </div>

        {/* action buttons */}
        <div className="flex items-right gap-2">
          {/* config */}
            <button
            onClick={() => setShowPanel(true)}
            className="flex items-right gap-1 rounded px-3 py-1 text-sm font-medium
                 bg-gradient-to-l from-[#2C3E50] to-[#3f587b]
                 hover:bg-white hover:from-white hover:to-white hover:text-black transition-colors"
            >
            <img src={gear} alt="" className="h-4 w-4" />
            Config
            </button>

          {/* POSM */}
          <button
            onClick={() =>
              window.open("https://posmweb.posmsoftware.com/", "_blank")
            }
            className="flex items-right gap-1 rounded px-3 py-1 text-sm font-medium
                 bg-gradient-to-l from-[#2C3E50] to-[#3f587b]
                 hover:bg-white hover:from-white hover:to-white hover:text-black transition-colors"
          >
            <img src={POSMIco} alt="" className="h-4 w-4" />
            POSM
          </button>

          {/* analytics */}
          <button
            onClick={() =>
              window.open(
                "https://posm.maps.arcgis.com/apps/webappviewer/index.html?id=4e6f45e0c58445269b8e329a998dce6f&extent=-11172481.6421%2C5519699.3236%2C-11164943.0402%2C5524457.5286%2C102100",
                "AnalyticsWindow",
                "width=1200,height=800"
              )
            }
            className="flex items-right gap-1 rounded px-3 py-1 text-sm font-medium
                 bg-gradient-to-l from-[#2C3E50] to-[#3f587b]
                 hover:bg-white hover:from-white hover:to-white hover:text-black transition-colors"
          >
            <img src={Analytics} alt="Analytics icon" className="h-4 w-4" />
            Open&nbsp;Analytics
          </button>

          {/* logout */}
          {session && (
            <button
              onClick={handleLogout}
              className="rounded px-3 py-1 text-sm font-medium
                         text-white bg-red-600 hover:bg-red-700"
            >
              Log&nbsp;out
            </button>
          )}
        </div>
      </header>

      {/* back-drop --------------------------------------------------- */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
          />
        )}
      </AnimatePresence>

      {/* slide-down panel ------------------------------------------- */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            ref={panelRef}
            initial={{ y: -400, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -400, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex justify-center pt-4 sm:pt-10 pointer-events-none"
          >
            <div className="pointer-events-auto w-[65vw] max-w-[100vw] max-h-[90vh] overflow-y-auto bg-white text-black shadow-2xl rounded-b-xl">
              <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 bg-white z-10">
                <h2 className="text-lg font-semibold">Configuration</h2>
                <img src={POSMEarth} alt="POSM logo" className="h-10 w-auto" />
                <button
                  onClick={() => setShowPanel(false)}
                  className="text-gray-500 hover:text-black text-xl"
                >
                  &times;
                </button>
              </div>

              <ConfigForm onClose={() => setShowPanel(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
