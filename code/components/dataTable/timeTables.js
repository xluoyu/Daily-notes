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
    this.$cb = options.cb
    this.init(this.$date, this.$list)
}
TimeTables.prototype = {
    async init (date, list) {
        Promise.all([this.getAllTableHead(date), this.handleList(list)]).then(res => {
            [this.$TableHead, this.$data] = res
            console.log(this.$TableHead)
            console.log(this.$data)
        }).catch(err => {
            throw new Error(err)
        })
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
                resolve(list)
            } catch (error) {
                reject(error)
            }
        })
    },
    render () {
        
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
