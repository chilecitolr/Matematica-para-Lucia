import React from 'react';

const SUP_MAP: Record<string, string> = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
};

const SPANISH_WORDS = new Set([
  'Semejantes',
  'semejantes',
  'Grupo',
  'Solo',
  'Grados',
  'Ejemplos',
  'gr',
  'cte',
  'neg',
  'nulo',
  'NO',
  'son',
  'Quedan',
  'separados',
  'y',
]);

interface ColorMathProps {
  expr: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export const ColorMath: React.FC<ColorMathProps> = ({
  expr,
  size = 'lg',
  className = '',
}) => {
  const sizeClasses: Record<NonNullable<ColorMathProps['size']>, string> = {
    sm: 'text-base',
    md: 'text-lg md:text-xl',
    lg: 'text-xl md:text-2xl',
    xl: 'text-2xl md:text-4xl',
    '2xl': 'text-3xl md:text-5xl',
  };

  // Tokenize numbers, superscripts, letters/words, signs, and operators
  const tokens: Array<{ value: string; kind: 'num' | 'var' | 'exp' | 'neg' | 'op' | 'word' }> = [];
  let i = 0;

  while (i < expr.length) {
    const ch = expr[i];

    if (SUP_MAP[ch]) {
      let sup = '';
      while (i < expr.length && SUP_MAP[expr[i]]) {
        sup += SUP_MAP[expr[i]];
        i++;
      }
      tokens.push({ value: sup, kind: 'exp' });
      continue;
    }

    if (/\d/.test(ch)) {
      let num = '';
      while (i < expr.length && /\d/.test(expr[i])) {
        num += expr[i];
        i++;
      }
      tokens.push({ value: num, kind: 'num' });
      continue;
    }

    if (/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(ch)) {
      let letters = '';
      while (i < expr.length && /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(expr[i])) {
        letters += expr[i];
        i++;
      }
      if (SPANISH_WORDS.has(letters) || expr[i] === ':') {
        tokens.push({ value: letters, kind: 'word' });
      } else {
        // Individual variable letters (e.g., xy, ab, pqr)
        tokens.push({ value: letters, kind: 'var' });
      }
      continue;
    }

    if (ch === '-' || ch === '−') {
      tokens.push({ value: '−', kind: 'neg' });
      i++;
      continue;
    }

    tokens.push({ value: ch, kind: 'op' });
    i++;
  }

  return (
    <span
      className={`font-math inline-flex flex-wrap items-baseline tracking-wide leading-relaxed ${sizeClasses[size]} ${className}`}
    >
      {tokens.map((tok, idx) => {
        if (tok.kind === 'num') {
          return (
            <span key={idx} className="text-blue-700 font-semibold">
              {tok.value}
            </span>
          );
        }
        if (tok.kind === 'var') {
          return (
            <span key={idx} className="text-emerald-700 font-semibold italic px-[0.5px]">
              {tok.value}
            </span>
          );
        }
        if (tok.kind === 'exp') {
          return (
            <sup
              key={idx}
              className="text-orange-600 font-bold text-[0.65em] -top-[0.48em] ml-[1px] mr-[2px]"
            >
              {tok.value}
            </sup>
          );
        }
        if (tok.kind === 'neg') {
          return (
            <span key={idx} className="text-red-600 font-bold px-[1px]">
              {tok.value}
            </span>
          );
        }
        if (tok.kind === 'word') {
          return (
            <span key={idx} className="font-sans text-slate-700 font-medium text-[0.82em]">
              {tok.value}
            </span>
          );
        }
        return (
          <span key={idx} className="text-slate-600 whitespace-pre">
            {tok.value}
          </span>
        );
      })}
    </span>
  );
};

interface FractionBoxProps {
  num: string;
  den: string;
  sign?: '+' | '-' | '−';
  size?: 'md' | 'lg' | 'xl';
}

export const FractionBox: React.FC<FractionBoxProps> = ({
  num,
  den,
  sign,
  size = 'lg',
}) => {
  const dim =
    size === 'xl'
      ? 'text-3xl md:text-4xl min-w-[3.2rem]'
      : size === 'lg'
        ? 'text-2xl md:text-3xl min-w-[2.5rem]'
        : 'text-lg md:text-xl min-w-[2rem]';

  return (
    <span className="inline-flex items-center gap-1.5 font-math">
      {sign && (
        <span
          className={`font-bold ${
            sign === '+' ? 'text-slate-700' : 'text-red-600'
          } ${size === 'xl' ? 'text-3xl' : 'text-2xl'}`}
        >
          {sign === '-' ? '−' : sign}
        </span>
      )}
      <span className={`inline-flex flex-col items-center justify-center ${dim}`}>
        <span className="text-blue-700 font-semibold leading-none pb-1.5 px-2">
          {num}
        </span>
        <span className="w-full h-[2.5px] bg-slate-800 rounded-full" />
        <span className="text-blue-700 font-semibold leading-none pt-1.5 px-2">
          {den}
        </span>
      </span>
    </span>
  );
};
