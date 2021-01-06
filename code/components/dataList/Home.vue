<template>
  <div class="home">
    <div class="content">
      <MyList :list="list" :loadData="getlist" :viewNumber="3">
        <template #item="{ item }">
          <div class="item" >
            <div class="title">{{item.title}}</div>
            <div class="text">{{item.text}}</div>
          </div>
        </template>
      </MyList>
    </div>
  </div>
</template>

<script>
import MyList from '@/components/MyList'
export default {
  name: 'Home',
  data() {
    return {
      list: [],
      page: 0,
      size: 2000
    }
  },
  components: {
    MyList,
  },
  created () {
    this.list = []
    this.getlist()
  },
  methods: {
    getlist() {
      this.$axios.api.GetNewsList({
        size: this.size,
        page: this.page
      }).then(res => {
        this.list = this.list.concat(res.data)
        this.page++
      }).catch(err => {
        console.log(err)
      });
    }
  },
}
</script>

<style lang="less" scoped>
.search{
  width: 100%;
  height: 40px;

  input{
    width: 200px;
  }
}
.content{
  background: #ddd;
  overflow: hidden;
}
.item{
  padding: 10px;
  background: #fff;
  box-sizing: border-box;
  border-bottom: 1px solid #eee;
}
</style>
