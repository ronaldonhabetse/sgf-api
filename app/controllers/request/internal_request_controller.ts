import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import InternalRequestService from "../../services/request/internal_request_service.js";
import InternalRequestValidator from "../../validators/request/internalRequestValidator.js";

/**
 * Gautchi Rogério Chambe
 */
@inject()
export default class InternalRequestController {

  constructor(
    private internalRequestService: InternalRequestService
  ) { }

  async createInternalRequest({ request, response }: HttpContext) {
    const data = await request.validateUsing(InternalRequestValidator.validateFields())

    try {
      return response.created(await this.internalRequestService.createInternalRequest(data));
    } catch (error) {
      return response.status(500).json({
        message: 'Ocorrer erro ao criar a requisicao interna',
        error: error.message,
      });
    }
  }

  async updateInternalRequestStatus({ request, response }: HttpContext) {
    const { requestNumber, conformanceStatus, justification } = request.body(); // Incluído `justification`

    if (!requestNumber || typeof conformanceStatus !== 'boolean') {
      return response.badRequest({
        message: 'Número da requisição ou status de conformidade inválidos.',
      });
    }

    try {
      const updatedRequest = await this.internalRequestService.updateStatus(requestNumber, conformanceStatus, justification); // Passar `justification`
      return response.ok({
        message: 'Status da requisição atualizado com sucesso.',
        data: updatedRequest,
      });
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao atualizar o status da requisição.',
        error: error.message,
      });
    }
  }

  async findAllInternalRequest({ response }: HttpContext) {
    return response.ok(await this.internalRequestService.findAll());
  }

  async feacthAllInternalRequest({ response }: HttpContext) {
    return response.ok(await this.internalRequestService.feacthAll());
  }


  async fetchAllInternalRequest({ response }: HttpContext) {
    return response.ok(await this.internalRequestService.fetchAll());
  }

  async findInternalRequestByRequestNumber({ request, response }: HttpContext) {
    const number = request.param('number');
    return response.ok(await this.internalRequestService.findByRequestNumber(number));
  }
}