<template>
  <div
    ref="root"
    class="lazy-draw"
  >
    <template v-if="ready">
      <slot />
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount, useTemplateRef } from 'vue'

const rootEl = useTemplateRef('root')

const intersectionCallbacks = []
let observer = { observe () {} }

if (typeof IntersectionObserver !== 'undefined') {
  const options = {
    rootMargin: '100px 20px'
  }

  observer = new IntersectionObserver(callback, options)

  // eslint-disable-next-line no-inner-declarations
  function callback (entries, object) {
    for (const entry of entries) {
      const { target } = entry
      for (const call of intersectionCallbacks) {
        if (call(target, entry.isIntersecting)) {
          intersectionCallbacks.splice(intersectionCallbacks.indexOf(call), 1)
          object.unobserve(target)
          break
        }
      }
    }
  }
}

const ready = ref(false)

// // debug
// const ready = ref(true)

onMounted(async () => {
  observer.observe(rootEl.value)

  let timeout = null
  intersectionCallbacks.push((target, isIntersecting) => {
    if (ready.value) {
      return true
    }
    if (target !== rootEl.value) return false

    if (isIntersecting) {
      timeout = setTimeout(
        () => {
          ready.value = true
        },
        // Launch Preview only if displayed for 300ms
        300
      )
    } else {
      if (timeout != null) {
        clearTimeout(timeout)
      }
    }
    return false
  })
})

onBeforeUnmount(() => {
  observer.unobserve(rootEl.value)
})
</script>
