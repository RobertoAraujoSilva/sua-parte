// scripts/agents-log.mjs
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const LOG_PATH = path.join(ROOT, "agents.log.json");
const AGENTS_MD = path.join(ROOT, "AGENTS.md");

function readArg(flag, def = "") {
  const i = process.argv.indexOf(`--${flag}`);
  return i > -1 ? process.argv[i + 1] : def;
}

const entry = {
  timestamp: new Date().toISOString(),
  agent: readArg("agent", "Unknown"),
  action: readArg("action", ""),
  status: readArg("status", "pending"),
  details: readArg("details", "")
};

// 1) append em agents.log.json (cria se não existir)
let log = [];
try {
  if (fs.existsSync(LOG_PATH)) {
    log = JSON.parse(fs.readFileSync(LOG_PATH, "utf8") || "[]");
  }
} catch (e) {
  console.warn("⚠️ Não foi possível ler agents.log.json, criando novo.", e?.message);
  log = [];
}

log.push(entry);
fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));

// 2) atualizar bloco no AGENTS.md entre marcadores
const START = "<!-- AGENTS_LOG_START -->";
const END = "<!-- AGENTS_LOG_END -->";

try {
  const md = fs.readFileSync(AGENTS_MD, "utf8");
  const i1 = md.indexOf(START);
  const i2 = md.indexOf(END);
  
  if (i1 !== -1 && i2 !== -1 && i2 > i1) {
    const visible = log
      .slice(-10)
      .reverse()
      .map(
        (e) =>
          `- ${e.timestamp} — **${e.agent}**: ${e.action} _(status: ${e.status})_` +
          (e.details ? `\n  ↳ ${e.details}` : "")
      )
      .join("\n");
    
    const next =
      md.slice(0, i1 + START.length) +
      "\n" +
      visible +
      "\n" +
      md.slice(i2);
    
    fs.writeFileSync(AGENTS_MD, next);
    console.log("✅ agents.log.json atualizado e AGENTS.md refletido.");
  } else {
    console.log("ℹ️ Marcadores não encontrados no AGENTS.md; gravado apenas em agents.log.json.");
  }
} catch (e) {
  console.warn("⚠️ Não foi possível atualizar o AGENTS.md. Verifique o arquivo.", e?.message);
}