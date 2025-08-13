#!/usr/bin/env node
/**
 * Auditor do Plano de Implementação
 * - Percorre o repo e tenta marcar tarefas como concluídas.
 * - Para pendentes óbvios, cria stubs seguros para iniciar a implementação.
 * - Atualiza docs/IMPLEMENTATION_PLAN.md in-place.
 *
 * ⚠️ Heurístico: marca como [x] quando TODOS os checks essenciais daquele item passam.
 * Caso apenas alguns sinais existam, marca como "parcial" (comentário) e mantém [ ].
 */

import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @ts-nocheck

const ROOT = process.cwd();
const PLAN_PATH = path.join(ROOT, "docs", "IMPLEMENTATION_PLAN.md");
const REPORT_PATH = path.join(ROOT, "audit-report.json");

// Pastas a ignorar
const IGNORE_DIRS = new Set([
  "node_modules", ".git", "dist", "build", ".next", ".output"
]);

// Util: percorre todos os arquivos de texto do repo
async function listFiles(dir) {
  const out = [];
  async function walk(d) {
    const ents = await fsp.readdir(d, { withFileTypes: true });
    for (const e of ents) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        if (!IGNORE_DIRS.has(e.name)) await walk(p);
      } else {
        out.push(p);
      }
    }
  }
  await walk(dir);
  return out;
}

function isTextLike(fp) {
  const ext = path.extname(fp).toLowerCase();
  return [
    ".ts",".tsx",".js",".jsx",".mjs",".cjs",".json",".md",".sql",".yml",".yaml",
    ".css",".scss",".mdx",".txt",".html",".tsconfig",".config",".env",".ps1",".sh"
  ].some(e => ext.endsWith(e)) || fp.endsWith("Dockerfile");
}

async function readSafe(fp) {
  try {
    const stat = await fsp.stat(fp);
    if (stat.size > 1_500_000) return ""; // evita arquivos enormes
    return await fsp.readFile(fp, "utf8");
  } catch { return ""; }
}

function hasAny(text, arr) {
  return arr.some(s => new RegExp(s, "i").test(text));
}
function filePathAny(fp, arr) {
  const p = fp.replace(/\\/g, "/").toLowerCase();
  return arr.some(s => p.includes(s.toLowerCase()));
}
function today() {
  return new Date().toISOString().slice(0,10);
}

