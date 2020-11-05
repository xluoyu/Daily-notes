<template>
  <div id="list" @scroll="scroll">
    <ul :style="{paddingTop: paddingTop + 'px', paddingBottom: paddingBottom + 'px'}">
      <li v-for="(item, index) in previewList" :key="index" class="li">
        <slot name="item" :item="item"></slot>
      </li>
    </ul>
    <div class="footer" ref="footer">加载中...</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      previewList: [],
      form: 0,
      to: 999,
      paddingTop: 0,
      paddingBottom: 0
    }
  },
  props: {
    list: {
      type: Array,
      default: () => [],
      required: true
    },
    loadData: {
      type: Function,
      default: () => {},
      required: true
    },
    height: {
      type: Number,
      default: 0
    },
    viewNumber: {
      type: Number,
      default: 4,
      validator: function (value) {
        return value >= 3
      }
    }
  },
  watch: {
    list() {
      this.initList();
    }
  },
  computed: {
    scroll() {
      return this.throttle(this.handleScroll, 60)
    }
  },
  mounted () {
    this.$footer = this.$refs.footer;
  },
  updated () {
    if (!this.itemHeight) {
      this.itemHeight = this.height || this.$el.querySelectorAll(".li")[0].offsetHeight
      this.displayCount = Math.round(window.innerHeight / this.itemHeight)
    }
  },
  methods: {
    throttle(fn, time) {
      let timer = null
      return function(args) {
        let that = this
        if (!timer) {
          timer = setTimeout(() => {
            fn.call(that, args)
            timer = null
          }, time)
        }
      }
    },
    initList() {
      this.previewList = this.list.slice(this.form, this.to)
      if (this.itemHeight) {
        this.paddingTop = this.form * this.itemHeight
        this.paddingBottom = (this.list.length - this.to) * this.itemHeight
      }
    },
    handleScroll() {
      if (this.$footer.getBoundingClientRect().top <= window.innerHeight) {
        this.to += this.displayCount
        this.loadData()
      } else {
        this.form = Math.max(Math.floor(this.$el.scrollTop / this.itemHeight) - this.displayCount * (this.viewNumber - 2), 0)
        this.to = Math.min(this.form + this.displayCount * this.viewNumber, this.list.length)
        this.initList()
      }
    }
  },
}
</script>

<style lang="less" scoped>
#list{
  width: 100%;
  height: 100%;
  max-height: 100vh;
  overflow-y: auto;
}
</style>