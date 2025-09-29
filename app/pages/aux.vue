<template>
  <div>
    <Channel name="channel name" :value="0" @update:value="value => sendToServer(13, 1, value)"/>
  </div>
</template>

<script setup lang="ts">
const host = 'http://10.96.250.95:8002/'
// const host = 'http://127.0.0.1:8002/'

function sendToServer(channel: number, aux: number, value: number) {
  fetch(host, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({address: "/channel/13/fader", args: [value]})
  });
}


</script>
