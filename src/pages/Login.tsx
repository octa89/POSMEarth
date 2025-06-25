// src/pages/Login.tsx
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/posmearthlogos/POSM-Earth-Full-Logo-Gray-Full-Graphic.png";
import {
  UserSession,
  IUserSessionOptions
} from "@esri/arcgis-rest-auth";

export default function Login() {
  const nav       = useNavigate();
  const location  = useLocation();
  const didRedirect = useRef(false);        // <-- prevents redirect loop

  /* local-login state */
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err,  setErr ] = useState<string | null>(null);

  /* ArcGIS OAuth config */
  const clientId    = import.meta.env.VITE_ARCGIS_CLIENT_ID;
  const redirectUri = "http://localhost:5173/login";
  const portal      = "https://www.arcgis.com/sharing/rest";

  /* ───────────────── effect: restore / finish OAuth ───────────────── */
  useEffect(() => {
    /* ---- 1. already have a stored session? ---- */
    const stored = sessionStorage.getItem("arcgisSession");
    if (
      stored &&
      location.pathname === "/login" &&   // ensure we’re still on login page
      !didRedirect.current               // ensure we haven’t redirected yet
    ) {
      console.log("✅ Existing ArcGIS session found – redirecting to /map once");
      didRedirect.current = true;
      nav("/map", { replace: true });
      return;
    }

    /* ---- 2. authorization-code flow ---- */
    const url  = new URL(window.location.href);
    const code = url.searchParams.get("code");
    if (code) {
      console.log("🔄 OAuth2 code detected, completing exchange…");
      UserSession.completeOAuth2({ clientId, redirectUri })
        .then((session) => {
          console.log("✅ Code-flow success:", session);
          sessionStorage.setItem(
            "arcgisSession",
            JSON.stringify(session.toJSON())
          );
          nav("/map", { replace: true });
        })
        .catch((e) => {
          console.error("❌ completeOAuth2 failed:", e);
          setErr("ArcGIS login failed: " + e.message);
        });
      return;
    }

    /* ---- 3. implicit hash fragment fallback ---- */
    const hash = window.location.hash;
    if (hash.includes("access_token=")) {
      console.log("⚠️ Hash fragment detected (implicit flow). Building session…");
      const params       = new URLSearchParams(hash.slice(1));
      const accessToken  = params.get("access_token");
      const expires      = Number(params.get("expires_in") ?? 7200);
      const username     = params.get("username") ?? undefined;
      const ssl          = params.get("ssl") === "true";

      if (!accessToken) {
        setErr("ArcGIS implicit login failed: no access_token");
        return;
      }

      const opts: IUserSessionOptions = {
        portal,
        clientId,
        token: accessToken,
        username,
        ssl,
        expires: Date.now() + expires * 1000
      };

      const session = new UserSession(opts);
      console.log("✅ Implicit-flow session created:", session);
      sessionStorage.setItem("arcgisSession", JSON.stringify(session.toJSON()));
      nav("/map", { replace: true });
      return;
    }

    console.log("ℹ️ No OAuth params in URL – awaiting user action.");
  }, [location.pathname, nav]);

  /* ───────── start ArcGIS OAuth (code + PKCE) ───────── */
  function handleArcGIS() {
    console.log("🚀 Calling beginOAuth2 (code + PKCE)");
    UserSession.beginOAuth2({
      clientId,
      redirectUri,
      responseType: "code",
      popup: false
    });
  }

  /* ───────── local creds form ───────── */
  async function handleLocal(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!user || !pass) return setErr("Username / password required.");

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE}/api/login`,
        { user, pass }
      );
      sessionStorage.setItem("jwt", data.token);
      nav("/map", { replace: true });
    } catch (e) {
      console.error("❌ Local login failed", e);
      setErr("Wrong username or password.");
    }
  }

  /* helper – clear stale session from login page */
  function clearArcgisSession() {
    sessionStorage.removeItem("arcgisSession");
    console.log("🗑️ Cleared stored ArcGIS session.");
    setErr(null);
  }

  /* ───────────────────────── UI ───────────────────────── */
  return (
    <div className="
      h-screen flex flex-col items-center justify-center gap-6
      bg-gradient-to-r from-[#2C3E50] to-black
      border-b border-[#323232] text-[#fefefe]
    ">
      <img
        src={logo}
        alt="POSM logo"
        className="w-48 sm:w-64 md:w-80 lg:w-[400px]"
      />

      <button
        onClick={handleArcGIS}
        className="w-64 px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500"
      >
        Sign in with ArcGIS
      </button>

      <form onSubmit={handleLocal} className="flex flex-col gap-2 w-64">
        <input
          className="px-3 py-2 rounded bg-neutral-800 text-white"
          placeholder="Username"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        <input
          className="px-3 py-2 rounded bg-neutral-800 text-white"
          type="password"
          placeholder="Password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
        <button
          type="submit"
          className="px-6 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500"
        >
          Sign in locally
        </button>
      </form>

      {err && (
        <p className="mt-2 text-sm text-red-400">
          {err}
          {location.pathname === "/login" && (
            <>
              {" "}
              <button
                className="underline text-gray-200 ml-2"
                onClick={clearArcgisSession}
              >
                Clear stored session
              </button>
            </>
          )}
        </p>
      )}
    </div>
  );
}
