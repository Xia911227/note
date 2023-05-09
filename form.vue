<script>
import Vue from 'vue'
import HikUI from 'hikui'

// 用于表单空间不足气泡提示
const Tooltip = Vue.extend(HikUI.Tooltip)

let currentToastComponentInstance = null

/**
 * 基于 HikUI.Form 组件封装，支持弹框提示错误信息
 */
export default {
  // 定义组件名称
  name: 'BaseFormOld',

  // 实际渲染时候，不需要将组件的 attributes 渲染到真实DOM上
  inheritAttrs: false,

  // 定义 props 选项
  props: {
    // 是否显示提示框
    errorToast: {
      type: Boolean,
    },
    // 提示框持续时间 ms
    toastDuration: {
      type: Number,
      default: 1500,
    },
    // 是否自动定位到错误字段
    autofixed: {
      type: Boolean,
    },
    // 是否启用实时校验
    hotValidate: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      watchers: [],
    }
  },

  mounted() {
    this.$watch('$refs.innerForm.fields', this.init, { immediate: true })
  },

  methods: {
    init() {
      const { innerForm: form } = this.$refs
      if (Array.isArray(form.fields) && form.fields.length) {
        // field is a vue component.
        form.fields.forEach((field) => {
          // 处理气泡显示问题
          if (this.isVisibleTooltip(field) && !field.$el._tooltip) {
            this.createPopper(field)
            this.registerBeforeDestroy(field)
          }
          // 处理实时校验问题
          if (this.hotValidate) {
            this.initHotValidate(field)
          }
        })
      }
    },

    // 新增实时校验
    initHotValidate(vm) {
      if (!this.watchers.includes(vm)) {
        // 监听字段值的变化，如果发生变更则自动校验
        vm.$watch('fieldValue', () => {
          this.$refs.innerForm.validateField(vm.prop)
        })
        // 注册 beforeDestory 生命周期
        vm.$on('hook:beforeDestroy', () => {
          const index = this.watchers.indexOf(vm)
          if (index >= 0) {
            this.watchers.splice(index, 1)
          }
        })
        this.watchers.push(vm)
      }
    },

    // 给 el-form-item 创建气泡显示
    createPopper(vm) {
      const tooltip = (vm.$el._tooltip = new Tooltip({
        el: document.createElement('div'),
        propsData: {
          manual: true,
          placement: 'top-start',
        },
      }))
      tooltip.reference = vm
      tooltip.referenceElm = vm.$el
      this.overwriteFormItemValidate(vm)
    },

    // 重写 el-form-item 验证方法，当事件触发
    // 校验字段时，满足规则条件需要自动隐藏气泡
    overwriteFormItemValidate(vm) {
      const oldValidate = vm.validate // 保存原有的验证方法
      const that = this
      vm.validate = function (...args) {
        oldValidate.apply(vm, args)
        const { _tooltip: tooltip } = vm.$el
        tooltip.content = vm.validateMessage
        tooltip.offset = 0 - that.getFormItemLabelWidth(vm)
        tooltip.value = vm.validateState === 'error'
      }
    },

    // 给 el-form-item 注册生命周期方法
    registerBeforeDestroy(vm) {
      vm.$on('hook:beforeDestroy', function () {
        const { _tooltip: tooltip } = vm.$el
        tooltip && tooltip.$destroy()
      })
    },

    // 进行表格校验
    validate(callback) {
      let _resolved = callback
      let _rejected = callback
      let _promiseInstance = null

      if (typeof callback != 'function') {
        _promiseInstance = new Promise((resolve, reject) => {
          _resolved = resolve
          _rejected = reject
        })
      }

      this.$refs.innerForm.validate((valid, fields) => {
        if (!valid) {
          _rejected(valid, fields)
          this.errorToast && this.showErrorToast()
          this.autofixed && this.autofixedField()
        } else {
          _resolved(valid, fields)
        }
        this.updatePopperVisibleStatus()
      })

      return _promiseInstance
    },

    // 清除表格校验
    validFromFlag() {
      this.$nextTick(() => {
        this.$refs.innerForm.resetFields()
      })
    },

    // 支持验证单个字段
    validateField(props, cb) {
      this.$refs.innerForm.validateField(props, (err, ...args) => {
        cb && cb.apply(null, [err].concat(args))
        if (this.autofixed) this.autofixedField()
      })
    },

    // 根据组件内挂载的元素距离顶部距离，由小到大进行排序
    // 解决动态添加组件时，提示信息顺序错误问题
    sortFields(fields) {
      const getElTop = (el) => {
        const rect = el.getBoundingClientRect()
        return rect.top || 0
      }
      return fields.sort((a, b) => getElTop(a.$el) - getElTop(b.$el))
    },

    // 获取错误第一个错误字段
    getFirstValidateErrorComponent() {
      const fields = this.sortFields(this.$refs.innerForm.fields)
      return fields.find((vm) => vm.validateState === 'error')
    },

    // 显示错误消息提示
    showErrorToast() {
      const component = this.getFirstValidateErrorComponent()
      if (component) {
        const { validateMessage } = component
        let message = (validateMessage || '').toString()
        if (message.trim().length > 0 && !currentToastComponentInstance) {
          currentToastComponentInstance = this.$message.error({
            duration: this.toastDuration || 1500,
            message,
          })
          currentToastComponentInstance.onClose = () => {
            currentToastComponentInstance = null
          }
        }
      }
    },

    // 自动定位到错误字段
    autofixedField() {
      const component = this.getFirstValidateErrorComponent()
      if (component && component.$el) {
        // 当前组件只有被 Autofixed 组件包裹，才会存在 setScrollPosition 方法
        if (this.$parent.setScrollPosition) {
          this.$parent.setScrollPosition(component.$el.getBoundingClientRect())
        }
      }
    },

    // 重置气泡状态
    resetTooltip() {
      const fields = this.sortFields(this.$refs.innerForm.fields)
      fields.forEach((field) => {
        if (this.isVisibleTooltip(field)) {
          field.$el._tooltip.value = false
        }
      })
    },

    // 是否显示气泡
    isVisibleTooltip(component) {
      const { $attrs: attrs } = component
      return (
        Reflect.has(attrs, 'show-tooltip') && attrs['show-tooltip'] !== false
      )
    },

    // 获取 el-form-item 中的 label 宽度
    getFormItemLabelWidth(vm) {
      /** @type {HTMLLabelElement} */
      const el = vm.$el.querySelector('.el-form-item__label')
      return el ? el.offsetWidth : 0
    },

    // 显示 Tooltip 气泡提示
    updatePopperVisibleStatus() {
      const fields = this.sortFields(this.$refs.innerForm.fields)
      const component = this.getFirstValidateErrorComponent()
      fields.forEach((vm) => {
        if (this.isVisibleTooltip(vm)) {
          if (vm == component) {
            const { _tooltip: tooltip } = component.$el
            tooltip.content = component.validateMessage
            tooltip.offset = 0 - this.getFormItemLabelWidth(vm)
            tooltip.value = true
          } else {
            vm.$el._tooltip.value = false
          }
        }
      })
    },
  },

  render(h) {
    const defaultSolts = (this.$slots.default ??= [])
    const defineComponentOptions = {
      listeners: this.$listeners,
      attrs: this.$attrs,
      ref: 'innerForm',
    }
    return h(HikUI.Form, defineComponentOptions, defaultSolts)
  },
}
</script>

<style lang="scss" scoped>
.el-form {
  ::v-deep .el-form-item {
    .el-form-item__error {
      padding-left: 0; // 清除左侧内边距
    }
  }
}
</style>
