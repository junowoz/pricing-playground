import { create } from "zustand";
import { BillingPeriod } from "./pricing-utils";

// Plan interface with expanded options
export interface Plan {
  id: string;
  nome: string;
  precoBase: number;
  periodo: BillingPeriod;
  arredondamento: {
    ativo: boolean;
    tipo: "up" | "down" | "terminacao";
    terminacao: string; // For custom endings like "99", "9", etc.
  };
}

// Quiz response interface for price recommendations
export interface QuizRespostas {
  segmento: "basico" | "intermediario" | "premium";
  concorrentes: number[];
  custoUnitario: number;
  margemAlvo: number;
  valorPercebido: number; // 1-5 scale
  recursosPrincipais: string[];
}

// Business simulation data
export interface SimulacaoNegocio {
  quantidadeClientes: number;
  custos: {
    operacoes: number; // % of revenue
    tecnologia: number; // % of revenue
    marketing: number; // % of revenue
    salarios: number; // % of revenue
    impostos: number; // % of revenue
    outros: number; // % of revenue
  };
}

// Pricing state interface
export interface PricingState {
  // Plans
  planos: Plan[];
  setPlanos: (planos: Plan[]) => void;
  addPlano: (plano: Omit<Plan, "id" | "arredondamento">) => void;
  removePlano: (id: string) => void;
  updatePlano: (id: string, updates: Partial<Omit<Plan, "id">>) => void;
  toggleArredondamento: (id: string, ativo: boolean) => void;
  setTipoArredondamento: (
    id: string,
    tipo: "up" | "down" | "terminacao"
  ) => void;
  setTerminacaoArredondamento: (id: string, terminacao: string) => void;

  // Discount settings
  desconto: number; // % discount for quarterly/yearly plans
  setDesconto: (desconto: number) => void;

  // Global adjustment
  ajuste: number; // global adjustment in %
  setAjuste: (ajuste: number) => void;

  // Global rounding
  arredondamento: null | "up" | "down" | "terminacao";
  terminacao: string;
  setArredondamento: (
    arredondamento: null | "up" | "down" | "terminacao"
  ) => void;
  setTerminacao: (terminacao: string) => void;

  // Business simulation
  simulacao: SimulacaoNegocio;
  setSimulacao: (updates: Partial<SimulacaoNegocio>) => void;
  setCusto: (
    categoria: keyof SimulacaoNegocio["custos"],
    valor: number
  ) => void;

  // Quiz responses
  quizRespostas: Partial<QuizRespostas>;
  setQuizRespostas: (respostas: Partial<QuizRespostas>) => void;

  // Mode
  modoDark: boolean;
  toggleModoDark: () => void;

  // View settings
  mostrarPrecoAnual: boolean;
  toggleMostrarPrecoAnual: () => void;

  // Active tab tracking
  tabAtiva: string;
  setTabAtiva: (tab: string) => void;
}

// Create pricing store
export const usePricingStore = create<PricingState>((set) => ({
  // Initial plans
  planos: [
    {
      id: "1",
      nome: "Exemplo",
      precoBase: 149,
      periodo: "mensal",
      arredondamento: {
        ativo: false,
        tipo: "up",
        terminacao: "9",
      },
    },
  ],

  // Plans actions
  setPlanos: (planos) => set({ planos }),

  addPlano: (plano) =>
    set((state) => ({
      planos: [
        ...state.planos,
        {
          ...plano,
          id: Date.now().toString(),
          arredondamento: {
            ativo: false,
            tipo: "up",
            terminacao: "9",
          },
        },
      ],
    })),

  removePlano: (id) =>
    set((state) => ({
      planos: state.planos.filter((p) => p.id !== id),
    })),

  updatePlano: (id, updates) =>
    set((state) => ({
      planos: state.planos.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  toggleArredondamento: (id, ativo) =>
    set((state) => ({
      planos: state.planos.map((p) =>
        p.id === id
          ? { ...p, arredondamento: { ...p.arredondamento, ativo } }
          : p
      ),
    })),

  setTipoArredondamento: (id, tipo) =>
    set((state) => ({
      planos: state.planos.map((p) =>
        p.id === id
          ? { ...p, arredondamento: { ...p.arredondamento, tipo } }
          : p
      ),
    })),

  setTerminacaoArredondamento: (id, terminacao) =>
    set((state) => ({
      planos: state.planos.map((p) =>
        p.id === id
          ? { ...p, arredondamento: { ...p.arredondamento, terminacao } }
          : p
      ),
    })),

  // Initial discount (20%)
  desconto: 20,
  setDesconto: (desconto) => set({ desconto }),

  // Initial adjustment (0%)
  ajuste: 0,
  setAjuste: (ajuste) => set({ ajuste }),

  // Initial rounding (none)
  arredondamento: null,
  terminacao: "9",
  setArredondamento: (arredondamento) => set({ arredondamento }),
  setTerminacao: (terminacao) => set({ terminacao }),

  // Business simulation
  simulacao: {
    quantidadeClientes: 100,
    custos: {
      operacoes: 10,
      tecnologia: 15,
      marketing: 20,
      salarios: 25,
      impostos: 15,
      outros: 5,
    },
  },

  setSimulacao: (updates) =>
    set((state) => ({
      simulacao: { ...state.simulacao, ...updates },
    })),

  setCusto: (categoria, valor) =>
    set((state) => ({
      simulacao: {
        ...state.simulacao,
        custos: {
          ...state.simulacao.custos,
          [categoria]: valor,
        },
      },
    })),

  // Quiz responses
  quizRespostas: {
    margemAlvo: 30,
    valorPercebido: 3,
  },

  setQuizRespostas: (respostas) =>
    set((state) => ({
      quizRespostas: { ...state.quizRespostas, ...respostas },
    })),

  // Mode (light/dark)
  modoDark: false,
  toggleModoDark: () => set((state) => ({ modoDark: !state.modoDark })),

  // View settings
  mostrarPrecoAnual: true,
  toggleMostrarPrecoAnual: () =>
    set((state) => ({
      mostrarPrecoAnual: !state.mostrarPrecoAnual,
    })),

  // Active tab
  tabAtiva: "simulador",
  setTabAtiva: (tab) => set({ tabAtiva: tab }),
}));
