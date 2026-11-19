# UrbanLink Flow — Sistema de Gestão Logística

**Projeto Integrador SENAI | 2026**

O **UrbanLink Flow** é uma aplicação web de apoio à logística urbana. A plataforma reúne cadastro de usuários e empresas, gestão de produtos em estoque, controle de veículos, solicitações e acompanhamento de entregas e uma simulação visual de rotas. Os recursos de gestão são separados por perfil de acesso, permitindo que operadores acompanhem suas solicitações enquanto administradores gerenciam a operação.

## Links do projeto

| Item da entrega | Acesso |
| --- | --- |
| **Site publicado e funcional** | **https://urbanlink-saep.vercel.app/** |
| **Código-fonte (GitHub)** | **https://github.com/SamSF554/TCC-SAEP-Senai** |
| Modelagem conceitual | [Abrir documentação](documentacao/modelagem_conceitual.md) |
| Modelagem lógica | [Abrir documentação](documentacao/modelagem_logica.md) |
| Diagrama Entidade-Relacionamento (DER) | [Visualizar DER](documentacao/DER.md) |
| Scripts SQL e instruções de uso | [Arquivos adicionais](arquivos_adicionais/INSTALACAO_E_USO.md) |

## Objetivo do sistema

Organizar tarefas comuns de uma operação de entregas em um ambiente único, apoiando:

- Registro de pedidos e identificação por código de rastreio.
- Visibilidade da quantidade disponível de produtos e seu consumo por entrega.
- Cadastro e associação de veículos à operação.
- Acompanhamento e atualização do andamento das entregas.
- Separação de permissões entre **operador** e **administrador**.

O sistema foi desenvolvido para **demonstração e fins educacionais**. A simulação visual de trajeto e os valores de distância/tempo são ilustrativos; não representam uma consulta de trânsito ou roteirização em tempo real.

## Funcionalidades

| Módulo | Funcionalidades | Acesso |
| --- | --- | --- |
| Cadastro | Criar conta pessoal ou corporativa; o cadastro público recebe perfil `operador` | Público |
| Autenticação | Login unificado, senha com hash bcrypt, sessão via JWT e controle de permissões | Operador e administrador |
| Entregas | Solicitar entregas com destino, código de rastreio, produto e quantidade; consultar entregas do próprio usuário | Operador e administrador |
| Estoque | Cadastrar produtos, consultar quantidades e receber novas remessas | Administrador |
| Frota | Cadastrar e consultar veículos e suas capacidades | Administrador |
| Painel de gestão | Associar veículo e alterar estado de entrega (`pendente`, `em_transito`, `entregue`) | Administrador |
| Simulação | Exibir visualização SVG ilustrativa de trajeto, distância e tempo demonstrativos | Público |

O registro de uma entrega pelo servidor verifica a disponibilidade do produto e desconta o estoque **na mesma transação**, evitando quantidades negativas. Os endpoints privados verificam o token JWT e as permissões do perfil.

## Tecnologias utilizadas

| Camada | Tecnologias |
| --- | --- |
| Frontend | **HTML5, CSS3, JavaScript**, Fetch API, ilustrações/elementos **SVG** |
| Backend | **Node.js**, **Express.js 4** e API HTTP/JSON |
| Persistência e modelos | **PostgreSQL no Supabase**, **Sequelize 6**, driver `pg` |
| Autenticação e segurança | **bcrypt**, **JSON Web Token (JWT)**, variáveis de ambiente com `dotenv` |
| Hospedagem | **Vercel** (site e backend Express) |
| Versionamento | **Git e GitHub** |

O código também permite **SQLite local** para desenvolvimento e possui suporte opcional a MySQL. **O banco do site publicado é PostgreSQL no Supabase**.

## Modelagem do banco de dados

O banco tem **quatro tabelas principais**:

| Tabela | Responsabilidade | Identificadores e vínculos |
| --- | --- | --- |
| `Usuarios` | Identificação, autenticação e perfil de acesso | `id` (PK), `email` único |
| `Produtos` | Itens e quantidades em estoque | `id` (PK), `codigo` único |
| `Veiculos` | Frota, capacidade e disponibilidade | `id` (PK), `placa` única |
| `Entregas` | Pedidos, rastreio, destino, quantidade e estado | `id` (PK), `codigo_rastreio` único; `usuario_id`, `produto_id`, `veiculo_id` (FKs) |

Cada entrega pode se relacionar a **um usuário**, **um produto** e **um veículo**; cada um desses registros pode participar de **várias entregas** ao longo do tempo. As chaves estrangeiras são anuláveis na estrutura atual para manter compatibilidade com dados antigos. O fluxo normal de cadastro exige produto e associa o usuário autenticado; a alocação de veículo pode ocorrer posteriormente.

