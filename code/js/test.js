let obj = {
  touser: 'oVC1d5UOTNPpDDTX7XSwpdhi4-08',
  template_id: 'lgSbQN3xTYAeFaiQ4QNDJknsCVxYt0209zKVseCDcc4',
  url: 'https://mp.weixin.qq.com/s/b2-i-aaqq2jYVDegdhm5vA',
  miniprogram: {
    appid:"wx134139f26c17b929",
    pagepath:"pages/index/index"
  },
  data: {
    "first":{
      "value":"发票开具成功提醒",
    },
    // 开票明细 - 课程名称
    "keyword1":{
        "value":"培训费",
    },
    // 发票金额
    "keyword2":{
        "value":"100元",
    },
    // 领取方式
    "keyword3":{
        "value":"1499863@qq.com",
    },
    "remark": {
      "value": "点击登录优图云学院小程序查看"
    }
  }
}

let ste = JSON.stringify(obj)
console.log(ste)

console.log('------------------------')
let uri = encodeURIComponent('http://127.0.0.1:3000/actives/enter?id=451')
console.log(uri)