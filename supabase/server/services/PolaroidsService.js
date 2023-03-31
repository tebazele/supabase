import { dbContext } from "../db/DbContext.js";
import { BadRequest, Forbidden } from "../utils/Errors.js";



class PolaroidsService {
  async getAll(query = {}) {
    const polaroids = await dbContext.Polaroids.find(query).populate('creator')
    return polaroids
  }
  async create(body) {
    const polaroid = await dbContext.Polaroids.create(body)
    polaroid.populate('creator')
    return polaroid
  }
  async remove(id, userId) {
    const original = await dbContext.Polaroids.findById(id)
    if (!original) throw new BadRequest(`no polaroid by that id: ${id}`)
    if (original.creatorId != userId) throw new Forbidden("You don't own that")
    original.remove()
    return `Deleted ${original.title}`
  }

}

export const polaroidsService = new PolaroidsService()
