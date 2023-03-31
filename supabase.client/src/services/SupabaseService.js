import { createClient } from "@supabase/supabase-js";
import { supabasePublicKey, supabaseUrl } from "../env.js";
import { logger } from "../utils/Logger.js";
import Pop from "../utils/Pop.js";

const seconds = 1000
const minutes = 60 * seconds
const hours = 60 * minutes
const days = 24 * hours

const fileOptions = {
  cacheControl: 1 * hours,
  upsert: true
}

let supabase = null
let bucket = null
class SupabaseService {
  /**
   *
   * @param {string} bucketName name of the storage project on supabase
   * @param {string} token supabase.token on the userInfo object from auth0 (needs additional rule in auth0)
   * initialized the instance of supabase for file storage
   */
  init(bucketName, token) {
    try {
      bucket = bucketName || 'default'
      supabase = createClient(supabaseUrl, supabasePublicKey, {
        global: {
          headers: {
            Authorization: 'Bearer ' + token
          }
        }
      })
      // call on load
      this.list('mick')
    } catch (error) {
      logger.log(error)
    }
  }
  /**
   *
   * @param {File} file data for single file to upload to supabase.
   * @param {string} name name of the file to upload ('MyCat.jpg') or ('cat_pictures/MyCat.jpg') to upload to a specific folder.
   * @returns {string} url of the file uploaded.
   */
  async upload(file, name) {
    try {
      const res = await supabase.storage.from(bucket).upload(`${name}`, file, fileOptions)
      logger.log('[UPLOAD COMPLETE]', `${supabase.storageUrl}/object/public/${bucket}/${res.data.path}`)
      return `${supabase.storageUrl}/object/public/${bucket}/${res.data.path}`
    } catch (error) {
      Pop.error(error.message)
      logger.error(error)
    }
  }

  /**
   *
   * @param {string} fileName path to file to remove from supabase including and folder names ('MyCat.jpg) or  ('cat_pictures/MyCat.jpg')
   */
  async remove(fileName) {
    try {
      const res = await supabase.storage.from(bucket).remove([fileName])
      logger.log('[SUPABASE REMOVE]', res.data)
    } catch (error) {
      Pop.error(error.message)
      logger.error(error)
    }
  }

  /**
   *
   * @param {string} folder path to folder or sub folder on supabase ('cat_pictures')
   * @returns {[object]} files located at that storage location
   */
  async list(folder = '') {
    try {
      if (folder && !folder.endsWith('/')) folder += '/'
      const res = await supabase.storage.from(bucket).list(folder)
      return res.data
    } catch (error) {
      Pop.error(error.message)
      logger.error(error)
    }
  }
}

export const supabaseService = new SupabaseService()
