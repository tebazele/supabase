<template>
  <div class="container-fluid bg-dark darken-10 text-light d-md-flex">

    <section class="w-25 sticky-top p-1 h-25 d-none d-md-block">
      <div class="border border-success rounded p-2">
        <h4 class="text-primary">Steps</h4>
        <div v-for="link in links" class="fade-in mt-2">
          <router-link class="text-primary selectable lighten-20 p-2 rounded" :to="link.href"
            @click="scrollTo(link.href)"> # {{ link.title }}
          </router-link>
        </div>
        <div class="mt-2 text-info ps-2">
          <a href="https://supabase.com/docs/reference/javascript/start" target="_blank"><i class="mdi mdi-link"></i>
            supabase docs</a>
        </div>
      </div>
    </section>
    <section class="pb-5">
      <div class="d-md-flex justify-content-start ps-md-4">
        <div class="about" v-html="content">
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { marked } from 'marked'
import { logger } from '../utils/Logger.js';
import { onBeforeMount, onMounted, ref } from 'vue';
const content = ref('')
const links = ref([])
onBeforeMount(() => {
  loadMarkdown()
})
onMounted(() => {
  setTimeout(attachCopy, 500)
  setTimeout(createNav, 500)
})
async function loadMarkdown() {
  try {
    let res = await fetch('/AboutPage.md')
    const markdown = await res.text()
    content.value = marked.parse(markdown)
  } catch (error) {
    logger.error(error)
  }
}

function attachCopy() {
  const blocks = document.querySelectorAll('pre')
  blocks.forEach(b => {
    let btn = document.createElement('button')
    btn.innerHTML = '<i class="mdi mdi-content-copy"></i>'
    btn.classList.add('selectable', 'btn', 'copy-button')
    btn.addEventListener('click', () => copy(b))
    b.appendChild(btn)
  })
}
function copy(elm) {
  navigator.clipboard.writeText(elm.innerText)
}

function createNav() {
  let headers = document.querySelectorAll('h2')
  headers.forEach(h => {
    h.id = h.innerText.replace(/ /ig, '-')
    links.value.push({ href: '#' + h.id, title: h.innerText })
  })
}

function scrollTo(id) {
  document.querySelector(id).scrollIntoView()
}
</script>

<style lang="scss">
.about {
  max-width: 80ch;

}

a {
  color: var(--bs-primary)
}

h1 {
  color: var(--bs-primary)
}

h1 {
  padding: .5em .2em;
  margin-bottom: .75em;
  border-bottom: 2px solid var(--bs-primary);
}

h2 {
  color: var(--bs-secondary);
  padding: .3em .1em;
  margin-bottom: .5em;
  border-bottom: 1px dotted rgba(255, 255, 255, 0.397);
}

p {
  margin: 0px .2em;
}

pre {
  position: relative;

  .copy-button {
    position: absolute;
    border: 0;
    top: 5px;
    right: 5px;
    padding: .5em .75em;
    border-radius: 8px;
    color: var(--bs-dark);
    cursor: pointer
  }
}

img {
  width: 90%;
  margin: .75em auto;
  border-radius: 8px;
}

[alt="supabase_logo"] {
  width: 1em;
}

[alt*="small_"] {
  width: 10%;
}

[alt*="inline_"] {
  display: inline-block;
}

[alt*="flex"] {
  display: flex;
}

[alt*="w_25_"] {
  width: 25%
}

[alt*="w_50_"] {
  width: 50%;
}

[alt*="w_75_"] {
  width: 75%
}

[alt*="w_100_"] {
  width: 100%
}

[alt*="5_vh_"] {
  max-height: 5vh;
  width: 100%;
}

[alt*="10_vh_"] {
  max-height: 10vh;
  width: 100%;
}


pre {
  min-height: 4em;
  font-size: 12px;
  background-color: rgba(202, 236, 202, 0.1);
  border-radius: 8px;
  padding: 5px;
  padding-left: 1em;
  color: var(--bs-warning);
}

.fade-in {
  opacity: 0;
  animation: fade-in .25s ease forwards
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
</style>
