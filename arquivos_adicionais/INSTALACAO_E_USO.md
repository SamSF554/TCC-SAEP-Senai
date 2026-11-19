# Instalação, configuração e utilização — UrbanLink Flow

Este guia serve à reprodução acadêmica do projeto. **A aplicação publicada já utiliza Vercel + Supabase; os comandos a seguir não precisam ser executados para acessar o site existente.**

## 1. Requisitos

- Node.js 18 ou superior e npm (recomenda-se uma versão LTS do Node.js).
- Git e navegador atualizado.
- **Para testar localmente:** SQLite em arquivo, utilizado automaticamente pelo Sequelize, sem instalar servidor de banco.
- **Para reproduzir o ambiente de produção:** um projeto Supabase com PostgreSQL e URL privada de conexão.

Repositório: https://github.com/SamSF554/TesteSaep

## 2. Obter o código e instalar dependências

```bash
git clone https://github.com/SamSF554/TesteSaep.git
cd TesteSaep
npm ci
```

O comando `npm ci` usa as dependências registradas em `package-lock.json`. Os arquivos HTML, CSS, JS e SVG estão em `public/`; o servidor e a API Express estão em `src/`.

## 3. Configuração local (SQLite)

1. Faça uma cópia de `.env.example` com o nome `.env` (Linux/macOS: `cp .env.example .env`; PowerShell: `Copy-Item .env.example .env`).
2. Preencha `JWT_SECRET` com uma sequência aleatória e exclusiva de **pelo menos 32 caracteres**.
3. Troque `ADMIN_PASSWORD` por uma senha exclusiva de **pelo menos 12 caracteres**. Use `ADMIN_EMAIL` para definir o e-mail do administrador local.
4. Mantenha `USE_SQLITE=true`, `DB_SYNC_ALTER=false` e deixe `DATABASE_URL` ausente/comentada.
5. Execute:

```bash
npm start
```

Acesse **http://localhost:3000/**. A rota **http://localhost:3000/api/health** retorna `{"status":"ok","banco":"conectado"}` quando o servidor e o banco estão preparados.

Em modo de desenvolvimento, `npm run dev` utiliza o `nodemon` se ele estiver instalado no ambiente (o projeto atual não o declara como dependência; caso não esteja, prefira `npm start`).

> Se a porta 3000 estiver ocupada, altere `PORT` no `.env`. Não publique o arquivo `.env` no GitHub.

## 4. Banco PostgreSQL / Supabase e scripts SQL

Os arquivos pedidos para a entrega estão nesta pasta:

| Arquivo | O que faz | Onde executar |
| --- | --- | --- |
| [`00_criar_banco_local.sql`](00_criar_banco_local.sql) | Cria um banco `urbanlink_flow` | PostgreSQL local/autogerenciado, conectado a um banco administrativo; **não** no Supabase |
| [`01_criar_tabelas.sql`](01_criar_tabelas.sql) | Cria as 4 tabelas, chaves, índices e RLS | Banco PostgreSQL **novo**, inclusive Supabase SQL Editor |
| [`02_inserir_dados.sql`](02_inserir_dados.sql) | Insere 3 produtos e 2 veículos fictícios | Banco novo, após as tabelas |

### Exemplo em PostgreSQL local

```bash
psql -U postgres -d postgres -f arquivos_adicionais/00_criar_banco_local.sql
psql -U postgres -d urbanlink_flow -f arquivos_adicionais/01_criar_tabelas.sql
psql -U postgres -d urbanlink_flow -f arquivos_adicionais/02_inserir_dados.sql
```

O arquivo `00` é um exemplo para atender à criação do banco; **o backend atual aplica SSL com CA do Supabase quando recebe `DATABASE_URL`**, portanto não está configurado para usar essa URL com um PostgreSQL local sem ajustes na camada de conexão. Para executar o site localmente sem essas alterações, siga a seção SQLite. Para rodar sobre PostgreSQL pelo backend, configure um projeto Supabase.

### Exemplo em um NOVO projeto Supabase

