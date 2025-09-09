// scripts/auditar-plano.mjs
// Auditor simples por heurística: verifica existência de arquivos/trechos
// e indica "feito" (true) ou "pendente" (false). Ajuste os checks conforme evoluir.

import fs from "fs";
import path from "path";
import fg from "fast-glob";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const has = (p) => fs.existsSync(path.join(root, p));
const grep = (globs, pattern) => {
  const files = fg.sync(globs, { cwd: root, dot: true, absolute: true });
  const rx = new RegExp(pattern, "i");
  return files.some(f => {
    try { return rx.test(fs.readFileSync(f, "utf8")); }
    catch { return false; }
  });
};

const checks = [
  // --- 1. Database Schema Modernization ---
  { id: "1.1", name: "Migrações aprimoradas", pass:
    has("APPLY_THIS_SQL.sql") || fg.sync("supabase/migrations/**/*.sql", {cwd:root}).length>0 },
  { id: "1.2", name: "Backfill + FamilyInferenceEngine", pass:
    grep(["src/**/**"], "FamilyInferenceEngine") && grep(["src/**/**"], "migration|backfill") },
  { id: "1.3", name: "Tipos TS (EstudanteEnhanced, enums)", pass:
    grep(["src/types/**","src/**/**.ts"], "EstudanteEnhanced|EstadoCivil|PapelFamiliar|RelacaoFamiliar") },
  { id: "1.4", name: "RLS atualizada p/ novo schema", pass:
    grep(["supabase/**/**.sql"], "policy|enable row level security") },

  // --- 2. Pages & Fluxos ---
  { id: "2.1", name: "Landing otimizada/SEO/PWA", pass:
    has("index.html") && (has("public/manifest.json") || has("public/site.webmanifest")) },
  { id: "2.2", name: "Autenticação + RBAC", pass:
    grep(["src/**/**"], "ProtectedRoute|role|RBAC") },
  { id: "2.3", name: "Dashboard avançado", pass:
    has("src/pages/Dashboard.tsx") && grep(["src/pages/Dashboard.tsx","src/components/**"], "widget|stats|websocket|realtime") },
  { id: "2.4", name: "Gestão de Estudantes avançada", pass:
    has("src/pages/Estudantes.tsx") && grep(["src/components/**"], "virtual|react-window|filter|Family") },
  { id: "2.5", name: "Gestão de Programas com parsing", pass:
    has("src/pages/Programas.tsx") && (grep(["src/components/**"], "PdfUpload|PdfParsing|JWContentParser") || has("test-jw-parser.js")) },
  { id: "2.6", name: "Designações (algoritmo + preview)", pass:
    has("src/pages/Designacoes.tsx") && grep(["src/components/**"], "Assignment(Generation|Preview|Status)") },

  // --- 3. Assignment Generation ---
  { id: "3.1", name: "Engine S-38-T reforçada", pass:
    grep(["src/utils/**"], "regrasS38T") && grep(["src/**"], "explain|justificativa|confidence") },
  { id: "3.2", name: "Validação familiar nova", pass:
    grep(["src/utils/**","src/components/**"], "validacaoFamiliar|family tree|visualiza") },
  { id: "3.3", name: "Balanceamento histórico", pass:
    grep(["src/utils/**"], "balanceamentoHistorico|fairness|peso") },
  { id: "3.4", name: "Testes abrangentes p/ designações", pass:
    grep(["cypress/**","src/**/__tests__/**"], "designa|assignment") },

  // --- 4. UX/UI ---
  { id: "4.1", name: "Responsividade e A11y", pass:
    grep(["src/**/**.tsx"], "aria-|role=") && has("src/components/ErrorBoundary.tsx") },
  { id: "4.2", name: "Loading progressivo (skeleton/offline)", pass:
    grep(["src/**/**.tsx"], "Skeleton|suspense") && (has("public/sw.js") || has("public/service-worker.js")) },
  { id: "4.3", name: "Tratamento de erros + toasts", pass:
    grep(["src/**/**.tsx"], "toast|error boundary|try\\s*\\{") },
  { id: "4.4", name: "Busca global/navegação avançada", pass:
    grep(["src/**/**.tsx"], "global search|command palette|Ctrl\\+K") },

  // --- 5. Import/Export ---
  { id: "5.1", name: "Import planilha robusto", pass:
    has("src/components/SpreadsheetUpload.tsx") && grep(["src/components/**"], "mapeamento|duplicado|preview") },
  { id: "5.2", name: "PDF/content processing", pass:
    grep(["src/components/**","src/utils/**"], "Pdf|parse.*pdf") },
  { id: "5.3", name: "Export avançado (PDF/XLSX)", pass:
    grep(["src/**"], "export.*(pdf|xlsx)") },
  { id: "5.4", name: "Operações em lote", pass:
    grep(["src/**"], "bulk|lote|batch") },

  // --- 6. Performance ---
  { id: "6.1", name: "Perf frontend (memo/virtual/cache)", pass:
    grep(["src/**/**.tsx"], "React\\.memo|useMemo|virtual") },
  { id: "6.2", name: "Índices/queries otimizadas", pass:
    grep(["supabase/**/**.sql"], "index|explain") },
  { id: "6.3", name: "Cache/queues", pass:
    grep(["src/**","supabase/**"], "Redis|queue|job") },
  { id: "6.4", name: "Monitoring/alertas", pass:
    grep(["src/**"], "Sentry|PostHog|monitor") },

  // --- 7. Segurança ---
  { id: "7.1", name: "MFA/RBAC/auditoria", pass:
    grep(["src/**"], "MFA|2FA|audit log|role") },
  { id: "7.2", name: "Proteção de dados", pass:
    grep(["supabase/**/**.sql","src/**"], "encrypt|mask|retention") },
  { id: "7.3", name: "Segurança de API", pass:
    grep(["src/**"], "rate limit|JWT|CORS|helmet") },
  { id: "7.4", name: "Conformidade/audit", pass:
    grep(["src/**","docs/**"], "compliance|auditoria") },

  // --- 8. Integrações ---
  { id: "8.1", name: "REST API + OpenAPI", pass:
    grep(["src/**"], "OpenAPI|swagger|/api/") },
  { id: "8.2", name: "Integrações externas", pass:
    grep(["src/**"], "Calendar|Webhook|email") },
  { id: "8.3", name: "Retry/backoff/circuit breaker", pass:
    grep(["src/**"], "backoff|circuit breaker|timeout") },
  { id: "8.4", name: "Monitoring API", pass:
    grep(["src/**"], "API health|usage analytics") },

  // --- 9. Testes & CI ---
  { id: "9.1", name: "Unit tests", pass:
    grep(["src/**/__tests__/**","src/**"], "describe\\(") },
  { id: "9.2", name: "E2E Cypress", pass:
    has("cypress.config.mjs") && fs.existsSync(path.join(root,"cypress")) },
  { id: "9.3", name: "CI/CD", pass:
    fs.existsSync(path.join(root,".github")) && grep([".github/**"], "actions|deploy") },
  { id: "9.4", name: "Qualidade/monitoramento", pass:
    grep(["eslint.config.js","src/**"], "eslint|prettier") },

  // --- 10. Documentação ---
  { id: "10.1", name: "Docs de usuário", pass:
    (fs.existsSync(path.join(root,"docs")) && grep(["docs/**","README.md"], "guia|tutorial")) },
  { id: "10.3", name: "Docs dev/API", pass:
    grep(["docs/**","README.md"], "API|arquitetura") },
  { id: "10.4", name: "Feedback/suporte", pass:
    grep(["src/**"], "feedback|suporte|help") },

  // --- 11. Gaps Críticos ---
  { id: "11.1", name: "UI de geração ligada ao engine", pass:
    grep(["src/components/**","src/pages/**"], "AssignmentGeneration.*regrasS38T") },
  { id: "11.2", name: "Form de estudante com família", pass:
    grep(["src/components/**"], "FamilyMember|Family.*List|EstudanteForm") },
  { id: "11.3", name: "Utils integrados ao UI", pass:
    grep(["src/components/**","src/utils/**"], "validacaoFamiliar|balanceamentoHistorico|regrasS38T") },
  { id: "11.5", name: "Páginas e routing", pass:
    has("src/pages/NotFound.tsx") && has("src/pages/Reunioes.tsx") && has("src/pages/Relatorios.tsx") },
];

const rows = checks.map(c => `- [${c.pass ? "x" : " "}] ${c.id} ${c.name}`);
const output = `# Auditoria do Plano\n\n${rows.join("\n")}\n`;
fs.mkdirSync(path.join(root,"audit"), { recursive: true });
fs.writeFileSync(path.join(root,"audit/STATUS_IMPL_PLAN.md"), output);
console.log(output);
