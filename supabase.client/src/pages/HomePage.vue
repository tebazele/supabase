<template>
  <div class="container-fluid">
    <!-- SECTION polaroids masonry -->
    <section class="masonry my-4">
      <!-- STUB single polaroid -->
      <div class="item text-center" v-for="p in polaroids" :key="p.id">
        <div class=" bg-white rounded p-0 elevation-2 polaroid">
          <img :src="p.imgUrl" class="img-fluid rounded-top" :alt="p.title" width="640" height="360">
          <h4 class="p-1">{{ p.title }}</h4>
          <p class="p-1">{{ formatDate(p.createdAt) }}</p>
        </div>
        <button v-if="account.id == p.creatorId" @click="deletePolaroid(p.id)" class="btn btn-danger delete-btn"
          title="delete me"><i class="mdi mdi-delete-forever"></i></button>
      </div>
      <!--  -->
      <!-- SECTION inline form -->
      <div v-if="account.id" class="item bg-white rounded elevation-2 p-2">
        <h5 class="text-primary"><i class="mdi mdi-plus"></i> <i class="mdi mdi-image"></i></h5>
        <form @submit.prevent="uploadPolaroid">
          <div class="mb-3">
            <label for="">name</label>
            <input class="form-control" type="text" v-model="editable.title" maxlength="15" required>
          </div>
          <div class="mb-3">
            <input class="form-control" type="file" accept="image/*" name="fileInput" required>
          </div>
          <button class="btn btn-primary w-100">submit</button>
        </form>
      </div>
      <!--  -->
    </section>
  </div>
</template>

<script>
import { logger } from '../utils/Logger.js';
import { onMounted, ref } from 'vue';
import { computed } from '@vue/reactivity';
import { AppState } from '../AppState.js';
import { polaroidsService } from '../services/PolaroidsService.js'

export default {
  setup() {
    const editable = ref({})
    onMounted(() => {
      getPolaroids()
    })
    async function getPolaroids() {
      try {
        await polaroidsService.getPolaroids()
      } catch (error) {
        logger.error(error)
      }
    }
    return {
      editable,
      account: computed(() => AppState.account),
      polaroids: computed(() => AppState.polaroids),
      uploadPolaroid(e) {
        // file inputs regardless of files chosen return an array
        const file = e.target.fileInput.files[0] // file cannot be v-modeled
        polaroidsService.createPolaroid(file, editable.value)
        editable.value = {} // reset editable
        e.target.reset() // clear file input
      },
      deletePolaroid(polaroidId) {
        polaroidsService.deletePolaroid(polaroidId)
      },
      formatDate(dateString) {
        const date = new Date(dateString)
        return date.toLocaleDateString()
      }
    }
  }
}
</script>

<style scoped lang="scss">
.container-fluid {
  overflow-x: hidden;
}

.masonry {
  columns: 250px;

  .item {
    position: relative;
    display: inline-block;
    width: 100%;
    margin-top: 1em;

    &:hover .delete-btn {
      opacity: 1;
      transform: scale(1) translate(0px, 0px);
      transition: .2s .3s ease;
    }

    img {
      margin: 0;
      border-radius: unset;
      width: 100%;
    }
  }
}

.delete-btn {
  border-radius: 50em;
  position: absolute;
  top: -1em;
  right: -1em;
  opacity: 0;
  transform: scale(0) translate(-20px, 20px);
}

.polaroid {
  opacity: 0;
  animation: drop-in .4s ease forwards;
}

@keyframes drop-in {
  0% {
    opacity: 0;
    transform: translateY(-50px) rotateZ(10deg);
  }

  100% {
    opacity: 1;
    transform: translateY(0px) rotateZ(0deg);
  }
}
</style>
