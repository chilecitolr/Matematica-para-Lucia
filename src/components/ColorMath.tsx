import React from 'react';
import type { SpotlightTarget } from '../utils/spotlightCues';

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
  'Área',
  'Lado',
]);

interface ColorMathProps {
  expr: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  highlightTarget?: SpotlightTarget;
}

type MathSegment =
  | { kind: 'text'; value: string }
  | { kind: 'frac'; num: string; den: string };

function splitMathSegments(expr: string): MathSegment[] {
  const fracRegex =
    /\(([^()]+)\)\s*\/\s*\(([^()]+)\)|\(([^()]+)\)\s*\/\s*([0-9a-zA-Z⁰¹²³⁴⁵⁶⁷⁸⁹]+)|([0-9a-zA-Z⁰¹²³⁴⁵⁶⁷⁸⁹]+)\/([0-9a-zA-Z⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g;

  const segments: MathSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = fracRegex.exec(expr)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ kind: 'text', value: expr.slice(lastIndex, match.index) });
    }
    const num = match[1] ?? match[3] ?? match[5];
    const den = match[2] ?? match[4] ?? match[6];
    segments.push({ kind: 'frac', num, den });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < expr.length) {
    segments.push({ kind: 'text', value: expr.slice(lastIndex) });
  }

  return segments;
}

