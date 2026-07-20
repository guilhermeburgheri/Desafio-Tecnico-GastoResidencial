# Controle de Gastos Residenciais

Sistema para cadastro de transações, pessoas e consulta de totais de uma residência.

O projeto foi desenvolvido com uma API em ASP.NET Core e uma interface em React. Os dados são armazenados em um banco SQLite e continuam disponíveis após a aplicação ser encerrada.


## Funcionalidades

### Pessoas

- Cadastro de pessoas;
- Listagem de pessoas cadastradas;
- Exclusão de pessoas;
- Geração automática do ID;
- Exclusão automática das transações associadas à pessoa removida.

### Transações

- Cadastro de receitas e despesas;
- Listagem das transações cadastradas;
- Geração automática do ID;
- Bloqueio de receitas para pessoas menores de 18 anos.

### Totais

- Total de receitas por pessoa;
- Total de despesas por pessoa;
- Saldo por pessoa;
- Total geral de receitas;
- Total geral de despesas;
- Saldo geral.


## Regras do sistema

- O sistema representa uma única residência com várias pessoas;
- Não existe autenticação ou controle de usuários;
- Cada transação pertence obrigatoriamente a uma pessoa;
- Valores de transações devem ser maiores que zero;
- Os valores são armazenados sempre como positivos;
- Pessoas menores de 18 anos podem cadastrar somente despesas;
- Ao excluir uma pessoa, todas as transações dela também são excluídas;


## Tecnologias

### Backend

- .NET 10;
- ASP.NET Core com Controllers;
- C#;
- Entity Framework Core 10.0.10;
- SQLite;
- Migrations do Entity Framework Core.

### Frontend

- React 19;
- TypeScript;
- Vite;
- API Fetch;
- CSS.


## Pré-requisitos

Para executar o projeto, é necessário ter instalado:

- .NET SDK 10;
- Node.js;
- npm;
- Git.

Para verificar as instalações no PowerShell:

```powershell
dotnet --version
node --version
npm --version
git --version
```


## Configuração do frontend

O endereço da API pode ser configurado pela variável:

- VITE_API_URL

Existe um arquivo de exemplo em:

- frontend/.env.example

Conteúdo padrão:

- VITE_API_URL=http://localhost:5045


## Compilação e verificação

### Backend

```powershell
dotnet build .\backend\Desafio.Api\Desafio.Api.csproj
```

### Frontend

```powershell
cd .\frontend
npm run lint
npm run build
```


## Como executar

Os comandos abaixo devem ser executados no PowerShell, a partir da raiz do repositório.

### 1. Instalar as dependências do frontend

Na primeira execução:

```powershell
cd .\frontend
npm install
cd ..
```

### 2. Executar o backend

Abra um terminal na raiz do projeto:

```powershell
dotnet run --project .\backend\Desafio.Api\Desafio.Api.csproj
```

A API será executada em:

http://localhost:5045

As migrations são aplicadas automaticamente durante a inicialização.

### 3. Executar o frontend

Abra outro terminal na raiz do projeto:

```powershell
cd .\frontend
npm run dev
```

O frontend será executado em:

http://localhost:5173

Acesse o endereço no navegador enquanto o backend e o frontend estiverem em execução.


## Validações

### Pessoa

- Nome obrigatório;
- Nome entre 2 e 100 caracteres;
- Nome não pode conter somente espaços;
- Idade entre 0 e 150 anos;
- Idade deve ser um número inteiro.

### Transação

- Descrição obrigatória;
- descrição entre 2 e 150 caracteres;
- descrição não pode conter somente espaços;
- valor deve ser maior que zero;
- tipo deve ser `Despesa` ou `Receita`;
- pessoa deve existir;
- pessoa menor de 18 anos não pode cadastrar receita.
