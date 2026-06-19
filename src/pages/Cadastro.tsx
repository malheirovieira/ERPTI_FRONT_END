import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, ChevronDown, CheckCircle } from 'lucide-react';

export const Cadastro: React.FC = () => {
  const navigate = useNavigate();
  
  // Lista de cargos mantida conforme original
  const CARGOS = ["Auxiliar", "Assistente", "Técnico", "Analista", "Coordenador", "Gerente", "Diretor"];
  
  // Estado para os setores vindo do banco
  const [setores, setSetores] = useState<{id: number, nome: string}[]>([]);
  
  const [formData, setFormData] = useState({ nome: '', email: '', idDepartamento: '', cargo: '', senha: '' });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Busca setores no IP 192.168.2.155:7000
  useEffect(() => {
    fetch('http://192.168.2.155:7000/departamentos')
      .then(res => res.json())
      .then(data => setSetores(data))
      .catch(err => console.error("Erro ao buscar setores:", err));

    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const isFormValid = formData.nome !== '' && formData.email !== '' && formData.idDepartamento !== '' && formData.cargo !== '' && formData.senha !== '';

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Envio para o back-end
    try {
      const response = await fetch('http://192.168.2.155:7000/auth/cadastrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          cargo: formData.cargo,
          idDepartamento: parseInt(formData.idDepartamento),
          empresaAcesso: 'ENGEBAG'
        }),
      });

      if (response.ok) {
        setShowModal(true);
      }
    } catch (err) {
      console.error("Erro no cadastro:", err);
    }
  };

  const inputStyle = "w-full px-4 py-3 bg-gray-50 border border-[#dee2e6] rounded-sm text-sm outline-none focus:border-[#E95C13] focus:ring-1 focus:ring-[#E95C13] transition-all text-gray-800 cursor-pointer flex items-center justify-between";

  // Dropdown mantendo exatamente a sua estrutura de componentes
  const Dropdown = ({ label, placeholder, options, field, isSetor }: any) => (
    <div className="relative flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
      <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{label}</label>
      <div className={inputStyle} onClick={() => setOpenDropdown(openDropdown === field ? null : field)}>
        <span className={!formData[field as keyof typeof formData] ? "text-gray-400" : "text-gray-800"}>
          {isSetor 
            ? (setores.find(s => s.id.toString() === formData.idDepartamento)?.nome || placeholder)
            : (formData[field as keyof typeof formData] || placeholder)}
        </span>
        <ChevronDown size={16} className="text-gray-400" />
      </div>
      
      {openDropdown === field && (
        <div className="absolute top-[75px] left-0 w-full bg-white border border-[#dee2e6] rounded-sm shadow-xl z-50 max-h-48 overflow-y-auto">
          {options.map((opt: any) => (
            <div key={isSetor ? opt.id : opt} onClick={() => { setFormData({...formData, [field]: isSetor ? opt.id.toString() : opt}); setOpenDropdown(null); }} 
              className="px-4 py-3 text-sm text-gray-700 hover:bg-[#E95C13] hover:text-white cursor-pointer transition-colors">
              {isSetor ? opt.nome : opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-screen min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] font-sans p-4">
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md p-8 max-w-sm w-full text-center flex flex-col items-center gap-4 shadow-2xl animate-in fade-in zoom-in duration-300">
            <CheckCircle className="text-[#E95C13]" size={48} />
            <h2 className="text-lg font-bold text-gray-800">Solicitação Enviada!</h2>
            <p className="text-sm text-gray-600">Seu cadastro foi enviado para análise de um administrador. Entraremos em contato em breve.</p>
            <button onClick={() => navigate('/login-admin')} className="w-full bg-[#E95C13] text-white font-bold text-sm py-3 rounded-sm hover:bg-[#d4500f] transition-all">
              OK, Entendido
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white border border-[#dee2e6] rounded-md shadow-lg p-12 flex flex-col gap-8">
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-[#E95C13] rounded-full flex items-center justify-center text-white shadow-md">
            <UserPlus size={32} />
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight mt-1">Novo Cadastro</h1>
        </div>

        <form onSubmit={handleCadastro} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Nome Completo</label>
            <input type="text" placeholder="Seu nome" className="w-full px-4 py-3 bg-gray-50 border border-[#dee2e6] rounded-sm text-sm outline-none focus:border-[#E95C13] focus:ring-1 focus:ring-[#E95C13] transition-all" onChange={(e) => setFormData({...formData, nome: e.target.value})} required />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">E-mail Corporativo</label>
            <input type="email" placeholder="Email@empresa.com.br" className="w-full px-4 py-3 bg-gray-50 border border-[#dee2e6] rounded-sm text-sm outline-none focus:border-[#E95C13] focus:ring-1 focus:ring-[#E95C13] transition-all" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          </div>

          <Dropdown label="Setor" placeholder="Selecione um setor" options={setores} field="idDepartamento" isSetor={true} />
          <Dropdown label="Cargo" placeholder="Selecione um cargo" options={CARGOS} field="cargo" isSetor={false} />

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Definir Senha</label>
            <div className="relative w-full">
              <input type={mostrarSenha ? "text" : "password"} placeholder="••••••••" className="w-full px-4 py-3 bg-gray-50 border border-[#dee2e6] rounded-sm text-sm outline-none focus:border-[#E95C13] focus:ring-1 focus:ring-[#E95C13] transition-all pr-12" onChange={(e) => setFormData({...formData, senha: e.target.value})} required />
              <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E95C13]">
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={!isFormValid}
            className="w-full bg-[#E95C13] text-white font-bold text-sm py-4 rounded-sm hover:bg-[#d4500f] transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Solicitar Acesso
          </button>
        </form>

        <div className="text-center text-xs text-gray-500">
          Já possui conta?{' '}
          <button type="button" onClick={() => navigate('/login-admin')} className="text-[#E95C13] hover:underline font-bold transition-all">
            Voltar para o Login
          </button>
        </div>
      </div>
    </div>
  );
};