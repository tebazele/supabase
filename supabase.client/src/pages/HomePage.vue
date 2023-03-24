<template>
  <div class="home flex-grow-1 d-flex flex-column align-items-center justify-content-center">
    <div class="home-card p-5 bg-white rounded elevation-3">
      <div class="row">
        <div class="col-3" v-for="i in images">
          <img class="img-fluid" :title="i.name"
            :src="'https://uoxkuoksvnbowxkngjfv.supabase.co/storage/v1/object/public/sandbox/test/' + i.name" alt="">
          <button class="btn btn-danger" @click="deletePic(i.name)"><i class="mdi mdi-delete"></i></button>
        </div>
      </div>
      <form @submit.prevent="upload">
        <input type="file" name="fileInput">
        <button>submit</button>
      </form>
    </div>
    <div class="row">
      <div>
        <input type="text" v-model="editable.title">
        <button class="btn btn-info" @click="createTodo"><i class="mdi mdi-plus"></i></button>
      </div>
      <div class="col-6"><button class="btn btn-success" @click="getTest">get Todos</button></div>
      <div class="row">
        <div class="col-12" v-for="t in todos">{{ t.title }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { logger } from '../utils/Logger.js';
import { supabaseService } from '../services/SupabaseService.js'
import { onMounted, ref } from 'vue';
import { computed } from '@vue/reactivity';
import { AppState } from '../AppState.js';
export default {
  setup() {
    const editable = ref({})
    onMounted(() => {
      supabaseService.list('mick')
    })
    return {
      editable,
      todos: computed(() => AppState.todos),
      images: computed(() => AppState.images),
      upload(e) {
        const file = e.target.fileInput.files[0]
        logger.log(file)
        supabaseService.upload(file, 'mick/' + file.name)
      },
      deletePic(name) {
        supabaseService.deletePic(name)
      },
      getTest() {
        supabaseService.getTodos()
      },
      createTodo() {
        supabaseService.createTodo(editable.value)
        editable.value = {}
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
