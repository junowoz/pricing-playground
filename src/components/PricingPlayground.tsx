"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { usePricingStore } from "../lib/pricing-store";
import { PlanItem } from "./PlanItem";
import { QuizPrecos } from "./QuizPrecos";
import { SimulacaoReceita } from "./SimulacaoReceita";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { BILLING_PERIODS } from "../lib/pricing-utils";
import html2canvas from "html2canvas";

export default function PricingPlayground() {
  // Get state from store
  const {
    planos,
    addPlano,
    desconto,
    setDesconto,
    ajuste,
    setAjuste,
    arredondamento,
    setArredondamento,
    tabAtiva,
    setTabAtiva,
    mostrarPrecoAnual,
    toggleMostrarPrecoAnual,
  } = usePricingStore();

  // Local state
  const [novoPlano, setNovoPlano] = useState<{
    nome: string;
    precoBase: number;
    periodo: "mensal" | "trimestral" | "anual";
  }>({
    nome: "",
    precoBase: 0,
    periodo: "mensal",
  });

  // Proportional pricing state
  const [proporcaoAtiva, setProporcaoAtiva] = useState(false);
  const [planoBase, setPlanoBase] = useState<string | null>(null);
  const [multiplicador, setMultiplicador] = useState(1.5);

  // Handler for adding a new plan
  function handleAddPlano() {
    if (!novoPlano.nome || novoPlano.precoBase <= 0) return;

    addPlano({
      nome: novoPlano.nome,
      precoBase: novoPlano.precoBase,
      periodo: novoPlano.periodo,
    });

    setNovoPlano({
      nome: "",
      precoBase: 0,
      periodo: "mensal",
    });
  }

  // Apply proportional pricing
  function aplicarProporcao() {
    if (!planoBase || !proporcaoAtiva || planos.length < 2) return;

    const planoReferencia = planos.find((p) => p.id === planoBase);
    if (!planoReferencia) return;

    const precoBase = planoReferencia.precoBase;

    // Update other plans based on the base plan
    planos.forEach((plano) => {
      if (plano.id !== planoBase) {
        const novoPreco = precoBase * multiplicador;
        usePricingStore.getState().updatePlano(plano.id, {
          precoBase: Math.round(novoPreco),
        });
      }
    });
  }

  // Export plans as image
  const exportarPlanos = async () => {
    const planosElement = document.getElementById("planos-container");
    if (!planosElement) return;

    try {
      const canvas = await html2canvas(planosElement);
      const image = canvas.toDataURL("image/png");

      // Create download link
      const link = document.createElement("a");
      link.href = image;
      link.download = "pricing-plans.png";
      link.click();
    } catch (error) {
      console.error("Erro ao exportar planos:", error);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Pricing Playground
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300 text-sm">
            Simule, calcule e planeje sua estratégia de precificação
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportarPlanos}>
            Exportar Planos
          </Button>
          <ThemeSwitcher />
        </div>
      </header>

      <Tabs
        defaultValue="simulador"
        value={tabAtiva}
        onValueChange={setTabAtiva}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="simulador">Simulador</TabsTrigger>
          <TabsTrigger value="simulacao">Simulação Financeira</TabsTrigger>
          <TabsTrigger value="recomendacao">Recomendação</TabsTrigger>
        </TabsList>

        <TabsContent value="simulador" className="space-y-6">
          <Card className="bg-white dark:bg-neutral-900 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Desconto para planos não-mensais (%)</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        min={0}
                        max={50}
                        step={1}
                        value={[desconto]}
                        onValueChange={([v]) => setDesconto(v)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        min={0}
                        max={50}
                        value={desconto}
                        onChange={(e) => setDesconto(Number(e.target.value))}
                        className="w-16"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Ajuste global de preços (%)</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        min={-50}
                        max={50}
                        step={1}
                        value={[ajuste]}
                        onValueChange={([v]) => setAjuste(v)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        min={-50}
                        max={50}
                        value={ajuste}
                        onChange={(e) => setAjuste(Number(e.target.value))}
                        className="w-16"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Label className="min-w-max">Arredondamento global:</Label>
                  <Select
                    value={arredondamento || "none"}
                    onValueChange={(v) =>
                      setArredondamento(
                        v === "none" ? null : (v as "up" | "down")
                      )
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sem arredondamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem arredondamento</SelectItem>
                      <SelectItem value="up">Para cima</SelectItem>
                      <SelectItem value="down">Para baixo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="mostrar-preco-anual"
                    checked={mostrarPrecoAnual}
                    onCheckedChange={toggleMostrarPrecoAnual}
                  />
                  <Label
                    htmlFor="mostrar-preco-anual"
                    className="cursor-pointer"
                  >
                    Mostrar equivalente anual
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="proporcao-ativa"
                    checked={proporcaoAtiva}
                    onCheckedChange={setProporcaoAtiva}
                  />
                  <Label htmlFor="proporcao-ativa" className="cursor-pointer">
                    Usar precificação proporcional
                  </Label>
                </div>

                {proporcaoAtiva && (
                  <div className="mt-2 space-y-4 bg-neutral-50 dark:bg-neutral-800 p-3 rounded-md">
                    <div className="space-y-2">
                      <Label>Plano de referência</Label>
                      <Select
                        value={planoBase || ""}
                        onValueChange={setPlanoBase}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um plano" />
                        </SelectTrigger>
                        <SelectContent>
                          {planos.map((plano) => (
                            <SelectItem key={plano.id} value={plano.id}>
                              {plano.nome} - {plano.precoBase}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Multiplicador para outros planos</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          min={0.5}
                          max={5}
                          step={0.1}
                          value={[multiplicador]}
                          onValueChange={([v]) => setMultiplicador(v)}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          min={0.5}
                          max={5}
                          step={0.1}
                          value={multiplicador}
                          onChange={(e) =>
                            setMultiplicador(Number(e.target.value))
                          }
                          className="w-16"
                        />
                      </div>
                      <p className="text-xs text-neutral-500">
                        Os outros planos serão {multiplicador}x o preço do plano
                        de referência
                      </p>
                    </div>

                    <Button
                      onClick={aplicarProporcao}
                      disabled={!planoBase || planos.length < 2}
                      className="w-full"
                    >
                      Aplicar proporção
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card
            id="planos-container"
            className="bg-white dark:bg-neutral-900 shadow-md"
          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Planos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {planos.map((plan) => (
                  <PlanItem key={plan.id} planId={plan.id} />
                ))}

                <div className="flex flex-col sm:flex-row gap-2 mt-4 border-t pt-4">
                  <Input
                    value={novoPlano.nome}
                    onChange={(e) =>
                      setNovoPlano((p) => ({ ...p, nome: e.target.value }))
                    }
                    className="flex-1 sm:max-w-[150px]"
                    placeholder="Nome do plano"
                  />
                  <Input
                    type="number"
                    min={0}
                    value={novoPlano.precoBase || ""}
                    onChange={(e) =>
                      setNovoPlano((p) => ({
                        ...p,
                        precoBase: Number(e.target.value),
                      }))
                    }
                    className="flex-1 sm:max-w-[100px]"
                    placeholder="Preço base"
                  />
                  <Select
                    value={novoPlano.periodo}
                    onValueChange={(v: "mensal" | "trimestral" | "anual") =>
                      setNovoPlano((p) => ({ ...p, periodo: v }))
                    }
                  >
                    <SelectTrigger className="flex-1 sm:w-[140px]">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      {BILLING_PERIODS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddPlano}
                    className="whitespace-nowrap"
                  >
                    Adicionar Plano
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulacao">
          <SimulacaoReceita />
        </TabsContent>

        <TabsContent value="recomendacao">
          <QuizPrecos />
        </TabsContent>
      </Tabs>

      <footer className="mt-8 pt-6 border-t text-center text-sm text-neutral-500 dark:text-neutral-400">
        <p>
          Pricing Playground v2.0 - Ferramenta para simulação de precificação
        </p>
      </footer>
    </div>
  );
}
