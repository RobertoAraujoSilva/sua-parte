import React, { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import estudantesData from "../data/estudantes_refinados_converted.json";

const cargos = [
  'anciao', 'servo_ministerial', 'pioneiro_regular', 'publicador_batizado', 'publicador_nao_batizado', 'estudante_novo'
];

const Relatorios = () => {
  const [filtroCargo, setFiltroCargo] = useState('');
  const [filtroIdade, setFiltroIdade] = useState('');
  const [filtroAcompanhamento, setFiltroAcompanhamento] = useState(false);
  const navigate = useNavigate();

  // Filtros principais
  const estudantesFiltrados = useMemo(() => {
    return estudantesData.filter(est => {
      if (filtroCargo && est.cargo !== filtroCargo) return false;
      if (filtroIdade && est.idade !== Number(filtroIdade)) return false;
      if (filtroAcompanhamento && !String(est.observacoes).toLowerCase().includes('acompanhamento')) return false;
      return true;
    });
  }, [filtroCargo, filtroIdade, filtroAcompanhamento]);

  return (
    <div className="p-6">
      <Header />
      <h1 className="text-2xl font-bold mb-4">Relatórios de Estudantes</h1>
      <div className="flex gap-4 mb-6">
        <select value={filtroCargo} onChange={e => setFiltroCargo(e.target.value)} className="border rounded px-2 py-1">
          <option value="">Todos os cargos</option>
          {cargos.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
        </select>
        <input type="number" placeholder="Idade" value={filtroIdade} onChange={e => setFiltroIdade(e.target.value)} className="border rounded px-2 py-1 w-24" />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={filtroAcompanhamento} onChange={e => setFiltroAcompanhamento(e.target.checked)} />
          Só acompanhamento
        </label>
      </div>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Nome</th>
            <th className="border px-2 py-1">Família</th>
            <th className="border px-2 py-1">Idade</th>
            <th className="border px-2 py-1">Cargo</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Funções</th>
            <th className="border px-2 py-1">Observações</th>
          </tr>
        </thead>
        <tbody>
          {estudantesFiltrados.map(est => (
            <tr key={est.id} className={String(est.observacoes).toLowerCase().includes('acompanhamento') ? 'bg-yellow-50' : ''}>
              <td className="border px-2 py-1 font-semibold">{est.nome}</td>
              <td className="border px-2 py-1">{est.familia}</td>
              <td className="border px-2 py-1">{est.idade}</td>
              <td className="border px-2 py-1">{est.cargo.replace('_', ' ')}</td>
              <td className="border px-2 py-1">{est.ativo === 'TRUE' ? 'Ativo' : 'Inativo'}</td>
              <td className="border px-2 py-1">
                {['chairman','pray','tresures','gems','reading','starting','following','making','explaining','talk'].filter(fn => est[fn] === 'VERDADEIRO' || est[fn] === true).map(fn => (
                  <span key={fn} className="inline-block bg-blue-100 text-blue-800 rounded px-2 py-0.5 mr-1 text-xs">{fn}</span>
                ))}
              </td>
              <td className="border px-2 py-1">{est.observacoes}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-6 text-sm text-gray-500">* Estudantes destacados em amarelo precisam de acompanhamento.</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
        <Button variant="outline" onClick={() => navigate('/designacoes')}>Voltar</Button>
        <Button variant="default" onClick={() => navigate('/dashboard')}>Prosseguir</Button>
      </div>
      <Footer />
    </div>
  );
};

export default Relatorios;
