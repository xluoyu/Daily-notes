/*
 * @Author: xluoyu
 * @Date: 2020-05-25 15:51:58
 * @LastEditTime: 2020-09-18 11:24:42
 * @LastEditors: Please set LastEditors
 * @Description: 日历形式的排班表
 */ 
function TimeTables (options) {
    if (!options.el) {
        throw new Error('没有传el')
    }
    this.$root = document.querySelector(options.el)
    this.$date = options.date || new Date()
    this.$list = options.data || []
    this.$template = options.template
    this.$cb = options.cb
    this.init(this.$date, this.$list)
}
TimeTables.prototype = {
    async init (date, list) {
        console.time('渲染')
        this.$TableHead = await this.getAllTableHead(date)
        this.$data = await this.handleList(list)
        this.render()
        console.timeEnd('渲染')
    },
    async getAllTableHead(datestr) {
        return new Promise((resolve, reject) => {
            try {
                let monthCount = this.getCountDays(datestr)
                let monthStart = datestr + '-01' // 开始日期
                let monthEnd = datestr + '-' + monthCount // 结束日期
                let res = []
                let arr = []
                let startDay = this.getOtherDay(monthStart, 'pre').reverse()
                let endDay = this.getOtherDay(monthEnd, 'next')
                res = res.concat(startDay)
                for (let i = 1; i <= monthCount; i++) {
                    res.push(this.getWeekDay(datestr + '-' + this.isOdd(i)))
                }
                res = res.concat(endDay)
                let chunkIndex = res.length / 7
                for (let i = 0; i < chunkIndex; i++) {
                    arr.push(res.splice(0, 7))
                }
                resolve(arr)
            } catch (error) {
                reject(error)
            }
        })
    },
    async handleList(list) {
        return new Promise((resolve, reject) => {
            try {
                let res = []
                this.$TableHead.forEach(item => {
                    let a = []
                    item.forEach(it => {
                        let arr = list.filter(data => {
                            if (data.date == it.value) {
                                data.cur = it.cur
                                return true
                            }
                            return false
                        })
                        a = a.concat(arr)
                    })
                    res.push(a)
                })
                // 每周
                // 按照姓名提取数据，格式为： [{name: '小明', value: [{},{}...七天的数据]}, {name: '小明', value: [{},{}...七天的数据]}]
                // 可考虑优化
                let ad = []
                res.forEach(it => {
                    let arr = {}
                    it.forEach(item => {
                        let name = item.name
                        if (arr[name]) {
                            arr[name].push(item)
                        } else {
                            arr[name] = [item]
                        }
                    })
                    ad.push(Object.keys(arr).map(a => {return {name: a, value:arr[a]}}))
                })
                resolve(ad)
            } catch (error) {
                reject(error)
            }
        })
    },
    render () {
        let HTML = ''
        this.$TableHead.forEach((item, index) => {
            let template = this.tableTemplate(item, index, this.$data[index])
            HTML += template
        })
        this.$root.innerHTML = HTML
    },
    tableTemplate (head, index, data) {
        let a = `<div class="row table" data-index="${index}">
        <table class="table text-center">
            <thead>
                <tr>`
        let arr = ['第一周', '第二周', '第三周', '第四周', '第五周', '第六周', '第七周']
        a += `<th class="text-center">${arr[index]}</th>`
        head.forEach(item => {
            a += `<th class="text-center">${item.day}/${item.week}</th>`
        })
        a += `</tr></thead><tbody>`
        data.forEach(item => {
            a += `<tr><td class="text-center">${item.name}</td>`
            if (item.value.length != 7) {
                let os = []
                head.forEach((ob) => {
                    let oIndex = item.value.findIndex(o => o.date == ob.value)
                    if (oIndex >= 0) {
                        os.push(item.value[oIndex])
                    } else {
                        os.push({noData: true})
                    }
                })
                item.value = os
            }
            item.value.forEach(it => {
                a += `<td class="${it.cur ? '' : 'noHandle'}">`
                a += this.$template(it)
                a += '</td>'
            })
            if (item.value.length != 7) {
                for(let i = 0; i < 7 - item.value.length; i++) {
                    a += `<td class="text-center">
                    <div class="p-taskmanage-newworktime-workbox noHandle">
                    </div>
                    </td>
                    `
                }
            }
        })
        return a
    },
    // 获取其他月份的日期
    // day -> '2020-04-01' 或 '2020-04-30'
    // type -> 'pre' 上个月, ’next‘ 下个月
    getOtherDay(day, type) {
        let date = new Date(day)
        let num = date.getDay()
        num = num == 0 ? 7 : num
        let ms = 1000 * 60 * 60 * 24 // 一天的毫秒数
        let res = []
        let length = type == 'pre' ? num - 1 : 7 - num
        for (let i = 1; i <= length; i++) {
            let curDay = type == 'pre' ? date.getTime() - i * ms : date.getTime() + i * ms
            let day = this.format(new Date(curDay))
            res.push(this.getWeekDay(day, false))
        }
        return res
    },
    // 获取日期和周
    getWeekDay(datestr, noCur = true) {
        let date = new Date(datestr)
        let weeknum = new Date(datestr).getDay()
        let WEEKARY = ['周日','周一','周二','周三','周四','周五','周六']
        return {
            value: this.format(date),
            day: this.isOdd(date.getDate()) + '',
            week: WEEKARY[weeknum],
            cur: noCur
        }
    },
    // 获取每月有多少天
    getCountDays(datestr) {
        var curDate = new Date(datestr);
        var curMonth = curDate.getMonth();
        curDate.setMonth(curMonth + 1);
        curDate.setDate(0);
        return curDate.getDate();
    },
    // 调整格式
    format (date) {
        let day = date == 'string' ? new Date(date) : date;
        return day.getFullYear() + '-' + this.isOdd(day.getMonth() + 1) + '-' + this.isOdd(day.getDate())
    },
    isOdd(num) {
        return num < 10 ? '0' + num : num
    }
}
