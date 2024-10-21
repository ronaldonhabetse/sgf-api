# ******************************************************
#  Arquitectura do projecto da API
# ******************************************************

# Versão do node: v18.20.4

# commando para matar todos os processos de node em execucao
ps aux | grep '[n]ode' | awk '{print $2}'|xargs kill -9

# ******************************************************
# Configurar a base de dados - Mysql
# ******************************************************
Step 1: Log in to MySQL
$ mysql -u root -p

Step 2: Create a New Database
$ CREATE DATABASE SGF;

Step 3: Create a New User
$ CREATE USER 'sgfuser'@'localhost' IDENTIFIED BY 'sgf123';

Step 4: Grant Privileges to the New User
$ GRANT ALL PRIVILEGES ON SGF.* TO 'sgfuser'@'localhost';

Step 5: Apply Privileges
$ FLUSH PRIVILEGES;

Step 6: Exit MySQL
EXIT;

Step 7: Test new MySQL user
$ mysql -u sgfuser -p -h localhost
# ******************************************************
#  Como correr e efectuar o buid da API
# ******************************************************
i. Build do pacote em produção
node ace build

ii. Correr no ambiente de desenvolvimento (a flag --hmr permite monitorar os recursos)
node ace serve --hmr

iii. Formatar o codico via command line. Não é necessario se o editor estiver configurado com estas extensões
 npm run lint
 npm run lint -- --fix #Run ESLint and auto-fix issues
 npm run format

ii. Correr no ambiente de desenvolvimento (a flag --hmr ou --watch permite monitorar os recursos)
node ace serve --hmr
node ace serve --watch

iii. Ver os serviços disponibilizados 
node ace list:routes

# **********************************************************************************************************
#  Modulos da API do Sistema de Gestão Financeira
#   1 - Modulo de Seguranca
#   2 - Modulo de Plano e Orcamento
#   3 - Modulo de Inscricao e Requisições
# **********************************************************************************************************

##### **********************************************************************************************************
# 1 - Modulo de Segurança
#    i. Descricao:
#       É o primeiro modulo desenvolvido no projecto e define a estrutura e logica dos requisitos não funcional #       segurnçà e acessos dos utilizadores.
#    ii. Modelo de dados
#        ![O modelo de dados e relacionamento pode ser encontrado na imagem](resources/modulo_seguranca.png)
#    iii. Funcionalidade
#    iv.  Serviços
##### **********************************************************************************************************

Step 1: Criação do projecto API com auth tipo tokens
npm init adonisjs@latest sgf-api -- --kit=api --auth-guard=access_tokens --db=mysql

Step 2: Commitar o projecto no repositorio gitlab
cd sgf-api
git remote add origin https://gitlab.com/sebadora/sgf/sgf-api.git
git branch -M developer
git push -uf origin developer

Step 3: criação das entidades: Model => ( https://lucid.adonisjs.com/docs/models )
        criação de controlladores: Controller => (https://docs.adonisjs.com/guides/basics/controllers)
        criação de serviços: Services => ()
        criação de objectos da base de dados: migrations => (https://lucid.adonisjs.com/docs/migrations)
        criação inserção automatica objectos da base de dados: seeder => (https://lucid.adonisjs.com/docs/seeders)
        criação de seederes para a insercao dos dados na BD seeder => (https://v5-docs.adonisjs.com/guides/database/seeders
        ))
       
node ace make:model user
node ace make:controller user
node ace make:migreation user
node ace make:seeder MainSeeder/index
node ace make:seeder user
 
Step 4: criar insercação automatica de obejctos na base de dados
node ace migration:run

Step 4.1: Efectuar drop da BD
node ace migration:reset

Step 4.2: Efectuar um reset e executa o seeder
node ace migration:fresh --seed


Nota: 
    Podemos tambem criara o model, controller e migration em uma unica instrução apenas adicionando a flag --cm na instrução abaixo. 
node ace make:model user --cm

# *****************************************************
# Como testar o modulo de segurança
# *****************************************************
Step1: Autenticação com token

curl --location 'http://localhost:3333/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
"email":"root@gmail.com",
"password":"sebadora123"
}'

Step2: chamada do serviço para a criacao do utilizador


##### *****************************************************
# 2 - Modulo de Plano e Orçamento
#    i. Descricao:
#       É o primeiro modulo desenvolvido no projecto e define a estrutura e logica dos requisitos não        #       funcional segurnçà e acessos dos utilizadores.
#    ii. Modelo de dados
#       ![O modelo de dados e relacionamento pode ser encontrado na imagem](resources/modolo_seguranca.png)
#   iii. Funcionalidades esperas neste modulo
#      1.
#      2.
#      3.
#      4.
#      5.
##### *****************************************************

# Listar todos os planos de conta
curl -s --location --request GET 'http://localhost:3333/sgf-api/planbudject/accountplan/findAllActiveAccountPlan' --header 'Content-Type: application/json' | jq

# Cria um plano de conta
curl -s --location 'http://localhost:3333/sgf-api/planbudject/accountplan/createAccountPlan' \
--header 'Content-Type: application/json' \
--data ' {
        "number": "1.1.1.1.05",
        "description": "Vencimento Base do Pessoal Civil Fora do Quadro11",
        "writable": "moviment",
        "type": "budject",
        "class": "2"
    }' | jq

# Listar todos os planos orçamentais
curl -s --location 'http://localhost:3333/sgf-api/planbudject/findAllAccountPlanBudjectEntries' \
--header 'Content-Type: application/json' \
--data-raw '{
"email":"root@gmail.com",
"password":"sebadora123"
}' | jq

# Criar um orcamento


# Listar todos os planos orçamentais 
curl -s --location 'http://localhost:3333/sgf-api/planbudject/createAccountPlanBudjectEntry' \
--header 'Content-Type: application/json' \
--data ' {
        "startPostingMonth": 1,
        "endPostingMonth": 12,
        "initialAllocation": 1200000,
        "accountPlanNumber": "1.1.1.1.02"
    }' | jq

# Listar todos os planos orçamentais  com as respectivas entradas
curl -s --location 'http://localhost:3333/sgf-api/planbudject/fetchAllAccountPlanBudjectEntries' \
--header 'Content-Type: application/json' \
--data-raw '{
"email":"root@gmail.com",
"password":"sebadora123"
}' | jq