# Relatório de revisão — UrbanLink Flow

## Problemas identificados e corrigidos

1. **Proteção incompleta de recursos privados:** a aplicação ocultava menus no navegador, porém qualquer cliente podia chamar a API. Agora as rotas exigem JWT válido e operações administrativas verificam o perfil no banco.
2. **Visibilidade indevida de entregas:** a listagem exibida aos operadores não tinha filtro por proprietário. A revisão associa novas entregas a `usuario_id`, filtra consultas de operadores e preserva acesso administrativo aos registros históricos.
3. **Risco de estoque inconsistente:** o estoque era abatido antes do cadastro da entrega, sem transação. A nova implementação usa atualização condicional dentro de uma transação, com rollback em caso de falha.
4. **Fallback de banco inoperante:** o código tentava trocar o Sequelize depois de definir os modelos. O banco agora é escolhido antes de carregar modelos, controladores e rotas. Em produção, falhas do MySQL não ativam um banco alternativo vazio.
5. **Seed inseguro:** a senha padrão `admin123` não é mais criada automaticamente. A configuração do administrador é explícita. Com as variáveis de administrador definidas, a senha antiga é substituída quando detectada.
6. **Validação permissiva:** valores como `2.7`, `-5` ou `12abc` podiam ser aceitos por conversão implícita ou `parseInt`. Quantidade, capacidade e remessa agora são validadas como números inteiros no servidor.
7. **Contrato quebrado do simulador:** o frontend esperava `recomendada` e `alternativa`, mas a API fornecia `distancia`, `tempo` e `transito`. O formulário, a exibição dos resultados e a animação ilustrativa foram corrigidos.
8. **Melhorias de interface:** chamadas privadas enviam autenticação automaticamente, erros de exclusão são mostrados, sessões expiram com redirecionamento e o simulador e os cards se adaptam a telas pequenas.

## Como validar

Sem depender das bibliotecas do projeto:

```bash
node --test tests/*.test.js
find src public/js tests -name '*.js' -type f -print0 | xargs -0 -n 1 node --check
```

Para validar a aplicação completa, recoloque os arquivos JSON de dependências do projeto original, instale as dependências com o gerenciador já utilizado e inicie o servidor após configurar `.env` a partir de `.env.example`.

## Cuidados e limites restantes

- Faça **backup do banco** antes de executar com dados existentes. A coluna opcional `Entregas.usuario_id` será adicionada caso ainda não exista.
- Entregas anteriores à revisão não possuem proprietário: ficam visíveis ao administrador, não a operadores.
- O simulador ainda utiliza valores fictícios e um mapa SVG ilustrativo. Cálculos reais exigem integração com um serviço de roteamento.
- O campo `peso_kg` permanece sendo utilizado pelo formulário como quantidade de unidades por compatibilidade. Separar quantidade e peso real é uma evolução importante para a logística.
- Para produção, vale adicionar limitação de tentativas de login, recuperação de senha, auditoria de alterações, migrações versionadas, monitoramento e testes integrados de banco/API.
- O arquivo `.env` do ZIP original não acompanha a versão revisada, para evitar redistribuir credenciais. Preserve o `.env` local de forma privada e atualize o segredo JWT caso ainda utilize um exemplo antigo.
