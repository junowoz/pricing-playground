"use client";

import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { usePricingStore } from "../lib/pricing-store";
import {
  BILLING_PERIODS,
  PRICE_ENDINGS,
  calcularPreco,
  arredondarPsicologico,
  arredondarComTerminacao,
  mensalParaAnual,
  formatarMoeda,
  BillingPeriod,
} from "../lib/pricing-utils";

interface PlanItemProps {
  planId: string;
}

export function PlanItem({ planId }: PlanItemProps) {
  const {
    planos,
    updatePlano,
    removePlano,
    toggleArredondamento,
    setTipoArredondamento,
    setTerminacaoArredondamento,
    desconto,
    ajuste,
    arredondamento: arredondamentoGlobal,
    terminacao: terminacaoGlobal,
    mostrarPrecoAnual,
  } = usePricingStore();

  const plano = planos.find((p) => p.id === planId);

  if (!plano) return null;

  // Calculate base price and final price
  const calcularPrecoFinal = () => {
    let precoFinal = calcularPreco(
      plano.precoBase,
      plano.periodo,
      desconto,
      ajuste
    );

    // Apply individual rounding if active
    if (plano.arredondamento.ativo) {
      if (plano.arredondamento.tipo === "up") {
        precoFinal = arredondarPsicologico(precoFinal, "up");
      } else if (plano.arredondamento.tipo === "down") {
        precoFinal = arredondarPsicologico(precoFinal, "down");
      } else if (plano.arredondamento.tipo === "terminacao") {
        precoFinal = arredondarComTerminacao(
          precoFinal,
          plano.arredondamento.terminacao
        );
      }
    }
    // Apply global rounding if individual is not active
    else if (arredondamentoGlobal) {
      if (arredondamentoGlobal === "up") {
        precoFinal = arredondarPsicologico(precoFinal, "up");
      } else if (arredondamentoGlobal === "down") {
        precoFinal = arredondarPsicologico(precoFinal, "down");
      } else if (arredondamentoGlobal === "terminacao") {
        precoFinal = arredondarComTerminacao(precoFinal, terminacaoGlobal);
      }
    }

    return precoFinal;
  };

  const precoFinal = calcularPrecoFinal();

  // Calculate annual price if needed
  const precoAnual =
    plano.periodo === "anual"
      ? precoFinal
      : plano.periodo === "trimestral"
      ? precoFinal * 4 // 12 meses / 3 = 4 pagamentos
      : mensalParaAnual(precoFinal, desconto); // Aplicar o desconto definido

  return (
    <Card className="overflow-hidden border p-0">
      <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-start">
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-1">
          {/* Plan name */}
          <Input
            value={plano.nome}
            onChange={(e) => updatePlano(plano.id, { nome: e.target.value })}
            className="max-w-full sm:max-w-[150px]"
            placeholder="Nome do plano"
          />

          {/* Base price */}
          <Input
            type="number"
            min={0}
            value={plano.precoBase}
            onChange={(e) =>
              updatePlano(plano.id, { precoBase: Number(e.target.value) })
            }
            className="max-w-full sm:max-w-[100px]"
            placeholder="Preço base"
          />

          {/* Period selection */}
          <Select
            value={plano.periodo}
            onValueChange={(v: BillingPeriod) =>
              updatePlano(plano.id, { periodo: v })
            }
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BILLING_PERIODS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Price display */}
          <div className="flex-1 flex flex-col gap-1">
            <div className="text-sm font-semibold">
              {formatarMoeda(precoFinal)}{" "}
              <span className="text-xs font-normal text-neutral-500">
                {plano.periodo !== "mensal" ? "/" + plano.periodo : "/mês"}
              </span>
            </div>

            {/* Annual equivalent price if showing annual prices and not already annual */}
            {mostrarPrecoAnual && plano.periodo !== "anual" && (
              <div className="text-xs text-neutral-500">
                Anual: {formatarMoeda(precoAnual)}
                {plano.periodo === "mensal" &&
                  desconto > 0 &&
                  ` (${formatarMoeda(
                    precoAnual / 12
                  )}/mês com ${desconto}% de desconto)`}
                {plano.periodo === "mensal" &&
                  desconto === 0 &&
                  ` (${formatarMoeda(precoAnual / 12)}/mês)`}
              </div>
            )}
          </div>
        </div>

        {/* Rounding and actions */}
        <div className="w-full sm:w-auto flex flex-wrap sm:flex-nowrap gap-2 items-center justify-between">
          {/* Rounding controls */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={
                  plano.arredondamento.ativo
                    ? "bg-neutral-100 dark:bg-neutral-800"
                    : ""
                }
              >
                Arredondar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor={`arredondar-${plano.id}`}
                    className="cursor-pointer"
                  >
                    Arredondamento individual
                  </Label>
                  <Switch
                    id={`arredondar-${plano.id}`}
                    checked={plano.arredondamento.ativo}
                    onCheckedChange={(checked) =>
                      toggleArredondamento(plano.id, checked)
                    }
                  />
                </div>

                {plano.arredondamento.ativo && (
                  <div className="space-y-3">
                    <div className="flex flex-col gap-2">
                      <Label>Tipo de arredondamento</Label>
                      <Select
                        value={plano.arredondamento.tipo}
                        onValueChange={(v) =>
                          setTipoArredondamento(
                            plano.id,
                            v as "up" | "down" | "terminacao"
                          )
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="up">Para cima</SelectItem>
                          <SelectItem value="down">Para baixo</SelectItem>
                          <SelectItem value="terminacao">
                            Terminação específica
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {plano.arredondamento.tipo === "terminacao" && (
                      <div className="flex flex-col gap-2">
                        <Label>Terminação</Label>
                        <Select
                          value={plano.arredondamento.terminacao}
                          onValueChange={(v) =>
                            setTerminacaoArredondamento(plano.id, v)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PRICE_ENDINGS.map((ending) => (
                              <SelectItem key={ending} value={ending}>
                                {ending === "9"
                                  ? "0,90"
                                  : ending === "99"
                                  ? "0,99"
                                  : ending === "95"
                                  ? "0,95"
                                  : ending === "90"
                                  ? "0,90"
                                  : ending === "0"
                                  ? "Inteiro"
                                  : ending === "5"
                                  ? "Múltiplo de 5"
                                  : ending}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Remove button */}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => removePlano(plano.id)}
          >
            Remover
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
