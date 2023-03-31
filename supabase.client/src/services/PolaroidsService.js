import { AppState } from "../AppState.js"
import { logger } from "../utils/Logger.js"
import { api } from "./AxiosService.js"
import { supabaseService } from "./SupabaseService.js"


class PolaroidsService {

  async getPolaroids() {
    const res = await api.get('api/polaroids')
    AppState.polaroids = res.data
  }

  async createPolaroid(file, polaroidData) {
    const folder = AppState.user.id
    const url = await supabaseService.upload(file, `${folder}/${polaroidData.title}`)
    polaroidData.imgUrl = url
    const res = await api.post('api/polaroids', polaroidData)
    AppState.polaroids.push(res.data)
  }

  async deletePolaroid(polaroidId) {
    const polaroidIndex = AppState.polaroids.findIndex(p => p.id == polaroidId)
    const polaroid = AppState.polaroids[polaroidIndex]
    const storagePath = `${AppState.account.id}/${polaroid.title}`
    const storageRes = await supabaseService.remove(storagePath)
    logger.log('[SUPA DELETE]', storageRes)
    const res = await api.delete(`api/polaroids/${polaroidId}`)
    logger.log('[API DELETE]', res.data)
    AppState.polaroids.splice(polaroidIndex, 1)
  }

}

export const polaroidsService = new PolaroidsService()
