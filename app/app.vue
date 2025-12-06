<template>
  <NuxtPage/>
</template>

<script setup lang="ts">
useHead({link: [{rel: 'manifest', href: '/manifest.json'}], htmlAttrs: { lang: 'ru' }});
</script>

<style>
* {
  margin: 0;
}

body {
  overflow: hidden;
  height: 100vh;
}

#__nuxt {
  overflow: hidden;
  height: 100%;
}
</style>
