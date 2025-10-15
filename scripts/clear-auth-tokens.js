#!/usr/bin/env node

/**
 * Script para limpar tokens de autenticação corrompidos
 * Executa via Node.js para limpar o localStorage do navegador
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Limpando tokens de autenticação corrompidos...\n');

// 1. Verificar se o servidor está rodando
try {
    console.log('📡 Verificando status do servidor...');
    const response = execSync('curl -s http://localhost:8080/api/status || echo "Servidor não está rodando"', 
        { encoding: 'utf8', timeout: 5000 });
    console.log('✅ Servidor respondendo:', response.trim());
} catch (error) {
    console.log('⚠️ Servidor não está respondendo. Execute npm run dev:all primeiro.');
}

// 2. Criar arquivo HTML de limpeza
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Clear Auth Tokens</title>
</head>
<body>
    <h1>Limpando tokens de autenticação...</h1>
    <div id="status"></div>
    <script>
        try {
            // Limpar localStorage
            localStorage.removeItem('sb-nwpuurgwnnuejqinkvrh-auth-token');
            localStorage.removeItem('supabase.auth.token');
            
            // Limpar todos os dados do Supabase
            Object.keys(localStorage).forEach(key => {
                if (key.includes('supabase') || key.includes('sb-nwpuurgwnnuejqinkvrh')) {
                    localStorage.removeItem(key);
                }
            });

            // Limpar sessionStorage
            sessionStorage.clear();

            document.getElementById('status').innerHTML = 
                '<p style="color: green;">✅ Tokens limpos com sucesso!</p>' +
                '<p>Você pode fechar esta aba e fazer login novamente.</p>';
        } catch (error) {
            document.getElementById('status').innerHTML = 
                '<p style="color: red;">❌ Erro: ' + error.message + '</p>';
        }
    </script>
</body>
</html>`;

const htmlPath = path.join(__dirname, '..', 'clear-tokens.html');
fs.writeFileSync(htmlPath, htmlContent);

console.log('📄 Arquivo de limpeza criado:', htmlPath);
console.log('🌐 Abra este arquivo no navegador para limpar os tokens:');
console.log(`   file://${htmlPath.replace(/\\/g, '/')}`);

// 3. Instruções para o usuário
console.log('\n📋 Instruções:');
console.log('1. Abra o arquivo clear-tokens.html no seu navegador');
console.log('2. Os tokens serão limpos automaticamente');
console.log('3. Feche a aba e acesse http://localhost:8080/auth');
console.log('4. Faça login novamente');

console.log('\n🔧 Alternativa via console do navegador:');
console.log('1. Abra http://localhost:8080 no navegador');
console.log('2. Pressione F12 para abrir o console');
console.log('3. Cole e execute:');
console.log(`
localStorage.removeItem('sb-nwpuurgwnnuejqinkvrh-auth-token');
localStorage.removeItem('supabase.auth.token');
Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('sb-nwpuurgwnnuejqinkvrh')) {
        localStorage.removeItem(key);
    }
});
sessionStorage.clear();
window.location.reload();
`);

console.log('\n✅ Script concluído!');
