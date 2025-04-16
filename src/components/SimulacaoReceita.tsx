"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { usePricingStore } from "../lib/pricing-store";
import { calcularLucratividade, formatarMoeda } from "../lib/pricing-utils";

export function SimulacaoReceita() {
  const { planos, simulacao, setSimulacao, setCusto } = usePricingStore();

  // Handle client count change
  const handleQuantidadeClientesChange = (quantidade: number) => {
    setSimulacao({ quantidadeClientes: quantidade });
  };

  // Handle cost percentage change
  const handleCustoChange = (
    categoria: keyof typeof simulacao.custos,
    valor: number
  ) => {
    setCusto(categoria, valor);
  };

  // Calculate total costs percentage
  const totalCustos = Object.values(simulacao.custos).reduce(
    (acc, val) => acc + val,
    0
  );

  // Calculate monthly and annual revenue
  const calcularReceita = () => {
    let receitaMensal = 0;
    let receitaAnual = 0;
    let receitaMediaPorCliente = 0;

    // Assume even distribution of customers across plans unless specified otherwise
    const clientesPorPlano = simulacao.quantidadeClientes / planos.length;

    planos.forEach((plano) => {
      let precoMensal = plano.precoBase;

      // Calculate monthly price based on period
      if (plano.periodo === "trimestral") {
        precoMensal = plano.precoBase / 3;
      } else if (plano.periodo === "anual") {
        precoMensal = plano.precoBase / 12;
      }

      const receitaPorPlano = precoMensal * clientesPorPlano;
      receitaMensal += receitaPorPlano;
    });

    receitaAnual = receitaMensal * 12;
    receitaMediaPorCliente =
      simulacao.quantidadeClientes > 0
        ? receitaMensal / simulacao.quantidadeClientes
        : 0;

    return {
      mensal: receitaMensal,
      anual: receitaAnual,
      mediaPorCliente: receitaMediaPorCliente,
    };
  };

  // Get revenue calculations
  const receita = calcularReceita();

  // Calculate costs and profit
  const custosMensais = Object.entries(simulacao.custos).map(
    ([categoria, percentual]) => {
      const valor = receita.mensal * (percentual / 100);
      return { categoria, percentual, valor };
    }
  );

  const lucratividade = calcularLucratividade(
    receita.mensal,
    Object.fromEntries(
      custosMensais.map(({ categoria, valor }) => [categoria, valor])
    )
  );

  return (
    <Card className="bg-white dark:bg-neutral-900 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Simulação de Receita
        </CardTitle>
        <CardDescription className="text-neutral-600 dark:text-neutral-300 text-sm">
          Simule sua receita, custos e lucratividade com base nos planos
          definidos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Cliente section */}
          <div className="space-y-3">
            <Label>Quantidade de clientes</Label>
            <div className="flex items-center gap-2">
              <Slider
                min={0}
                max={1000}
                step={10}
                value={[simulacao.quantidadeClientes]}
                onValueChange={([v]) => handleQuantidadeClientesChange(v)}
                className="flex-1"
              />
              <Input
                type="number"
                min={0}
                value={simulacao.quantidadeClientes}
                onChange={(e) =>
                  handleQuantidadeClientesChange(parseInt(e.target.value) || 0)
                }
                className="w-20"
              />
            </div>
          </div>

          {/* Receita overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-md">
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Receita Mensal
              </div>
              <div className="text-xl font-bold">
                {formatarMoeda(receita.mensal)}
              </div>
            </div>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-md">
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Receita Anual
              </div>
              <div className="text-xl font-bold">
                {formatarMoeda(receita.anual)}
              </div>
            </div>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-md">
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Média por Cliente
              </div>
              <div className="text-xl font-bold">
                {formatarMoeda(receita.mediaPorCliente)}/mês
              </div>
            </div>
          </div>

          {/* Custos section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Estrutura de custos</Label>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Total: {totalCustos}%{" "}
                {totalCustos > 100 ? "(⚠️ Atenção: acima de 100%)" : ""}
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(simulacao.custos).map(([categoria, valor]) => (
                <div key={categoria} className="space-y-1">
                  <div className="flex justify-between">
                    <Label className="text-sm capitalize">
                      {categoria} (%)
                    </Label>
                    <span className="text-sm text-neutral-500">
                      {formatarMoeda(receita.mensal * (valor / 100))}/mês
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[valor]}
                      onValueChange={([v]) =>
                        handleCustoChange(
                          categoria as keyof typeof simulacao.custos,
                          v
                        )
                      }
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={valor}
                      onChange={(e) =>
                        handleCustoChange(
                          categoria as keyof typeof simulacao.custos,
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-16"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lucro section */}
          <div className="border-t pt-4 space-y-3">
            <Label>Resultado financeiro</Label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-md">
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  Lucro/Prejuízo Mensal
                </div>
                <div
                  className={`text-xl font-bold ${
                    lucratividade.lucro >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatarMoeda(lucratividade.lucro)}
                </div>
              </div>
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-md">
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  Margem de Lucro
                </div>
                <div
                  className={`text-xl font-bold ${
                    lucratividade.margem >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {lucratividade.margem.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              {lucratividade.margem < 0 &&
                "⚠️ Prejuízo: Seus custos estão superiores à receita."}
              {lucratividade.margem >= 0 &&
                lucratividade.margem < 10 &&
                "⚠️ Margem de lucro baixa. Considere revisar seus preços ou custos."}
              {lucratividade.margem >= 10 &&
                lucratividade.margem < 20 &&
                "Margem de lucro razoável, mas pode ser melhorada."}
              {lucratividade.margem >= 20 &&
                lucratividade.margem < 30 &&
                "Boa margem de lucro, dentro da média para muitos negócios."}
              {lucratividade.margem >= 30 && "Excelente margem de lucro!"}
            </div>
          </div>

          {/* Resumo mensal/anual */}
          <div className="border-t pt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-semibold">Item</th>
                  <th className="text-right py-2 font-semibold">Mensal</th>
                  <th className="text-right py-2 font-semibold">Anual</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Receita Bruta</td>
                  <td className="py-2 text-right">
                    {formatarMoeda(receita.mensal)}
                  </td>
                  <td className="py-2 text-right">
                    {formatarMoeda(receita.anual)}
                  </td>
                </tr>
                {custosMensais.map(({ categoria, valor }) => (
                  <tr key={categoria} className="border-b">
                    <td className="py-2 capitalize">{categoria}</td>
                    <td className="py-2 text-right">{formatarMoeda(valor)}</td>
                    <td className="py-2 text-right">
                      {formatarMoeda(valor * 12)}
                    </td>
                  </tr>
                ))}
                <tr className="font-bold">
                  <td className="py-2">Lucro Líquido</td>
                  <td className="py-2 text-right">
                    {formatarMoeda(lucratividade.lucro)}
                  </td>
                  <td className="py-2 text-right">
                    {formatarMoeda(lucratividade.lucro * 12)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
