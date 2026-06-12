# Formula Data

O **Formula Data** é uma aplicação web para consulta e gerenciamento de dados
históricos da Fórmula 1. O sistema oferece dashboards, relatórios e ações
específicas para três perfis de usuário:

- **Administrador:** visualiza dados gerais e cadastra pilotos e escuderias.
- **Piloto:** acompanha seus resultados e seu resumo de desempenho.
- **Escuderia:** consulta seus pilotos e resultados e pode importar pilotos.

O projeto é um monorepo gerenciado com pnpm. O banco é inicializado com dados
históricos fornecidos pelos arquivos CSV em `backend/database/csvs/`.

## Tecnologias

### Frontend

- React 19 e TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack React Query e TanStack React Table
- Axios
- Zustand

### Backend

- Node.js e TypeScript
- Express 5
- PostgreSQL 16
- `pg` para acesso ao banco com SQL
- JWT para autenticação

### Infraestrutura

- pnpm workspaces
- Docker e Docker Compose
- pgAdmin opcional

## Estrutura do projeto

```text
.
|-- backend/
|   |-- database/       # Estrutura SQL, scripts de carga e arquivos CSV
|   `-- src/            # API REST, rotas, serviços e acesso ao PostgreSQL
|-- frontend/
|   `-- src/            # Interface React, páginas, componentes e integração com a API
|-- package.json        # Scripts compartilhados do monorepo
`-- pnpm-workspace.yaml
```

## Requisitos

Antes de iniciar, instale:

- [Node.js](https://nodejs.org/) 20 ou superior;
- [pnpm](https://pnpm.io/installation);
- [Docker](https://docs.docker.com/get-docker/);
- Docker Compose v2, disponível pelo comando `docker compose`.

Confira as instalações:

```bash
node --version
pnpm --version
docker --version
docker compose version
```

## Execução local

Todos os comandos desta seção devem ser executados na raiz do repositório.

### 1. Instale as dependências

```bash
pnpm install
```

### 2. Inicie o PostgreSQL

```bash
pnpm db:up
```

O comando cria um container PostgreSQL e aguarda o banco ficar disponível na
porta `5432`.

### 3. Crie a estrutura do banco

```bash
pnpm db:structure
```

### 4. Carregue os dados iniciais

```bash
pnpm db:load
```

Essa etapa importa os arquivos CSV, ajusta os relacionamentos e cria os
usuários iniciais. A carga pode levar alguns minutos, pois processa mais de
150 mil registros.

> Execute `db:structure` e `db:load` apenas na primeira inicialização ou após
> limpar completamente a estrutura do banco.

### 5. Inicie o frontend e o backend

```bash
pnpm dev
```

O comando inicia as duas aplicações em paralelo:

| Serviço | URL |
| --- | --- |
| Frontend | <http://localhost:5173> |
| API | <http://localhost:3000> |
| Status da API | <http://localhost:3000/health> |
| Conexão com o banco | <http://localhost:3000/db/ping> |

Também é possível iniciar cada aplicação separadamente:

```bash
pnpm dev:backend
pnpm dev:frontend
```

## Acesso ao sistema

Depois da carga inicial, utilize a conta administrativa:

```text
Login: admin
Senha: admin
```

Também são criadas contas com base nos dados importados:

| Perfil | Login | Senha |
| --- | --- | --- |
| Piloto | `<driver_ref>_d` | `<driver_ref>` |
| Escuderia | `<constructor_ref>_c` | `<constructor_ref>` |

Por exemplo, um piloto cujo `driver_ref` seja `hamilton` acessa com o login
`hamilton_d` e a senha `hamilton`.

## Variáveis de ambiente

O projeto funciona localmente sem arquivos `.env`, usando os valores padrão
abaixo. As variáveis podem ser definidas para personalizar a execução.

### Backend

Crie `backend/.env` quando precisar alterar a API ou sua conexão com o banco:

```dotenv
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/f1db
JWT_SECRET=troque-esta-chave-em-ambientes-compartilhados
```

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `PORT` | `3000` | Porta HTTP da API. |
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5432/f1db` | Conexão com o PostgreSQL. |
| `JWT_SECRET` | `development-secret` | Chave usada para assinar os tokens JWT. |

