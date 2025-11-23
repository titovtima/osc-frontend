<template>
  <div class="channel-group" :class="{ collapsed: !isExpanded }">
    <div class="group-header" @click="toggleGroup">
      <div class="group-toggle">
        <span class="toggle-icon">{{ isExpanded ? '▼' : '►' }}</span>
      </div>
      <div class="group-name">{{ group.name }}</div>
      <div class="group-channel-count">({{ visibleChannels.length }})</div>
    </div>
    
    <div v-if="isExpanded" class="group-channels">
      <ChannelShow 
        v-for="channel in visibleChannels" 
        :key="channel.number"
        :name="channel.name" 
        :number="channel.number"
        :level="levels[currentAuxNum][channel.number]" 
        @update:level="(value) => $emit('update:level', channel.number, currentAuxNum, value)"
        :pan="pans[currentAuxNum][channel.number]" 
        @update:pan="(value) => $emit('update:pan', channel.number, currentAuxNum, value)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  group: channelGroup;
  currentAuxNum: number;
  levels: any;
  pans: any;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:level': [channel: number, aux: number, value: number];
  'update:pan': [channel: number, aux: number, value: number];
  'toggle-group': [groupName: string];
}>();

const isExpanded = ref(true);

// Filter out hidden channels
const visibleChannels = computed(() => {
  return props.group.channels.filter(channel => !channel.hidden);
});

function toggleGroup() {
  isExpanded.value = !isExpanded.value;
  emit('toggle-group', props.group.name);
}
</script>

<style scoped>
.channel-group {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2; /* Ensure groups stack properly */
}

.channel-group.collapsed {
  background: rgba(255, 255, 255, 0.03);
}

.group-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.08);
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  position: relative;
  z-index: 3; /* Higher than group container */
  touch-action: manipulation; /* Better touch handling */
}

.group-header:hover {
  background: rgba(255, 255, 255, 0.12);
}

.group-toggle {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00b4db;
  font-size: 0.8rem;
}

.toggle-icon {
  transition: transform 0.2s ease;
}

.group-name {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  flex: 1;
}

.group-channel-count {
  font-size: 0.8rem;
  color: #ccc;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
}

.group-channels {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.02);
  position: relative;
  z-index: 1; /* Lower than header */
}

/* Animation for expand/collapse */
.group-channels {
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .channel-group {
    border-radius: 6px;
  }
  
  .group-header {
    padding: 0.5rem 0.75rem;
    gap: 0.5rem;
    min-height: 44px; /* Minimum touch target size for mobile */
  }
  
  .group-name {
    font-size: 0.9rem;
  }
  
  .group-channel-count {
    font-size: 0.7rem;
    padding: 0.15rem 0.4rem;
  }
  
  .group-channels {
    padding: 0.5rem;
    gap: 0.25rem;
  }
  
  /* Remove hover effects on mobile */
  .group-header:hover {
    background: rgba(255, 255, 255, 0.08);
  }
}

/* Mobile-specific improvements */
@media (hover: none) and (pointer: coarse) {
  .group-header {
    cursor: default; /* Remove cursor on touch devices */
  }
  
  .group-header:active {
    background: rgba(255, 255, 255, 0.15);
    transition: background 0.1s ease;
  }
}
</style>