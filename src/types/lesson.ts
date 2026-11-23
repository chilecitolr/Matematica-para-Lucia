export type TokenKind = 'num' | 'var' | 'exp' | 'neg' | 'op' | 'text';

export type PedagogicalPhase =
  | 'concepto'
  | 'que-pide'
  | 'datos'
  | 'operacion'
  | 'regla'
  | 'paso'
  | 'resultado'
  | 'comprobar'
  | 'practica'
  | 'cierre';

export type VisualDiagram =
  | {
      type: 'fraction-intro';
      slices: number;
      total: number;
      style: 'pizza' | 'chocolate';
      caption: string;
    }
  | {
      type: 'fraction-add-same';
      leftNum: number;
      rightNum: number;
      den: number;
      op: '+' | '-';
      showSum: boolean;
    }
  | {
      type: 'fraction-common-denom';
      left: [number, number];
      right: [number, number];
      commonDen: number;
      op: '+' | '-';
      stage: 'original' | 'converted' | 'solved';
    }
  | {
      type: 'fraction-flip';
      first: string;
      secondNum: string;
      secondDen: string;
      flipped: boolean;
      signNote?: string;
      result?: string;
    }
  | {
      type: 'power-visual';
      base: string;
      exp: number;
      expanded: string;
      result: string;
      warningCompare?: string;
    }
  | {
      type: 'root-visual';
      kind: 'square' | 'cube';
      radicandNum: number;
      rootNum: number;
      radicandDen?: number;
      rootDen?: number;
      isNegative?: boolean;
    }
  | {
      type: 'order-checklist';
      activeStep: 1 | 2 | 3 | 4 | 5;
      expression: string;
      stepNote: string;
    }
  | {
      type: 'monomio-parts';
      sign?: string;
      coeff: string;
      vars: Array<{ letter: string; exp?: string }>;
      degree: number;
      note?: string;
    }
  | {
      type: 'monomio-table';
      revealedRows: number;
      activeRow: number;
    }
  | {
      type: 'apples-pears';
      leftLabel: string;
      leftKind: 'same-a' | 'different-b';
      rightLabel: string;
      rightKind: 'same-a' | 'different-b';
      sameFamily: boolean;
      resultLabel: string;
    }
  | {
      type: 'exponent-flow';
      mode: 'multiply' | 'divide';
      coeffA: string;
      coeffB: string;
      coeffResult: string;
      baseVar: string;
      expA: number;
      expB: number;
    }
  | {
      type: 'rectangle-area';
      widthLabel: string;
      heightLabel: string;
      areaLabel: string;
      showResult: boolean;
    }
  | {
      type: 'steps-board';
      exerciseTag: string;
      lines: Array<{
        label?: string;
        math: string;
        focus?: boolean;
        note?: string;
      }>;
    }
  | {
      type: 'practice-challenge';
      promptMath: string;
      question: string;
      hint: string;
      options: Array<{
        id: string;
        label: string;
        isCorrect: boolean;
        feedback: string;
      }>;
      solutionSteps: string[];
    }
  | {
      type: 'final-summary';
    };

export interface LessonScene {
  id: string;
  phase: PedagogicalPhase;
  headline: string;
  keyMessage: string;
  narration: string;
  durationSeconds: number;
  diagram: VisualDiagram;
  supportPhrase?: string;
}

export interface Chapter {
  id: string;
  number: number;
  videoGroupId: 'video-1' | 'video-2' | 'video-3' | 'video-4';
  title: string;
  activityRef: string;
  shortDesc: string;
  scenes: LessonScene[];
}

export interface VideoModule {
  id: 'video-1' | 'video-2' | 'video-3' | 'video-4';
  shortLabel: string;
  title: string;
  subtitle: string;
  chapterNumbers: number[];
}
