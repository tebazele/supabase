import { Auth0Provider } from "@bcwdev/auth0provider"
import BaseController from "../utils/BaseController.js"
import { polaroidsService } from "../services/PolaroidsService.js"



export class PolaroidsController extends BaseController {
  constructor() {
    super('api/polaroids')
    this.router
      .get('', this.getAll)
      .use(Auth0Provider.getAuthorizedUserInfo)
      .post('', this.create)
      .delete('/:id', this.remove)
  }


  async getAll(req, res, next) {
    try {
      const polaroids = await polaroidsService.getAll(req.query)
      return res.send(polaroids)
    } catch (error) {
      next(error)
    }
  }

  async create(req, res, next) {
    try {
      req.body.creatorId = req.userInfo.id
      const polaroid = await polaroidsService.create(req.body)
      return res.send(polaroid)
    } catch (error) {
      next(error)
    }
  }
  async remove(req, res, next) {
    try {
      const message = await polaroidsService.remove(req.params.id, req.userInfo.id)
      return res.send(message)
    } catch (error) {
      next(error)
    }
  }

}
