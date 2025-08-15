# 📚 Sistema Ministerial

> **Plataforma completa para gestão de designações da Escola do Ministério Teocrático das Testemunhas de Jeová**

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.53.0-green.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-blue.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-purple.svg)](https://vitejs.dev/)
[![Cypress](https://img.shields.io/badge/Cypress-13.15.0-brightgreen.svg)](https://www.cypress.io/)

---

## 🎯 Visão Geral

O **Sistema Ministerial** é uma aplicação web moderna desenvolvida para automatizar e otimizar a gestão de designações da Escola do Ministério Teocrático.
Inclui **ferramentas exclusivas para administradores congregacionais** realizarem download automático dos materiais oficiais da [jw.org](https://www.jw.org) (Apostila, S-38, arquivos DAISY, JWPUB e PDF) e disponibilizá-los para os instrutores organizarem seus estudantes.

---

## 🌟 Principais Características

* **🔐 Autenticação Dual**: Admin, Instrutores e Estudantes
* **📥 Download Automático**: Apostilas e arquivos auxiliares direto da JW\.org
* **👥 Gestão de Estudantes**: Cadastro manual ou importação via Excel
* **📊 Dashboard Inteligente**: Estatísticas em tempo real
* **👨‍👩‍👧‍👦 Gestão Familiar**: Relacionamentos e convites
* **📱 Portal do Estudante**: Área dedicada para designações
* **🎯 Conformidade S-38-T**: Respeita regras congregacionais
* **📈 Relatórios Avançados**: Participação e engajamento

---

## 🖥️ Como usar o **Painel do Administrador** (`http://localhost:8080/admin`)

> **Acesso restrito** — necessário login de Administrador.

1. **Inicie o servidor backend**:

   ```bash
   npm run server
   ```

   *(ou `node server/index.js` dependendo do setup)*

2. **Acesse no navegador**:

   ```
   http://localhost:8080/admin
   ```

3. **Faça login** com credenciais de Administrador:

   * **Email**: `amazonwebber007@gmail.com`
   * **Senha**: `Admin123!@#`

4. **Baixando materiais da JW\.org**:

   * Escolha o idioma (**PT** ou **EN**)
   * Clique em **"Buscar Apostila"** — o sistema acessa:

     * `https://www.jw.org/pt/biblioteca/jw-apostila-do-mes/`
     * `https://www.jw.org/en/library/jw-meeting-workbook/`
   * Clique em **"Baixar PDF / JWPUB / DAISY"**
   * Arquivos serão salvos automaticamente em:

     ```
     ./docs/Oficial/
     ```

5. **Atualização Automática**:

   * Botão **"Verificar Atualizações"** busca novas apostilas e substitui as antigas
   * Registro de log das atualizações na aba **"Histórico"**

---

## 📷 Exemplo Visual

**Tela de Login Admin**
![login](docs/screenshots/admin-login.png)

**Painel com Opção de Download**
![painel](docs/screenshots/admin-panel.png)

---

## 🚀 Início Rápido

### Pré-requisitos

* Node.js 18+
* npm ou yarn
* Conta no Supabase

```bash
git clone https://github.com/RobertoAraujoSilva/sua-parte.git
cd sua-parte
npm install
cp .env.example .env.local
# Configure suas credenciais no .env.local
npx supabase db push
npm run dev
```

---

## ⚙️ Variáveis de Ambiente (.env.local)

| Variável             | Descrição                           |
| -------------------- | ----------------------------------- |
| `SUPABASE_URL`       | URL do projeto Supabase             |
| `SUPABASE_ANON_KEY`  | Chave pública do Supabase           |
| `DOCS_DIR`           | Pasta para salvar arquivos baixados |
| `JW_URL_PT`          | URL JW\.org Apostila PT             |
| `JW_URL_EN`          | URL JW\.org Apostila EN             |
| `CYPRESS_RECORD_KEY` | Chave Cypress Cloud                 |

---

## 🧪 Testes

```bash
npm run cypress:open
npm run cypress:run
```

---

## 📞 Suporte

* 📧 **Email**: [amazonwebber007@gmail.com](mailto:amazonwebber007@gmail.com)
* 🐛 **Issues**: [GitHub Issues](https://github.com/RobertoAraujoSilva/sua-parte/issues)
* 📖 **Documentação**: Pasta `docs/`

---

<div align="center">

**🙏 Desenvolvido com dedicação para servir às congregações das Testemunhas de Jeová**
*"Tudo o que fizerem, façam de todo o coração, como para Jeová, e não para homens." - Colossenses 3:23*

</div>

