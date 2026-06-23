import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Pencil, Lock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
// Importação da URL centralizada e dos headers de autenticação
import { API_URL, getAuthHeaders } from '../../services/api'; 

interface ProfileMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export const ProfileMenuModal: React.FC<ProfileMenuModalProps> = ({ isOpen, onClose, userName }) => {
  const { theme } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);
  
  const [userData, setUserData] = useState<any>(null);
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true); // Garante o estado de loading ao reabrir o modal

      // Busca dados do usuário e lista de departamentos utilizando a configuração centralizada
      Promise.all([
        fetch(`${API_URL}/usuarios/me`, {
          headers: getAuthHeaders() // Injeta dinamicamente Content-Type e Authorization Bearer
        }).then(res => res.json()),
        fetch(`${API_URL}/departamentos`, {
          headers: getAuthHeaders()
        }).then(res => res.json())
      ])
        .then(([user, depts]) => {
          setUserData(user);
          setDepartamentos(depts);
        })
        .catch(err => console.error("Erro ao carregar dados:", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  // Função para mapear o ID do departamento para o Nome
  const getNomeSetor = () => {
    if (!userData?.idDepartamento) return 'Não definido';
    const dept = departamentos.find(d => d.id === userData.idDepartamento);
    return dept ? dept.nome : 'Desconhecido';
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const InputField = ({ label, value, readOnly = false, onChange }: any) => (
    <div>
      <label className="text-[10px] font-bold uppercase text-gray-400">{label}</label>
      <div className="relative mt-1">
        <input 
          type="text" 
          value={value} 
          readOnly={readOnly}
          onChange={onChange}
          className={`w-full p-3 rounded border pr-10 ${
            readOnly 
              ? 'bg-gray-100 cursor-not-allowed opacity-70 text-gray-500' 
              : theme === 'dark' ? 'bg-[#35363a] border-[#4a4b50] text-white' : 'bg-white border-gray-200'
          }`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          {readOnly ? <Lock size={14} /> : <Pencil size={14} />}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={handleOverlayClick}>
      <div ref={modalRef} className={`w-full max-w-md rounded-xl shadow-2xl p-6 ${theme === 'dark' ? 'bg-[#202124]' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Meu Perfil</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
        </div>

        <div className="flex flex-col items-center mb-6">
          <div className="relative w-24 h-24 rounded-full bg-[#E95C13] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {userData?.nome ? userData.nome.substring(0, 2).toUpperCase() : userName.substring(0, 2).toUpperCase()}
            <button className="absolute bottom-0 right-0 p-2 bg-gray-800 rounded-full text-white hover:bg-black"><Camera size={14} /></button>
          </div>
        </div>

        <div className="space-y-4">
          <InputField label="Nome Completo" value={userData?.nome || userName} readOnly />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Setor" value={loading ? 'Carregando...' : getNomeSetor()} readOnly />
            <InputField label="Cargo" value={userData?.cargo || 'Não definido'} readOnly />
          </div>
          <InputField label="E-mail" value={userData?.email || ''} onChange={(e: any) => setUserData({...userData, email: e.target.value})} />
          <InputField label="Nova Senha" value="••••••••" onChange={() => {}} />
        </div>

        <button className="w-full mt-8 bg-[#E95C13] text-white py-3 rounded font-bold hover:bg-[#d4500f] transition-all">
          Salvar Alterações
        </button>
      </div>
    </div>
  );
};