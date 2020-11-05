define('home.static.js.mis.taskmanage.newworktimecreatetables',function() {
    var initWorkTimeTables = {
        init: async function(date, list, el, cb){
            this.$date = date;
            this.$list = list.reverse();
            if (!this.$list.length) return;
            this.$root = el;
            this.$cb = cb;
            this.$dom = '';
            this.$setDataList = []
            this.allTableHead = this.getAllTableHead(this.$date) // 表头
            console.log(this.allTableHead)
            this.$timeData = await this.handleListToTime()
            console.log(this.$timeData)
            this.$data = await this.handleList()
            console.log(this.$data)
            this.$total = []
            this.createTables()
        },
        // 按天处理数据
        async handleListToTime () {
            let res = []
            this.allTableHead.forEach(item => {
                let a = []
                // 日期
                item.forEach(it => {
                    let res = {
                        date: '',
                        types: {},
                        values: []
                    }
                    let arr = this.$list.filter(data => {
                       return data.date == it.value
                    })
                    arr.forEach(data => {
                        if (data.type) {
                            if (res.types[data.type]) {
                                res.types[data.type]++
                            } else {
                                res.types[data.type] = 1
                            }
                        }
                    })
                    res.date = it.value
                    res.values = arr
                    a.push(res)
                })
                res.push(a)
            })
            return res
        },
        // 按人处理数据
        async handleList () {
            let res = []
            let ad = []
            this.allTableHead.forEach(item => {
                let a = []
                item.forEach(it => {
                    let arr = this.$list.filter(data => {
                        if (data.date == it.value) {
                            data.cur = it.cur
                            return data
                        }
                        return false
                    });
                    a = a.concat(arr)
                })
                res.push(a)
            })
            res.forEach((it) => {
                let arr = []
                it.forEach(item => {
                    let name = item.realName
                    let index = arr.findIndex(find => find.name == name)
                    if (index == -1) {
                        arr.push({
                            name: name,
                            holiday: item.holiday, // 月可排休天数
                            workday: item.workday, // 应工作日
                            monthActualWorkDays: item.monthActualWorkDays, // 出勤天数
                            totalMonthWorkDays: item.totalMonthWorkDays,  // 工作天数
                            curWeekWorkDays: item.cur ? item.type == 1 ? 1 : 0 : 0,
                            curWeekRestDays: item.cur ? item.type == 2 ? 1 : 0 : 0,
                            value: [item] // 原数据
                        })
                    } else {
                        arr[index].value.push(item)
                        arr[index].holiday = item.holiday // 月可排休天数
                        arr[index].workday = item.workday // 应工作日
                        arr[index].monthActualWorkDays = item.monthActualWorkDays// 出勤天数
                        arr[index].totalMonthWorkDays = item.totalMonthWorkDays  // 工作天数
                        arr[index].curWeekWorkDays += item.cur ? item.type == 1 ? 1 : 0 : 0
                        arr[index].curWeekRestDays += item.cur ? item.type == 2 ? 1 : 0 : 0
                    }
                })
                ad.push(arr)
            })
            return ad
        },
        createTables () {
            this.allTableHead.forEach((item, index) => {
                let template = this.tableTemplate(item, index, this.$data[index])
                this.$dom += template
            })
            this.$root[0].innerHTML = this.$dom
            this.$cb && this.$cb()
        },
        // 单个table表渲染
        tableTemplate (head, index, data) {
            let a = `<div class="row p-taskmanage-newworktime-table" data-index="${index}">
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
                item.value.forEach((it) => {
                    if (it.noData) {
                        a += `<td class="text-center">
                        <div class="p-taskmanage-newworktime-workbox noHandle">
                        </div>
                        </td>
                        `
                        return
                    }
                    a += `<td class="text-center">
                    <div class="p-taskmanage-newworktime-workbox ${it.cur ? '' : 'noHandle'} ${it.error ? 'errorBor' : ''}" id="js-p-taskmanage-newworktime-workbox-${it.id}" data-id="${it.id}" data-week="${index}" data-status="${it.workRule}" data-reason="${it.reason}" data-type="${it.type}" data-weektext="${this.getWeekDay(it.date).week}" data-date="${it.date}"  data-name="${item.name}">
                    <div class="p-taskmanage-newworktime-workbox-options js-p-taskmanage-newworktime-workbox-options">...</div>
                    <div class="p-taskmanage-newworktime-workbox-main js-p-taskmanage-newworktime-workbox-main">`
                    a += this.getWorkBoxMain(it.type, {start:it.start, end:it.end})
                    a += `</div>
                            <div class="p-taskmanage-newworktime-workbox-bottom">
                                <div class="js-p-taskmanage-newworktime-workbox-tag ${it.type == '1' && (it.workRule == '1' || it.workRule == '早班') ? 'light' : ''}" data-type="1" data-status="1">早班</div>
                                <div class="js-p-taskmanage-newworktime-workbox-tag ${it.type == '1' && (it.workRule == '2' || it.workRule == '晚班') ? 'light' : ''}" data-type="1" data-status="2">晚班</div>
                                <div class="js-p-taskmanage-newworktime-workbox-tag ${it.type == '1' && (it.workRule == '3' || it.workRule == '通班') ? 'light' : ''}" data-type="1" data-status="3">通班</div>
                                <div class="js-p-taskmanage-newworktime-workbox-tag ${it.type == '2' ? 'light' : ''}" data-type="2">休息</div>
                            </div>
                        </div>
                    </td>`
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
            a += `<tr><td class="text-center"></td>`
            head.forEach((item, i) => {
                let arr = this.$timeData[index][i].values
                if (!arr.length) return
                a += this.getDayTotal(item.value, index).dom
            })
            a += `</tr></tbody></table>`
            if (this.allTableHead.length - 1 != index && this.$data[index].length) {
                a += `<div class="p-taskmanage-newworktime-quote js-p-taskmanage-newworktime-quote" data-index="${index}">将排班引用到下一周</div>`
            }
            a += `</div>`
            return a
        },
        getWorkBoxMain (type, time) {
            let str = ''
            if (type == 1 || type == 13) {
                str = `<div class="work">`
                if (type ==13) {
                    str += '<p>加班</p>'
                }
                str += this.getSelectTimeDom(time.start) + ' - '
                str += this.getSelectTimeDom(time.end)
                str += `<div class="p-taskmanage-newworktime-workbox-timeBtn">
                            <div class="js-p-taskmanage-newworktime-workbox-timeConfirm">确认</div>
                            <i class="iconfont icon-wulumuqishigongandashujuguanlipingtai-ico- js-p-taskmanage-newworktime-workbox-timeset"></i>
                        </div>
                    </div>`
            } else if (!type || type == 0) {
                str = `<div class="default">设置今日状态</div>`
            } else {
                let status = $Jobstatus.find(find => find.id == type)
                if (!status) return
                status = status.name
                status = status.split('（')[0]
                str = `<div class="text">${status}</div>`
            }
            return str
        },
        // 每天总计
        getDayTotal (date, week) {
            let dayIndex = this.$timeData[week].findIndex(item => item.date == date)
            let data = this.$timeData[week][dayIndex]
            let types = {}
            data.values.forEach(item => {
                let q = item.type
                if (q) {
                    if (types[q]) {
                        types[q]++
                    } else {
                        types[q] = 1
                    }
                }
            })
            let res = {
                types,
                date
            }
            let p = ''
            Object.keys(types).forEach(key => {
                let ob = $Jobstatus.find(i => i.id == key)
                if (!ob) return
                let str = ob.name
                str = str.split('（')[0]
                if (str == '工作时间') {str = '工作'}
                p += str + types[key] + '人/'
            })
            res['dom'] = `<td class="text-center p-taskmanage-newworktime-complate" id="js-p-taskmanage-newworktime-complate-${date}" data-time="${date}">${p.substr(0, p.length - 1)}</td>`
            return res
        },
        getSelectTimeDom (time) {
            let times = time.split(':')
            let start = times[0]
            let end = times[1]
            let str = `<select value="${start}" disabled>`
            for (let i = 7; i < 24; i++) {
                str += `<option value="${this.isOdd(i)}" ${start == this.isOdd(i) ? 'selected' : ''}>${this.isOdd(i)}</option>`
            }
            str += `</select>
                    <span>:</span>
                    <select value="${end}" disabled>
                        <option value="00" ${end == '00' ? 'selected' : ''}>00</option>
                        <option value="10" ${end == '10' ? 'selected' : ''}>10</option>
                        <option value="20" ${end == '20' ? 'selected' : ''}>20</option>
                        <option value="30" ${end == '30' ? 'selected' : ''}>30</option>
                        <option value="40" ${end == '40' ? 'selected' : ''}>40</option>
                        <option value="50" ${end == '50' ? 'selected' : ''}>50</option>
                    </select>`
            return str
        },
        getAllTableHead(datestr) {
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
            return arr
        },
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
        // 获取每月有多少天
        getCountDays(datestr) {
            var curDate = new Date(datestr);
            var curMonth = curDate.getMonth();
            curDate.setMonth(curMonth + 1);
            curDate.setDate(0);
            return curDate.getDate();
        },
        // 获取日期和周
        getWeekDay(datestr, noCur = true) {
            let date = new Date(datestr)
            let weeknum = date.getDay()
            let WEEKARY = ['周日','周一','周二','周三','周四','周五','周六']
            return {
                value: this.format(date),
                day: this.isOdd(date.getDate()) + '',
                week: WEEKARY[weeknum],
                cur: noCur
            }
        },
        format (date) {
            let day = date == 'string' ? new Date(date) : date;
            return day.getFullYear() + '-' + this.isOdd(day.getMonth() + 1) + '-' + this.isOdd(day.getDate())
        },
        isOdd(num) {
            return num < 10 ? '0' + num : num
        },
        // 修改数据
        // 修改的数据, 第几周（下表），id，name
        setData(data, info) {
            if (!info.id) throw 'setData没有传id'
            if (!info.name) throw 'setData没有传name'
            if (info.index == undefined) throw 'setData没有传index'
            if (!info.date) throw 'setData没有传date'
            // 便利，获取当前该天总计人数
            console.log(info);
            let dayTotal = this.getDayTotal(info.date, info.index)
            info.dayRestTotal = dayTotal.type2
            let nameIndex = this.$data[info.index].findIndex(item => item.name == info.name)
            let dataIndex = this.$data[info.index][nameIndex].value.findIndex(item => item.id == info.id)
            let oldData = this.$data[info.index][nameIndex].value[dataIndex] // 原始数据
            // 进入规则检查
            if (data.type == 1 || data.type == 2 || data.type == 13 || data.type == 0) {
                let result = this.check(data.type, info)
                if (!result) {
                    console.log(`${info.id} 加红线`)
                    $(`#js-p-taskmanage-newworktime-workbox-${info.id}`).addClass("errorBor")
                    if (info.copy) {
                        oldData.error = true
                    }
                    return false
                } else {
                    $(`#js-p-taskmanage-newworktime-workbox-${info.id}`).removeClass("errorBor")
                }
            } else {
                $(`#js-p-taskmanage-newworktime-workbox-${info.id}`).removeClass("errorBor")
            }
            // 修改原始数据
            Object.keys(data).forEach(key => {
                oldData[key] = data[key]
            })
            // 修改timeData
            this.$timeData[info.index][dataIndex].values[nameIndex] = oldData
            // 重新遍历, 修改dom
            dayTotal = this.getDayTotal(info.date, info.index)
            $(`#js-p-taskmanage-newworktime-complate-${info.date}`).replaceWith(dayTotal.dom)
            // 填充进修改后的数据
            let setlistIndex = this.$setDataList.findIndex(it => it.id == oldData.id)
            if (setlistIndex == -1) {
                this.$setDataList.push(oldData)
            } else {
                this.$setDataList[setlistIndex] = oldData
            }
            console.log(this.$data[info.index][nameIndex].value[dataIndex])
            return true
        },
        // 规则检查
        check(type, info) {
            let {weekWorkDays, weekRestDays} = this.getWeekWorkDays(info.index, info.name)
            let {monthWorkDays, monthRestDays} = this.getMonthWorkDays(info.name)
            // let totalIndex = this.$total.details.findIndex(item => item.name = info.name)
            // let nameIndex = this.$data[info.index].findIndex(item => item.name == info.name)
            // if (type == 0) {
            //     return false
            // }
            if (type && type == 13) {
                if (monthWorkDays < this.$total.workday) {
                    alert(`${info.name}本月上班时间未排满，不能申请加班`)
                    return false
                }
            }
            if (type && type == 1) {
                if (monthWorkDays >= this.$total.monthWorkdays) {
                    alert(`${info.name}本月排班天数已满`)
                    return false
                }
            }
            if (type && type == 2) {
                let weekPeopleNumber = this.$data[info.index].length;
                if (Math.floor(weekPeopleNumber / 2) <= info.dayRestTotal) {
                    alert(`一天可排休息的人数不能超过店铺人数的一半`)
                    return false
                }
                if (info.week && info.week == '周六' || info.week == '周日') {
                    alert(`周六周日不能排休`)
                    return false
                }
                if (weekRestDays >= 2 && !info.copy) {
                    alert(`${info.name}本周休息天数已满`)
                    return false
                }
                if (monthRestDays >= this.$total.holiday) {
                    alert(`${info.name}本月休息天数已满`)
                    return false
                }
            }
            return true
        },
        // 对外事件导出，用于复制排班到下一周
        copyData(index) {
            let ms = 1000 * 60 * 60 * 24 // 一天的毫秒数
            let arr = []
            index = Number(index)
            this.$data[index].forEach(item => {
                let people = this.$data[index + 1].find(o => o.name == item.name)
                if (people) {
                    item.value.forEach((a, i) => {
                        if (!people.value[i]) return
                        this.setData({
                            type: (a.type != 1 && a.type != 2) ? 0 : a.type,
                            start: a.start,
                            end: a.end,
                            workRule: a.workRule,
                            reason: a.reason
                        }, {
                            index: index + 1,
                            id: people.value[i].id,
                            date: people.value[i].date,
                            name: people.value[i].realName,
                            copy: true
                        })
                    })
                }
            })
            arr = this.$data[index + 1]
            return this.tableTemplate(this.allTableHead[index + 1], index + 1, arr)
        },
        // 计算周工作天数，休息天数
        // index -> 周下表， name -> 姓名
        getWeekWorkDays (index, name) {
           let nameIndex = this.$data[index].findIndex(item => item.name == name)
           let [weekWorkDays, weekRestDays] = [0, 0]
           if (!this.$data[index][nameIndex]) return
           this.$data[index][nameIndex].value.forEach(item => {
                   if (item.type == 1 || item.type == 13) {
                        weekWorkDays++
                   } else if (item.type == 2) {
                       weekRestDays++
                   }
           })
           return {weekWorkDays, weekRestDays}
        },
        // 计算月工作天数，休息天数
        // name -> 姓名
        getMonthWorkDays (name) {
            let [monthWorkDays, monthRestDays] = [0, 0]
            this.allTableHead.forEach((o, i) => {
                let weekNumber = this.getWeekWorkDays(i, name)
                if (!weekNumber) return
                monthWorkDays += weekNumber.weekWorkDays || 0
                monthRestDays += weekNumber.weekRestDays || 0
            })
            return {monthWorkDays, monthRestDays}
        },
        // 对外数据导出，用于批量排班接口
        getSetDataList () {
            let res = []
            this.$setDataList.forEach(item => {
                let ob = {
                    id: item.id,
                    start: item.start,
                    end: item.end,
                    type: item.type,
                    workRule: item.workRule,
                    reason: item.reason,
                    operatorId: $uinfos.id,
                    operatorName: $uinfos.realname
                }
                res.push(ob)
            })
            return res
        },
        // 对外数据导出，用于排班人数统计等
        getWorkNumber () {
            let res = {
                full: 0,
                nofull: 0,
                total: 0,
                workday: 0,
                holiday: 0,
                details: []
            }
            let details = []
            this.$data.forEach(it => {
                it.forEach(item => {
                    var detailsIndex = details.findIndex(a => a.name == item.name)
                    if (detailsIndex == -1) {
                        let ob = {
                            name: item.name,
                            holiday: item.holiday,
                            monthActualWorkDays: item.monthActualWorkDays,
                            totalMonthWorkDays: item.totalMonthWorkDays,
                            workday: item.workday,
                            curMonthWorkDays: item.curWeekWorkDays,
                            curMonthRestDays: item.curWeekRestDays
                        }
                        details.push(ob)
                    } else {
                        details[detailsIndex].curMonthWorkDays += item.curWeekWorkDays
                        details[detailsIndex].curMonthRestDays += item.curWeekRestDays
                    }
                })
            })
            details.forEach(item => {
                if (item.monthActualWorkDays == item.workday) {
                    res.full++
                }
            })
            res.total = details.length
            res.nofull = res.total - res.full
            res.details = details
            res.holiday = details[0].holiday
            res.workday = details[0].workday
            this.$total = res
            return res
        }
    }
    return initWorkTimeTables
})
