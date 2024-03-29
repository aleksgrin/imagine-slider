(function(window, document, Math) {
  "use strict";
  class ImagineSlider {
    constructor() {
      this.sliderValue = null;
      this.sliderHandle = null;
      this.arr = null;
      this.startValue = null;
      this.endValue = null;
      this.totalCurveLength = null;
      this.startEvent = null;
      this.moveEvent = null;
      this.endEvent = null;
    }

    render(elem, arr) {
      const defaultLook =
        "border-radius: 50%; background-color: #000000; width: 60px; height: 60px;";
      const canvasDefaultCSS = "position: absolute; left: 0; top: 0;";
      elem.style = "position: relative";
      elem.innerHTML = `
      ${
        this.isVisible
          ? `<canvas id='canvas' style="${canvasDefaultCSS}"></canvas>`
          : ""
      }
      ${
        this.isConnected
          ? `<canvas id='canvas_top' style="${canvasDefaultCSS}"></canvas>`
          : ""
      }
      <div class="slider_handle" style="position: absolute; ${
        this.customHandle ? "" : defaultLook
      }"></div>
    `;
      if (this.isVisible) {
        const canvas = document.querySelector("#canvas");
        const dotRadius = this.lineWidth / 2;
        canvas.width = this.canvasWidth;
        canvas.height = this.canvasHeight;
        const ctx = canvas.getContext("2d");
        this.ctx = ctx;

        ctx.beginPath();
        ctx.fillStyle = this.lineColor;
        ctx.lineWidth = 0;
        arr.forEach(elem => {
          ctx.moveTo(elem.x + dotRadius / 2, elem.y + dotRadius / 2);
          ctx.arc(elem.x, elem.y, dotRadius, 0, 2 * Math.PI);
        });
        ctx.fill();
        if (this.referenceValuesArray) {
          ctx.beginPath();
          ctx.lineWidth = this.dashWidth;
          ctx.strokeStyle = this.dashColor;
          this.referenceValuesArray.forEach(referenceElem => {
            const myElem = this.findNearest(
              referenceElem.x,
              referenceElem.y,
              arr
            );
            const dashStart = this.calulateDashCoords(
              myElem,
              arr,
              this.dashHeight / 2
            );
            const dashEnd = this.calulateDashCoords(
              myElem,
              arr,
              -this.dashHeight / 2
            );
            ctx.moveTo(dashStart.x, dashStart.y);
            ctx.lineTo(dashEnd.x, dashEnd.y);
          });
          ctx.stroke();
        }
      }
    }
    renderTopLine() {
      const activeArrayPart = this.arr.slice(0, this.currentElemIndex);

      const canvasTop = document.querySelector("#canvas_top");
      const dotRadius = this.lineWidth / 2;
      canvasTop.width = this.canvasWidth;
      canvasTop.height = this.canvasHeight;
      const ctx = canvasTop.getContext("2d");

      ctx.beginPath();
      ctx.fillStyle = "black";
      ctx.lineWidth = 0;
      activeArrayPart.forEach(elem => {
        ctx.moveTo(elem.x + dotRadius / 2, elem.y + dotRadius / 2);
        ctx.arc(elem.x, elem.y, dotRadius, 0, 2 * Math.PI);
      });
      ctx.fill();
    }

    createArray(begin, end, N) {
      const h = (end - begin) / N;
      const arr = [begin];
      for (let i = 1; i <= N; i++) {
        arr.push(arr[i - 1] + h);
      }
      return arr;
    }
    createArrayH(begin, end, h) {
      const N = (end - begin) / h;
      const arr = [begin];
      for (let i = 1; i <= N; i++) {
        arr.push(arr[i - 1] + h);
      }
      return arr;
    }

    findCurveLength(arr, ind) {
      const sliceInd = ind !== undefined ? ind : arr.length - 1;
      const newArr = arr.slice(0, sliceInd + 1);
      return newArr.reduce((acum, curr, index, array) => {
        return (
          acum +
          (index === 0
            ? 0
            : Math.sqrt(
                Math.pow(curr.x - array[index - 1].x, 2) +
                  Math.pow(curr.y - array[index - 1].y, 2)
              ))
        );
      }, 0);
    }

    findNearest(x, y, arr) {
      // Нахожит ближайшую точку в масиве к переданной
      const dists = arr.map(elem => {
        return Math.sqrt(Math.pow(elem.x - x, 2) + Math.pow(elem.y - y, 2));
      });
      const minInd = dists.indexOf(Math.min(...dists));
      return arr[minInd];
    }

    checkInput(param) {
      const N = param.type.N || 100;
      if (param.arr) {
        return param.arr;
      }
      if (param.type.curve === "circle") {
        const R = param.type.r;
        return this.createArrayH(0, 360, 1)
          .map(elem => (elem * Math.PI) / 180)
          .map(elem => {
            let xAbs = R * Math.cos(elem);
            let yAbs = R * Math.sin(elem);
            return { x: xAbs, y: yAbs };
          });
      }
      if (param.type.curve === "spiral") {
        const { fi1, fi2, r1, r2 } = param.type;
        const N = 1000;
        return (
          this.createArray(fi1, fi2, N)
            // return this.createArrayH(fi1, fi2, 1)
            .map(elem => (elem * Math.PI) / 180)
            .map((elem, i) => {
              let xAbs = this.createArray(r1, r2, N)[i] * Math.cos(elem);
              let yAbs = this.createArray(r1, r2, N)[i] * Math.sin(elem);
              return { x: xAbs, y: yAbs };
            })
        );
      }
      if (param.type.curve === "arc") {
        const { r, fi1, fi2 } = param.type;
        const dfi = (2 * Math.asin(1 / r / Math.sqrt(2)) * 180) / Math.PI;
        return this.createArrayH(fi1, fi2, dfi)
          .map(elem => (elem * Math.PI) / 180)
          .map(elem => {
            let xAbs = r * Math.cos(elem);
            let yAbs = r * Math.sin(elem);
            return { x: xAbs, y: yAbs };
          });
      }
      if (param.type.curve === "line") {
        const { x1, x2, y1, y2 } = param.type;
        const xArr = this.createArray(x1, x2, N);
        const yArr = this.createArray(y1, y2, N);
        return xArr.map((elem, index) => {
          let xAbs = elem;
          let yAbs = yArr[index];
          return { x: xAbs, y: yAbs };
        });
      }
    }

    line(x1, y1, x2, y2) {
      let xArr;
      let yArr;
      let determineH = (x1, x2) => (x2 < x1 ? -1 : 1);
      if (Math.abs(x2 - x1) > Math.abs(y2 - y1)) {
        xArr = this.createArrayH(x1, x2, determineH(x1, x2));
        yArr = this.createArray(y1, y2, xArr.length - 1);
      } else if (Math.abs(x2 - x1) < Math.abs(y2 - y1)) {
        yArr = this.createArrayH(y1, y2, determineH(y1, y2));
        xArr = this.createArray(x1, x2, yArr.length - 1);
      }
      return xArr.map((elem, index) => {
        let xAbs = elem;
        let yAbs = yArr[index];
        return { x: xAbs, y: yAbs };
      });
    }
    arc(r, fi1, fi2, xc = 0, yc = 0) {
      let dfi = (2 * Math.asin(1 / r / Math.sqrt(2)) * 180) / Math.PI;
      dfi = fi2 > fi1 ? dfi : -dfi;
      return this.createArrayH(fi1, fi2, dfi)
        .map(elem => (elem * Math.PI) / 180)
        .map(elem => {
          let xAbs = xc + r * Math.cos(elem);
          let yAbs = yc + r * Math.sin(elem);
          return { x: xAbs, y: yAbs };
        });
    }

    calculateValue(start, end, currL, L) {
      return parseInt(((end - start) * currL) / L + start);
    }

    get() {
      return this.sliderValue;
    }

    getPersentage() {
      return (this.currL / this.totalCurveLength) * 100;
    }

    findNearesELemIndex(value, arr) {
      const values = arr.map(elem => Math.abs(elem - value));
      const foundElemIndex = values.indexOf(Math.min(...values));
      return foundElemIndex;
    }

    set(value) {
      if (this.startValue !== null && this.endValue !== null) {
        if (value > this.endValue || value < this.startValue) {
          console.warn(
            "Your value is out of your start or end values or you forgot to provied one"
          );
          return;
        }
        this.sliderValue = value;
        const Lin =
          ((value - this.startValue) * this.totalCurveLength) /
          (this.endValue - this.startValue);
        const foundIndex = this.findNearesELemIndex(Lin, this.curveLengths);
        const foundElem = this.arr[
          this.findNearesELemIndex(Lin, this.curveLengths)
        ];
        this.currentElemIndex = foundIndex;

        this.moveSliderHandle(foundElem.x, foundElem.y);
      } else {
        this.setPers(value);
      }
    }

    setPers(value) {
      if (value > 100 || value < 0) {
        console.warn(
          "Your value is a persent of a curve so it has to be between 0 and 100"
        );
        return;
      }
      const Lin = (value * this.totalCurveLength) / 100;
      const foundIndex = this.findNearesELemIndex(Lin, this.curveLengths);
      const foundElem = this.arr[foundIndex];
      this.currentElemIndex = foundIndex;
      this.moveSliderHandle(foundElem.x, foundElem.y);
    }

    listen(type, callback) {
      if (type === "start") {
        this.startEvent = new Event("start");
        this.sliderHandle.addEventListener("start", callback, false);
      } else if (type === "move") {
        this.moveEvent = new Event("move");
        document.addEventListener("move", callback, false);
      } else if (type === "end") {
        this.endEvent = new Event("end");
        document.addEventListener("end", callback, false);
      } else if (type === "click") {
        this.clickEvent = new Event("click");
        document.addEventListener("click", callback, false);
      }
    }

    to(elem) {
      const currInd = this.currentElemIndex;
      const targInd = this.arr.indexOf(elem);
      const slider = this;

      function animate({ timing, draw, duration }) {
        let start = performance.now();

        requestAnimationFrame(function animate(time) {
          let timeFraction = (time - start) / duration;
          if (timeFraction > 1) timeFraction = 1;

          let progress = timing(timeFraction);

          draw(progress);

          if (timeFraction < 1) {
            requestAnimationFrame(animate);
          }
        });
      }

      animate({
        duration: this.transitionTime,
        timing: slider.timingFunction,
        draw(progress) {
          let i = Math.floor((targInd - currInd) * progress + currInd);
          if (i >= slider.arr.length) {
            i = slider.arr.length - 1;
          }
          if (i < 0) {
            i = 0;
          }
          slider.moveSliderHandle(slider.arr[i].x, slider.arr[i].y);
        }
      });
      this.currentElemIndex = targInd;
    }

    moveSliderHandle(x, y) {
      this.sliderHandle.style.left =
        x - this.sliderHandle.offsetWidth / 2 + "px";
      this.sliderHandle.style.top =
        y - this.sliderHandle.offsetHeight / 2 + "px";
    }

    moveSliderHandleToNearestRef(x, y) {
      const foundReferenceElem = this.findNearest(
        this.foundElem.x,
        this.foundElem.y,
        this.referenceValuesArray
      );
      this.foundElem = this.findNearest(
        foundReferenceElem.x,
        foundReferenceElem.y,
        this.arr
      );
      this.to(this.foundElem);
    }

    handleReferenceValues() {
      return this.referenceValues.map(value => {
        if (value > this.endValue || value < this.startValue) {
          console.warn(
            "Your value is out of your start or end values or you forgot to provied one"
          );
          return;
        }
        const Lin =
          ((value - this.startValue) * this.totalCurveLength) /
          (this.endValue - this.startValue);
        return this.arr[this.findNearesELemIndex(Lin, this.curveLengths)];
      });
    }

    shiftInputArray(arr) {
      const arrMinX = Math.min(...arr.map(elem => elem.x));
      const arrMaxX = Math.max(...arr.map(elem => elem.x));
      const arrMinY = Math.min(...arr.map(elem => elem.y));
      const arrMaxY = Math.max(...arr.map(elem => elem.y));
      return arr.map(elem => {
        elem.y += 10;
        elem.x += 10;
        if (arrMinY < 0) {
          elem.y -= arrMinY - 20;
        }
        if (arrMinX < 0) {
          elem.x -= arrMinX - 20;
        }
        return elem;
      });
    }
    calulateDashCoords(elem, arr, r) {
      const elemIndex = arr.indexOf(elem);
      const diff =
        elemIndex === arr.length - 1
          ? (arr[elemIndex].y - arr[elemIndex - 1].y) /
            (arr[elemIndex].x - arr[elemIndex - 1].x)
          : (arr[elemIndex + 1].y - arr[elemIndex].y) /
            (arr[elemIndex + 1].x - arr[elemIndex].x);
      // const diff2 =
      //   (arr[elemIndex + 1].y - 2 * arr[elemIndex].y + arr[elemIndex - 1].y) /
      //   Math.pow(arr[elemIndex + 1].x - arr[elemIndex].x, 2);

      const alpha = Math.atan(diff);

      const fiAdd = 0;
      // const fiAdd = diff2 > 0 ? Math.PI : 0;

      return {
        x: elem.x + r * Math.cos(fiAdd + Math.PI / 2 + alpha),
        y: elem.y + r * Math.sin(fiAdd + Math.PI / 2 + alpha)
      };
    }

    init(elem, param) {
      // Константы
      const defaultTransitionTime = 800;
      const defaultTimingFunction = timeFraction => {
        return timeFraction;
      };
      const cutoffInd = 30;

      // Начальные значения
      this.currentElemIndex = 0;

      // Обработка входных параметров
      this.transitionTime =
        param.transition && param.transition.t
          ? param.transition.t
          : defaultTransitionTime;
      this.timingFunction =
        param.transition && param.transition.timingFunction
          ? param.transition.timingFunction
          : defaultTimingFunction;

      this.startValue = param.values ? param.values.from : null;
      this.endValue = param.values ? param.values.to : null;

      // Соединение
      this.isConnected =
        param.connection && param.connection.connect
          ? param.connection.connect
          : false;

      this.behavor = param.behavior ? param.behavior : null;
      this.isToggle =
        param.behavor && param.behavor.toggle === true
          ? param.behavor.toggle
          : null;
      this.customHandle =
        param.sliderHandle && param.sliderHandle === "custom" ? true : false;

      this.referenceValues = param.referenceValues
        ? param.referenceValues.values
        : null;
      this.isVisible =
        param.render && param.render.visible !== undefined
          ? param.render.visible
          : true;
      this.closed = param.type.closed ? param.type.closed : null;
      this.lineColor =
        param.render && param.render.color ? param.render.color : "#000000";
      this.lineWidth =
        param.render && param.render.width ? param.render.width : 4;
      this.dashColor =
        param.render && param.render.dashColor
          ? param.render.dashColor
          : "black";
      this.dashWidth =
        param.render && param.render.dashWidth ? param.render.dashWidth : 4;
      this.dashHeight =
        param.render && param.render.dashHeight ? param.render.dashHeight : 40;

      this.elem = elem;
      this.arr = this.checkInput(param);
      this.arr = this.shiftInputArray(this.arr);
      this.curveLengths = this.arr.map((elem, ind, arr) => {
        return this.findCurveLength(arr, ind);
      });

      this.canvasWidth = Math.max(...this.arr.map(elem => elem.x)) + 50;
      this.canvasHeight = Math.max(...this.arr.map(elem => elem.y)) + 50;
      this.totalCurveLength = this.findCurveLength(this.arr);

      this.referenceValuesArray =
        this.referenceValues && this.handleReferenceValues();
      this.render(this.elem, this.arr);
      this.sliderElem = document.querySelector(".slider");
      this.sliderHandle = document.querySelector(".slider_handle");
      const sliderLeft = this.sliderElem.offsetLeft;
      const sliderTop = this.sliderElem.offsetTop;

      this.moveSliderHandle(this.arr[0].x, this.arr[0].y);

      let getCoordsStorage = evt => {
        return evt.targetTouches ? evt.targetTouches[0] : evt;
      };

      if (param.clickable !== false) {
        let onSliderClick = evt => {
          if (this.clickEvent) this.elem.dispatchEvent(this.clickEvent);

          evt.preventDefault();
          let coords = {
            x: getCoordsStorage(evt).clientX - sliderLeft,
            y: getCoordsStorage(evt).clientY - sliderTop
          };

          this.foundElem = this.findNearest(coords.x, coords.y, this.arr);
          if (param.referenceValues) {
            const foundReferenceElem = this.findNearest(
              this.foundElem.x,
              this.foundElem.y,
              this.referenceValuesArray
            );
            this.foundElem = this.findNearest(
              foundReferenceElem.x,
              foundReferenceElem.y,
              this.arr
            );
            this.foundElemIndex = this.arr.indexOf(this.foundElem);
            this.targetElemIndex = this.foundElemIndex;
            this.moveSliderHandleToNearestRef();
          } else {
            this.foundElemIndex = this.arr.indexOf(this.foundElem);
            this.targetElemIndex = this.foundElemIndex;
            this.to(this.foundElem);
          }

          this.currentElemIndex = this.foundElemIndex;
          this.currL = this.findCurveLength(this.arr, this.foundElemIndex);
          if (param.values) {
            this.sliderValue = this.calculateValue(
              this.startValue,
              this.endValue,
              this.currL,
              this.totalCurveLength
            );
          } else {
            this.sliderValue = this.getPersentage();
          }
        };
        this.sliderElem.addEventListener("click", onSliderClick);
      }

      let onMouseDown = evt => {
        evt.preventDefault();

        if (this.startEvent) this.sliderHandle.dispatchEvent(this.startEvent);

        let coords = {
          x: getCoordsStorage(evt).clientX - sliderLeft,
          y: getCoordsStorage(evt).clientY - sliderTop
        };

        let onMouseMove = moveEvt => {
          this.renderTopLine();
          moveEvt.preventDefault();

          if (this.moveEvent) document.dispatchEvent(this.moveEvent);

          this.foundElem = this.findNearest(coords.x, coords.y, this.arr);
          this.foundElemIndex = this.arr.indexOf(this.foundElem);
          this.currElem = this.arr[this.currentElemIndex];

          const isClosedCurve = () => {
            return (
              (this.closed &&
                this.currentElemIndex >= this.arr.length - cutoffInd &&
                this.foundElemIndex < cutoffInd) ||
              (this.currentElemIndex < cutoffInd &&
                this.foundElemIndex > this.arr.length - cutoffInd)
            );
          };

          if (
            Math.abs(this.foundElemIndex - this.currentElemIndex) < cutoffInd ||
            isClosedCurve()
          ) {
            this.currentElemIndex = this.foundElemIndex;
            this.moveSliderHandle(this.foundElem.x, this.foundElem.y);
          }

          coords = {
            x: getCoordsStorage(moveEvt).clientX - sliderLeft,
            y: getCoordsStorage(moveEvt).clientY - sliderTop
          };

          const currInd = this.arr.indexOf(this.foundElem);
          this.currL = this.findCurveLength(this.arr, currInd);
          if (param.values) {
            this.sliderValue = this.calculateValue(
              this.startValue,
              this.endValue,
              this.currL,
              this.totalCurveLength
            );
          } else {
            this.sliderValue = this.getPersentage();
          }
        };

        let onMouseUp = upEvt => {
          upEvt.preventDefault();
          if (this.endEvent) document.dispatchEvent(this.endEvent);

          if (this.referenceValuesArray) {
            const foundReferenceElem = this.findNearest(
              this.foundElem.x,
              this.foundElem.y,
              this.referenceValuesArray
            );
            this.foundElem = this.findNearest(
              foundReferenceElem.x,
              foundReferenceElem.y,
              this.arr
            );
            this.to(this.foundElem);
          }

          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("touchmove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
          document.removeEventListener("touchend", onMouseUp);
        };
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("touchmove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        document.addEventListener("touchend", onMouseUp);
      };
      this.sliderHandle.addEventListener("mousedown", onMouseDown);
      this.sliderHandle.addEventListener("touchstart", onMouseDown);
    }
  }

  if (typeof module != "undefined" && module.exports) {
    module.exports = ImagineSlider;
  } else if (typeof define == "function" && define.amd) {
    define(function() {
      return ImagineSlider;
    });
  } else {
    window.ImagineSlider = ImagineSlider;
  }
})(window, document, Math);
