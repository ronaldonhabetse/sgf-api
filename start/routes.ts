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
      router.get('findAll', [AccountPlansController, 'findAllAccountPlan']);
      router.post('createAccountPlan', [AccountPlansController, 'createAccountPlan']);
    }).prefix("accountplan");

    //Plano e orca
    /*router.post('create/createPlanBudjectEntry', [AccountPlansController, 'createPlanBudjectEntry']);
    router.post('update/reforcePlanBudjectEntry', [AccountPlansController, 'reforcePlanBudjectEntry']);
    router.post('update/anullPlanBudjectEntry', [AccountPlansController, 'anullPlanBudjectEntry']);
    router.post('update/redistribueteReforcePlanBudjectEntry', [AccountPlansController, 'redistribueteReforcePlanBudjectEntry']);
    router.post('update/redistribueteAnullPlanBudjectEntry', [AccountPlansController, 'redistribueteAnullPlanBudjectEntry']);
  
      router.get('findAllActiveAccountPlanBujectEntry', [AccountPlansController, 'create']);
    */
  }).prefix("planbudject");

  /*------------------------------------------------------------------------------------------*/
  /** Outros modulos  **/
  /*------------------------------------------------------------------------------------------*/
  router.get('/about', async () => {
    return 'This is the about page'
  })

}).prefix("sgf-api");