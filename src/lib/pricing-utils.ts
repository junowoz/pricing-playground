// Pricing utility functions

// Common psychological price points (99, 199, 299, etc)
export const PSYCHOLOGICAL_PRICES = [
  9, 19, 29, 39, 49, 59, 69, 79, 89, 99, 109, 119, 129, 139, 149, 159, 169, 179,
  189, 199, 209, 219, 229, 239, 249, 259, 269, 279, 289, 299, 349, 399, 449,
  499, 549, 599, 649, 699, 749, 799, 849, 899, 949, 999, 1499, 1999, 2499, 2999,
  4999, 9999,
];

// Common price endings (for custom rounding)
export const PRICE_ENDINGS = ["9", "99", "95", "90", "0", "5"];

// Billing period definitions
export const BILLING_PERIODS = [
  { value: "mensal", label: "Mensal", monthMultiplier: 1 },
  { value: "trimestral", label: "Trimestral", monthMultiplier: 3 },
  { value: "anual", label: "Anual", monthMultiplier: 12 },
];

export type BillingPeriod = "mensal" | "trimestral" | "anual";

/**
 * Calculate the price based on base price, discount, and global adjustment
 */
export function calcularPreco(
  precoBase: number,
  periodo: BillingPeriod,
  desconto: number,
  ajuste: number
): number {
  let preco = precoBase;

  // Apply discount for non-monthly plans
  if (periodo === "trimestral" || periodo === "anual") {
    preco = preco * (1 - desconto / 100);
  }

  // Apply global adjustment
  preco = preco * (1 + ajuste / 100);

  return preco;
}

/**
 * Round to a psychologically attractive price point
 */
export function arredondarPsicologico(
  valor: number,
  direcao: "up" | "down"
): number {
  if (direcao === "up") {
    // Find the nearest psychological price that is >= the value
    for (const p of PSYCHOLOGICAL_PRICES) {
      if (p >= valor) return p;
    }
    // If no match found, round up to nearest 9 ending
    const intPart = Math.floor(valor);
    if (intPart === valor) {
      return intPart + 9;
    }
    return intPart + 9;
  } else {
    // Find the nearest psychological price that is <= the value
    for (let i = PSYCHOLOGICAL_PRICES.length - 1; i >= 0; i--) {
      if (PSYCHOLOGICAL_PRICES[i] <= valor) return PSYCHOLOGICAL_PRICES[i];
    }
    // If no match found, round down to nearest 9 ending
    const intPart = Math.floor(valor);
    if (intPart === valor) {
      return intPart - 1;
    }
    return intPart - 1;
  }
}

/**
 * Round to nearest value with a specific ending
 */
export function arredondarComTerminacao(
  valor: number,
  terminacao: string
): number {
  // Convert to string and extract whole number part
  const valorStr = valor.toString();
  const dotIndex = valorStr.indexOf(".");
  const intPart =
    dotIndex > -1
      ? parseInt(valorStr.substring(0, dotIndex))
      : parseInt(valorStr);

  // Handle different endings
  if (terminacao === "9") {
    if (valor >= intPart + 0.9) {
      return intPart + 0.9;
    } else {
      return intPart - 1 + 0.9;
    }
  } else if (terminacao === "99") {
    if (valor >= intPart + 0.99) {
      return intPart + 0.99;
    } else {
      return intPart - 1 + 0.99;
    }
  } else if (terminacao === "95") {
    if (valor >= intPart + 0.95) {
      return intPart + 0.95;
    } else {
      return intPart - 1 + 0.95;
    }
  } else if (terminacao === "90") {
    if (valor >= intPart + 0.9) {
      return intPart + 0.9;
    } else {
      return intPart - 1 + 0.9;
    }
  } else if (terminacao === "0") {
    return Math.round(valor);
  } else if (terminacao === "5") {
    return Math.round(valor / 5) * 5;
  }

  // Default fallback
  return valor;
}

/**
 * Convert monthly price to annual price
 */
export function mensalParaAnual(
  precoMensal: number,
  descontoAnual: number
): number {
  return precoMensal * 12 * (1 - descontoAnual / 100);
}

/**
 * Calculate profit margin based on revenue, expenses and volumes
 */
export function calcularLucratividade(
  receita: number,
  custos: { [categoria: string]: number }
): { margem: number; lucro: number; gastoTotal: number } {
  const gastoTotal = Object.values(custos).reduce((acc, val) => acc + val, 0);
  const lucro = receita - gastoTotal;
  const margem = receita > 0 ? (lucro / receita) * 100 : 0;

  return { margem, lucro, gastoTotal };
}

/**
 * Generate pricing recommendations based on market positioning and costs
 */
export function gerarRecomendacaoPreco(
  segmento: "basico" | "intermediario" | "premium",
  concorrentes: number[],
  custos: number = 0,
  valorPercebido: number = 3, // Scale 1-5
  margemAlvo: number = 30 // Target profit margin in %
): { preco: number; justificativa: string } {
  // Calculate average of competitor prices
  const mediaPrecosConcorrentes =
    concorrentes.length > 0
      ? concorrentes.reduce((acc, val) => acc + val, 0) / concorrentes.length
      : 0;

  // Base price calculation
  let precoBase = 0;
  let justificativa = "";

  // Calculate minimum viable price based on costs
  const precoMinimo = custos > 0 ? custos / (1 - margemAlvo / 100) : 0;

  // Recommend price based on segment positioning
  switch (segmento) {
    case "basico":
      precoBase = Math.max(precoMinimo, mediaPrecosConcorrentes * 0.7);
      justificativa =
        "Preço competitivo para segmento básico, posicionado abaixo da média dos concorrentes.";
      break;
    case "intermediario":
      precoBase = Math.max(precoMinimo, mediaPrecosConcorrentes);
      justificativa =
        "Preço alinhado com a média do mercado para segmento intermediário.";
      break;
    case "premium":
      precoBase = Math.max(precoMinimo, mediaPrecosConcorrentes * 1.5);
      justificativa =
        "Preço premium posicionado acima da média dos concorrentes para destacar qualidade superior.";
      break;
    default:
      precoBase = Math.max(precoMinimo, mediaPrecosConcorrentes);
      justificativa = "Preço baseado na média do mercado.";
  }

  // Adjust based on perceived value
  const ajusteValorPercebido = (valorPercebido - 3) * 10; // -20% to +20%
  precoBase = precoBase * (1 + ajusteValorPercebido / 100);

  // Ensure minimum price covers costs with margin
  if (precoBase < precoMinimo && custos > 0) {
    precoBase = precoMinimo;
    justificativa += " Ajustado para garantir a margem de lucro mínima.";
  }

  // Round to a "nice" number
  const precoFinal = arredondarPsicologico(precoBase, "up");

  return {
    preco: precoFinal,
    justificativa:
      justificativa +
      (precoFinal > precoBase
        ? " Arredondado para um valor psicologicamente atrativo."
        : ""),
  };
}

/**
 * Format currency value as Brazilian Real
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}