const ColorMathTokens: React.FC<{
  expr: string;
  highlightTarget: SpotlightTarget;
  inFraction?: boolean;
}> = ({ expr, highlightTarget, inFraction = false }) => {
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

  const isHighlighted = (kind: 'num' | 'var' | 'exp' | 'neg' | 'op' | 'word') => {
    if (highlightTarget === 'num' || highlightTarget === 'base') return kind === 'num';
    if (highlightTarget === 'var') return kind === 'var';
    if (highlightTarget === 'exp') return kind === 'exp';
    if (highlightTarget === 'neg') return kind === 'neg';
    return false;
  };

  return (
    <>
      {tokens.map((tok, idx) => {
        const hi = !inFraction && isHighlighted(tok.kind);

        if (tok.kind === 'num') {
          return (
            <span
              key={idx}
              className={`inline-block text-blue-700 font-semibold transition-transform duration-300 ${
                hi
                  ? 'scale-125 bg-blue-100 ring-2 ring-blue-400 rounded-md px-1 mx-0.5'
                  : ''
              }`}
            >
              {tok.value}
            </span>
          );
        }
        if (tok.kind === 'var') {
          return (
            <span
              key={idx}
              className={`inline-block text-emerald-700 font-semibold italic px-[0.5px] transition-transform duration-300 ${
                hi
                  ? 'scale-125 bg-emerald-100 ring-2 ring-emerald-500 rounded-md px-1.5 mx-0.5 not-italic font-bold'
                  : ''
              }`}
            >
              {tok.value}
            </span>
          );
        }
        if (tok.kind === 'exp') {
          return (
            <sup
              key={idx}
              className={`inline-block text-orange-600 font-bold text-[0.65em] -translate-y-[0.45em] ml-[1px] mr-[2px] transition-transform duration-300 ${
                hi
                  ? 'scale-150 bg-orange-100 ring-2 ring-orange-500 rounded px-1 mx-1'
                  : ''
              }`}
            >
              {tok.value}
            </sup>
          );
        }
        if (tok.kind === 'neg') {
          return (
            <span
              key={idx}
              className={`inline-block text-red-600 font-bold px-[1px] transition-transform duration-300 ${
                hi
                  ? 'scale-150 bg-red-100 ring-2 ring-red-500 rounded-md px-1.5 mx-0.5'
                  : ''
              }`}
            >
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
    </>
  );
};

export const ColorMath: React.FC<ColorMathProps> = ({
  expr,
  size = 'lg',
  className = '',
  highlightTarget = 'none',
}) => {
  const sizeClasses: Record<NonNullable<ColorMathProps['size']>, string> = {
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-lg md:text-xl',
    lg: 'text-lg sm:text-xl md:text-2xl',
    xl: 'text-xl sm:text-2xl md:text-4xl',
    '2xl': 'text-2xl sm:text-3xl md:text-5xl',
  };

  const segments = splitMathSegments(expr);
  const hiNum = highlightTarget === 'numerador' || highlightTarget === 'num';
  const hiDen = highlightTarget === 'denominador' || highlightTarget === 'num';

  return (
    <span
      className={`font-math inline-flex flex-wrap items-center tracking-wide leading-relaxed ${sizeClasses[size]} ${className}`}
    >
      {segments.map((seg, idx) => {
        if (seg.kind === 'text') {
          return (
            <ColorMathTokens
              key={idx}
              expr={seg.value}
              highlightTarget={highlightTarget}
            />
          );
        }

        return (
          <span
            key={idx}
            className="inline-flex flex-col items-center justify-center align-middle mx-1 leading-none"
          >
            <span
              className={`px-1.5 pb-[2px] text-[0.8em] leading-tight transition-transform duration-300 ${
                hiNum
                  ? 'scale-115 bg-blue-100 ring-2 ring-blue-400 rounded-md py-0.5 mb-0.5'
                  : ''
              }`}
            >
              <ColorMathTokens
                expr={seg.num}
                highlightTarget={highlightTarget}
                inFraction
              />
            </span>
            <span className="w-full min-w-[1.3em] h-[2px] bg-slate-800 rounded-full" />
            <span
              className={`px-1.5 pt-[3px] text-[0.8em] leading-tight transition-transform duration-300 ${
                hiDen
                  ? 'scale-115 bg-blue-100 ring-2 ring-blue-400 rounded-md py-0.5 mt-0.5'
                  : ''
              }`}
            >
              <ColorMathTokens
                expr={seg.den}
                highlightTarget={highlightTarget}
                inFraction
              />
            </span>
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
  highlightTarget?: SpotlightTarget;
}

export const FractionBox: React.FC<FractionBoxProps> = ({
  num,
  den,
  sign,
  size = 'lg',
  highlightTarget = 'none',
}) => {
  const dim =
    size === 'xl'
      ? 'text-2xl sm:text-3xl md:text-4xl min-w-[2.6rem] sm:min-w-[3.2rem]'
      : size === 'lg'
        ? 'text-xl sm:text-2xl md:text-3xl min-w-[2.2rem] sm:min-w-[2.5rem]'
        : 'text-base sm:text-lg md:text-xl min-w-[1.8rem] sm:min-w-[2rem]';

  const hiNum = highlightTarget === 'numerador' || highlightTarget === 'num';
  const hiDen = highlightTarget === 'denominador' || highlightTarget === 'num';
  const hiSign = highlightTarget === 'neg' && sign !== '+';

  return (
    <span className="inline-flex items-center gap-1.5 font-math">
      {sign && (
        <span
          className={`inline-block font-bold transition-transform duration-300 ${
            sign === '+' ? 'text-slate-700' : 'text-red-600'
          } ${size === 'xl' ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} ${
            hiSign ? 'scale-150 bg-red-100 ring-2 ring-red-500 rounded px-1' : ''
          }`}
        >
          {sign === '-' ? '−' : sign}
        </span>
      )}
      <span className={`inline-flex flex-col items-center justify-center ${dim}`}>
        <span
          className={`text-blue-700 font-semibold leading-none pb-1.5 px-2 transition-transform duration-300 ${
            hiNum
              ? 'scale-125 bg-blue-100 ring-2 ring-blue-500 rounded-lg py-1 mb-1'
              : ''
          }`}
        >
          {num}
        </span>
        <span className="w-full h-[2.5px] bg-slate-800 rounded-full" />
        <span
          className={`text-blue-700 font-semibold leading-none pt-1.5 px-2 transition-transform duration-300 ${
            hiDen
              ? 'scale-125 bg-blue-100 ring-2 ring-blue-500 rounded-lg py-1 mt-1'
              : ''
          }`}
        >
          {den}
        </span>
      </span>
    </span>
  );
};
