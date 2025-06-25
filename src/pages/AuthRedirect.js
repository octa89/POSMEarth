import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserSession } from "@esri/arcgis-rest-auth";
const CLIENT_ID = "0wYxtEIa5ZBowmAJ";
const REDIRECT_URI = "http://localhost:5173/auth";
const PORTAL = "https://www.arcgis.com";
export default function AuthRedirect() {
    const nav = useNavigate();
    useEffect(() => {
        (async () => {
            try {
                // ⬇️ call the static method on UserSession
                const session = await UserSession.completeOAuth2({
                    clientId: CLIENT_ID,
                    redirectUri: REDIRECT_URI,
                    portal: PORTAL,
                });
                sessionStorage.setItem("agol", session.serialize());
                nav("/map", { replace: true });
            }
            catch (err) {
                console.error("OAuth hand-off failed:", err);
                nav("/login", { replace: true });
            }
        })();
    }, []);
    return _jsx("p", { className: "p-4", children: "Finishing sign-in\u2026" });
}
