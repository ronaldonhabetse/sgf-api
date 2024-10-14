import type { HttpContext } from '@adonisjs/core/http'
import UserService from '../../services/security/user_service.js'
import { createUserValidator } from '../../validators/user.js';
import User from '../../models/security/user.js';

export default class UsersController {

  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {

    return await UserService.findAll();
  }

    /**
   * Display a list of resource
   */
    async findBy({}: HttpContext) {

      //return await UserService.find
    }

  /**
   * Display form to create a new record
   */
  async create({request}: HttpContext) {

    const data = request.validateUsing(createUserValidator)

    const user=await User.create(data);

    return User.accessTokens.create(user);

  }
}