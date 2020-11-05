/* eslint-disable */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.DragAcr = factory());
}(this, (function () { 'use strict';

    class DragAcr {
        constructor(param) {
            this.initParam(param);
        }
        initParam(param) {
            const {
                el,
                startDeg = 0, // 开始角度
                endDeg = 2, // 结束角度
                outColor = "#c0c0c0", // 底层颜色
                outLineWidth = 20, // 轨道宽度
                color = ["#06dabc", "#33aaff"], // 颜色渐变 左-> 右
                counterclockwise = false, // 正反向
                slider = 10, // 滑块半径
                sliderColor = "#fff", // 滑块颜色
                value = 0, // 值 0 -> 100
                change = (v) => { console.log(v); },
                textShow = true, // 是否显示值
                duration = .4, // 运动时间 单位s
                timing = 20, // 运动间隔 单位 ms
                title // 标题
            } = param;

            this.el = el;
            this.width = el.offsetWidth;
            this.height = el.offsetHeight;
            this.center = this.width / 2;
            this.radius = this.width / 2 - outLineWidth / 2; //滑动路径半径
            this.initCanvas(el);

            this.startDeg = startDeg;
            this.endDeg = endDeg;
            this.outColor = outColor;
            this.outLineWidth = outLineWidth;
            this.counterclockwise = counterclockwise;
            this.slider = slider;
            this.color = color;
            this.sliderColor = sliderColor;
            this.value = value;
            this.textShow = textShow;
            this.title = title;

            this.change = change;

            let timeThunk = duration * 1000 / timing;
            let vThunk = value / timeThunk;
            let i = 0;
            let timeFn = setInterval(() => {
                let v = Math.ceil(vThunk * i);
                if (v >= value) {
                    v = value;
                    clearInterval(timeFn);
                } else {
                    i += 1;
                }
                this.draw(v);
            }, timing);
        }
        initCanvas(dom) {
            let dpr = window.devicePixelRatio;
            this.canvas = document.createElement("canvas");
            this.canvas.setAttribute("id", "dragArc");
            this.canvas.setAttribute("width", dpr * this.width);
            this.canvas.setAttribute("height", dpr * this.width);
            this.canvas.style.width = this.width + 'px'
            this.canvas.style.height = this.width + 'px'
            dom.innerHTML = '';
            dom.appendChild(this.canvas);
            this.ctx = this.canvas.getContext("2d");
            this.ctx.scale(dpr, dpr)
            this.isMobile = /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);
        }
        //绘图
        draw(value) {
            this.ctx.clearRect(0, 0, this.width, this.width);

            this.ctx.save();

            let startDeg = this.counterclockwise ? Math.PI * (2 - this.startDeg) : Math.PI * this.startDeg;
            let endDeg = this.counterclockwise ? Math.PI * (2 - this.endDeg) : Math.PI * this.endDeg;

            // 绘制外侧圆弧
            this.ctx.beginPath();
            this.ctx.arc(this.center, this.center, this.radius, startDeg, endDeg, this.counterclockwise); // 绘制外侧圆弧
            this.ctx.strokeStyle = this.outColor;
            this.ctx.lineCap = "round";
            this.ctx.lineWidth = this.outLineWidth;
            this.ctx.stroke();

            let Deg = this.valToDeg(value);

            // 绘制可变圆弧
            let themeColor = (typeof this.color === 'string') ? this.color : this.setLinearGradient();
            this.ctx.beginPath();
            this.ctx.arc(this.center, this.center, this.radius, startDeg, Deg, this.counterclockwise); // 可变圆弧
            this.ctx.strokeStyle = themeColor;
            this.ctx.lineCap = "round";
            this.ctx.lineWidth = this.outLineWidth;
            this.ctx.stroke();

            // 绘制滑块
            this.P = this.DegToXY(Deg);
            this.ctx.beginPath();
            this.ctx.moveTo(this.center, this.center);
            this.ctx.arc(this.P.x, this.P.y, this.slider, 0, Math.PI * 2, false); // 绘制滑块
            this.ctx.fillStyle = this.sliderColor;        this.ctx.fill();

            // 文字
            if (!this.textShow) return;
            let textColor = (typeof this.color === 'string') ? this.color : this.setLinearGradient(this.width / 2.5 * ((value + '').length));
            this.ctx.font = `${this.center / 3}px serif`;
            this.ctx.fillStyle = textColor;
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = this.title ? "bottom" : 'middle';
            this.ctx.fillText(value, this.center, this.center);

            if (!this.title) return;
            this.ctx.font = `${this.center / 7}px serif`;
            this.ctx.fillStyle = '#fff';
            this.ctx.textAlign = "center";
            this.ctx.fillText(this.title, this.center, this.center * 1.3);
        }
        //将值转化为弧度
        valToDeg(v) {
            let range = this.endDeg - this.startDeg;
            let val = range / 100 * v;
            if (this.counterclockwise && (val !== 0)) val = 2 - val;
            let startDeg = this.counterclockwise ? (2 - this.startDeg) : this.startDeg;
            return (startDeg + val) * Math.PI;
        }

        // 弧度转化为对应坐标值
        DegToXY(deg) {
            let d = 2 * Math.PI - deg;
            return this.respotchangeXY({
                x: this.radius * Math.cos(d),
                y: this.radius * Math.sin(d)
            })
        }

        //中心坐标转化为canvas坐标
        respotchangeXY(point) {
            const spotchangeX = (i) => {
                return i + this.center
            };
            const spotchangeY = (i) => {
                return this.center - i
            };
            return {
                x: spotchangeX(point.x),
                y: spotchangeY(point.y)
            }
        }

        setLinearGradient(width) {
            const grad = this.ctx.createLinearGradient(0, 0, width || this.width, 0);
            this.color.forEach((e, i) => {
                if (i === 0) {
                    grad.addColorStop(0, e);
                } else if (i === this.color.length - 1) {
                    grad.addColorStop(1, e);
                } else {
                    grad.addColorStop(1 / this.color.length * (i + 1), e);
                }
            });
            return grad;
        }
    }

    return DragAcr;

})));
