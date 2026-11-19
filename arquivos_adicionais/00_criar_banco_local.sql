-- UrbanLink Flow | PostgreSQL local/autogerenciado
-- Execute conectado a um banco administrativo (por exemplo, postgres).
-- Exemplo: psql -U postgres -d postgres -f arquivos_adicionais/00_criar_banco_local.sql
-- ATENCAO: NAO execute este arquivo no Supabase SQL Editor.
-- Cada projeto Supabase ja oferece seu banco PostgreSQL; nele use 01_criar_tabelas.sql.

CREATE DATABASE urbanlink_flow
    WITH ENCODING = 'UTF8'
    TEMPLATE = template0;

-- A criacao local e demonstrativa. A configuracao DATABASE_URL do backend atual
-- usa TLS com o certificado da CA do Supabase; para executar o app localmente,
-- prefira SQLite ou conecte-se a um projeto Supabase conforme INSTALACAO_E_USO.md.
