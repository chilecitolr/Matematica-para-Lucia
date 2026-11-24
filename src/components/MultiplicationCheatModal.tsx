import React, { useState } from 'react';
import { Grid3X3, Hash, Sparkles, X } from 'lucide-react';

interface MultiplicationCheatModalProps {
  open: boolean;
  onClose: () => void;
}

const TABLE_TRICKS: Record<number, string> = {
  1: 'Todo número multiplicado por 1 queda igual.',
  2: 'Multiplicar por 2 es sumar el número dos veces (el doble). Siempre termina en par.',
  3: 'Podés pensarlo como el doble del número más una vez más ese número.',
  4: 'Truco: calculá el doble y después el doble otra vez (× 2 y × 2).',
  5: 'Siempre termina en 0 o en 5. Nunca falla.',
  6: 'Es la tabla del 3 duplicada (o la del 5 más una vez el número).',
  7: 'Si te trabás en 7 × 8 = 56, acordate: 5, 6, 7, 8 → 56 = 7 × 8.',
  8: 'Truco: multiplicá por 10 y restale el doble del número.',
  9: 'Las cifras del resultado siempre suman 9 (ej: 9 × 4 = 36 → 3 + 6 = 9).',
  10: 'Solo agregás un 0 al final del número.',
};

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export const MultiplicationCheatModal: React.FC<MultiplicationCheatModalProps> = ({
  open,
  onClose,
}) => {
  const [tab, setTab] = useState<'por-tabla' | 'pitagorica'>('por-tabla');
  const [selectedTable, setSelectedTable] = useState<number | 'todas'>(6);
  const [highlightedCell, setHighlightedCell] = useState<{ r: number; c: number }>({
    r: 6,
    c: 7,
  });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Machete de tablas de multiplicar"
    >
      <div className="bg-white rounded-2xl border-2 border-blue-300 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6 bg-blue-50 border-b border-blue-200">
          <div>
            <h2 className="font-display text-base sm:text-xl font-bold text-slate-900">
              Machete · Tablas de multiplicar (1 al 10)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Usalo tranquilo para verificar cuentas o buscar rápido una multiplicación.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar tablas de multiplicar"
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-blue-100 text-slate-700 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex flex-wrap items-center gap-2 px-4 sm:px-6 py-3 bg-slate-50 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setTab('por-tabla')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-xl border text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              tab === 'por-tabla'
                ? 'bg-blue-700 border-blue-900 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Hash className="w-4 h-4" />
            <span>Por tabla (1 al 10)</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('pitagorica')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-xl border text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              tab === 'pitagorica'
                ? 'bg-blue-700 border-blue-900 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            <span>Cuadro pitagórico + Signos</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {tab === 'por-tabla' ? (
            <div className="space-y-4">
              {/* Selector buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {NUMBERS.map((n) => {
                  const active = selectedTable === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setSelectedTable(n)}
                      className={`min-w-[52px] min-h-[42px] px-3 py-1.5 rounded-xl border-2 font-math font-bold text-sm transition-colors cursor-pointer ${
                        active
                          ? 'bg-blue-700 border-blue-950 text-white ring-2 ring-blue-300 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-800 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      × {n}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setSelectedTable('todas')}
                  className={`px-3.5 min-h-[42px] py-1.5 rounded-xl border-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                    selectedTable === 'todas'
                      ? 'bg-emerald-700 border-emerald-950 text-white ring-2 ring-emerald-300 shadow-sm'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                  }`}
                >
                  Ver todas juntas
                </button>
              </div>

              {selectedTable === 'todas' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {NUMBERS.map((tableNum) => (
                    <div
                      key={tableNum}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-1.5"
                    >
                      <div className="font-display font-bold text-sm text-blue-900 border-b border-slate-200 pb-1">
                        Tabla del {tableNum}
                      </div>
                      <div className="space-y-1 font-math text-sm">
                        {NUMBERS.map((mult) => (
                          <div
                            key={mult}
                            className="flex items-center justify-between gap-2 px-2 py-0.5 rounded-lg bg-white border border-slate-100"
                          >
                            <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-blue-800 font-semibold">
                              {tableNum} × {mult}
                            </span>
                            <span className="text-slate-500 font-bold">=</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold min-w-[2.4rem] text-center">
                              {tableNum * mult}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-950">
                    <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Truco de la tabla del {selectedTable}: </strong>
                      <span>{TABLE_TRICKS[selectedTable]}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {NUMBERS.map((mult) => (
                      <div
                        key={mult}
                        className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-math text-base sm:text-lg"
                      >
                        <span className="px-3 py-1 rounded-xl bg-sky-50 border border-sky-300 text-blue-800 font-bold">
                          {selectedTable} × {mult}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 font-bold">
                          =
                        </span>
                        <span className="px-3.5 py-1 rounded-xl bg-emerald-50 border-2 border-emerald-400 text-emerald-800 font-bold min-w-[3.4rem] text-center">
                          {selectedTable * mult}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Live selected readout */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs sm:text-sm text-slate-600 font-medium">
                  Tocá cualquier casillero para ver su multiplicación:
                </div>
                <div className="flex items-center gap-2 font-math text-lg sm:text-2xl font-bold">
                  <span className="px-3 py-1 rounded-xl bg-sky-50 border border-sky-300 text-blue-800">
                    {highlightedCell.r} × {highlightedCell.c}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800">=</span>
                  <span className="px-3.5 py-1 rounded-xl bg-emerald-50 border-2 border-emerald-400 text-emerald-800">
                    {highlightedCell.r * highlightedCell.c}
                  </span>
                </div>
              </div>

              {/* 10x10 Grid */}
              <div className="overflow-x-auto pb-1">
                <table className="w-full min-w-[520px] border-collapse font-math text-xs sm:text-sm text-center">
                  <thead>
                    <tr>
                      <th className="p-2 bg-slate-800 text-white rounded-tl-lg font-bold">×</th>
                      {NUMBERS.map((c) => {
                        const isCol = highlightedCell.c === c;
                        return (
                          <th
                            key={c}
                            className={`p-2 border border-slate-200 font-bold transition-colors ${
                              isCol
                                ? 'bg-blue-700 text-white'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {c}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {NUMBERS.map((r) => {
                      const isRow = highlightedCell.r === r;
                      return (
                        <tr key={r}>
                          <th
                            className={`p-2 border border-slate-200 font-bold transition-colors ${
                              isRow
                                ? 'bg-blue-700 text-white'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {r}
                          </th>
                          {NUMBERS.map((c) => {
                            const isExact = highlightedCell.r === r && highlightedCell.c === c;
                            const isCross = isRow || highlightedCell.c === c;
                            return (
                              <td key={c} className="p-0 border border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => setHighlightedCell({ r, c })}
                                  onMouseEnter={() => setHighlightedCell({ r, c })}
                                  className={`w-full py-2 px-1 transition-colors cursor-pointer font-semibold ${
                                    isExact
                                      ? 'bg-emerald-600 text-white font-bold ring-2 ring-inset ring-emerald-900'
                                      : isCross
                                        ? 'bg-sky-100 text-blue-950'
                                        : r === c
                                          ? 'bg-amber-50/70 text-slate-900'
                                          : 'bg-white text-slate-700 hover:bg-blue-50'
                                  }`}
                                >
                                  {r * c}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Regla de signos machete */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
                <div className="font-display text-sm font-bold text-slate-900">
                  Machete extra · Regla de signos (multiplicación y división)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-math text-sm">
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-slate-200">
                    <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-slate-800">
                      (+) × (+)
                    </span>
                    <span className="font-bold text-slate-500">=</span>
                    <span className="px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-400 text-emerald-800 font-bold">
                      (+) Igual signo → +
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-slate-200">
                    <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-red-700">
                      (−) × (−)
                    </span>
                    <span className="font-bold text-slate-500">=</span>
                    <span className="px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-400 text-emerald-800 font-bold">
                      (+) Igual signo → +
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-slate-200">
                    <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-slate-800">
                      (+) × <span className="text-red-600">(−)</span>
                    </span>
                    <span className="font-bold text-slate-500">=</span>
                    <span className="px-2.5 py-0.5 rounded bg-red-50 border border-red-300 text-red-700 font-bold">
                      (−) Distinto signo → −
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-slate-200">
                    <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-slate-800">
                      <span className="text-red-600">(−)</span> × (+)
                    </span>
                    <span className="font-bold text-slate-500">=</span>
                    <span className="px-2.5 py-0.5 rounded bg-red-50 border border-red-300 text-red-700 font-bold">
                      (−) Distinto signo → −
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
