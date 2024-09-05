import type { HttpContext } from '@adonisjs/core/http'
import AuthService from '../services/auth_service.js'
import { loginValidator } from '../validators/auth.js';
import User from '../models/user.js';


/**
 * Gautchi Rogério Chambe
 */
export class AuthController {

  async login({ request }: HttpContext) {

    const { email, password } = await request.validateUsing(loginValidator);

    return AuthService.authenticate(email, password);
  }

  async logout({ auth }: HttpContext) {

    const user = auth.user!;
    const acessToken = user.currentAccessToken;

    if (acessToken != undefined) {
      await User.accessTokens.delete(user, acessToken.identifier);
      return ({ message: 'sussess' })
    }

    return ({ message: 'error' })

  }

  async isAuthenticated({ auth }: HttpContext) {
    await auth.check()
    return { user: auth.user }
  }

  async resetPassword({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    response.accepted(AuthService.resetPassword(email, password));
  }
}