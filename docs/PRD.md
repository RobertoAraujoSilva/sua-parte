# PRD — Sistema Ministerial de Designações Automatizadas

## 1. Visão Geral
Sistema web para congregações das Testemunhas de Jeová automatizarem designações da Reunião Vida e Ministério Cristão, com foco em eficiência, conformidade e sustentabilidade via doações.

## 2. Objetivos
- Reduzir esforço manual dos designadores
- Garantir conformidade com regras congregacionais (gênero, cargo, parentesco)
- Facilitar acompanhamento das designações pelos estudantes
- Sustentar o sistema via doações voluntárias

## 3. Funcionalidades Principais
- **Gestão de Estudantes:** Cadastro manual e por planilha, validação de cargos, parentesco e qualificações.
- **Importação de Programas Semanais:** Parsing automático de PDFs oficiais, conversão para JSON.
- **Geração Automática de Designações:** Algoritmo que respeita regras congregacionais, evita repetições e sugere duplas válidas.
- **Notificações Automáticas:** Envio por e-mail e WhatsApp, log de envios, fallback em PDF.
- **Portal do Estudante:** Visualização de designações, confirmação de participação, doações via Pix.
- **Relatórios e Dashboard:** Histórico de designações, métricas de engajamento, exportação para PDF/Excel.
- **Conformidade com Regras:** Algoritmo que respeita todas as diretrizes da Escola do Ministério Teocrático.
- **Sustentabilidade via Doações:** QR code Pix, botão copiar chave Pix, popup de agradecimento.

## 4. Requisitos Técnicos
- **Frontend:** React + TailwindCSS + Zustand
- **Backend:** Supabase (Postgres + Auth)
- **Automação:** Node.js para parsing de PDFs
- **Notificações:** EmailJS/SendGrid e Twilio
- **Deploy:** Vercel (frontend) + Supabase (backend)

## 5. Fluxo de Usuário
1. Designador cadastra estudantes (manual/planilha)
2. Importa programa semanal (PDF)
3. Sistema gera designações automaticamente
4. Notificações são enviadas
5. Estudantes acessam portal, confirmam participação e podem doar

## 6. Métricas de Sucesso
- Designações geradas em <5 min/semana
- >80% dos estudantes visualizam semanalmente
- Doações mensais cobrem custos
- >95% das designações sem intervenção manual

## 7. Extensões Futuras
- Agenda para múltiplas congregações
- Relatórios automáticos para coordenadores
- App mobile offline
- Lembretes e confirmações automáticas
