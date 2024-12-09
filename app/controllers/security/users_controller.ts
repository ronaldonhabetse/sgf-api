import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';
import UserService from '../../services/security/user_service.js';
import UserValidator from '#validators/security/user';
import AuthService from '../../services/security/auth_service.js'

/**
 * Controller de Usuários
 */
@inject()
export default class UsersController {

  constructor(
    private userService: UserService, // Injetando o serviço de usuário
    private authService: AuthService // Injetando o serviço de autenticação
  ) { }

  /**
   * Exibe a lista de todos os usuários
   */
  async index({ response }: HttpContext) {
    try {
      const users = await UserService.findAll(); // Chama o serviço para listar todos os usuários
      return response.ok(users);
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao listar usuários',
        error: error.message,
      });
    }
  }

  /**
   * Exibe um usuário específico pelo ID
   */
  async findBy({ request, response }: HttpContext) {
    const { id } = request.param('id'); // Pegando o ID do usuário da URL

    try {
      const user = await this.userService.findById(id); // Chama o serviço para encontrar o usuário
      return response.ok({ user });
    } catch (error) {
      return response.status(404).json({
        message: 'Usuário não encontrado.',
        error: error.message,
      });
    }
  }

  /**
   * Criação de um novo usuário
   */
  async createUser({ request, response }: HttpContext) {
    const data = await request.validateUsing(UserValidator.validateFields()); // Validando os dados do usuário com o validador

    console.log("dadis obtidos", data)
    try {
      const user = await this.userService.createUser(data); // Chama o serviço para criar o usuário
      return response.created({
        message: 'Usuário criado com sucesso.',
        data: user,
      });
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao criar o usuário.',
        error: error.message,
      });
    }
  }

  /**
   * Atualização dos dados de um usuário
   */
  async updateUser({ request, response }: HttpContext) {
    const { id } = request.param('id'); // Pegando o ID do usuário da URL
    const data = request.body(); // Pegando os dados para atualização

    try {
      const updatedUser = await this.userService.updateUser(id, data); // Chama o serviço para atualizar o usuário
      return response.ok({
        message: 'Usuário atualizado com sucesso.',
        data: updatedUser,
      });
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao atualizar o usuário.',
        error: error.message,
      });
    }
  }

  /**
   * Inativação (delete lógico) de usuário
   */
  async deactivateUser({ request, response }: HttpContext) {
    const { id } = request.param('id'); // Pegando o ID do usuário

    try {
      const deactivatedUser = await this.userService.deactivateUser(id); // Chama o serviço para inativar o usuário
      return response.ok({
        message: 'Usuário inativado com sucesso.',
        data: deactivatedUser,
      });
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao inativar o usuário.',
        error: error.message,
      });
    }
  }



  async getUser({ request, response }: HttpContext) {
    try {
      // Pega o token do cabeçalho da requisição
      const token = request.header('Authorization');

      console.log("Token", token)

      // Verifica o token e pega os dados do usuário
      const userId = await AuthService.verifyToken(token); // Verifique o token e obtenha o ID do usuário

      // Busca os dados do usuário no banco
      const user = await this.userService.findById(userId);

      return response.ok({ user }); // Retorna os dados do usuário
    } catch (error) {
      return response.status(401).json({
        message: 'Falha na autenticação.',
        error: error.message,
      });
    }
  }
}
