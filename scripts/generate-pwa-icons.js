const fs = require('fs');
const path = require('path');

// Função para criar um SVG simples
function createSVGIcon(size, text = 'SM', bgColor = '#1f2937', textColor = '#ffffff') {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${bgColor}" rx="20"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold" 
        text-anchor="middle" dominant-baseline="middle" fill="${textColor}">${text}</text>
</svg>`;
}

// Função para criar favicon ICO básico (como SVG)
function createFavicon() {
  return createSVGIcon(32, 'SM');
}

// Criar diretório public se não existir
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Gerar ícones
const icons = [
  { size: 192, filename: 'pwa-192x192.svg' },
  { size: 512, filename: 'pwa-512x512.svg' },
  { size: 32, filename: 'favicon.svg' }
];

console.log('🎨 Gerando ícones PWA para Sistema Ministerial...');

icons.forEach(icon => {
  const svgContent = createSVGIcon(icon.size);
  const filePath = path.join(publicDir, icon.filename);
  
  fs.writeFileSync(filePath, svgContent);
  console.log(`✅ Criado: ${icon.filename} (${icon.size}x${icon.size})`);
});

// Criar apple-touch-icon
const appleTouchIcon = createSVGIcon(180, 'SM');
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.svg'), appleTouchIcon);
console.log('✅ Criado: apple-touch-icon.svg (180x180)');

// Criar masked-icon
const maskedIcon = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 50 L462 50 L462 462 L50 462 Z" fill="black"/>
  <text x="256" y="300" font-family="Arial, sans-serif" font-size="150" font-weight="bold" 
        text-anchor="middle" fill="white">SM</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'masked-icon.svg'), maskedIcon);
console.log('✅ Criado: masked-icon.svg');

console.log('\n🎉 Todos os ícones PWA foram gerados com sucesso!');
console.log('\n📋 Próximos passos:');
console.log('1. Execute: npm run build');
console.log('2. Execute: npm run preview');
console.log('3. Teste o PWA no navegador');
console.log('4. Use as ferramentas de desenvolvedor para verificar o Service Worker');

// Criar um arquivo de instruções
const instructions = `# 📱 PWA Icons - Sistema Ministerial

## Ícones Gerados:

- **pwa-192x192.svg** - Ícone principal 192x192px
- **pwa-512x512.svg** - Ícone principal 512x512px  
- **favicon.svg** - Favicon do site
- **apple-touch-icon.svg** - Ícone para dispositivos Apple
- **masked-icon.svg** - Ícone mascarado para Safari

## Como Personalizar:

1. **Editar cores**: Modifique as variáveis bgColor e textColor no script
2. **Alterar texto**: Mude 'SM' para outro texto ou símbolo
3. **Criar ícones customizados**: Use um editor de imagem para criar PNGs

## Conversão para PNG (se necessário):

Para converter SVG para PNG, você pode usar:
- Ferramentas online como convertio.co
- Inkscape (software gratuito)
- Comando ImageMagick: \`convert icon.svg icon.png\`

## Teste do PWA:

1. Execute \`npm run build && npm run preview\`
2. Abra o navegador em modo incógnito
3. Vá para localhost:4173
4. Verifique se aparece o botão "Instalar app"
5. Teste a funcionalidade offline

## Verificação:

- ✅ Manifest.json configurado
- ✅ Service Worker ativo
- ✅ Ícones em múltiplos tamanhos
- ✅ Cache de recursos estáticos
- ✅ Cache de APIs Supabase
`;

fs.writeFileSync(path.join(publicDir, 'PWA_INSTRUCTIONS.md'), instructions);
console.log('✅ Criado: PWA_INSTRUCTIONS.md');
