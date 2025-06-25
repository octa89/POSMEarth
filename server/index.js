// server/index.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import { fileURLToPath } from "url";
import { spawn } from "child_process"; // 👈 NEW

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.join(__dirname, "..", ".env");
dotenv.config({ path: ENV_PATH });

console.log("ENV_PATH =", ENV_PATH);

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "OPTIONS"],
  })
);

/* ───────────── 1. GET /api/config ───────────── */
app.get("/api/config", (_req, res) => {
  const env = dotenv.parse(fs.readFileSync(ENV_PATH, "utf8"));
  res.json({
    VITE_ARCGIS_API_KEY: env.VITE_ARCGIS_API_KEY ?? "",
    VITE_MAP_ID: env.VITE_MAP_ID ?? "",
    VITE_SQL_INSTANCE: env.VITE_SQL_INSTANCE ?? "",
    VITE_DB_NAME: env.VITE_DB_NAME ?? "",
    VITE_POSM_EXECUTABLE_PATH: env.VITE_POSM_EXECUTABLE_PATH ?? "",
    SQL_USER: env.SQL_USER ?? "",
    SQL_PASS: env.SQL_PASS ?? "",
    VITE_ID_FIELD: env.VITE_ID_FIELD ?? "",
  });
});

/* ───────────── 2. PUT /api/config ───────────── */
app.put("/api/config", (req, res) => {
  try {
    const current = dotenv.parse(fs.readFileSync(ENV_PATH, "utf8"));
    const allowed = [
      "VITE_ARCGIS_API_KEY",
      "VITE_MAP_ID",
      "VITE_SQL_INSTANCE",
      "VITE_DB_NAME",
      "VITE_POSM_EXECUTABLE_PATH",
      "SQL_USER",
      "SQL_PASS",
      "VITE_ID_FIELD",
      "VITE_TEMPLATE",
    ];
    allowed.forEach((k) => {
      if (k in req.body) current[k] = req.body[k];
    });

    const out =
      Object.entries(current)
        .map(([k, v]) => `${k}=${v}`)
        .join("\n") + "\n";
    fs.writeFileSync(ENV_PATH, out, "utf8");
    Object.assign(process.env, current); // keep in-memory env synced
    res.json({ ok: true });
  } catch (err) {
    console.error("CONFIG WRITE FAIL →", err);
    res.status(500).json({ error: err.code || "write-failed" });
  }
});

/* ───────────── 3. POST /launch ─────────────
   Accepts either:
   • { id: "2851" }                     – legacy call
   • { cmd: ["C:\\POSM\\POSM.exe", …] } – new sidebar call
──────────────────────────────────────────────*/
app.post("/launch", (req, res) => {
  const { id, cmd } = req.body;

  // 3-a  New sidebar → array of args
  if (Array.isArray(cmd) && cmd.length) {
    console.log("Launching POSM with cmd:", cmd);

    // spawn the child; use shell:true so paths with spaces work
    const child = spawn(cmd[0], cmd.slice(1), { shell: true, detached: true });
    child.unref(); // let POSM run independently

    return res.json({ ok: true });
  }

  // 3-b  Legacy map hook → id only
  if (id) {
    console.log("Received /launch for id:", id);

    const exe = process.env.VITE_POSM_EXECUTABLE_PATH;
    const template = process.env.VITE_TEMPLATE ?? "";
    const argList = [exe, "/S", "/AID", id, template].filter(Boolean);

    console.log("Computed arg list:", argList);
    if (!exe) return res.status(500).json({ error: "POSM exe not set" });

    const child = spawn(argList[0], argList.slice(1), {
      shell: true,
      detached: true,
    });
    child.unref();
    return res.json({ ok: true });
  }

  res.status(400).json({ error: "no id or cmd supplied" });
});

/* ── demo auth (unchanged) ───────────────────── */
const USERS = {
  octavio: "$2b$10$OX4CMUM82gZW0ulo4Efmau0cOECrTCgZfDpdy0VRqxKoSgdPb5zm2", // pass=posm123
};

app.post("/api/login", async (req, res) => {
  const { user, pass } = req.body;
  const hash = USERS[user];
  if (!hash || !(await bcrypt.compare(pass, hash))) {
    return res.status(401).json({ error: "invalid" });
  }
  const token = jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: "2h" });
  res.json({ token });
});

/* ───────────── start server ───────────── */
const PORT = process.env.API_PORT || 3000;
app.listen(PORT, () => console.log(`API listening on :${PORT}`));
