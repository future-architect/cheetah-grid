<template>
  <div class="sample">
    <c-grid
      ref="grid"
      :data="data"
      :frozen-col-count="1"
    >
      <c-grid-check-column
        :width="50"
        field="check"
      />
      <c-grid-column
        field="id"
        width="85"
      >
        ID
      </c-grid-column>
      <c-grid-column-group caption="GROUP">
        <c-grid-button-column
          caption="BUTTON"
          width="100"
          @click="onClick"
        >
          BUTTON
        </c-grid-button-column>
        <c-grid-icon-column
          field="stars"
          icon-name="star"
          width="75"
        >
          ICON
        </c-grid-icon-column>
      </c-grid-column-group>
      <c-grid-input-column
        :width="75"
        field="text"
      >
        INPUT
      </c-grid-input-column>
      <c-grid-link-column
        :width="75"
        :href="onLink"
        field="link"
      >
        LINK
      </c-grid-link-column>
      <c-grid-menu-column
        :width="75"
        :options="[
          { value: '', label: 'Empty' },
          { value: 1, label: 'Opt1' },
          { value: 2, label: 'Opt2' }
        ]"
        field="menu"
      >
        MENU
      </c-grid-menu-column>
      <c-grid-percent-complete-bar-column
        :width="90"
        field="percent"
      >
        PERCENT
      </c-grid-percent-complete-bar-column>
    </c-grid>
  </div>
</template>

<script>
export default {
  name: 'Sample',
  data () {
    return {
      data: [
        { check: true, id: 1, stars: 1, text: 'text', link: 'link', menu: '', percent: 10 },
        { check: false, id: 2, stars: 2, text: 'text', link: 'link', menu: 1, percent: 50 },
        { check: true, id: 3, stars: 3, text: 'text', link: 'link', menu: 2, percent: 90 }
      ]
    }
  },
  methods: {
    onClick (rec) {
      console.log('click!!', rec)
      return 'click!'
    },
    onLink (rec) {
      console.log('link!!', rec)
      return 'link!'
    }
  }
}
</script>

<style scoped>
.sample {
  height: 300px;
  width: 100%;
}
</style>
