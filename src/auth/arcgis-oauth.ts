// src/auth/arcgis-oauth.ts
import { UserSession } from "@esri/arcgis-rest-auth";

/* ------------------------------------------------------------------ */
/* 0.  CONSTANTS (edit if you move to .env)                            */
/* ------------------------------------------------------------------ */
export const CLIENT_ID   = "0wYxtEIa5ZBowmAJ";
export const REDIRECT_URI = "http://localhost:5173/login"; // MUST match item
export const PORTAL       = "https://www.arcgis.com";
export const STORAGE_KEY  = "arcgisSession";               // sessionStorage key

/* single in-memory cache */
let cached: UserSession | null = null;

/* ------------------------------------------------------------------ */
/* 1.  KICK-OFF – redirect to ArcGIS (code + PKCE)                     */
/* ------------------------------------------------------------------ */
export function signIn(): void {
  UserSession.beginOAuth2({
    clientId:     CLIENT_ID,
    redirectUri:  REDIRECT_URI,
    portal:       PORTAL,
    responseType: "code",      // secure code flow
    popup:        false
  });
}

/* ------------------------------------------------------------------ */
/* 2.  COMPLETE – call on the redirect URI when ?code=… is present    */
/* ------------------------------------------------------------------ */
export async function completeOAuth(): Promise<UserSession> {
  const session = await UserSession.completeOAuth2({
    clientId:    CLIENT_ID,
    redirectUri: REDIRECT_URI,
    portal:      PORTAL
  });

  /* ⚠️ store the FULLY-POPULATED payload */
  sessionStorage.setItem(STORAGE_KEY, session.serialize());
  cached = session;
  return session;
}

/* ------------------------------------------------------------------ */
/* 3.  GET ACTIVE SESSION                                             */
/* ------------------------------------------------------------------ */
export function getSession():
  | UserSession   // valid ArcGIS session
  | "local"       // JWT present
  | null          // nothing
{
  /* local JWT (your own backend auth) */
  if (sessionStorage.getItem("jwt")) return "local";

  /* memoised */
  if (cached) return cached;

  /* rebuild from storage */
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  /* preferred path */
  try {
    cached = UserSession.deserialize(raw);
    return cached;
  } catch (_) {
    /* fallback for OLD / partial blobs stored with toJSON() */
    try {
      cached = new UserSession(JSON.parse(raw));
      return cached;
    } catch (e) {
      console.warn("⚠️ getSession – unable to rebuild, clearing.", e);
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }
}

/* ------------------------------------------------------------------ */
/* 4.  GLOBAL SIGN-OUT                                                */
/* ------------------------------------------------------------------ */
export function signOut(): void {
  cached = null;
  sessionStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem("jwt");
  window.location.replace("/login");
}
