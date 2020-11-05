## 需求
> 实现一个全局的Loading组件，可以使用`this.$loading()`调用，或使用`v-loading`指令调用

## 组件实现
简单写一个普通的`loading`组件，使用`transtion`实现显示和隐藏时的动画效果
```
<template>
  <transition name="loading">
    <div v-show="isShow" class="loading-wrap">
      <div class="loading">
        <div class="loading-icon"></div>
        <div class="loading-text">{{text}}</div>
      </div>
    </div>
  </transition>
</template>

<script>
  export default {
    props: {
      text: {
        type: String,
        default: '加载中...'
      },
      isShow: {
        type: Boolean,
        default: false
      }
    },
  }
</script>
```
以下是样式
```
.loading-enter-active, .loading-leave-active{
  transition: all .3s ease;
}
.loading-enter, .loading-leave-to{
  opacity: 0;
}
// 过渡效果

.loading-wrap{
  position: absolute;
  z-index: 999;
  top: 0;
  left: 0;
}
.loading{
  position: fixed;
  z-index: 1000;
  top: 50%;
  left: 0;
  right: 0;
  margin: auto;
  width: 300px;
  height: 300px;
  transform: translateY(-50%);
  border-radius: 10px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, .6);
  color: #fff;
  font-size: 36px;
}
// 整体样式
.loading-icon{
  width: 40px;
  height: 40px;
  margin-bottom: 40px;
  border-radius: 50%;
  border-top:6px solid #c7f7e8;
  border-right:6px solid #c6ffed;
  border-bottom:6px solid #b4f8e3;
  border-left:6px solid #a0fadd;
  animation:turn 1s linear infinite;
}
@keyframes turn {
  0%{transform: rotate(0deg);}
  25%{transform: rotate(90deg);}
  50%{transform: rotate(18deg);}
  75%{transform: rotate(27deg);}
  100%{transform: rotate(360deg);}
}
// 一个会旋转的小圆环
```
## 全局命令
### 实现思路
在`Vue.prototype`上绑定一个`$Loading`方法，在方法首次调用时，将组件的dom并添加到body中，并且修改组件的`isShow`让其显示。再次调用时修改`isShow`隐藏组件并在dom中剔除。

`Vue.extend`可以将组件构造成一个Vue的子类，之后就和使用Vue一样对其进行实例化
```
import UiLoading from './Loading.vue'
import Vue from 'vue'

let Loading = Vue.extend(UiLoading)
new Loading({
  el: document
})

new Vue({
  el: document
})
```
再然后就可以从`$el`中拿到我们所需要的dom元素去做操作了，而且进行实例化后就可以直接操作其`data`里的数据了
```
 export default {
    data() {
      return {
        text: '加载中...',
        isShow: false
      }
    },
  }
```

完整代码
```
import UiLoading from './Loading.vue'
import Vue from 'vue'

let Loading = Vue.extend(UiLoading) // 创建构造器
let loading = null // 用于组件实例化的参数

// 为组件添加一个关闭的方法
Loading.prototype.close = function () {
  if (loading) {
    loading = null
  }
  this.isShow = false
  setTimeout(() => {
    if (this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el)
    }
    // 进项组件的销毁
    this.$destroy()
  })
}

const Loadinginit = function (options = {}) {
  if (loading) {
    // 再次调用方法后可以关闭Loading
    loading.close()
    return
  }
  // 通过传参，可以修改组件的父级。默认为body
  let parent;
  if (options.parent && Object.prototype.toString.call(options.parent) == '[object String]') {
    parent = document.querySelector(options.parent)
  } else {
    parent = document.body
  }
  // 实例化，插入进dom节点，修改显示状态
  loading = new Loading({
    el: document.createElement('div'),
    data: options
  })
  parent.appendChild(loading.$el)
  Vue.nextTick(() => {
    loading.isShow = true
  })
  return loading
}
export default Loadinginit
```
## 自定义指令
继续上一个文件写，有了之前的基础，添加自定义指令就方便多了

自定义指令只需要注意三个钩子函数
1. `bind`: 初次调用时我们需要进行组件的实例化，在当前`el`中添加组件的dom元素并修改`isShow`
2. `update`: 当指令中的值发生改变时，只需要修改`isShow`
3. `unbind`: 剔除`el`中的组件dom，并对组件进行销毁

```
Vue.directive('loading', {
  bind(el, binding) {
    const loading = new Loading({
      el: document.createElement('div'),
      data: {}
    })
    el.appendChild(loading.$el)
    el.loading = loading
    Vue.nextTick(() => {
      loading.isShow = binding.value
    })
  },
  update(el, binding) {
    if (binding.oldValue !== binding.value) {
      el.loading.isShow = binding.value
    }
  },
  unbind(el) {
    const element = el.loading.$el
    if (element.parentNode) {
      element.parentNode.removeChild(element)
    }
    el.loading.$destroy()
    el.loading = null
  }
})
```