<template>
  <div class="home">
    <div class="page-title">
      <h1>Cheetah is the fastest animal on land</h1>
    </div>
    <br>
    <div
      class="grid"
    >
      <c-grid
        :data="data"
        :frozen-col-count="2"
      >
        <c-grid-column
          :width="60"
          field="check"
          column-type="check"
          action="check"
        />
        <c-grid-column
          :column-style="{ textAlign: 'center' }"
          :sort="true"
          :width="70"
          field="no"
        >
          No
        </c-grid-column>
        <c-grid-column
          :width="300"
          :sort="true"
          :icon="{
            src: 'icon',
            width: 26
          }"
          field="name"
          :column-style="record => {
            return record.no === 1
              ? {
                indicatorTopLeft: {
                  style: 'triangle',
                  color: '#ff9933'
                }
              }
              : undefined
          }"
        >
          Name
        </c-grid-column>
        <c-grid-column
          :width="300"
          :icon="{
            src: 'habitat',
            width: 26
          }"
          field="area"
        >
          Habitat
        </c-grid-column>

        <c-grid-percent-complete-bar-column
          :sort="true"
          :min="0"
          :max="120"
          :formatter="s => { return '' }"
          :column-style="{
            barHeight: 25
          }"
          field="speed"
          width="400"
        >
          Speed
        </c-grid-percent-complete-bar-column>

        <c-grid-percent-complete-bar-column
          :sort="true"
          :column-style="{
            barHeight: 5,
            barColor: '#F48FB1'
          }"
          :formatter="s => { return `${s}cm` }"
          :min="0"
          :max="5500"
          field="length"
          width="200"
        >
          Length
        </c-grid-percent-complete-bar-column>
        <c-grid-percent-complete-bar-column
          :sort="true"
          :formatter="s => { return `${s}kg` }"
          :column-style="{
            barHeight: 5,
            barColor: '#7986CB'
          }"
          :min="0"
          :max="5400"
          field="weight"
          width="200"
        >
          Weight
        </c-grid-percent-complete-bar-column>
        <c-grid-button-column
          :width="150"
          caption="DETAIL"
          @click="clickRec"
        >
          Button
        </c-grid-button-column>
      </c-grid>
    </div>
  </div>
</template>
<script>

import * as cGridAll from 'vue-cheetah-grid'

const records = [
  { no: 1, check: 'true', name: 'Cheetah', icon: './animals-icons/cheetah.png', habitat: './animals-icons/africa.png', area: 'Africa', length: 150, weight: 60, speed: 120 },
  { no: 2, check: 'false', name: 'Lion', icon: './animals-icons/lion.png', habitat: './animals-icons/africa.png', area: 'Africa', length: 200, weight: 200, speed: 79.2 },
  { no: 3, check: 'true', name: 'Wolf', icon: './animals-icons/wolf.png', habitat: './animals-icons/world.png', area: 'World', length: 150, weight: 40, speed: 60 },
  { no: 4, check: 'false', name: 'Tiger', icon: './animals-icons/tiger.png', habitat: './animals-icons/asia.png', area: 'Asia', length: 280, weight: 200, speed: 64.8 },
  { no: 5, check: 'true', name: 'Cat', icon: './animals-icons/cat.png', habitat: './animals-icons/world.png', area: 'World', length: 75, weight: 5, speed: 30 },
  { no: 6, check: 'false', name: 'Dog', icon: './animals-icons/dog.png', habitat: './animals-icons/africa.png', area: 'Africa', length: 100, weight: 10, speed: 69.6 },
  { no: 7, check: 'true', name: 'Rat', icon: './animals-icons/rat.png', habitat: './animals-icons/asia.png', area: 'Asia', length: 0.2, weight: 0.5, speed: 39.6 },
  { no: 8, check: 'false', name: 'Elephant', icon: './animals-icons/elephant.png', habitat: './animals-icons/asia.png', area: 'Asia', length: 5500, weight: 5400, speed: 36 },
  { no: 9, check: 'true', name: 'Giraffe', icon: './animals-icons/giraffe.png', habitat: './animals-icons/africa.png', area: 'Africa', length: 5300, weight: 1930, speed: 54 },
  { no: 10, check: 'false', name: 'Turtle', icon: './animals-icons/turtle.png', habitat: './animals-icons/asia.png', area: 'Asia', length: 200, weight: 900, speed: 9.6 },
  { no: 11, check: 'true', name: 'Rabbit', icon: './animals-icons/rabbit.png', habitat: './animals-icons/asia.png', area: 'Asia', length: 76, weight: 2, speed: 72 },
  { no: 12, check: 'true', name: 'Gorilla', icon: './animals-icons/gorilla.png', habitat: './animals-icons/africa.png', area: 'Africa', length: 170, weight: 160, speed: 49.2 },
  { no: 13, check: 'false', name: 'Monkey', icon: './animals-icons/monkey.png', habitat: './animals-icons/asia.png', area: 'Asia', length: 60, weight: 18, speed: 57.6 },
  { no: 14, check: 'true', name: 'Rhinoceros', icon: './animals-icons/rhinoceros.png', habitat: './animals-icons/africa.png', area: 'Africa', length: 400, weight: 2300, speed: 48 },
  { no: 15, check: 'false', name: 'Horse', icon: './animals-icons/horse.png', habitat: './animals-icons/africa.png', area: 'Africa', length: 170, weight: 800, speed: 63.6 },
  { no: 16, check: 'true', name: 'Kangaroo', icon: './animals-icons/kangaroo.png', habitat: './animals-icons/africa.png', area: 'Africa', length: 160, weight: 85, speed: 60 },
  { no: 17, check: 'false', name: 'Penguin', icon: './animals-icons/penguin.png', habitat: './animals-icons/world.png', area: 'World', length: 100, weight: 45, speed: 8.4 },
  { no: 18, check: 'true', name: 'Crocodile', icon: './animals-icons/crocodile.png', habitat: './animals-icons/africa.png', area: 'Africa', length: 500, weight: 1000, speed: 24 },
  { no: 19, check: 'false', name: 'Snake', icon: './animals-icons/snake.png', habitat: './animals-icons/africa.png', area: 'Africa', length: 300, weight: 6, speed: 9.6 },
  { no: 20, check: 'true', name: 'Squirrel', icon: './animals-icons/squirrel.png', habitat: './animals-icons/world.png', area: 'World', length: 10, weight: 0.1, speed: 14.4 },
  { no: 21, check: 'false', name: 'Reindeer', icon: './animals-icons/reindeer.png', habitat: './animals-icons/world.png', area: 'World', length: 220, weight: 300, speed: 69.6 }
]

export default {
  name: 'Animals',
  components: {
    ...cGridAll
  },
  data () {
    return { data: records }
  },
  methods: {
    clickRec (rec) {
      alert(JSON.stringify(rec))
    }
  }
}
</script>

<style scoped>
</style>