### Frontend

Crie `frontend/.env` para apontar a interface para outra URL da API:

```dotenv
VITE_API_URL=http://localhost:3000
```

### PostgreSQL e pgAdmin

As variáveis abaixo podem ser exportadas no terminal antes de executar os
comandos do banco ou definidas em `backend/.env` para o Docker Compose:

```dotenv
POSTGRES_PORT=5432
POSTGRES_DB=f1db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
PGADMIN_PORT=8080
PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=admin
```

Ao alterar usuário, senha, banco ou porta do PostgreSQL, atualize também a
`DATABASE_URL` do backend com os mesmos valores.

## pgAdmin opcional

Para iniciar o pgAdmin:

```bash
pnpm db:pgadmin
```

Acesse <http://localhost:8080> e entre com:

```text
E-mail: admin@admin.com
Senha: admin
```

Ao cadastrar o servidor PostgreSQL no pgAdmin, use:

```text
Host: postgres
Porta: 5432
Banco: f1db
Usuário: postgres
Senha: postgres
```

## Comandos disponíveis

| Comando | Descrição |
| --- | --- |
| `pnpm dev` | Inicia frontend e backend em modo de desenvolvimento. |
| `pnpm dev:frontend` | Inicia somente o frontend. |
| `pnpm dev:backend` | Inicia somente o backend. |
| `pnpm typecheck` | Verifica os tipos TypeScript de todo o monorepo. |
| `pnpm --filter frontend build` | Gera o build de produção do frontend. |
| `pnpm --filter backend build` | Compila o backend para `backend/dist/`. |
| `pnpm db:up` | Inicia o container PostgreSQL. |
| `pnpm db:structure` | Cria tabelas, restrições, funções e gatilhos. |
| `pnpm db:load` | Importa os CSVs e cria os usuários da aplicação. |
| `pnpm db:clean` | Remove os dados carregados, preservando a estrutura. |
| `pnpm db:clean:structure` | Remove a estrutura do banco. |
| `pnpm db:pgadmin` | Inicia o pgAdmin. |
| `pnpm db:down` | Encerra os containers do projeto. |

## Reinicialização do banco

Para apagar os dados e reconstruir o banco mantendo o volume do PostgreSQL:

```bash
pnpm db:clean
pnpm db:clean:structure
pnpm db:structure
pnpm db:load
```

Os comandos de limpeza removem dados do banco. Não os execute em uma base que
contenha informações que precisem ser preservadas.

Para apenas encerrar os containers:

```bash
pnpm db:down
```

## Solução de problemas

### Porta em uso

Se as portas `3000`, `5173`, `5432` ou `8080` já estiverem ocupadas:

- altere `PORT` no `backend/.env` e `VITE_API_URL` no `frontend/.env`;
- altere `POSTGRES_PORT` ou `PGADMIN_PORT` no `backend/.env`;
- encerre o processo ou container que estiver utilizando a porta.

### API não conecta ao banco

1. Confirme que o PostgreSQL está ativo com `docker compose -f backend/docker-compose.yml ps`.
2. Acesse <http://localhost:3000/db/ping>.
3. Confira se a `DATABASE_URL` corresponde às credenciais do Docker Compose.
4. Consulte os logs com `docker compose -f backend/docker-compose.yml logs postgres`.

### Tabelas ou dados ausentes

Execute os comandos na ordem correta:

```bash
pnpm db:up
pnpm db:structure
pnpm db:load
```

Se uma carga anterior ficou incompleta, utilize o procedimento de
reinicialização do banco antes de tentar novamente.

### Alterações em variáveis não foram aplicadas

Reinicie o processo correspondente. Para alterações do PostgreSQL, pode ser
necessário recriar a base, pois as credenciais iniciais do container ficam
armazenadas no volume Docker.
