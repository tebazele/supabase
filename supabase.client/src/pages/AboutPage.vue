<template>
  <div class="container-fluid bg-dark darken-10 text-light">
    <div class="d-flex justify-content-center">
      <div class="about" v-html="content">
      </div>
    </div>
  </div>
</template>

<script setup>
import { marked } from 'marked'
import { logger } from '../utils/Logger.js';
import { onBeforeMount, onMounted, ref } from 'vue';
const content = ref('')
onBeforeMount(() => {
  loadMarkdown()
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
</script>

<style lang="scss">
.about {
  max-width: 80ch;

}

h1 {
  color: var(--bs-primary)
}

h1 {
  padding: .5em .2em;
  margin-bottom: .75em;
  border-bottom: 1px solid var(--bs-primary);
}

h2 {
  color: var(--bs-secondary);
  padding: .3em .1em;
  margin-bottom: .5em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.397);
}

p {
  margin: 0px .2em;
}

img {
  display: block;
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

pre {
  font-size: 12px;
  background-color: rgba(202, 236, 202, 0.1);
  border-radius: 8px;
  padding: 5px;
  padding-left: 1em;
  color: var(--bs-danger);
}
</style>
