import { supabase } from '@/integrations/supabase/client';

export const addRedirectURL = async () => {
  try {
    console.log('🔗 Adicionando URL de redirect via MCP...');
    
    // Usar MCP do Supabase para adicionar URL de redirect
    const { error } = await supabase.auth.admin.updateAuthConfig({
      SITE_URL: 'https://designa-91mn.onrender.com',
      REDIRECT_URLS: [
        'http://localhost:5173/**',
        'http://localhost:8080/**', 
        'http://localhost:8081/**',
        'https://sua-parte.lovable.app/**',
        'https://designa-91mn.onrender.com/**'
      ]
    });
    
    if (error) {
      console.error('❌ Erro ao atualizar config:', error);
      return false;
    }
    
    console.log('✅ URL de redirect adicionada: https://designa-91mn.onrender.com/**');
    return true;
    
  } catch (error) {
    console.error('❌ Erro MCP:', error);
    return false;
  }
};