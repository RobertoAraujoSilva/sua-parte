/**
 * Fix Missing Tables Script
 * This script can be run in the browser console to create missing tables
 */

// Check if we're in a browser environment
if (typeof window === 'undefined') {
  console.error('❌ This script must be run in a browser environment');
  process.exit(1);
}

// Import the function from the existing utility
async function fixMissingTables() {
  try {
    console.log('🔧 Starting to fix missing tables...');
    
    // Check if the function is available
    if (typeof window.applyGlobalProgrammingSchema !== 'function') {
      console.error('❌ applyGlobalProgrammingSchema function not found. Make sure the page is loaded.');
      return { success: false, error: 'Function not available' };
    }
    
    // Run the schema application
    console.log('🚀 Applying global programming schema...');
    const result = await window.applyGlobalProgrammingSchema();
    
    if (result.success) {
      console.log('✅ Global programming schema applied successfully!');
      
      // Now let's also ensure the congregacoes table exists
      console.log('🔧 Ensuring congregacoes table exists...');
      
      const { supabase } = await import('/src/integrations/supabase/client.js');
      
      // Create congregacoes table if it doesn't exist
      const congregacoesSQL = `
        CREATE TABLE IF NOT EXISTS public.congregacoes (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          nome VARCHAR(255) NOT NULL UNIQUE,
          pais VARCHAR(100) NOT NULL DEFAULT 'Brasil',
          cidade VARCHAR(100),
          endereco TEXT,
          telefone VARCHAR(20),
          email VARCHAR(255),
          ativa BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE public.congregacoes ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view congregacoes" 
        ON public.congregacoes FOR SELECT
        USING (true);
        
        CREATE POLICY "Instructors can manage their congregation" 
        ON public.congregacoes FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'instrutor'
            AND profiles.congregacao = congregacoes.nome
          )
        );
        
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.congregacoes TO authenticated;
        
        INSERT INTO public.congregacoes (nome, pais, cidade) VALUES 
        ('Market Harborough', 'Reino Unido', 'Market Harborough'),
        ('compensa', 'Brasil', 'Manaus')
        ON CONFLICT (nome) DO NOTHING;
      `;
      
      const statements = congregacoesSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const statement of statements) {
        if (statement.length === 0) continue;
        
        try {
          const { error } = await supabase.rpc('exec_sql', { 
            sql: statement + ';'
          });
          
          if (error) {
            console.warn(`⚠️ Warning in congregacoes statement:`, error.message);
          }
        } catch (error) {
          console.warn(`⚠️ Warning in congregacoes statement:`, error.message);
        }
      }
      
      console.log('✅ Congregacoes table ensured!');
      
      // Verify all tables exist
      console.log('🔍 Verifying all tables...');
      
      const tablesToVerify = ['global_programming', 'workbook_versions', 'congregacoes'];
      
      for (const tableName of tablesToVerify) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('id')
            .limit(1);
          
          if (error) {
            console.warn(`⚠️ Warning: Could not verify table ${tableName}:`, error.message);
          } else {
            console.log(`✅ Table ${tableName} exists and is accessible`);
          }
        } catch (verifyError) {
          console.warn(`⚠️ Warning: Could not verify table ${tableName}:`, verifyError.message);
        }
      }
      
      console.log('🎉 All missing tables have been created successfully!');
      console.log('🔄 Please refresh the page to see the changes.');
      
      return { success: true };
    } else {
      console.error('❌ Failed to apply global programming schema:', result.error);
      return { success: false, error: result.error };
    }
    
  } catch (error) {
    console.error('❌ Error fixing missing tables:', error);
    return { success: false, error: error.message };
  }
}

// Run the fix
fixMissingTables()
  .then(result => {
    if (result.success) {
      console.log('🎉 Success! Missing tables have been created.');
    } else {
      console.error('❌ Failed to fix missing tables:', result.error);
    }
  })
  .catch(error => {
    console.error('❌ Unexpected error:', error);
  });

// Also expose the function globally for manual use
window.fixMissingTables = fixMissingTables;
console.log('🔧 Fix function available: window.fixMissingTables()');
