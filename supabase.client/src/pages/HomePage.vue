<template>
  <div class="home flex-grow-1 d-flex flex-column align-items-center justify-content-center">
    <div class="home-card p-5 bg-white rounded elevation-3">
      <form @submit.prevent="upload">
        <input type="file" name="fileInput">
        <button>submit</button>
      </form>
    </div>
  </div>
</template>

<script>
import { logger } from '../utils/Logger.js';
import { supabaseService } from '../services/SupabaseService.js'
export default {
  setup() {
    return {
      upload(e) {
        const file = e.target.fileInput.files[0]
        logger.log(file)
        supabaseService.upload(file, file.name)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.home {
  display: grid;
  height: 80vh;
  place-content: center;
  text-align: center;
  user-select: none;

  .home-card {
    width: 50vw;

    >img {
      height: 200px;
      max-width: 200px;
      width: 100%;
      object-fit: contain;
      object-position: center;
    }
  }
}
</style>
