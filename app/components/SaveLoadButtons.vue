<template>
  <div>
    <div v-if="state == 'save'">
      <input ref="inputRef" type="text"/>
      <!-- <input ref="inputRef" type="text" list="datalist-saved-files-names"/>
      <datalist id="datalist-saved-files-names">
        <option v-for="name of savedNames">{{ name }}</option>
      </datalist> -->
    </div>
    <div v-else-if="state == 'load'">
      <input ref="fileInput" type="file" @change="onChangeFile" />
    </div>
    <div>
      <button v-if="!state" @click="state = 'save'">Save</button>
      <button v-if="!state" @click="state = 'load'">Load</button>
      <button v-if="state == 'save'" @click="$emit('save', inputRef ? inputRef.value : 'aux'); state = null;">Save</button>
      <!-- <button v-if="state == 'load'">Load</button> -->
      <button v-if="state" @click="state = null">Cancel</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// defineProps<{
//   savedNames: string[]
// }>();

const emit = defineEmits<{
  save: [name: string],
  load: [data: any],
}>();

const fileInput = useTemplateRef('fileInput');
const inputRef = useTemplateRef('inputRef');
const state: Ref<string | null> = ref(null);

async function getFileData(elem: HTMLInputElement) {
  return await new Response(elem.files!![0]).json().then(json => {
    return json;
  }, err => {
    // not json
  })
}

async function getInputFileData() {
  return await getFileData(fileInput.value!!);
}

function onChangeFile() {
  emit('load', getInputFileData());
  setTimeout(() => state.value=null, 3000);
}
</script>
