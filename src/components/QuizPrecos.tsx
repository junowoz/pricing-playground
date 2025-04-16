"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { usePricingStore } from "../lib/pricing-store";
import { gerarRecomendacaoPreco, formatarMoeda } from "../lib/pricing-utils";

export function QuizPrecos() {
  const { quizRespostas, setQuizRespostas, addPlano } = usePricingStore();
  const [activeTab, setActiveTab] = useState("segmento");
  const [concorrentePreco, setConcorrentePreco] = useState("");
  const [precoRecomendado, setPrecoRecomendado] = useState<null | {
    preco: number;
    justificativa: string;
  }>(null);
  const [nomeNovoPlano, setNomeNovoPlano] = useState("");
  const [recursoSelecionado, setRecursoSelecionado] = useState("");

  // Recursos disponíveis por segmento
  const recursosPorSegmento = {
    basico: [
      "Suporte por e-mail",
      "Funcionalidades principais",
      "Limite básico de uso",
    ],
    intermediario: [
      "Suporte prioritário",
      "Recursos avançados",
      "Limites maiores de uso",
      "Integrações extras",
      "Personalização básica",
    ],
    premium: [
      "Suporte 24/7",
      "Acesso a todas funcionalidades",
      "Uso ilimitado",
      "Integrações avançadas",
      "Personalização completa",
      "Gerente de conta dedicado",
      "SLA garantido",
    ],
  };

  // Add competitor price to the list
  const addConcorrentePreco = () => {
    const preco = parseFloat(concorrentePreco);
    if (!isNaN(preco) && preco > 0) {
      const concorrentes = [...(quizRespostas.concorrentes || []), preco];
      setQuizRespostas({ concorrentes });
      setConcorrentePreco("");
    }
  };

  // Remove competitor price from the list
  const removeConcorrentePreco = (index: number) => {
    const concorrentes = [...(quizRespostas.concorrentes || [])];
    concorrentes.splice(index, 1);
    setQuizRespostas({ concorrentes });
  };

  // Add feature to the list
  const addRecurso = () => {
    if (recursoSelecionado) {
      const recursos = [
        ...(quizRespostas.recursosPrincipais || []),
        recursoSelecionado,
      ];
      setQuizRespostas({ recursosPrincipais: recursos });
      setRecursoSelecionado("");
    }
  };

  // Remove feature from the list
  const removeRecurso = (index: number) => {
    const recursos = [...(quizRespostas.recursosPrincipais || [])];
    recursos.splice(index, 1);
    setQuizRespostas({ recursosPrincipais: recursos });
  };

  // Generate price recommendation
  const gerarRecomendacao = () => {
    if (quizRespostas.segmento && quizRespostas.concorrentes?.length) {
      const resultado = gerarRecomendacaoPreco(
        quizRespostas.segmento,
        quizRespostas.concorrentes,
        quizRespostas.custoUnitario || 0,
        quizRespostas.valorPercebido || 3,
        quizRespostas.margemAlvo || 30
      );
      setPrecoRecomendado(resultado);
    }
  };

  // Add recommended price as a new plan
  const adicionarComoPlano = () => {
    if (precoRecomendado && nomeNovoPlano) {
      addPlano({
        nome: nomeNovoPlano,
        precoBase: precoRecomendado.preco,
        periodo: "mensal",
      });
      setNomeNovoPlano("");
      setPrecoRecomendado(null);
      setActiveTab("segmento");
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Get available features based on selected segment
  const getRecursosDisponiveis = () => {
    if (!quizRespostas.segmento) return [];
    return recursosPorSegmento[quizRespostas.segmento] || [];
  };

  // Calculate average competitor price
  const mediaPrecosConcorrentes =
    quizRespostas.concorrentes && quizRespostas.concorrentes.length > 0
      ? quizRespostas.concorrentes.reduce((acc, val) => acc + val, 0) /
        quizRespostas.concorrentes.length
      : 0;

  return (
    <Card className="bg-white dark:bg-neutral-900 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Recomendação de Preço
        </CardTitle>
        <CardDescription className="text-neutral-600 dark:text-neutral-300 text-sm">
          Use este assistente para obter uma recomendação de preço baseada em
          técnicas reais de precificação.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="segmento">Segmento</TabsTrigger>
            <TabsTrigger value="concorrentes">Concorrentes</TabsTrigger>
            <TabsTrigger value="custos">Custos</TabsTrigger>
            <TabsTrigger value="recursos">Recursos</TabsTrigger>
          </TabsList>

          {/* Segmento Tab */}
          <TabsContent value="segmento" className="space-y-4">
            <div className="space-y-3">
              <Label>Qual segmento seu produto atende?</Label>
              <Select
                value={quizRespostas.segmento}
                onValueChange={(
                  value: "basico" | "intermediario" | "premium"
                ) => setQuizRespostas({ segmento: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o segmento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basico">
                    Básico (preço acessível)
                  </SelectItem>
                  <SelectItem value="intermediario">
                    Intermediário (preço médio)
                  </SelectItem>
                  <SelectItem value="premium">
                    Premium (preço elevado)
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="pt-2">
                <Label>Valor percebido pelo cliente (1-5)</Label>
                <div className="flex items-center mt-2 gap-2">
                  <span className="text-xs text-neutral-500">Baixo</span>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={[quizRespostas.valorPercebido || 3]}
                    onValueChange={([v]) =>
                      setQuizRespostas({ valorPercebido: v })
                    }
                    className="flex-1"
                  />
                  <span className="text-xs text-neutral-500">Alto</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  {quizRespostas.valorPercebido === 1 &&
                    "Valor percebido baixo - preço deve ser competitivo"}
                  {quizRespostas.valorPercebido === 2 &&
                    "Valor percebido abaixo da média - preço ligeiramente inferior à média"}
                  {quizRespostas.valorPercebido === 3 &&
                    "Valor percebido médio - preço alinhado com a média do mercado"}
                  {quizRespostas.valorPercebido === 4 &&
                    "Valor percebido acima da média - preço premium justificado"}
                  {quizRespostas.valorPercebido === 5 &&
                    "Valor percebido muito alto - preço premium elevado"}
                </p>
              </div>
            </div>

            <Button
              onClick={() => handleTabChange("concorrentes")}
              disabled={!quizRespostas.segmento}
              className="w-full"
            >
              Próximo: Concorrentes
            </Button>
          </TabsContent>

          {/* Concorrentes Tab */}
          <TabsContent value="concorrentes" className="space-y-4">
            <div className="space-y-2">
              <Label>Adicione os preços dos concorrentes (R$)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Preço do concorrente"
                  value={concorrentePreco}
                  onChange={(e) => setConcorrentePreco(e.target.value)}
                  min="0"
                />
                <Button onClick={addConcorrentePreco}>Adicionar</Button>
              </div>

              {quizRespostas.concorrentes &&
                quizRespostas.concorrentes.length > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center">
                      <Label>Preços adicionados:</Label>
                      <span className="text-sm text-neutral-500">
                        Média: {formatarMoeda(mediaPrecosConcorrentes)}
                      </span>
                    </div>
                    <ul className="mt-2 space-y-2">
                      {quizRespostas.concorrentes.map((preco, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center p-2 bg-neutral-100 dark:bg-neutral-800 rounded"
                        >
                          <span>{formatarMoeda(preco)}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeConcorrentePreco(index)}
                          >
                            Remover
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleTabChange("segmento")}
                className="w-1/2"
              >
                Voltar
              </Button>
              <Button
                onClick={() => handleTabChange("custos")}
                disabled={
                  !quizRespostas.concorrentes ||
                  quizRespostas.concorrentes.length === 0
                }
                className="w-1/2"
              >
                Próximo: Custos
              </Button>
            </div>
          </TabsContent>

          {/* Custos Tab */}
          <TabsContent value="custos" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label>Custo unitário (R$)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Custo unitário do seu produto/serviço"
                  value={quizRespostas.custoUnitario || ""}
                  onChange={(e) =>
                    setQuizRespostas({
                      custoUnitario: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="mt-1"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Inclua todos os custos diretamente relacionados à entrega do
                  seu produto/serviço
                </p>
              </div>

              <div>
                <Label>Margem de lucro alvo (%)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Slider
                    min={5}
                    max={80}
                    step={5}
                    value={[quizRespostas.margemAlvo || 30]}
                    onValueChange={([v]) => setQuizRespostas({ margemAlvo: v })}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={5}
                    max={80}
                    value={quizRespostas.margemAlvo || 30}
                    onChange={(e) =>
                      setQuizRespostas({
                        margemAlvo: parseFloat(e.target.value) || 30,
                      })
                    }
                    className="w-16"
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  {quizRespostas.margemAlvo &&
                    quizRespostas.margemAlvo < 20 &&
                    "Margem baixa - adequada para produtos de alta rotatividade"}
                  {quizRespostas.margemAlvo &&
                    quizRespostas.margemAlvo >= 20 &&
                    quizRespostas.margemAlvo < 40 &&
                    "Margem média - padrão para muitos produtos e serviços"}
                  {quizRespostas.margemAlvo &&
                    quizRespostas.margemAlvo >= 40 &&
                    "Margem alta - adequada para produtos premium/exclusivos"}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleTabChange("concorrentes")}
                className="w-1/2"
              >
                Voltar
              </Button>
              <Button
                onClick={() => handleTabChange("recursos")}
                className="w-1/2"
              >
                Próximo: Recursos
              </Button>
            </div>
          </TabsContent>

          {/* Recursos Tab */}
          <TabsContent value="recursos" className="space-y-4">
            {quizRespostas.segmento ? (
              <div className="space-y-3">
                <Label>Selecione os principais recursos do seu produto</Label>

                <div className="flex flex-col gap-2 mt-2">
                  <Select
                    value={recursoSelecionado}
                    onValueChange={setRecursoSelecionado}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um recurso" />
                    </SelectTrigger>
                    <SelectContent>
                      {getRecursosDisponiveis().map((recurso) => (
                        <SelectItem key={recurso} value={recurso}>
                          {recurso}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={addRecurso}
                    disabled={!recursoSelecionado}
                    variant="outline"
                    className="w-full"
                  >
                    Adicionar Recurso
                  </Button>
                </div>

                {quizRespostas.recursosPrincipais &&
                  quizRespostas.recursosPrincipais.length > 0 && (
                    <div className="mt-2">
                      <Label>Recursos selecionados:</Label>
                      <ul className="mt-2 space-y-2">
                        {quizRespostas.recursosPrincipais.map(
                          (recurso, index) => (
                            <li
                              key={index}
                              className="flex justify-between items-center p-2 bg-neutral-100 dark:bg-neutral-800 rounded"
                            >
                              <span>{recurso}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeRecurso(index)}
                              >
                                Remover
                              </Button>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            ) : (
              <div className="text-center text-neutral-500">
                Por favor, selecione um segmento primeiro.
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleTabChange("custos")}
                className="w-1/2"
              >
                Voltar
              </Button>
              <Button
                onClick={gerarRecomendacao}
                disabled={
                  !quizRespostas.segmento || !quizRespostas.concorrentes?.length
                }
                className="w-1/2"
              >
                Gerar Recomendação
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {precoRecomendado !== null && (
          <div className="mt-6 p-4 border rounded-md bg-neutral-50 dark:bg-neutral-800">
            <h3 className="font-semibold mb-2">Recomendação de Preço:</h3>
            <p className="text-2xl font-bold text-primary mb-2">
              {formatarMoeda(precoRecomendado.preco)}
            </p>

            <div className="space-y-3 mb-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                <strong>Justificativa:</strong> {precoRecomendado.justificativa}
              </p>

              {quizRespostas.custoUnitario &&
                quizRespostas.custoUnitario > 0 && (
                  <div className="text-sm">
                    <p className="text-neutral-600 dark:text-neutral-400">
                      <strong>Custo unitário:</strong>{" "}
                      {formatarMoeda(quizRespostas.custoUnitario)}
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      <strong>Margem bruta:</strong>{" "}
                      {(
                        ((precoRecomendado.preco -
                          quizRespostas.custoUnitario) /
                          precoRecomendado.preco) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                )}

              {mediaPrecosConcorrentes > 0 && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  <strong>Relação com mercado:</strong>{" "}
                  {precoRecomendado.preco < mediaPrecosConcorrentes
                    ? "Abaixo"
                    : precoRecomendado.preco > mediaPrecosConcorrentes
                    ? "Acima"
                    : "Na média"}{" "}
                  da média dos concorrentes (
                  {formatarMoeda(mediaPrecosConcorrentes)})
                </p>
              )}
            </div>

            <div className="space-y-4">
              <Label>Nome do Plano</Label>
              <Input
                placeholder="Ex: Básico, Profissional, Enterprise"
                value={nomeNovoPlano}
                onChange={(e) => setNomeNovoPlano(e.target.value)}
              />
              <Button
                onClick={adicionarComoPlano}
                disabled={!nomeNovoPlano}
                className="w-full"
              >
                Adicionar como Plano
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
