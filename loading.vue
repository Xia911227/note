<template>
  <div v-show='visible'
       class='hik-loading'
       :class="{'is-fullscreen': fullscreen }">
    <div class="hik-loading-box">
      <div class="hik-progress-bar">
        <div class="hik-fill"
             :style="{width:loadingNumericalValue+'%'}"></div>
      </div>
      <div class="hik-progress-desc">
        <div class="hik-text">{{text}}</div>
        <div class="hik-number">{{loadingNumericalValue}}%</div>
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script>
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）

export default {
  name: 'Loading',

  data() {
    // 这里存放数据
    return {
      loadingNumericalValue: 0,
      text: 'Preparing data...',
      visible: false,
      fullscreen: false,
    }
  },

  // 方法集合
  methods: {
    // 数据 初始化
    init() {
      setInterval(() => {
        if (this.loadingNumericalValue !== 99) {
          this.loadingAnimation()
        }
      }, 40)
    },
    // 加载 动画
    loadingAnimation() {
      this.loadingNumericalValue += 1
    },
  },
}
</script>
<style lang='scss' scoped>
// @import url(); 引入公共css类
.hik-loading {
  display: flex;
  width: 100%;
  height: 100%;
  z-index: 999999;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  .hik-loading-box {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    .hik-progress-bar {
      width: 320px;
      height: 8px;
      margin: 4px 0;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      overflow: hidden;
      .hik-fill {
        position: relative;
        height: 100%;
        background: #ca1d22;
        border-radius: 8px;
        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: #fff;
          border-radius: 8px;
          animation: myfirst 1s ease-out infinite;
        }
        @keyframes myfirst {
          0% {
            width: 0;
            opacity: 0.1;
          }
          60% {
            width: 60%;
            opacity: 0.4;
          }
          100% {
            width: 100%;
            opacity: 0;
          }
        }
      }
    }
    .hik-progress-desc {
      display: flex;
      align-items: center;
      text-align: left;
      width: 200px;
    }
    .hik-text {
      margin-left: 8px;
      color: #000000;
    }
    .hik-number {
      margin-left: 8px;
      color: #000000;
    }
  }
}
.hik-loading.is-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
