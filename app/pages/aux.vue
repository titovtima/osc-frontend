<template>
  <div class="mixer-container">
    <div class="mixer-header">
      <h1 class="mixer-title">DiGiCo AUX Mixer</h1>
      <div class="aux-selector-container">
        <label class="aux-selector-label">AUX Bus:</label>
        <select 
          ref="selectAuxElem" 
          @change="changeAux(selectAuxElem.value)"
          class="aux-selector"
        >
          <option 
            v-for="aux in auxes" 
            :value="aux.number" 
            :key="aux.number"
            :style="{ color: '#' + aux.color }"
            :selected="currentAuxNum == aux.number"
          >
            {{ aux.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="channels-scroll-container">
      <div class="channels-container">
        <ChannelGroupShow 
          v-for="group in channelGroups" 
          :key="group.name"
          :group="group"
          :current-aux-num="currentAuxNum"
          :levels="levels"
          :pans="pans"
          @update:level="sendLevelToServer"
          @update:pan="sendPanToServer"
          @toggle-group="toggleGroup"
        />
      </div>
    </div>

    <div class="mixer-footer">
      <div class="status-indicator" :class="{ connected: wsConnected }">
        {{ wsConnected ? 'Connected' : 'Disconnected' }}
      </div>
      <div class="current-aux-display">
        {{ auxes.find(a => a.number === currentAuxNum)?.name || 'None' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const selectAuxElem: Ref<any> = ref(null);
const currentAuxNum = ref(0);
const wsConnected = ref(false);

const channelGroups: Ref<channelGroup[]> = ref([]);
const auxes: Ref<Array<any>> = ref([{number: 0, name: "aux 0", color: "ffffff"}]);

// console.log(config);
const levels: Ref<any> = ref(new Array(config.maxAux+1));
const pans: Ref<any> = ref(new Array(config.maxAux+1));
for (let i = 0; i <= config.maxAux; i++) {
  levels.value[i] = new Array<number>(config.maxChannel+1).fill(0);
  pans.value[i] = new Array<number>(config.maxChannel+1).fill(0);
}

// Track expanded/collapsed state for groups
const groupExpandedState = ref<Record<string, boolean>>({});

const localStorageCurrentAuxKey = 'currentAux';
function changeAux(num: number) {
  console.log('changeAux for ' + num);
  currentAuxNum.value = num;
  localStorage.setItem(localStorageCurrentAuxKey, String(num));
}

// Toggle group expand/collapse
function toggleGroup(groupName: string) {
  groupExpandedState.value[groupName] = !groupExpandedState.value[groupName];
}

// Check if group is expanded
function isGroupExpanded(groupName: string): boolean {
  return groupExpandedState.value[groupName] !== false; // Default to expanded
}

loadConfigPromise.then(() => {
  fetch('http://' + config.host + "/channels").then(res => res.json()).then(res => {
    if (res.channels) {
      channelGroups.value = res.channels;
      // Initialize all groups as expanded by default
      channelGroups.value.forEach(group => {
        groupExpandedState.value[group.name] = true;
      });
    } else if (res.channels) {
      // Fallback: create a single group with all channels
      channelGroups.value = [{
        name: "All Channels",
        order: 0,
        hidden: false,
        channels: res.channels
      }];
      groupExpandedState.value["All Channels"] = true;
    }
    createWs();
  });

  fetch('http://' + config.host + "/auxes").then(res => res.json()).then(res => {
    auxes.value = res.auxes;
  });
});

let ws: WebSocket;

function createWs() {
  ws = new WebSocket("ws://" + config.host);

  ws.onmessage = (event) => {
    let data = JSON.parse(event.data);
    let addrLevels: string[] = data.address.split('/');
    if (config.consoleType == 's') {
      if (addrLevels.length == 6 && addrLevels[1] == 'channel' && addrLevels[3] == 'send' && addrLevels[5] == 'level') {
        let channelNum = Number(addrLevels[2]);
        let auxNum = Number(addrLevels[4]);
        levels.value[auxNum][channelNum] = data.args[0];
      }
      if (addrLevels.length == 6 && addrLevels[1] == 'channel' && addrLevels[3] == 'send' && addrLevels[5] == 'pan') { 
        let channelNum = Number(addrLevels[2]);
        let auxNum = Number(addrLevels[4]);
        pans.value[auxNum][channelNum] = data.args[0];
      }
    } else {
      if (addrLevels.length == 7 && addrLevels[2] == 'Input_Channels' && addrLevels[4] == 'Aux_Send' && addrLevels[6] == 'send_level') {
        let channelNum = Number(addrLevels[3]);
        let auxNum = Number(addrLevels[5]);
        levels.value[auxNum][channelNum] = sliderToDb(data.args[0] * 100);
      }
      if (addrLevels.length == 7 && addrLevels[2] == 'Input_Channels' && addrLevels[4] == 'Aux_Send' && addrLevels[6] == 'send_pan') {
        let channelNum = Number(addrLevels[3]);
        let auxNum = Number(addrLevels[5]);
        pans.value[auxNum][channelNum] = sliderToPan(data.args[0] * 100);
      }
    }
  };

  ws.onclose = () => {
    wsConnected.value = false;
    setTimeout(createWs, 2000);
  }

  ws.onerror = () => {
    wsConnected.value = false;
    ws.close();
  }

  ws.onopen = () => {
    wsConnected.value = true;
    ws.send(JSON.stringify({address: 'init', args:[]}));
  }
}

function sendLevelToServer(channel: number, aux: number, value: number) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    if (config.consoleType == 's') {
      ws.send(JSON.stringify({address: '/channel/' + channel + '/send/' + aux + '/level', args: [value]}))
    } else {
      ws.send(JSON.stringify({address: '/sd/Input_Channels/' + channel + '/Aux_Send/' + aux + '/send_level', 
        args: [dbToSlider(value) / 100.0]}))
    }
    levels.value[aux][channel] = value;
  }
}

function sendPanToServer(channel: number, aux: number, value: number) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    if (config.consoleType == 's') {
      ws.send(JSON.stringify({address: '/channel/' + channel + '/send/' + aux + '/pan', args: [value]}))
    } else {
      ws.send(JSON.stringify({address: '/sd/Input_Channels/' + channel + '/Aux_Send/' + aux + '/send_pan',
        args: [panToSlider(value) / 100.0]}))
    }
    pans.value[aux][channel] = value;
  }
}

