> **Para publicar na Vercel com Supabase, leia primeiro [`GUIA_DEPLOY_VERCEL_SUPABASE.md`](GUIA_DEPLOY_VERCEL_SUPABASE.md).**

# 🚚 UrbanLink Flow — Mobilidade & Gestão Logística Conectada

![UrbanLink Version](https://img.shields.io/badge/Revis%C3%A3o-seguran%C3%A7a%20e%20integridade-4C7026?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-202B60?style=for-the-badge&logo=nodedotjs)
![Express](https://img.shields.io/badge/Express-4.19-B6CF7B?style=for-the-badge&logo=express)
![Sequelize](https://img.shields.io/badge/Sequelize-6.37-8FACCA?style=for-the-badge&logo=sequelize)

O **UrbanLink Flow** é uma plataforma web completa para gestão logística urbana, gerenciamento de frotas, controle de estoque corporativo e simulação em tempo real de trajetos e entregas.

---

## 🌟 Destaques da Versão 9.0 (v9)

A versão **v9.0** consolidou a interface e os fluxos iniciais. Esta revisão complementa o projeto com validações no servidor e correções importantes:

- A API agora exige JWT para consultas privadas e perfil de administrador para alterações de estoque, frota e status.
- Entregas são vinculadas ao usuário autenticado; operadores só consultam as próprias entregas. Registros antigos sem proprietário ficam visíveis somente para administradores.
- O abatimento do estoque e o cadastro da entrega ocorrem na mesma transação, com atualização condicional para evitar quantidades negativas.
- O fallback de MySQL para SQLite é selecionado antes da criação dos modelos (somente em desenvolvimento).
- O simulador exibe o contrato correto da API e deixa explícito que os valores são demonstrativos.
- Não há mais senha administrativa fixa criada automaticamente. O seed passa a ser configurável.

### 🆕 O que mudou na v9.0:
1. **Limpeza e Otimização Estrutural:**
   - Remoção completa de scripts, arquivos mortos e duplicados do ecossistema.
2. **Autenticação Administrativa Restrita:**
   - Acesso exclusivo via formulário de login padrão (`login.html`). **Não há formulários públicos para cadastro de Administrador**.
3. **Sementeira Automática no Banco de Dados (`Seed`):**
   - O servidor pode criar uma conta administrativa na inicialização, mediante configuração de `ADMIN_EMAIL` e `ADMIN_PASSWORD`.
4. **Perfil `operador` Obrigatório Web:**
   - Todos os registros iniciados pelas páginas de cadastro (`usuario.html` e `empresas.html`) recebem estritamente o perfil **`operador`**.
5. **Status Inicial "Pendente":**
   - O fluxo de vida de uma entrega inicia-se por padrão como **`pendente`** (substituindo a atribuição direta para `em_transito`).
6. **Divisão Modular do Painel Administrativo:**
   - O painel administrativo foi fragmentado em páginas dedicadas e protegidas:
     - **`estoque.html`**: Cadastro de itens em galpão e suporte à botão **"+ Nova Remessa"** (validando obrigatoriamente entradas numéricas $> 0$).
     - **`veiculos.html`**: Gestão e inclusão de veículos com verificação de capacidade máxima em kg.
     - **`admin.html`**: Central de controle de entregas para alteração de status (`pendente`, `em_transito`, `entregue`) e alocação de frota.
7. **Reintegração Visual no Início:**
   - Restauração dos cards de perfis com ícones SVG estilizados e caixa de simulação rápida na página inicial (`index.html`).
8. **Simulador de Rotas SVG Animado Reativado:**
   - A página `simulacao.html` foi reintegrada utilizando o mapa interativo SVG animado, ajustado para a paleta oficial de cores do projeto.
9. **Formatação Humanizada de Interface:**
   - O sistema limpa formatações brutas do banco de dados (ex: transforma `em_transito` em **`EM TRÂNSITO`** sem traços ou underlines para visualização do usuário final).

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** com **Express.js** (Arquitetura RESTful).
- **Sequelize ORM** (Suporte nativo a **MySQL 8** e banco em memória **SQLite3**).
- **BCrypt** para hashing seguro de senhas.
- **JSON Web Token (JWT)** para autenticação de sessões.
- **Dotenv** para variáveis de ambiente.

### Frontend
- **HTML5 & CSS3** (Sistema de temas com variáveis CSS customizadas e responsividade).
- **JavaScript Vanilla (ES6+)** com consumo assíncrono via Fetch API.
- **SVG com animações CSS/JS** para cálculo e visualização de trajetos no mapa.
- **Fonte Oficial:** *Panton Trial Regular*.

---

## 🎨 Paleta Oficial de Cores

| Cor | Código Hex | Utilização |
| :--- | :--- | :--- |
| **Verde Escuro** | `#4C7026` | Botões principais, títulos e pontos finais da rota |
| **Verde Claro** | `#B6CF7B` | Fundo de tabelas, badges e detalhes visuais |
| **Creme** | `#F5F3DC` | Cor de fundo principal da aplicação |
| **Azul Claro** | `#8FACCA` | Elementos de apoio e nós intermediários |
| **Azul Escuro** | `#202B60` | Bordas, textos principais, cabeçalhos e veículo animado |

---

## 📂 Estrutura do Projeto

```text
urbanlink-flow/
├── package.json
├── README.md
├── .env
├── .gitignore
├── src/
│   ├── app.js                          # Servidor express + inicializador do banco e seeders
│   ├── config/
│   │   └── database.js                 # Configuração de conexão (MySQL / SQLite fallback)
│   ├── models/
│   │   ├── Usuario.js                  # Modelo de usuários (perfil: operador | administrador)
│   │   ├── Veiculo.js                  # Modelo de frotas e capacidade em kg
│   │   ├── Produto.js                  # Modelo de itens do estoque
│   │   └── Entrega.js                  # Modelo de entregas (status padrão: pendente)
│   ├── controllers/
│   │   ├── authController.js           # Lógica de login e geração do token JWT
│   │   ├── usuarioController.js        # Cadastro de contas públicas (sempre operador)
│   │   ├── veiculoController.js        # CRUD de veículos da frota
│   │   ├── produtoController.js        # Controle de estoque e botão "+ Nova Remessa" (>0)
│   │   ├── entregaController.js        # Abatimento de estoque e alocação de entregas
│   │   └── simulacaoController.js      # Endpoint de simulação de frete/trajeto
│   └── routes/
│       ├── authRoutes.js
│       ├── usuarioRoutes.js
│       ├── veiculoRoutes.js
│       ├── produtoRoutes.js
│       ├── entregaRoutes.js
│       └── simulacaoRoutes.js
└── public/
    ├── index.html                      # Página inicial com opções de perfil e atalhos
    ├── login.html                      # Tela unificada de login (Operadores e Admins)
    ├── usuario.html                    # Cadastro de conta pessoal (Operador)
    ├── empresas.html                   # Cadastro de conta corporativa (Operador)
    ├── entregas.html                   # Solicitação/Consulta de entregas
    ├── estoque.html                    # Área restrita: Gestão de estoque (Admin)
    ├── veiculos.html                   # Área restrita: Gestão de frotas (Admin)
    ├── admin.html                      # Área restrita: Painel Geral de Entregas (Admin)
    ├── simulacao.html                  # Visualizador de rota e mapa SVG animado
    ├── css/
    │   └── estilo.css                  # Folha de estilos unificada
    ├── js/
    │   ├── comum.js                    # Validador de sessão e controle global da Navbar
    │   ├── login.js
    │   ├── usuario.js
    │   ├── empresas.js
    │   ├── entregas.js
    │   ├── estoque.js
    │   ├── veiculos.js
    │   └── simulacao.js
    ├── img/                            # Logotipos SVG oficiais
    └── font/                           # Arquivo de fonte oficial
```

---

## 👥 Permissões e Perfis de Acesso

O sistema gerencia dois níveis de perfil:

1. **`operador`** (Criado via site em `usuario.html` ou `empresas.html`):
   - Acesso à visualização do início e da simulação.
   - Permissão para cadastrar e consultar suas próprias solicitações de entrega (`entregas.html`), com verificação no backend.
   - Abatimento automático no estoque ao realizar um pedido.
   - **Restrições:** Não visualiza nem acessa as páginas de Estoque, Veículos e Painel Admin.

2. **`administrador`** (Cadastrado diretamente no banco de dados):
   - Acesso irrestrito a todas as páginas da plataforma.
   - Gestão de itens em estoque e funcionalidade de **+ Nova Remessa** (`estoque.html`).
   - Gestão e inclusão de novos veículos na frota (`veiculos.html`).
   - Alteração dos status das entregas (`Pendente` ➔ `Em Trânsito` ➔ `Entregue`) e alocação de veículos (`admin.html`).

---

## 🔑 Configuração da Conta Administrativa

Para criar a primeira conta administrativa, defina `ADMIN_EMAIL` e `ADMIN_PASSWORD` (pelo menos 12 caracteres) no arquivo `.env` antes de iniciar a aplicação. **Não há mais credenciais padrão embutidas no código.** Se um banco antigo contém o administrador com senha `admin123`, altere essa senha imediatamente antes de expor o sistema à rede.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js instalado (versão 18 ou superior).
- MySQL em execução (opcional, pois o sistema possui fallback automático para SQLite local).

### Passo a Passo

1. **Clonar/Extrair o projeto e instalar as dependências:**
   ```bash
   cd urbanlink-flow
   npm install
   ```

2. **Configurar o Arquivo de Ambiente (`.env`):**
   Copie `.env.example` para `.env` e configure uma chave `JWT_SECRET` aleatória, de pelo menos 32 caracteres. Para o primeiro acesso administrativo, preencha `ADMIN_EMAIL` e `ADMIN_PASSWORD` com uma senha forte. Para utilizar SQLite local, mantenha `USE_SQLITE=true`.

3. **Iniciar o Servidor:**
   ```bash
   npm start
   ```
   *Ou para modo de desenvolvimento com Nodemon:*
   ```bash
   npm run dev
   ```

4. **Acessar no Navegador:**
   Acesse a aplicação em `http://localhost:3000`.

---

## ⚡ Fluxo Principal de Teste Recomendado

1. Acesse `http://localhost:3000/login.html` e entre com a conta de administrador configurada no `.env`.
2. Acesse a página **Estoque** e adicione novos itens ou utilize o botão **"+ Nova Remessa"** adicionando quantidade.
3. Acesse a página **Veículos** e cadastre um veículo (ex: `Mini Caminhão` / Placa `ABC-1234`).
4. Acesse a página **Entregas**, crie um pedido de entrega. Observe que o status inicial será **PENDENTE** e a quantidade será deduzida do estoque.
5. Acesse o **Painel Admin**, selecione a entrega criada, aloque o veículo cadastrado e altere o status para **EM TRÂNSITO** ou **ENTREGUE**.
6. Acesse a **Simulação** para visualizar a animação ilustrativa. As estimativas são estáticas, não rotas ou trânsito em tempo real.

### Observações de compatibilidade

- Os arquivos `package.json` e de lock não fazem parte deste ZIP reduzido; mantenha os arquivos de dependências do seu projeto original.
- A tabela `Entregas` recebe a nova coluna opcional `usuario_id` automaticamente; faça backup do banco antes de executar a nova versão em dados existentes.
- Para produção, configure MySQL corretamente. Se ele ficar indisponível, o serviço **não** alterna silenciosamente para um banco vazio. O fallback automático para SQLite é restrito a desenvolvimento.
- A aplicação preservou `peso_kg` por compatibilidade, embora o formulário atual o utilize como quantidade de unidades. Para controle de peso real, será preciso modelar o peso por produto separadamente.
- A proteção de recursos acontece nos endpoints da API. Como os HTMLs são estáticos, acessar o arquivo de uma página administrativa não concede acesso aos dados e às operações privadas.

---

## 📄 Licença

Este projeto é disponibilizado para fins educacionais e de gestão de logística conectada.
UrbanLink Flow © 2026. Todos os direitos reservados.
