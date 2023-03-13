import { createClient } from "@supabase/supabase-js";
import { supaPrivatKey, supabasePublicKey, supabaseUrl } from "../env.js";
import { logger } from "../utils/Logger.js";
import Pop from "../utils/Pop.js";

const supabase = createClient(supabaseUrl, supaPrivatKey, {
  auth: {

  }
})
const uri = 'https://uoxkuoksvnbowxkngjfv.supabase.co/storage/v1/object/public/sandbox/'

class SupabaseService {
  async upload(file, name) {
    try {
      const { data } = await supabase.storage.from('sandbox').upload('test/' + name, file, { upsert: true, owner: 'Mickle' })
      logger.log('[UPLOAD COMPLETE]', uri + data.path)
    } catch (error) {
      Pop.error(error.message)
      logger.error(error)
    }
  }
}

export const supabaseService = new SupabaseService()