onMounted(() => {
  try {
    currentAuxNum.value = Number(localStorage.getItem(localStorageCurrentAuxKey));
  } catch(_) {
  }
  if (currentAuxNum.value == 0)
    currentAuxNum.value = 1;
})
</script>

<style scoped>
.mixer-container {
  min-height: 100vh;
  min-height: 100dvh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
  padding: 0.5rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.mixer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

.mixer-title {
  font-size: 1.25rem;
  font-weight: 300;
  margin: 0;
  background: linear-gradient(45deg, #00b4db, #0083b0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.aux-selector-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.aux-selector-label {
  font-size: 0.9rem;
  color: #ccc;
}

.aux-selector {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 0.5rem;
  color: white;
  font-size: 0.9rem;
  min-width: 120px;
}

/* New scroll container for better mobile handling */
.channels-scroll-container {
  flex: 1;
  overflow: hidden;
  position: relative;
  margin-bottom: 1rem;
  min-height: 0; /* Critical for flex scrolling */
}

.channels-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  position: relative;
  z-index: 1;
}

/* Hide scrollbar for Webkit browsers */
.channels-container::-webkit-scrollbar {
  display: none;
}

.mixer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  margin-top: auto;
  position: relative;
  z-index: 10;
}

.status-indicator {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  background: #e74c3c;
}

.status-indicator.connected {
  background: #27ae60;
}

.current-aux-display {
  font-size: 0.9rem;
  color: #00b4db;
  font-weight: 500;
}

@media (max-width: 768px) {
  .mixer-container {
    padding: 0.25rem;
    min-height: 100dvh;
    height: 100dvh;
  }
  
  .mixer-header {
    padding: 0.5rem;
    margin-bottom: 0.5rem;
  }
  
  .mixer-title {
    font-size: 1.1rem;
  }
  
  .channels-scroll-container {
    margin-bottom: 0.5rem;
  }
  
  .channels-container {
    gap: 0.25rem;
  }
  
  .mixer-footer {
    padding: 0.5rem;
  }
}

/* Special fix for mobile browsers with bottom bars */
@supports (padding: max(0px)) {
  .mixer-container {
    padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
  }
}

/* Fix for iOS Safari */
@supports (-webkit-touch-callout: none) {
  .mixer-container {
    min-height: -webkit-fill-available;
  }
  
  /* iOS specific scroll fix */
  .channels-scroll-container {
    -webkit-overflow-scrolling: touch;
  }
}
</style>
