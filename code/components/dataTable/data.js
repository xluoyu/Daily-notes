function getData () {
  const data = []
  const useName = ['韭菜A', '韭菜B', '韭菜C', '韭菜D', '韭菜E', '韭菜F', '韭菜G', '韭菜H', '韭菜I', '韭菜J', '韭菜K', '韭菜L', '韭菜M']
  
  const Year = [2019, 2020]
  let id = 1000

  function getStatus() {
    return Math.ceil(Math.random() * 3)
  }

  function isOdd(num) {
    return num < 10 ? '0' + num : num
  }

  useName.forEach(item => {
    Year.forEach(year => {
      let month = 1
      while(month <= 12) {
        let curDate = new Date(year, month - 1)
        curDate.setDate(0);
        let maxDay = curDate.getDate()
        for(let i = 1; i <= maxDay; i++) {
          data.push({
            id: id,
            name: item,
            status: getStatus(),
            date: year + '-' + isOdd(month) + '-' + isOdd(i)
          })
          id += 1
        }
        month += 1
      }
    })
  })

  return data
}