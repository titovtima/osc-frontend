<template>
  <div>
    <div>
      <select ref="selectAuxElem" @change="changeAux(selectAuxElem.value)">
        <option v-for="aux in auxes" :value="aux.number">{{ aux.name }}</option>
      </select>
    </div>
    <ChannelShow v-for="channel in channels" :name="channel.name" 
      :level="levels[currentAuxNum][channel.number]" @update:level="(value) => sendLevelToServer(channel.number, currentAuxNum, value)"
      :pan="pans[currentAuxNum][channel.number]" @update:pan="(value) => sendPanToServer(channel.number, currentAuxNum, value)"
      />
  </div>
</template>

<script setup lang="ts">
const selectAuxElem: Ref<any> = ref(null);
const currentAuxNum = ref(0);

const channels: Ref<Array<any>> = ref([]);
const auxes: Ref<Array<any>> = ref([{number: 0, name: "aux 0", color: "ffffff"}]);

const maxAux = 32;
const maxChannel = 64;

const levels: Ref<any> = ref(new Array(maxAux+1));
const pans: Ref<any> = ref(new Array(maxAux+1));
for (let i = 0; i <= maxAux; i++) {
  levels.value[i] = new Array<number>(maxChannel+1).fill(0);
  pans.value[i] = new Array<number>(maxChannel+1).fill(0);
}

function changeAux(num: number) {
  console.log('changeAux for ' + num);
  currentAuxNum.value = num;
}

fetch(httpHost + "/channels").then(res => res.json()).then(res => {
  channels.value = res.channels;
  createWs();
});

fetch(httpHost + "/auxes").then(res => res.json()).then(res => {
  auxes.value = res.auxes;
  currentAuxNum.value = 1;
});

let ws = new WebSocket("ws://" + host);

function createWs() {
  let ws = new WebSocket("ws://" + host);

  ws.onmessage = (event) => {
    let data = JSON.parse(event.data);
    let addrLevels: string[] = data.address.split('/');
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
  };

  ws.onclose = () => {
    createWs();
  }

  ws.onerror = () => {
    ws.close();
    createWs();
  }

  ws.onopen = () => {
    ws.send(JSON.stringify({address: 'init', args:[]}));
  }
}

function sendLevelToServer(channel: number, aux: number, value: number) {
  ws.send(JSON.stringify({address: '/channel/' + channel + '/send/' + aux + '/level', args: [value]}))
}

function sendPanToServer(channel: number, aux: number, value: number) {
  ws.send(JSON.stringify({address: '/channel/' + channel + '/send/' + aux + '/pan', args: [value]}))
}
</script>