> **Nota de modelagem:** o atributo de entrega `peso_kg` tem um nome legado. Na implementação atual, seu valor é usado como **quantidade de unidades do produto**, não como medida física de peso. A documentação preserva o nome real da coluna e explica seu significado.

Documentos exigidos para a entrega:

1. [**Modelagem conceitual** — entidades e regras de relacionamento](documentacao/modelagem_conceitual.md).
2. [**Modelagem lógica** — esquema, tipos de dados, PK, FK, regras e dicionário](documentacao/modelagem_logica.md).
3. [**Diagrama Entidade-Relacionamento (DER)** — diagrama renderizado em Mermaid](documentacao/DER.md).

## Estrutura do repositório

```text
TCC-SAEP-Senai/
├── README.md
├── .env.example                 # Modelo de ambiente, sem senhas reais
├── package.json
├── package-lock.json
├── public/                      # HTML, CSS, JavaScript e SVG do site
├── src/
│   ├── app.js                   # Inicialização Express, rotas e banco
│   ├── config/                  # Conexão PostgreSQL, SQLite ou MySQL
│   ├── models/                  # Usuario, Produto, Veiculo, Entrega
│   ├── controllers/             # Regras de negócio
│   ├── middlewares/             # Autenticação e autorização
│   ├── routes/                  # Endpoints HTTP
│   └── utils/                   # Validações compartilhadas
├── documentacao/
│   ├── modelagem_conceitual.md
│   ├── modelagem_logica.md
│   └── DER.md
└── arquivos_adicionais/
    ├── 00_criar_banco_local.sql
    ├── 01_criar_tabelas.sql
    ├── 02_inserir_dados.sql
    └── INSTALACAO_E_USO.md
```

O repositório também contém o guia histórico de deploy (`GUIA_DEPLOY_VERCEL_SUPABASE.md`) e o relatório de melhorias anteriores (`RELATORIO_MELHORIAS.md`).

## Instalação e execução

Para uma instalação **local simples** (SQLite), é necessário Node.js 18+ e npm:

```bash
git clone https://github.com/SamSF554/TCC-SAEP-Senai.git
cd TCC-SAEP-Senai
npm ci
```

Copie `.env.example` para `.env` e **substitua** `JWT_SECRET` por um valor aleatório com pelo menos 32 caracteres e `ADMIN_PASSWORD` por uma senha forte com pelo menos 12 caracteres. Para SQLite, mantenha `USE_SQLITE=true` e deixe `DATABASE_URL` ausente.

```bash
npm start
```

Depois, abra **http://localhost:3000/**. A rota **`/api/health`** permite verificar a conexão com o banco. Para uso remoto, visite o [site publicado na Vercel](https://urbanlink-saep.vercel.app/).

Para reproduzir o PostgreSQL, executar os scripts SQL, configurar o Supabase ou entender os passos de cada perfil, consulte o **[guia completo de instalação e uso](arquivos_adicionais/INSTALACAO_E_USO.md)**.

## Scripts SQL para a entrega

1. [`00_criar_banco_local.sql`](arquivos_adicionais/00_criar_banco_local.sql): cria um banco PostgreSQL **local/autogerenciado**, não executável no Supabase SQL Editor.
2. [`01_criar_tabelas.sql`](arquivos_adicionais/01_criar_tabelas.sql): cria as tabelas, o enum de status, as FKs, as restrições, os índices e habilita RLS num banco PostgreSQL **novo**.
3. [`02_inserir_dados.sql`](arquivos_adicionais/02_inserir_dados.sql): insere **produtos e veículos fictícios** de demonstração, sem usuários, senhas ou dados pessoais.

**Atenção:** esses arquivos documentam a reprodução acadêmica do banco. **Não execute scripts de criação ou de inserção no banco de produção já em funcionamento.** Para criar usuários e entregas reais, utilize a própria aplicação, que aplica hashes e regras de estoque.

## Perfis e segurança

- **Operador:** conta criada pelos formulários públicos; solicita e consulta suas entregas.
- **Administrador:** conta configurada no servidor por `ADMIN_EMAIL` e `ADMIN_PASSWORD` (não existe senha administrativa padrão no código); gerencia estoque, frota e entregas.
- Os segredos, a URL privada do banco e a senha administrativa devem ficar nas **variáveis de ambiente** do servidor, nunca no frontend, no `.env.example` ou no repositório.
- O Supabase armazena os dados; **a autenticação desta aplicação é implementada no backend Express com bcrypt e JWT**, e não pela interface Supabase Auth.

---

**Projeto Integrador SENAI — UrbanLink Flow (2026).** Repositório e aplicação disponibilizados para avaliação acadêmica.
