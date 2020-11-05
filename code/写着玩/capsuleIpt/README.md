## 输入型标签池
体验地址：https://xluoyu.github.io/myCode/capsuleIpt/index.html
使用textarea为底，配合上层div实现。
支持区分中英文逗号，
支持动态换行，

可做调整：
将绑定dom改为动态生成dom

使用方法：
```
let myCapsuleIpt = new CapsuleIpt({
  el: '#capsuleIpt',
  minTagWidth: 50
})
$("#btn").click(() => {
  console.log(myCapsuleIpt.getValues())
})

```

