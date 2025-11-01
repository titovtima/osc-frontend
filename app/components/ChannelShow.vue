<template>
  <div>
    <div>
      {{ name }}
    </div>
    <div style="display: flex; align-items: stretch;">
      <button style="flex: 0 1 auto;" ref="minusButtonPan" class="unselectable">
        -
      </button>
      <div style="flex: 1 1 20px; width: 100%; margin: 0 0.5rem;">
        <div style="height: 100%; display: flex; align-items: center; position: relative; touch-action: none;" ref="panElem">
          <div style="width: 100%; height: 0.1rem; background-color: #aaa; z-index: -2;">
          </div>
          <div class="unselectable"
            style="position: absolute; width: 1rem; height: 1rem; border-radius: 0.5rem; background-color: #555; z-index: -1; text-align: center;" 
            :style="{left: 'calc(' + panToSlider(panRef) + '% - 0.5rem)' }">
            {{ Math.round(panRef * panRound) / panRound }}
          </div>
        </div>
      </div>
      <button style="flex: 0 1 auto;" ref="plusButtonPan" class="unselectable">
        +
      </button>
    </div>
    <div style="display: flex;">
      <button style="flex: 0 1 auto;" ref="minusButtonLvl" class="unselectable">
        -
      </button>
      <div style="flex: 1 1 20px; background-color: #aaa; padding: 2px; margin: 0 0.5rem; position: relative; touch-action: none;" ref="bar">
        <div style="background-color: #fff; height: 100%;" :style="{width: dbToSlider(levelRef) * 100 / maxValue + '%'}">
        </div>
        <div style="position: absolute; bottom: 0; left: 50%;">
          <div style="position: relative; left: -50%; height: min-content;" class="unselectable">
            {{ Math.round(levelRef * roundWith) / roundWith }}
          </div>
        </div>
      </div>
      <button style="flex: 0 1 auto;" ref="plusButtonLvl" class="unselectable">
        +
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
let props = defineProps({
  name: String,
  level: {
    type: Number,
    required: true,
  },
  pan: {
    type: Number,
    required: true,
  },
});

let emit = defineEmits(['update:level', 'update:pan']);

let bar = ref();
let panElem = ref();
let plusButtonLvl = ref();
let minusButtonLvl = ref();
let plusButtonPan = ref();
let minusButtonPan = ref();

let panRef = ref(props.pan);
watch(() => props.pan, () => {
  panRef.value = props.pan;
});

let levelRef = ref(props.level);
watch(() => props.level, () => {
  levelRef.value = props.level;
});

const maxValue = 100;
const minValue = 0;
const step = 0.5;
const minDbValue = -150;
const maxDbValue = 10;
const logBase = 100;
const roundWith = 10;

function sliderToDb(value: number): number {
  return ((Math.log(value*(logBase - 1)/(maxValue - minValue) + (1 - minValue)) / Math.log(logBase)) * (maxDbValue - minDbValue)) + minDbValue;
}

function dbToSlider(db: number): number {
	return (Math.pow(logBase, (db - minDbValue) / (maxDbValue - minDbValue)) - (1 - minValue)) * (maxValue - minValue)/(logBase - 1);
}

const maxPanValue = 1;
const minPanValue = -1;
const panRound = 100;
const panStep = 0.01;

function sliderToPan(value: number): number {
  return value / 50 - 1;
}

function panToSlider(pan: number): number {
  return (pan + 1) * 50;
}

onMounted(() => {
  let handlerLvl = (event: PointerEvent) => {
    let barRect = bar.value.getBoundingClientRect();
    let newValue = (event.clientX - barRect.x + 2) * maxValue / (barRect.width - 4);

    newValue = Math.max(minValue, Math.min(maxValue, newValue));

    levelRef.value = sliderToDb(newValue);
    emit('update:level', levelRef.value);
  }

  bar.value.addEventListener('pointerdown', (event: PointerEvent) => {
    handlerLvl(event);
    bar.value.addEventListener('pointermove', handlerLvl);
  });

  plusButtonLvl.value.onclick = () => {
    levelRef.value = Math.min(maxDbValue, levelRef.value + step);
    emit('update:level', levelRef.value);
  };

  minusButtonLvl.value.onclick = () => {
    levelRef.value = Math.max(minDbValue, levelRef.value - step);
    emit('update:level', levelRef.value);
  };

  let handlerPan = (event: PointerEvent) => {
    let barRect = panElem.value.getBoundingClientRect();
    let newValue = (event.clientX - barRect.x + 2) * 100 / (barRect.width - 4);

    newValue = Math.max(minValue, Math.min(maxValue, newValue));

    panRef.value = sliderToPan(newValue);
    emit('update:pan', panRef.value);
  };

  panElem.value.addEventListener('pointerdown', (event: PointerEvent) => {
    handlerPan(event);
    panElem.value.addEventListener('pointermove', handlerPan);
  });

  plusButtonPan.value.onclick = () => {
    panRef.value = Math.min(maxPanValue, panRef.value + panStep);
    emit('update:pan', panRef.value);
  };

  minusButtonPan.value.onclick = () => {
    panRef.value = Math.max(minPanValue, panRef.value - panStep);
    emit('update:pan', panRef.value);
  };

  document.addEventListener('pointerup', () => {
    bar.value.removeEventListener('pointermove', handlerLvl);
    panElem.value.removeEventListener('pointermove', handlerPan);
  });
});
</script>

<style>
.unselectable {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