1. Crie o projeto em https://supabase.com/dashboard (o banco já vem criado).
2. Abra **SQL Editor** e execute apenas `01_criar_tabelas.sql`; depois `02_inserir_dados.sql`.
3. Em **Connect**, copie a URL privada do **Transaction pooler**.
4. Configure no ambiente do servidor `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` e `DB_SYNC_ALTER=false`. Remova ou desative `USE_SQLITE`.
5. Instale as dependências e execute `npm start`, se estiver executando o backend localmente.

**Não execute scripts em um banco de produção já populado.** O site atual possui banco configurado e não precisa de recriação. Os scripts foram incluídos para documentação e reprodução, não como operação de migração.

## 5. Variáveis de ambiente

| Variável | Obrigatória? | Uso |
| --- | --- | --- |
| `JWT_SECRET` | Sim | Assinatura dos tokens JWT; >= 32 caracteres |
| `ADMIN_EMAIL` | Para criar/gerenciar admin | E-mail da conta administrativa |
| `ADMIN_PASSWORD` | Para criar/gerenciar admin | Senha do admin; >= 12 caracteres; sincronizada com o banco ao iniciar |
| `DATABASE_URL` | Com Supabase | URL privada do pooler PostgreSQL, com credenciais; **Secret** |
| `USE_SQLITE` | Opcional | `true` para SQLite local, sem `DATABASE_URL` |
| `DB_SYNC_ALTER` | Opcional | Mantenha `false` em produção |
| `PORT` | Opcional | Porta local, padrão 3000 |

Em Vercel, configure as variáveis no painel **Settings → Environment Variables → Production** e faça um novo deploy após alterar segredos. Não envie `.env`, `DATABASE_URL` ou a senha administrativa para repositórios ou páginas públicas. O arquivo `.env.example` é um modelo sem valores reais.

## 6. Como utilizar o sistema

1. **Visitação:** abra a [aplicação publicada](https://projeto-integrador-senai-saep.vercel.app/) ou a instalação local.
2. **Cadastro:** em `usuario.html` (pessoa) ou `empresas.html` (empresa), crie uma conta que terá perfil `operador`.
3. **Login:** em `login.html`, entre com a conta cadastrada. Um administrador utiliza o **mesmo** formulário de login com o e-mail/senha configurados no servidor.
4. **Estoque (admin):** em `estoque.html`, cadastre produtos, veja quantidades e inclua novas remessas.
5. **Frota (admin):** em `veiculos.html`, registre os veículos disponíveis e suas capacidades.
6. **Entregas:** em `entregas.html`, selecione produto, informe destino, quantidade e rastreio. É preciso haver estoque suficiente; o registro abate as unidades solicitadas.
7. **Gestão (admin):** em `admin.html`, consulte entregas, associe veículos e altere status entre `pendente`, `em_transito` e `entregue`.
8. **Simulação:** em `simulacao.html`, visualize a demonstração de trajeto. **Não** representa distâncias ou tráfego reais.

Operadores enxergam apenas as próprias entregas. As operações administrativas dependem de autenticação e autorização JWT no backend. O campo `peso_kg` é utilizado no projeto como quantidade de unidades (nome legado), e o registro de entregas pela API é transacional.

## 7. Solução rápida de problemas

- **503 / erro de banco:** confira `DATABASE_URL`, SSL, disponibilidade do Supabase e logs do servidor.
- **Login administrativo inválido:** verifique o e-mail e `ADMIN_PASSWORD` do ambiente do servidor; após alterar na Vercel, gere novo deploy. Não há senha padrão no repositório.
- **`nodemon` não encontrado:** use `npm start` ou instale-o como ferramenta de desenvolvimento.
- **Operador não vê páginas administrativas:** comportamento esperado; apenas perfis `administrador` têm permissão.
- **O mapa não exibe localização real:** a simulação atual é ilustrativa, não há geolocalização ou API de trânsito em tempo real.

## 8. Documentação dos dados

- [Modelagem conceitual](../documentacao/modelagem_conceitual.md)
- [Modelagem lógica](../documentacao/modelagem_logica.md)
- [Diagrama Entidade-Relacionamento (DER)](../documentacao/DER.md)
