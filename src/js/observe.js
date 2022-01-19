import Dep from './dep'

function defineReactive(data, key, val) {
  if (typeof val === 'object') { // 递归设置响应式
    new Observer(val)
  }
  let dep = new Dep() // 新增
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get() {
      dep.depend()
      return val
    },
    set(newVal) {
      if (val === newVal) {
        return
      }
      val = newVal
      dep.notify() // 通知
    }
  })
}

class Observer {
  constructor(value) {
    this.value = value

    if (!Array.isArray(value)) {
      this.walk(value)
    }
  }

  walk(obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]])
    }
  }
}
