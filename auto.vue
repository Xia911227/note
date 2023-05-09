<template>
  <div ref="autofixed" class="autofixed-wrapper">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'Autofixed',
  methods: {
    /**
     * 设置滚动条位置
     * @name setScrollPosition
     * @param { DOMRect } rect
     */
    setScrollPosition(rect) {
      /** @type { HTMLDivElement} */
      const el = this.$refs.autofixed
      const _rect = el.getBoundingClientRect()
      el.scrollTop = el.scrollTop + (rect.top - _rect.top)
    }
  }
}
</script>
