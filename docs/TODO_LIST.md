# Lista de Tarefas — Sua-Parte

Esta lista serve como um roteiro prático para colocar o sistema em funcionamento, cobrindo desde a configuração inicial até a validação final em produção. Marque cada item conforme concluir.
enciais do Supabase e testar conexão

## 2. Backend
- [ ] Ajustar/validar configurações do backend (`backend/.env`)
- [ ] Rodar o backend com `npm run dev:backend-only`
- [ ] Testar endpoints principais (login, materiais, congregações)
- [ ] Validar integração com Supabase (RLS, permissões, storage)

## 3. Frontend
- [ ] Rodar o frontend com `npm run dev:frontend-only`
- [ ] Validar rotas principais: `/admin`, `/dashboard`, `/auth`, `/estudante/:id`
- [ ] Testar login/logout e troca de papéis (admin, instrutor, estudante)
- [ ] Validar carregamento sem telas em branco (Skeleton global)

## 4. Dashboards e Fluxos
- [ ] Testar fluxo do Admin: importar materiais, publicar programação, gerenciar permissões
- [ ] Testar fluxo do Instrutor: visualizar programação, cadastrar estudantes, designar partes
- [ ] Testar fluxo do Estudante: acesso restrito, leitura de materiais/designações
- [ ] Validar sincronização offline/online (Instrutor)

## 5. Testes e Qualidade
- [ ] Rodar todos os testes E2E com `npm run cypress:run`
- [ ] Corrigir eventuais falhas e garantir cobertura mínima
- [ ] Validar mensagens de erro e feedbacks visuais

## 6. Documentação e Segurança
- [ ] Revisar e atualizar documentação (`README.md`, docs/)
- [ ] Garantir que nenhuma chave sensível está exposta
- [ ] Validar RLS e privilégios mínimos no Supabase

## 7. Deploy e Produção
- [ ] Configurar ambiente de produção (variáveis, build, storage)
- [ ] Realizar build final com `npm run build`
- [ ] Testar deploy em ambiente real
- [ ] Validar todos os fluxos em produção

---

> Consulte sempre os arquivos em `docs/` para detalhes de integração, debug e fluxo de trabalho.
