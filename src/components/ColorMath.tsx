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
  activeTerms?: string[];
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
  activeTerms?: string[];
}> = ({ expr, highlightTarget, inFraction = false, activeTerms = [] }) => {
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

  const termSet = new Set(activeTerms.map((t) => t.toLowerCase()));

  const isHighlighted = (kind: 'num' | 'var' | 'exp' | 'neg' | 'op' | 'word') => {
    if (highlightTarget === 'num' || highlightTarget === 'base') return kind === 'num';
    if (highlightTarget === 'var') return kind === 'var';
    if (highlightTarget === 'exp') return kind === 'exp';
    if (highlightTarget === 'neg') return kind === 'neg';
    return false;
  };

  const isTermMatched = (tok: { value: string; kind: string }) => {
    if (termSet.size === 0) return false;
    const v = tok.value.trim().toLowerCase();
    if (!v) return false;
    if (termSet.has(v)) return true;
    if (tok.kind === 'neg' && (termSet.has('−') || termSet.has('-'))) return true;
    if (v === '*' && termSet.has('×')) return true;
    return false;
  };

  return (
    <>
      {tokens.map((tok, idx) => {
        const hi = !inFraction && isHighlighted(tok.kind);
        const termHi = isTermMatched(tok);

        if (tok.kind === 'num') {
          return (
            <span
              key={idx}
              className={`inline-block text-blue-700 font-semibold transition-all duration-300 ${
                termHi
                  ? 'scale-125 bg-amber-200 ring-2 ring-amber-500 text-slate-950 rounded-md px-1 mx-0.5 shadow-sm'
                  : hi
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
              className={`inline-block text-emerald-700 font-semibold italic px-[0.5px] transition-all duration-300 ${
                termHi
                  ? 'scale-125 bg-amber-200 ring-2 ring-amber-500 text-slate-950 rounded-md px-1.5 mx-0.5 not-italic font-bold shadow-sm'
                  : hi
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
              className={`inline-block text-orange-600 font-bold text-[0.65em] -translate-y-[0.45em] ml-[1px] mr-[2px] transition-all duration-300 ${
                termHi
                  ? 'scale-150 bg-amber-200 ring-2 ring-amber-500 text-slate-950 rounded px-1 mx-1'
                  : hi
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
              className={`inline-block text-red-600 font-bold px-[1px] transition-all duration-300 ${
                termHi
                  ? 'scale-150 bg-amber-200 ring-2 ring-amber-500 text-red-700 rounded-md px-1.5 mx-0.5 shadow-sm'
                  : hi
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
          <span
            key={idx}
            className={`whitespace-pre transition-all duration-300 ${
              termHi
                ? 'inline-block scale-135 bg-amber-200 ring-2 ring-amber-500 text-slate-950 font-bold rounded-md px-1 mx-0.5'
                : 'text-slate-600'
            }`}
          >
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
  activeTerms = [],
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
  const termSet = new Set(activeTerms.map((t) => t.toLowerCase()));

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
              activeTerms={activeTerms}
            />
          );
        }

        const fracKey = `${seg.num.trim()}/${seg.den.trim()}`.toLowerCase();
        const fracHi = termSet.has(fracKey);

        return (
          <span
            key={idx}
            className={`inline-flex flex-col items-center justify-center align-middle mx-1 leading-none transition-all duration-300 ${
              fracHi
                ? 'scale-115 bg-amber-100 ring-2 ring-amber-500 rounded-lg px-1.5 py-1 shadow-sm'
                : ''
            }`}
          >
            <span
              className={`px-1.5 pb-[2px] text-[0.8em] leading-tight transition-transform duration-300 ${
                hiNum && !fracHi
                  ? 'scale-115 bg-blue-100 ring-2 ring-blue-400 rounded-md py-0.5 mb-0.5'
                  : ''
              }`}
            >
              <ColorMathTokens
                expr={seg.num}
                highlightTarget={highlightTarget}
                inFraction
                activeTerms={fracHi ? [] : activeTerms}
              />
            </span>
            <span className="w-full min-w-[1.3em] h-[2px] bg-slate-800 rounded-full" />
            <span
              className={`px-1.5 pt-[3px] text-[0.8em] leading-tight transition-transform duration-300 ${
                hiDen && !fracHi
                  ? 'scale-115 bg-blue-100 ring-2 ring-blue-400 rounded-md py-0.5 mt-0.5'
                  : ''
              }`}
            >
              <ColorMathTokens
                expr={seg.den}
                highlightTarget={highlightTarget}
                inFraction
                activeTerms={fracHi ? [] : activeTerms}
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
  activeTerms?: string[];
}

export const FractionBox: React.FC<FractionBoxProps> = ({
  num,
  den,
  sign,
  size = 'lg',
  highlightTarget = 'none',
  activeTerms = [],
}) => {
  const dim =
    size === 'xl'
      ? 'text-2xl sm:text-3xl md:text-4xl min-w-[2.6rem] sm:min-w-[3.2rem]'
      : size === 'lg'
        ? 'text-xl sm:text-2xl md:text-3xl min-w-[2.2rem] sm:min-w-[2.5rem]'
        : 'text-base sm:text-lg md:text-xl min-w-[1.8rem] sm:min-w-[2rem]';

  const termSet = new Set(activeTerms.map((t) => t.toLowerCase()));
  const fracHi = termSet.has(`${num.trim()}/${den.trim()}`.toLowerCase());
  const numTermHi = !fracHi && termSet.has(num.trim().toLowerCase());
  const denTermHi = !fracHi && termSet.has(den.trim().toLowerCase());
  const signTermHi =
    sign && ((sign === '+' && termSet.has('+')) || (sign !== '+' && (termSet.has('−') || termSet.has('-'))));

  const hiNum = highlightTarget === 'numerador' || highlightTarget === 'num';
  const hiDen = highlightTarget === 'denominador' || highlightTarget === 'num';
  const hiSign = highlightTarget === 'neg' && sign !== '+';

  return (
    <span className="inline-flex items-center gap-1.5 font-math">
      {sign && (
        <span
          className={`inline-block font-bold transition-all duration-300 ${
            sign === '+' ? 'text-slate-700' : 'text-red-600'
          } ${size === 'xl' ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} ${
            signTermHi
              ? 'scale-150 bg-amber-200 ring-2 ring-amber-500 rounded px-1 shadow-sm'
              : hiSign
                ? 'scale-150 bg-red-100 ring-2 ring-red-500 rounded px-1'
                : ''
          }`}
        >
          {sign === '-' ? '−' : sign}
        </span>
      )}
      <span
        className={`inline-flex flex-col items-center justify-center transition-all duration-300 ${dim} ${
          fracHi ? 'scale-110 bg-amber-100 ring-2 ring-amber-500 rounded-xl px-2.5 py-1.5 shadow-sm' : ''
        }`}
      >
        <span
          className={`text-blue-700 font-semibold leading-none pb-1.5 px-2 transition-all duration-300 ${
            numTermHi
              ? 'scale-125 bg-amber-200 ring-2 ring-amber-500 text-slate-950 rounded-lg py-1 mb-1'
              : hiNum && !fracHi
                ? 'scale-125 bg-blue-100 ring-2 ring-blue-500 rounded-lg py-1 mb-1'
                : ''
          }`}
        >
          {num}
        </span>
        <span className="w-full h-[2.5px] bg-slate-800 rounded-full" />
        <span
          className={`text-blue-700 font-semibold leading-none pt-1.5 px-2 transition-all duration-300 ${
            denTermHi
              ? 'scale-125 bg-amber-200 ring-2 ring-amber-500 text-slate-950 rounded-lg py-1 mt-1'
              : hiDen && !fracHi
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
