import { useAuth } from "@/contexts/AuthContext";

const ProgramasTest = () => {
  const { user, profile, loading } = useAuth();

  console.log('🔍 ProgramasTest - Auth state:', {
    loading,
    hasUser: !!user,
    hasProfile: !!profile,
    userRole: profile?.role,
    metadataRole: user?.user_metadata?.role
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-blue-900">
          Teste da Página de Programas
        </h1>
        
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Estado da Autenticação:</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading ? 'Sim' : 'Não'}</p>
            <p><strong>Usuário:</strong> {user ? user.email : 'Não logado'}</p>
            <p><strong>Perfil:</strong> {profile ? profile.nome_completo : 'Não carregado'}</p>
            <p><strong>Role:</strong> {profile?.role || user?.user_metadata?.role || 'Não definido'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Programas Importados</h3>
            <div className="text-3xl font-bold text-green-600">3</div>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Programas Processados</h3>
            <div className="text-3xl font-bold text-blue-600">1</div>
          </div>
          
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Aguardando</h3>
            <div className="text-3xl font-bold text-yellow-600">2</div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Lista de Programas</h2>
          
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">12-18 de Agosto de 2024</h3>
                  <p className="text-gray-600">Importado em 05/08/2024</p>
                </div>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                  Processado
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Arquivo:</h4>
                  <p className="text-sm text-gray-600">programa-12-18-agosto-2024.pdf</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Partes do Programa:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Tesouros da Palavra de Deus</li>
                    <li>• Faça Seu Melhor no Ministério</li>
                    <li>• Nossa Vida Cristã</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">19-25 de Agosto de 2024</h3>
                  <p className="text-gray-600">Importado em 12/08/2024</p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                  Pendente
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Arquivo:</h4>
                  <p className="text-sm text-gray-600">programa-19-25-agosto-2024.pdf</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Partes do Programa:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Tesouros da Palavra de Deus</li>
                    <li>• Faça Seu Melhor no Ministério</li>
                    <li>• Nossa Vida Cristã</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramasTest;
