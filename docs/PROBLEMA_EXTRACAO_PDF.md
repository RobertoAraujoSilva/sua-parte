# Problema: Extração Automática de Programação dos PDFs Oficiais MWB

## Contexto
O sistema Sua-Parte precisa exibir a programação oficial das reuniões ministeriais baseada nos arquivos PDF do "Nosso Ministério do Reino" (MWB), disponibilizados mensalmente. Atualmente, o uso de dados mockados não atende ao requisito de fidelidade e atualização automática.

## O Problema
- **Dados mockados não refletem a programação real:** Qualquer alteração ou atualização oficial não é refletida automaticamente no sistema.
- **Risco de divergência:** Usuários podem trabalhar com informações desatualizadas ou incorretas.
- **Retrabalho manual:** Exige que alguém converta ou digite manualmente a programação, aumentando o risco de erro humano.
- **Escalabilidade limitada:** Para cada novo mês, seria necessário atualizar manualmente os dados.

## Requisito
O sistema deve:
- Ler automaticamente os arquivos PDF oficiais localizados em `docs/Oficial/` (ex: `mwb_E_202511.pdf`, `mwb_E_202507.pdf`, etc.).
- Extrair de forma estruturada as informações de datas, partes, temas, horários e demais detalhes relevantes.
- Exibir esses dados reais no frontend, eliminando a necessidade de mocks.

## Solução Técnica Recomendada
1. **Pipeline de extração:** Utilizar uma biblioteca de leitura de PDF (ex: pdf-parse, pdfjs, PyPDF2) para processar os arquivos.
2. **Parser customizado:** Implementar lógica para identificar e extrair os blocos de texto relevantes (datas, partes, temas, horários, etc.).
3. **Conversão para JSON:** Salvar os dados extraídos em um formato estruturado (JSON) para uso pelo frontend.
4. **Atualização automática:** Sempre que um novo PDF for adicionado à pasta, o sistema deve processá-lo e atualizar a programação exibida.

## Impacto
- Garante que a programação exibida seja sempre fiel ao documento oficial.
- Elimina retrabalho manual e reduz erros.
- Facilita a manutenção e escalabilidade do sistema.

---

> Este documento define o problema e o requisito de extração automática dos PDFs oficiais, servindo de referência para implementação e validação do fluxo.
