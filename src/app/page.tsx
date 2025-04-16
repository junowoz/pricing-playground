import PricingPlayground from "@/components/PricingPlayground";

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Pricing Playground
            </h1>
            <p className="text-muted-foreground mt-1">
              Simule, compare e otimize suas estratégias de preço
            </p>
          </div>
        </header>

        <PricingPlayground />
      </div>
    </main>
  );
}
