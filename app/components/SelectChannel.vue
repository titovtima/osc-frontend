<template>
  <div v-if="scroll" style="display: flex; flex-direction: row;">
    <span v-if="reorder && selected" class="selected item" style="flex: 0 1 5rem;">
      {{ selected }}
    </span>
    <span style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
      <div style="width: max-content;">
        <div v-for="option in showList" @click="() => $emit('select', option)"
            class="item" :class="{selected : selected == option}">
          {{ option }}
        </div>
      </div>
    </span>
  </div>
  <div v-else>
    <div v-for="option in showList" @click="() => $emit('select', option)"
        class="item" :class="{selected : selected == option}">
      {{ option }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  list: {
    type: Array<string>,
    required: true,
  },
  selected: [String, null],
  scroll: {
    type: Boolean,
    default: false,
  },
  reorder: {
    type: Boolean,
    default: false,
  },
});

const showList = computed(() => props.list);
// const showList = computed(() => props.reorder && props.selected && props.list.includes(props.selected) ? 
  // [props.selected].concat(props.list.filter(value => value != props.selected)) : props.list);

defineEmits<{
  select: [option: string]
}>();
</script>

<style scoped>
.item {
  display: inline-block;
  /* width: 4rem;  */
  word-wrap: none; 
  /* overflow: hidden; */
  /* overflow: auto; */
  padding: 0.5rem;
  height: 1rem; 
  border-radius: 0.5rem; 
  line-height: 1rem;
  box-sizing: content-box;
  text-align: center;
  background: #333333;
  margin: 0 0.25rem 0.25rem;
}

.selected.item {
  background: #555555;
}
</style>
