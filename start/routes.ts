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
import InternalRequestController from '../app/controllers/request/internal_request_controller.js';
import ProvidersController from '../app/controllers/collectiveperson/providers_controller.js';


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
      router.post('removeAccountPlan', [AccountPlansController, 'removeAccountPlan']);
      router.post('updateAccountPlan', [AccountPlansController, 'updateAccountPlan']);
    }).prefix("accountplan");

    //Ano contabilistico especifico
    router.post('createAccountPlanYear', [AccountPlanBudjectsController, 'createAccountPlanYear']);
    router.post('findAllAccountPlanYear', [AccountPlanBudjectsController, 'findAllAccountPlanYear']);
    router.post('findAccountPlanYearByYear/:year', [AccountPlanBudjectsController, 'findAccountPlanYearByYear']);

    // Entradas/Saldos do plano do ano especifico - dotação
    router.post('findAccountPlanEntriesByYear/:year', [AccountPlanBudjectsController, 'findAccountPlanEntriesByYear']);
    router.post('fetchAccountPlanEntriesByYear/:year', [AccountPlanBudjectsController, 'fetchAccountPlanEntriesByYear']);
    router.post('fetchAccountPlanEntriesByYearAndNumber/:year/:accountPlanNumber', [AccountPlanBudjectsController, 'fetchAccountPlanEntriesByYearAndNumber']);

    //Criacao do saldo do plano de contas [Ver com Cipriano por que estamos a disponibilizar este serviço??
    // pois criamos os saldos somente na criacao do plano de contas]
    router.post('createAccountPlanEntry', [AccountPlanBudjectsController, 'createAccountPlanEntry']);

    // Actualização a dotação do plano de contas (reforço, anulação, redistribuição reforço, redistribuição anulação)
    router.post('initialAllocationAccountPlanEntry', [AccountPlanBudjectsController, 'initialAllocationAccountPlanEntry']);
    router.post('reinforceAccountPlanEntry', [AccountPlanBudjectsController, 'reinforceAccountPlanEntry']);
    router.post('annulAccountPlanEntry', [AccountPlanBudjectsController, 'annulAccountPlanEntry']);
    router.post('redistribuitioReinforcimentAccountPlanEntry', [AccountPlanBudjectsController, 'redistribuitioReinforcimentAccountPlanEntry']);
    router.post('redistributeAnnulmentAccountPlanEntry', [AccountPlanBudjectsController, 'redistributeAnnulmentAccountPlanEntry']);
    router.post('associateFinancialAccountWithBujectAccounts', [AccountPlanBudjectsController, 'associateFinancialAccountWithBujectAccounts']);

  }).prefix("planbudject");

  //Plano de contas
  router.group(() => {
    router.get('findAllInternalRequest', [InternalRequestController, 'findAllInternalRequest']);
    router.get('findInternalRequestByRequestNumber', [InternalRequestController, 'findInternalRequestByRequestNumber']);
    router.post('createInternalRequest', [InternalRequestController, 'createInternalRequest']);
  }).prefix("internalrequest");


  router.group(() => {
    //Provedores
    router.group(() => {
      router.get('findAllProviders', [ProvidersController, 'findAllProviders']);
      router.get('findProviderByAccountFinancialNumber', [ProvidersController, 'findProviderByAccountFinancialNumber']);
      router.post('createProvider', [ProvidersController, 'createProvider']);
    }).prefix("providers");

  }).prefix("collectiveperson");



  /*------------------------------------------------------------------------------------------*/
  /** Outros modulos  **/
  /*------------------------------------------------------------------------------------------*/
  router.get('/about', async () => {
    return 'This is the about page'
  })

}).prefix("sgf-api");