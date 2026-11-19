# UrbanLink Flow — publicação na Vercel com Supabase

## O que foi corrigido

- `src/app.js` exporta o aplicativo Express diretamente, permitindo que a Vercel o detecte.
- Inicialização do banco e das rotas acontece na primeira solicitação ao backend (uma vez por instância).
- `src/config/database.js` reconhece `DATABASE_URL` e usa PostgreSQL com SSL e pool pequeno.
- URLs/segredos reais não são incluídos no ZIP. `node_modules` e `.git` também foram excluídos.
- `GET /api/health` informa quando a conexão e as rotas estão prontas.

## 1. Criar banco de dados no Supabase

1. Entre em https://supabase.com/dashboard e crie um projeto.
2. No projeto, clique **Connect**.
3. Selecione **Transaction pooler** e copie a connection string PostgreSQL. Esse modo é recomendado para Serverless.
4. Substitua o marcador da senha pela senha do banco de dados. Caso sua senha contenha `@`, `#`, `?` ou outros caracteres especiais, aplique URL encoding.
5. Não use chaves `anon`, `publishable` ou `service_role` no campo `DATABASE_URL`. A URL do banco é diferente dessas chaves.

## 2. Preparar o projeto

1. Descompacte o ZIP, abra a pasta que contém `package.json`.
2. Execute `npm install` para baixar as dependências, inclusive `pg` e `pg-hstore`.
3. O `npm install` criará `package-lock.json`. Inclua esse arquivo no Git após gerar as dependências.
4. Caso já exista um projeto Vercel conectado ao GitHub, substitua os arquivos do projeto, faça commit e push. Mantenha `.env` fora do repositório.

## 3. Variáveis na Vercel

Vercel > Project > Settings > Environment Variables, ambiente **Production**:

- `NODE_ENV` = `production`
- `DATABASE_URL` = connection string copiada de Supabase > Connect > Transaction pooler
- `JWT_SECRET` = segredo aleatório de pelo menos 32 caracteres
- `ADMIN_EMAIL` = e-mail da conta administradora
- `ADMIN_PASSWORD` = senha forte da conta administradora, com pelo menos 12 caracteres
- `DB_SYNC_ALTER` = `false`

`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` são ignoradas quando `DATABASE_URL` está definida. Não use `localhost` na Vercel.

## 4. Publicar

1. Em Vercel > Settings > General, selecione a pasta correta como **Root Directory** (a que contém `package.json` e `src/`).
2. Utilize o preset Express, se estiver disponível (detecção automática também é suportada).
3. Faça **Redeploy** após criar/alterar variáveis.
4. Teste `https://SEU_SITE.vercel.app/` e `https://SEU_SITE.vercel.app/api/health`.
5. Se `/api/health` responder 503, abra Vercel > Project > Logs/Runtime Logs e veja a mensagem de inicialização.

## Informações importantes

- O Supabase hospedará PostgreSQL; o site e a API ficam na Vercel. Não é preciso "subir o HTML" no Supabase.
- O projeto usará tabelas *novas e vazias* em um Supabase recém-criado. Ele **não migra automaticamente** os dados de um banco MySQL anterior. Exporte/migre esses dados separadamente, se necessário.
- O código atual usa `sequelize.sync()` na inicialização para simplificar o primeiro deploy. Para produção com tráfego real, mova alterações de esquema para migrations dedicadas, evitando conflitos quando várias instâncias iniciam simultaneamente.
- O `.env` original foi excluído deste ZIP, pois continha credenciais. Se esse arquivo foi publicado em algum repositório acessível a outras pessoas, troque todas as senhas/chaves afetadas.
- SQLite não deve ser utilizado como banco persistente em funções Vercel.
- Para desenvolvimento local, use `.env.example` como modelo; não comite o `.env` preenchido.
