# 🤖 SISTEMA DE AGENTES - ORQUESTRAÇÃO

## 🎯 Modos de Operação

### 1. ORCHESTRATOR
**Função:** Coordena ciclo completo (plano → handoffs → checklist → prazos)
**Entrega:** Plano executivo, handoffs prontos, checklist por modo, owners/prazos

### 2. F ARCHITECT  
**Função:** Planeja arquitetura, dados, RLS, regras S-38
**Entrega:** Diagrama componentes, esquema SQL, políticas RLS, critérios aceite

### 3. CODE
**Função:** Implementação SOLID/DRY + testes + docs
**Entrega:** Arquivos/paths, integração, testes unit/E2E, lint/build, docs

### 4. ASK
**Função:** Descoberta/decisão com perguntas fechadas
**Entrega:** 2-4 perguntas com prós/cons, recomendação final

### 5. DEBUG
**Função:** Diagnóstico → fix → teste regressão  
**Entrega:** Reprodução, causa raiz, fix proposto, teste regressão, métricas

---

## 🔄 Handoffs Padrão

### Orchestrator → F Architect
```
Use o prompt f_architect para planejar <OBJETIVO>. 
Entregue diagrama, esquema SQL, RLS e critérios de aceite testáveis.
```

### F Architect → Code
```
Use o prompt code_impl para implementar conforme o escopo do F Architect. 
Liste arquivos, pontos de integração, testes (unit/E2E), e critérios de aceite.
```

### Code → Debug
```
Use o prompt debug_mode com o cenário: <como reproduzir>. 
Entregue RCA, fix, teste de regressão e métrica.
```

---

## 📊 Log de Atividades

<!-- AGENTS_LOG_START -->
<!-- AGENTS_LOG_END -->

---

## 🚀 Comandos Rápidos

### Logging
```bash
npm run agents:log -- \
  --agent="Code" \
  --action="Implementar verificação JW.org" \
  --status="completed" \
  --details="endpoints /admin/check-updates criados"
```

### Health Check
```bash
curl http://localhost:3000/api/status
```

### Smoke Tests
1. **Onboarding:** "Execute prompt onboarding e gere plano semanal (PT-BR/EN-US)"
2. **Health:** "Cheque http://localhost:3000/api/status e traga alertas"  
3. **Debug:** "Use debug_mode e proponha fix + teste regressão"

---

## ⚙️ Configuração

### Scripts package.json
```json
{
  "agents:log": "node scripts/agents-log.mjs",
  "lint": "eslint . --ext .ts,.tsx", 
  "test": "vitest run",
  "e2e": "cypress run"
}
```

### .gitignore
```
agents.log.json
*.local
*.log
```

---

## 🔐 MCP Supabase (Somente Leitura)

```yaml
mcpServers:
  - name: supabase-ro
    command: npx
    args:
      - "@supabase/mcp-server-supabase"
      - "--read-only" 
      - "--project-ref=${{ secrets.SUPABASE_PROJECT_REF }}"
    env:
      SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

**Secrets necessários:**
- `SUPABASE_PROJECT_REF`: nwpuurgwnnuejqinkvrh
- `SUPABASE_ACCESS_TOKEN`: token pessoal (não versionar)

---

## 📋 Status Atual

- ✅ Sistema funcionando (Frontend: 8080, Backend: 3000)
- ✅ Admin Dashboard operacional
- ✅ Downloads JW.org automatizados
- ✅ Testes Cypress implementados
- ✅ Orquestração de agentes configurada