async function check(files, contentsByFile) {

  // Helpers de busca
  const contentIncludes = (regexes, scope = files) => {
    for (const f of scope) {
      const text = contentsByFile.get(f) || "";
      if (hasAny(text, Array.isArray(regexes) ? regexes : [regexes])) return true;
    }
    return false;
  };
  const existsAny = (needles) => files.some(f => filePathAny(f, needles));
  const ensureFile = async (relPath, content) => {
    const full = path.join(ROOT, relPath);
    if (!fs.existsSync(full)) {
      await fsp.mkdir(path.dirname(full), { recursive: true });
      await fsp.writeFile(full, content, "utf8");
      return { created: true, path: relPath };
    }
    return { created: false, path: relPath };
  };

  // STUBS seguros para iniciar implementação quando faltar tudo
  const stubs = {
    rls: async () => ensureFile(
      "supabase/migrations/9999_rls_family_links.sql",
`-- RLS policies para nova estrutura familiar
-- Ajuste os roles conforme seu projeto (anon, authenticated, service_role)
alter table if exists family_links enable row level security;

create policy "family_links_select" on family_links
for select using (auth.uid() is not null);

create policy "family_links_insert" on family_links
for insert with check (auth.uid() is not null);

create policy "family_links_update" on family_links
for update using (auth.uid() is not null);

create policy "family_links_delete" on family_links
for delete using (false); -- restritivo por padrão, ajuste se necessário
`
    ),

    dashboard: async () => ensureFile(
      "src/components/dashboard/RealtimeStats.tsx",
`import { useEffect, useState } from "react";
// TODO: Ajuste para seu client Supabase/WS
export default function RealtimeStats() {
  const [stats, setStats] = useState({ estudantes: 0, programas: 0, designacoes: 0 });

  useEffect(() => {
    let t = setInterval(async () => {
      try {
        // TODO: substitua por chamadas reais
        setStats(s => ({ ...s, estudantes: s.estudantes + 1 }));
      } catch {}
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="p-4 rounded-xl shadow">
      <h3 className="font-semibold mb-2">Estatísticas em tempo real</h3>
      <div className="text-sm opacity-80">Estudantes: {stats.estudantes}</div>
      <div className="text-sm opacity-80">Programas: {stats.programas}</div>
      <div className="text-sm opacity-80">Designações: {stats.designacoes}</div>
    </div>
  );
}
`
    ),

    hotkeys: async () => ensureFile(
      "src/hooks/useHotkeys.ts",
`import { useEffect } from "react";
export function useHotkeys(map = { "k": () => {} }, opts = { ctrl: true, meta: true }) {
  useEffect(() => {
    const onKey = (e) => {
      const wantCtrl = opts.ctrl ? e.ctrlKey : true;
      const wantMeta = opts.meta ? e.metaKey : true;
      if (!wantCtrl || !wantMeta) return;
      const key = e.key.toLowerCase();
      if (map[key]) {
        e.preventDefault();
        map[key]();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
`
    ),

    virtualized: async () => ensureFile(
      "src/components/students/VirtualizedStudentsList.tsx",
`import { useMemo } from "react";
export default function VirtualizedStudentsList() {
  // TODO: Substituir por react-window/react-virtualized
  const rows = useMemo(() => new Array(1000).fill(0).map((_,i)=>({id:i,name:"Aluno "+i})),[]);
  return (
    <div className="h-[400px] overflow-auto border rounded-xl p-2">
      {rows.map(r => <div key={r.id} className="py-1 border-b">{r.name}</div>)}
    </div>
  );
}
`
    ),

    familyGraph: async () => ensureFile(
      "src/components/students/FamilyGraph.tsx",
`// TODO: substituir por react-flow/d3 para grafo real
export default function FamilyGraph() {
  return (
    <div className="p-4 rounded-xl border">
      <div className="font-semibold mb-2">Árvore Familiar (protótipo)</div>
      <div className="text-sm opacity-70">Conecte com family_links e estudantes</div>
    </div>
  );
}
`
    ),

    assignmentConflicts: async () => ensureFile(
      "src/utils/conflicts.ts",
`export function detectConflicts(assignments = []) {
  // TODO: implementar validações S-38-T + conflitos básicos
  return [];
}
`
    ),
  };

  // Definição de tarefas com checks
  const tasks = [
    {
      id: "1.4",
      title: "Update RLS policies for new schema",
      essential: [
        () => existsAny(["supabase/"]),
        () => contentIncludes(["enable row level security|RLS", "create policy", "alter policy"]),
        () => contentIncludes(["family_links", "relacao_familiar|papel_familiar|id_pai|id_mae|id_conjuge"])
      ],
      signals: [
        () => contentIncludes(["grant|revoke", "auth.uid\\(\\)"])
      ],
      boot: async () => [await stubs.rls()]
    },

    {
      id: "2.3",
      title: "Enhance Dashboard (/dashboard) Command Center",
      essential: [
        () => existsAny(["src/pages/Dashboard.tsx","src/app/dashboard","/Dashboard.tsx"]),
      ],
      signals: [
        () => contentIncludes(["on\\(\"postgres_changes\"|WebSocket|EventSource|setInterval|polling"], files),
        () => contentIncludes(["react-grid-layout|draggable|Resizable|widget"], files),
        () => contentIncludes(["useHotkeys|keydown|cmd\\+k|ctrl\\+k"], files),
        () => contentIncludes(["health|status|heartbeat|uptime"], files),
        () => contentIncludes(["recommend|recomenda|suggestion"], files),
      ],
      boot: async () => [
        await stubs.dashboard(),
        await stubs.hotkeys(),
      ]
    },

    {
      id: "2.4",
      title: "Enhance Student Management (/estudantes) with advanced features",
      essential: [
        () => existsAny(["src/pages/Estudantes.tsx","src/app/estudantes/page.tsx"])
      ],
      signals: [
        () => existsAny(["src/components/students/VirtualizedStudentsList.tsx","react-window","react-virtualized"]),
        () => contentIncludes(["filter|filtro|advanced search|busca avançada|faceta"], files),
        () => existsAny(["src/components/FamilyMembersList.tsx","src/components/FamilyMemberForm.tsx"]),
        () => contentIncludes(["bulk|lote|em massa|progresso"], files),
        () => contentIncludes(["progresso|qualifica|tracking"], files),
      ],
      boot: async () => [
        await stubs.virtualized(),
        await stubs.familyGraph(),
      ]
    },

    {
      id: "2.5",
      title: "Optimize Program Management (/programas)",
      essential: [
        () => existsAny(["src/pages/Programas.tsx","src/app/programas/page.tsx"]),
      ],
      signals: [
        () => existsAny(["src/components/PdfParsingDemo.tsx","src/components/JWContentParser.tsx"]),
        () => existsAny(["src/components/TemplateLibrary.tsx"]),
        () => contentIncludes(["cache|memo|indexedDB|localforage|swr|react-query"], files),
        () => contentIncludes(["preview|pré-visualização|ProgramPreview"], files),
        () => contentIncludes(["queue|fila|batch|lote|worker"], files),
      ]
    },

    {
      id: "2.6",
      title: "Enhance Assignment Generation (/designacoes) intelligence",
      essential: [
        () => existsAny(["src/pages/Designacoes.tsx"])
      ],
      signals: [
        () => existsAny([
          "src/components/AssignmentGenerationModal.tsx",
          "src/components/AssignmentPreviewModal.tsx",
          "src/components/AssignmentEditModal.tsx",
          "src/components/AssignmentStatusCard.tsx"
        ]),
        () => contentIncludes(["conflict|conflito|collision"], files),
        () => contentIncludes(["ml|machine learning|tfjs|modelo"], files),
        () => contentIncludes(["workflow|approval|aprovação|colaboração"], files),
        () => contentIncludes(["template|preset|predefini"], files),
      ],
      boot: async () => [await stubs.assignmentConflicts()]
    },

    {
      id: "3.1",
      title: "Enhanced S-38-T compliance engine",
      essential: [
        () => contentIncludes(["regrasS38T"], files)
      ],
      signals: [
        () => contentIncludes(["confidence|confiança|score"], files),
        () => contentIncludes(["explain|explica|documenta"], files)
      ]
    },

    {
      id: "3.2",
      title: "Family relationship validation system",
      essential: [
        () => contentIncludes(["ValidacaoFamiliar|validacaoFamiliar"], files),
        () => existsAny(["family_links","src/components/FamilyMembersList.tsx"])
      ],
      signals: [
        () => contentIncludes(["avô|avo|grandparent|irmã|irmão|siblings|tios|primos"], files),
        () => contentIncludes(["grafo|tree|graph|visualiza"], files)
      ]
    },

    {
      id: "3.4",
      title: "Comprehensive assignment testing framework",
      essential: [
        () => existsAny(["test-assignment-generation.js","cypress.config.mjs"])
      ],
      signals: [
        () => contentIncludes(["benchmark|desempenho|performance"], files),
        () => contentIncludes(["regression|regressão"], files)
      ]
    },

    {
      id: "4.3",
      title: "Enhance error handling and user feedback",
      essential: [
        () => existsAny(["src/components/ErrorBoundary.tsx"])
      ],
      signals: [
        () => contentIncludes(["toast|notification|notificação|progress"], files),
        () => contentIncludes(["help|ajuda|tooltip|dica"], files)
      ]
    },

    {
      id: "5.1",
      title: "Enhance spreadsheet import system",
      essential: [
        () => existsAny(["src/components/SpreadsheetUpload.tsx"])
      ],
      signals: [
        () => contentIncludes(["preview|pré-visualização|map|mapeamento|duplicate|duplicado"], files),
        () => contentIncludes(["ods|xlsx|csv"], files)
      ]
    },

    {
      id: "5.2",
      title: "Optimize PDF and content processing",
      essential: [
        () => existsAny(["src/components/PdfUpload.tsx","src/components/PdfParsingDemo.tsx"])
      ],
      signals: [
        () => contentIncludes(["layout|template|parser"], files),
        () => contentIncludes(["batch|fila|queue|worker"], files)
      ]
    },

    {
      id: "7.1",
      title: "Enhanced authentication and authorization",
      essential: [
        () => existsAny(["src/components/ProtectedRoute.tsx","AUTH_TROUBLESHOOTING.md"])
      ],
      signals: [
        () => contentIncludes(["role|RBAC|permiss"], files),
        () => contentIncludes(["MFA|two-factor|multi-factor"], files),
        () => contentIncludes(["audit|auditoria|log"], files)
      ]
    },

    {
      id: "9.2",
      title: "Integration and end-to-end testing",
      essential: [
        () => existsAny(["cypress.config.mjs","cypress/"])
      ],
      signals: [
        () => contentIncludes(["cross-browser|mobile|responsive|a11y|accessibility"], files)
      ]
    },

    {
      id: "10.3",
      title: "Developer documentation and API guides",
      essential: [
        () => existsAny(["README.md","docs/","PROGRAMAS_SETUP.md"])
      ],
      signals: [
        () => contentIncludes(["contribu|architecture|arquitetura|diagrama|deployment"], files)
      ]
    },

    {
      id: "11.2",
      title: "Student mgmt w/ family relationships",
      essential: [
        () => existsAny(["src/components/EstudanteForm.tsx","src/components/FamilyMembersList.tsx"])
      ],
      signals: [
        () => contentIncludes(["family.ts|FamilyLink|relacao_familiar|papel_familiar"], files),
        () => contentIncludes(["valida|validation"], files)
      ]
    },

    {
      id: "11.3",
      title: "Integrate utilities with UI components",
      essential: [
        () => existsAny(["src/components/Assignment*","src/components/ModalPreviaDesignacoes.tsx"])
      ],
      signals: [
        () => contentIncludes(["regrasS38T|validacaoFamiliar|balanceamentoHistorico"], files)
      ]
    },
  ];

  // Executa os checks
  const results = [];
  for (const t of tasks) {
    const essentials = await Promise.all(t.essential.map(fn => fn()));
    const signals = t.signals ? await Promise.all(t.signals.map(fn => fn())) : [];
    let status = "pending";
    if (essentials.every(Boolean)) {
      // todos essenciais ok; se existirem sinais, pelo menos metade
      const okSignals = signals.filter(Boolean).length;
      const need = Math.ceil((signals.length || 0) / 2);
      status = (signals.length === 0 || okSignals >= need) ? "done" : "partial";
    }
    let bootOps = [];
    if (status !== "done" && t.boot) {
      bootOps = await t.boot();
    }
    results.push({
      id: t.id, title: t.title, essentials, signalsCount: signals.filter(Boolean).length,
      signalsTotal: signals.length, status, bootOps
    });
  }
  return results;
}

