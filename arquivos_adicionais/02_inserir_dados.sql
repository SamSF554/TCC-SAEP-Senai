-- UrbanLink Flow | Dados ficticios para demonstracao
-- Execute somente em um banco de teste/novo, DEPOIS de 01_criar_tabelas.sql.
-- Pode ser executado novamente: ON CONFLICT evita repetir codigos e placas.
-- Nao insere senhas, contas de administradores nem dados pessoais.
-- A conta administrativa e criada pelo backend via ADMIN_EMAIL/ADMIN_PASSWORD.

BEGIN;

INSERT INTO public."Produtos"
    (codigo, nome, categoria, quantidade, "createdAt", "updatedAt")
VALUES
    ('DEMO-P001', 'Caixas para envio (demonstracao)', 'Embalagens', 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('DEMO-P002', 'Material de escritorio (demonstracao)', 'Escritorio', 75, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('DEMO-P003', 'Acessorios eletronicos (demonstracao)', 'Eletronicos', 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public."Veiculos"
    (placa, modelo, tipo, capacidade_kg, status, "createdAt", "updatedAt")
VALUES
    ('DEMO001', 'Utilitario de demonstracao', 'Van', 600, 'disponivel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('DEMO002', 'Motocicleta de demonstracao', 'Moto', 40, 'disponivel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (placa) DO NOTHING;

COMMIT;

-- Para gerar um usuario operador, utilize o cadastro do site: a aplicacao
-- produz o hash bcrypt e aplica as regras de validacao.
-- Para gerar uma entrega de teste, utilize a pagina Entregas: a API
-- vincula o usuario e desconta o estoque dentro de uma transacao.
-- Inserir Entregas diretamente por SQL nao executa essas regras de negocio.
