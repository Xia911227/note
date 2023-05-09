import Vue from 'vue'
import Loading from './loading.vue'

const Mask = Vue.extend(Loading)

const toggleLoading = (el, binding) => {
  if (binding.value.isShow) {
    Vue.nextTick(() => {
      // 控制loading组件显示
      el.instance.visible = true

      if (binding.modifiers.fullscreen) {
        el.instance.fullscreen = true
      }

      // 插入到目标元素
      insertDom(el, el, binding)
    })
  } else {
    el.instance.visible = false
    el.instance.loadingNumericalValue = 0
    el.instance.text = ''
  }
}

/* 更新进度条进度 */
const updateLoading = (el, binding) => {
  if (binding.value.isShow) {
    el.instance.text = binding.value.text
    Vue.nextTick(() => {
      el.instance.visible = true
      el.instance.loadingNumericalValue = binding.arg
      // 插入到目标元素
      insertDom(el, el, binding)
    })
  } else {
    el.instance.visible = false
    el.instance.loadingNumericalValue = 0
    el.instance.text = ''
  }
}

const insertDom = (parent, el, binding) => {
  parent.appendChild(el.mask)
}

export default {
  name: 'realLoading',
  bind: function (el, binding, vnode) {
    const mask = new Mask({
      el: document.createElement('div'),
    })
    el.instance = mask
    el.mask = mask.$el
    el.maskStyle = {}
    binding.value.isShow && toggleLoading(el, binding)
  },
  update: function (el, binding) {
    if (binding.oldValue.isShow !== binding.value.isShow) {
      toggleLoading(el, binding)
    }
    if (binding.arg !== binding.oldArg) {
      updateLoading(el, binding)
    }
  },
  unbind: function (el, binding) {
    el.instance && el.instance.$destroy()
  }
}