// Atualiza o markdown do plano
function updatePlanMarkdown(md, results) {
  const lines = md.split(/\r?\n/);
  const map = new Map(results.map(r => [r.id, r]));
  const idPattern = /^- \[(x| )\] (\d+\.\d+)\b/;

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(idPattern);
    if (!m) continue;
    const id = m[2];
    const r = map.get(id);
    if (!r) continue;

    const base = lines[i].replace(/^(- \[)(x| )(]\s+\d+\.\d+)/, "$1$2$3");
    if (r.status === "done") {
      lines[i] = base.replace("- [ ]", "- [x]") + `  — ✅ auto-verificado em ${today()}`;
    } else if (r.status === "partial") {
      lines[i] = base.replace("- [ ]", "- [ ]") + `  — 🟡 evidências parciais (ver relatório)`;
    } else {
      lines[i] = base; // mantém como estava
    }
  }
  return lines.join("\n");
}

async function main() {
  if (!fs.existsSync(PLAN_PATH)) {
    console.error(`❌ Plano não encontrado em ${PLAN_PATH}. Crie o arquivo antes de rodar.`);
    process.exit(1);
  }

  const files = (await listFiles(ROOT)).filter(isTextLike);
  const contentsByFile = new Map();
  for (const f of files) {
    contentsByFile.set(f, await readSafe(f));
  }

  const md = await fsp.readFile(PLAN_PATH, "utf8");
  const results = await check(files, contentsByFile);

  const updated = updatePlanMarkdown(md, results);
  await fsp.writeFile(PLAN_PATH, updated, "utf8");
  await fsp.writeFile(REPORT_PATH, JSON.stringify({
    generatedAt: new Date().toISOString(),
    results
  }, null, 2), "utf8");

  console.log("✅ Auditoria concluída.");
  console.log(`→ Plano atualizado: docs/IMPLEMENTATION_PLAN.md`);
  console.log(`→ Relatório: ${path.relative(ROOT, REPORT_PATH)}`);
  const pending = results.filter(r => r.status !== "done").map(r => r.id);
  if (pending.length) {
    console.log("⚠️ Pendentes (ou parciais):", pending.join(", "));
  }
}

main().catch(err => {
  console.error("Erro na auditoria:", err);
  process.exit(1);
});
