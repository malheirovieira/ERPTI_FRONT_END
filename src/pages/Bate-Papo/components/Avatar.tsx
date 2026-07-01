import React from 'react';

export const CORES = ['#E95C13', '#1a73e8', '#1e8e3e', '#7e22ce', '#eab308', '#0891b2', '#d33b2c'];

export function iniciais(nome: string) {
  return nome.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export function corPara(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return CORES[Math.abs(h) % CORES.length];
}

interface AvatarProps {
  nome: string;
  tipo?: 'pessoa' | 'grupo' | 'global';
  tamanho?: number;
  online?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ nome, tipo = 'pessoa', tamanho = 32, online }) => {
  const cor = corPara(nome);
  const arredondado = tipo === 'pessoa' ? 'rounded-full' : 'rounded-lg';

  return (
    <div
      className={`relative flex items-center justify-center text-white font-semibold shrink-0 ${arredondado}`}
      style={{ backgroundColor: cor, width: tamanho, height: tamanho, fontSize: tamanho * 0.4 }}
    >
      {tipo === 'global' ? (
        <svg width={tamanho * 0.5} height={tamanho * 0.5} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
        </svg>
      ) : tipo === 'grupo' ? (
        '#'
      ) : (
        iniciais(nome)
      )}
      {online !== undefined && (
        <span
          className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white"
          style={{ backgroundColor: online ? '#1e8e3e' : '#9aa3ad', width: tamanho * 0.3, height: tamanho * 0.3 }}
        />
      )}
    </div>
  );
};
