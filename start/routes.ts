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
      router.post('resetPassword', [AuthController, 'resetPassword']).use(middleware.auth());
    }).prefix("auth");
  }).prefix("security");
  /*------------------------------------------------------------------------------------------*/
  /** Modulo de plano e orçamento **/
  /*------------------------------------------------------------------------------------------*/
  router.group(() => {
    //Plano de contas
    router.group(() => {
      router.get('findAllActiveAccountPlan', [AccountPlansController, 'findAllActiveAccountPlan']);
      router.get('findActiveBy', [AccountPlansController, 'findAllAccountPlan']);
      router.get('findAllAccountPlan', [AccountPlansController, 'findAllAccountPlan']);
      router.post('createAccountPlan', [AccountPlansController, 'createAccountPlan']);
      router.post('updateAccountPlan', [AccountPlansController, 'updateAccountPlan']);
    }).prefix("accountplan");

    //Orcamento
    router.post('createAccountPlanBudject', [AccountPlanBudjectsController, 'createAccountPlanBudject']);
    router.post('findAllAccountPlanBudject', [AccountPlanBudjectsController, 'findAllAccountPlanBudject']);
   
    router.post('createAccountPlanBudjectEntry', [AccountPlanBudjectsController, 'createAccountPlanBudjectEntry']);
    router.post('findAllAccountPlanBudjectEntries', [AccountPlanBudjectsController, 'findAllAccountPlanBudjectEntries']);
    router.post('fetchAllAccountPlanBudjectEntries', [AccountPlanBudjectsController, 'fetchAllAccountPlanBudjectEntries']);

   // router.post('update/reforcePlanBudjectEntry', [AccountPlansController, 'reforcePlanBudjectEntry']);
   // router.post('update/anullPlanBudjectEntry', [AccountPlansController, 'anullPlanBudjectEntry']);
   // router.post('update/redistribueteReforcePlanBudjectEntry', [AccountPlansController, 'redistribueteReforcePlanBudjectEntry']);
   // router.post('update/redistribueteAnullPlanBudjectEntry', [AccountPlansController, 'redistribueteAnullPlanBudjectEntry']);
  
    //router.get('findAllActiveAccountPlanBujectEntry', [AccountPlansController, 'create']);
    
  }).prefix("planbudject");

  /*------------------------------------------------------------------------------------------*/
  /** Outros modulos  **/
  /*------------------------------------------------------------------------------------------*/
  router.get('/about', async () => {
    return 'This is the about page'
  })

}).prefix("sgf-api");