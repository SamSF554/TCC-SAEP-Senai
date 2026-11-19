# Modelagem lógica — UrbanLink Flow

Banco utilizado em produção: **PostgreSQL (Supabase)**. Nomes entre aspas e maiúsculas são preservados para compatibilidade com os modelos Sequelize (`public."Usuarios"`, `public."Produtos"`, `public."Veiculos"` e `public."Entregas"`).

## Esquema relacional

```text
Usuarios(id PK, nome, email UQ, senha, cpf_cnpj, cidade,
         veiculo_preferencia, tipo_conta, perfil, createdAt, updatedAt)

Produtos(id PK, codigo UQ, nome, categoria, quantidade,
         createdAt, updatedAt)

Veiculos(id PK, placa UQ, modelo, tipo, capacidade_kg, status,
         createdAt, updatedAt)

Entregas(id PK, codigo_rastreio UQ, destino, peso_kg, status,
         produto_id FK -> Produtos.id,
         veiculo_id FK -> Veiculos.id,
         usuario_id FK -> Usuarios.id,
         createdAt, updatedAt)
```

`PK` = chave primária; `FK` = chave estrangeira; `UQ` = valor único. Todos os `id` são inteiros gerados automaticamente. As três FKs de `Entregas` aceitam `NULL` no esquema atual e usam `ON UPDATE CASCADE / ON DELETE SET NULL`.

## Dicionário de dados

### `Usuarios`

| Coluna | Tipo | Restrições / significado |
| --- | --- | --- |
| `id` | INTEGER | PK, identity |
| `nome` | VARCHAR(255) | Obrigatório |
| `email` | VARCHAR(255) | Obrigatório, único; usado no login |
| `senha` | VARCHAR(255) | Obrigatório; **hash bcrypt**, nunca texto puro |
| `cpf_cnpj` | VARCHAR(255) | Opcional, padrão vazio |
| `cidade` | VARCHAR(255) | Opcional, padrão vazio |
| `veiculo_preferencia` | VARCHAR(255) | Opcional, padrão `Carro` |
| `tipo_conta` | VARCHAR(255) | Opcional, padrão `pessoal` |
| `perfil` | VARCHAR(255) | Obrigatório, `operador` ou `administrador`; padrão `operador` |
| `createdAt`, `updatedAt` | TIMESTAMPTZ | Obrigatórios; registro de criação/alteração |

### `Produtos`

| Coluna | Tipo | Restrições / significado |
| --- | --- | --- |
| `id` | INTEGER | PK, identity |
| `codigo` | VARCHAR(255) | Obrigatório, único (SKU) |
| `nome` | VARCHAR(255) | Obrigatório |
| `categoria` | VARCHAR(255) | Obrigatório, padrão `Geral` |
| `quantidade` | INTEGER | Obrigatório, padrão `0`, não negativo |
| `createdAt`, `updatedAt` | TIMESTAMPTZ | Obrigatórios |

### `Veiculos`

| Coluna | Tipo | Restrições / significado |
| --- | --- | --- |
| `id` | INTEGER | PK, identity |
| `placa` | VARCHAR(255) | Obrigatório, único |
| `modelo` | VARCHAR(255) | Obrigatório |
| `tipo` | VARCHAR(255) | Obrigatório, padrão `Carro` |
| `capacidade_kg` | INTEGER | Obrigatório, padrão `100`, maior que zero |
| `status` | VARCHAR(255) | Obrigatório, padrão `disponivel` |
| `createdAt`, `updatedAt` | TIMESTAMPTZ | Obrigatórios |

### `Entregas`

| Coluna | Tipo | Restrições / significado |
| --- | --- | --- |
| `id` | INTEGER | PK, identity |
| `codigo_rastreio` | VARCHAR(255) | Obrigatório, único |
| `destino` | VARCHAR(255) | Obrigatório |
| `peso_kg` | INTEGER | Obrigatório, maior que zero, padrão `1`; **representa unidades solicitadas** na implementação atual |
| `status` | ENUM | `pendente`, `em_transito`, `entregue`, `concluido` (legado); padrão `pendente`; anulável no banco |
| `produto_id` | INTEGER | FK → `Produtos.id`, pode ser `NULL` |
| `veiculo_id` | INTEGER | FK → `Veiculos.id`, pode ser `NULL` |
| `usuario_id` | INTEGER | FK → `Usuarios.id`, pode ser `NULL` (compatibilidade) |
| `createdAt`, `updatedAt` | TIMESTAMPTZ | Obrigatórios |

## Integridade e comportamento

- `email`, `codigo`, `placa` e `codigo_rastreio` não se repetem em suas respectivas tabelas.
- As quantidades de produtos nunca podem ser negativas, e a capacidade dos veículos e a quantidade da entrega devem ser positivas.
- O cadastro público cria somente `operador`; a conta `administrador` é inicializada de forma controlada com `ADMIN_EMAIL`/`ADMIN_PASSWORD` no servidor.
- O backend solicita produto válido, associa o usuário autenticado, verifica estoque e desconta a quantidade em transação. O valor `concluido` permanece no enum para compatibilidade, mas a atualização via interface admite `pendente`, `em_transito` e `entregue`.
- Como o projeto usa conexão PostgreSQL no servidor, nenhuma senha do banco ou chave privilegiada é enviada ao navegador.
- Índices nas três FKs de `Entregas` apoiam as consultas e junções.

As definições SQL reproduzíveis estão em [`arquivos_adicionais/01_criar_tabelas.sql`](../arquivos_adicionais/01_criar_tabelas.sql).
