# Problema: Tela em Branco ao Recarregar (F5) no Admin Dashboard

## Contexto
Ao acessar o Admin Dashboard do sistema Sua-Parte e pressionar F5 (recarregar a página), a interface pode ficar em branco, sem exibir a programação ou os componentes esperados, mesmo após a autenticação e inicialização do sistema.

## Sintoma
- Após recarregar a página (`F5`), a terceira coluna (ou componente principal) do Admin Dashboard permanece em branco.
- Não há erro explícito no console relacionado ao React, Supabase ou autenticação.
- O restante da interface pode carregar normalmente (menus, cabeçalho, etc.), mas a área de programação/designações não exibe nada.

## Causas Prováveis
- O componente responsável pela exibição da programação (ex: `ProgramDisplay`) depende de dados que não chegam ou chegam vazios após o reload.
- O frontend espera um array de partes/dados estruturados, mas recebe um array vazio, `undefined` ou um JSON mal formatado.
- O backend pode não estar servindo os dados corretamente, ou o pipeline de extração dos PDFs ainda não está gerando o JSON no formato esperado.
- Não há fallback visual (Skeleton, mensagem de "Nenhum dado encontrado"), então a interface fica em branco quando não há dados.

## Impacto
- Usuário não consegue visualizar a programação após recarregar a página, gerando confusão e sensação de erro.
- Dificulta a validação, auditoria e uso do sistema em produção.

## Solução Recomendada
- Garantir que o componente sempre exiba um estado visual (Skeleton, mensagem de "Nenhuma programação encontrada", etc.) mesmo quando os dados estiverem ausentes ou vazios.
- Adicionar logs para depuração e validar o formato dos dados recebidos do backend/JSON.
- Ajustar o pipeline de extração para garantir que o JSON gerado sempre contenha os campos esperados pelo frontend.

---

> Este documento descreve o problema recorrente de tela em branco após recarregar o Admin Dashboard, servindo de referência para correção e validação futura.
