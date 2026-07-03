import React, { useRef, useState, useEffect } from 'react';

interface Props {
  placeholder: string;
  onEnviar: (texto: string) => void;
  onDigitando?: (digitando: boolean) => void;
}

export const CaixaTexto: React.FC<Props> = ({ placeholder, onEnviar, onDigitando }) => {
  const [texto, setTexto] = useState('');
  const ultimoEstadoDigitandoRef = useRef(false);
  const timeoutDigitandoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Limpa o timeout se o componente for desmontado para evitar vazamentos de memória
  useEffect(() => {
    return () => {
      if (timeoutDigitandoRef.current) {
        clearTimeout(timeoutDigitandoRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setTexto(valor);

    if (!onDigitando) return;

    const temTexto = valor.trim().length > 0;

    if (temTexto) {
      // Se não estava digitando antes, dispara imediatamente o estado true
      if (!ultimoEstadoDigitandoRef.current) {
        ultimoEstadoDigitandoRef.current = true;
        onDigitando(true);
      }

      // Limpa o timeout anterior e renova o debounce de 2 segundos
      if (timeoutDigitandoRef.current) {
        clearTimeout(timeoutDigitandoRef.current);
      }

      timeoutDigitandoRef.current = setTimeout(() => {
        ultimoEstadoDigitandoRef.current = false;
        onDigitando(false);
      }, 2000);
    } else {
      // Se o usuário apagou todo o texto, cancela o timer e avisa imediatamente
      if (timeoutDigitandoRef.current) {
        clearTimeout(timeoutDigitandoRef.current);
      }
      if (ultimoEstadoDigitandoRef.current) {
        ultimoEstadoDigitandoRef.current = false;
        onDigitando(false);
      }
    }
  };

  const handleEnviar = () => {
    const conteudo = texto.trim();
    if (!conteudo) return;
    
    onEnviar(conteudo);
    setTexto('');

    // Cancela o timeout ativo ao enviar a mensagem para não disparar após o envio
    if (timeoutDigitandoRef.current) {
      clearTimeout(timeoutDigitandoRef.current);
    }
    
    if (ultimoEstadoDigitandoRef.current) {
      ultimoEstadoDigitandoRef.current = false;
      onDigitando?.(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  return (
    <div className="shrink-0 px-5 pb-4">
      <div className="border border-[#dee2e6] rounded-2xl shadow-sm overflow-hidden">
        <input
          value={texto}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 pt-3 pb-1 text-sm outline-none text-gray-700"
        />
        <div className="flex items-center justify-between px-2 pb-2 pt-1">
          <div className="flex items-center gap-1">
            <button type="button" className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-[#f1f3f4] hover:text-[#E95C13]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>
            <button type="button" className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-[#f1f3f4] hover:text-[#E95C13]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" x2="9.01" y1="9" y2="9" />
                <line x1="15" x2="15.01" y1="9" y2="9" />
              </svg>
            </button>
          </div>
          <button
            type="button"
            onClick={handleEnviar}
            className="w-8 h-8 rounded-full bg-[#E95C13] hover:bg-[#cf4d0e] flex items-center justify-center text-white shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};