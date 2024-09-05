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
import { AuthController } from '../app/controllers/auth_controller.js';


router.group(() => {
  router.post('login', [AuthController, 'login']);
  router.post('logout', [AuthController, 'logout']).use(middleware.auth());
  router.post('isAuthenticated', [AuthController, 'isAuthenticated']);
  router.post('resetPassword', [AuthController, 'resetPassword']);
}).prefix("auth");

router
  .get('dashboard', ({ auth }) => {
    return auth.user
  })
  .use(middleware.auth({
    guards: ['basicAuth']
  }))

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.get('/about', async () => {
  return 'This is the about page'
})