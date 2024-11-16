/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { AuthController } from '../app/controllers/security/auth_controller.js';
import AccountPlansController from '../app/controllers/planbudject/account_plans_controller.js';
import AccountPlanBudjectsController from '../app/controllers/planbudject/account_plan_budjects_controller.js';

router.group(() => {
  /*------------------------------------------------------------------------------------------*/
  /** Modulo de segurança **/
  /*------------------------------------------------------------------------------------------*/
  router.group(() => {
    router.group(() => {
      router.post('login', [AuthController, 'login']);
      router.post('logout', [AuthController, 'logout']).use(middleware.auth());
      router.post('isAuthenticated', [AuthController, 'isAuthenticated']);
    //  router.post('resetPassword', [AuthController, 'resetPassword']).use(middleware.auth());
    }).prefix("auth");
  }).prefix("security");
  /*------------------------------------------------------------------------------------------*/
  /** Modulo de plano e orçamento **/
  /*------------------------------------------------------------------------------------------*/
  router.group(() => {
    //Plano de contas
    router.group(() => {
      router.get('findAllAccountPlan', [AccountPlansController, 'findAllAccountPlan']);
      router.get('findAnyAccountPlan', [AccountPlansController, 'findAnyAccountPlan']);
      router.get('findAccountPlanByNumber/:number', [AccountPlansController, 'findAccountPlanByNumber']);
      router.get('findAnyAccountPlanByNumber', [AccountPlansController, 'findAnyAccountPlanByNumber']);
      router.post('createAccountPlan', [AccountPlansController, 'createAccountPlan']);
      router.post('updateAccountPlan', [AccountPlansController, 'updateAccountPlan']);
    }).prefix("accountplan");

    //Orcamento do ano especifico
    router.post('createAccountPlanBudject', [AccountPlanBudjectsController, 'createAccountPlanBudject']);
    router.post('findAllAccountPlanBudject', [AccountPlanBudjectsController, 'findAllAccountPlanBudject']);
    router.post('findAccountPlanBudjectByYear/:year', [AccountPlanBudjectsController, 'findAccountPlanBudjectByYear']);

    // Entradas do orcamento do ano especifico - dotação
    router.post('findAccountPlanBudjectEntriesByYear/:year', [AccountPlanBudjectsController, 'findAccountPlanBudjectEntriesByYear']);
    router.post('fetchAccountPlanBudjectEntriesByYear/:year', [AccountPlanBudjectsController, 'fetchAccountPlanBudjectEntriesByYear']);
    router.post('fetchAccountPlanBudjectEntriesByYearAndNumber/:year/:accountPlanNumber', [AccountPlanBudjectsController, 'fetchAccountPlanBudjectEntriesByYearAndNumber']);

    // Actualização a dotação do plano de contas (reforço, anulação, redistribuição reforço, redistribuição anulação)
    router.post('initialAllocationAccountPlanBudjectEntry', [AccountPlanBudjectsController, 'initialAllocationAccountPlanBudjectEntry']);
    router.post('reinforceAccountPlanBudjectEntry', [AccountPlanBudjectsController, 'reinforceAccountPlanBudjectEntry']);
    router.post('annulAccountPlanBudjectEntry', [AccountPlanBudjectsController, 'annulAccountPlanBudjectEntry']);

    router.post('redistribuitioReinforcimentAccountPlanBudjectEntry', [AccountPlanBudjectsController, 'redistribuitioReinforcimentAccountPlanBudjectEntry']);
    router.post('redistributeAnnulmentAccountPlanBudjectEntry', [AccountPlanBudjectsController, 'redistributeAnnulmentAccountPlanBudjectEntry']);

  }).prefix("planbudject");

  /*------------------------------------------------------------------------------------------*/
  /** Outros modulos  **/
  /*------------------------------------------------------------------------------------------*/
  router.get('/about', async () => {
    return 'This is the about page'
  })

}).prefix("sgf-api");