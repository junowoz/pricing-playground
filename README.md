# Pricing Playground

Uma ferramenta interativa para simular, calcular e visualizar estratégias de precificação para planos e assinaturas.

## 📱 Live Demo

Execute o projeto localmente e acesse em: `http://localhost:3000`

## 🚀 Funcionalidades

- **Gerenciamento de Planos:**

  - Adicione, edite e remova planos
  - Configure preço base e período (mensal, trimestral, anual)

- **Simulações de Preço:**

  - Aplique descontos para períodos não-mensais
  - Ajuste global de preços com controle percentual
  - Arredondamento para valores psicologicamente atrativos

- **Visualização de Resultados:**

  - Veja todos os planos e preços calculados
  - Receitas mensais e totais estimadas

- **Sugestão de Preço:**

  - Assistente interativo baseado em segmento e concorrência
  - Recomendações baseadas em melhores práticas de mercado

- **Design Responsivo:**
  - Interface otimizada para dispositivos móveis e desktop
  - Suporte a modo claro/escuro

## 🛠️ Tecnologias Utilizadas

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Utilitários CSS
- **Shadcn/UI** - Componentes de UI
- **Zustand** - Gerenciamento de estado

## 📋 Como Usar

### Simulador de Preços

1. Configure o desconto para planos não-mensais (%)
2. Ajuste o percentual global de preços (+/-)
3. Escolha arredondar para cima ou para baixo se desejar
4. Adicione seus planos com nome, preço base e período
5. Visualize automaticamente os resultados calculados

### Recomendação de Preço

1. Selecione o segmento do seu produto (básico, intermediário, premium)
2. Adicione os preços de concorrentes como referência
3. Receba uma recomendação de preço baseada nos dados fornecidos
4. Adicione o preço recomendado como um novo plano (opcional)

## 🚀 Executando Localmente

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/pricing-playground.git

# Entre no diretório
cd pricing-playground

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

## 📝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

## 📜 Licença

Este projeto está licenciado sob a licença MIT.
