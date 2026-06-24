// src/pages/TI/SuporteTecnico/components/UsuarioBloqueadoModal.tsx
import { ShieldAlert } from 'lucide-react';

export default function UsuarioBloqueadoModal() {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm text-center px-6 py-8">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mx-auto mb-4">
                    <ShieldAlert size={28} className="text-red-600" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-2">
                    Usuário inativo para Suporte Técnico
                </h3>
                <p className="text-sm text-slate-600">
                    Por gentileza, contatar o Administrador do Sistema.
                </p>
            </div>
        </div>
    );
}
