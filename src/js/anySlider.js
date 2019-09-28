export default class AnySliderClass {
  constructor() {
    this.sliderValue = null;
    this.sliderHandle = null;
    this.arr = null;
    this.startValue = null;
    this.endValue = null;
    this.L = null;
  }

  render(elem, arr) {
    elem.innerHTML = `
      <div class="slider_handle"></div>
      <div class="test">
        ${arr
          .map(elem => {
            return `<div class='dot' style='left: ${elem.x}px; top: ${elem.y}px'></div>`;
          })
          .join("")}
      </div>
    `;
  }

  createArray(begin, end, N) {
    const h = (end - begin) / N;
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
    const dists = arr.map(elem => {
      return Math.sqrt(Math.pow(elem.x - x, 2) + Math.pow(elem.y - y, 2));
    });
    const minInd = dists.indexOf(Math.min(...dists));
    return arr[minInd];
  }

  checkInput(param) {
    let arr;
    const xc = 200;
    const yc = 200;
    const N = 100;
    if (param.arr) {
      return param.arr;
    }
    if (param.type.curve === "circle") {
      const R = param.type.r;
      arr = this.createArray(0, 360, N)
        .map(elem => (elem * Math.PI) / 180)
        .map((elem, i) => {
          let xAbs = xc + R * Math.cos(elem);
          let yAbs = yc + R * Math.sin(elem);
          return { x: xAbs, y: yAbs };
        });
    }
    if (param.type.curve === "spiral") {
      const { fi1, fi2, r1, r2 } = param.type;
      arr = this.createArray(fi1, fi2, N)
        .map(elem => (elem * Math.PI) / 180)
        .map((elem, i) => {
          let xAbs = xc + this.createArray(r1, r2, N)[i] * Math.cos(elem);
          let yAbs = yc + this.createArray(r1, r2, N)[i] * Math.sin(elem);
          return { x: xAbs, y: yAbs };
        });
    }
    if (param.type.curve === "arc") {
      const { r, fi1, fi2 } = param.type;
      arr = this.createArray(fi1, fi2, N)
        .map(elem => (elem * Math.PI) / 180)
        .map(elem => {
          let xAbs = xc + r * Math.cos(elem);
          let yAbs = yc + r * Math.sin(elem);
          return { x: xAbs, y: yAbs };
        });
    }
    if (param.type.curve === "line") {
      const { x1, x2, y1, y2 } = param.type;
      const xArr = this.createArray(x1, x2, N);
      const yArr = this.createArray(y1, y2, N);
      arr = xArr.map((elem, index) => {
        let xAbs = elem;
        let yAbs = yArr[index];
        return { x: xAbs, y: yAbs };
      });
    }
    return arr;
  }

  calculateValue(start, end, currL, L) {
    return parseInt(((end - start) * currL) / L + start);
  }

  get() {
    return this.sliderValue;
  }

  findNearesELemIndex(value, arr) {
    const values = arr.map(elem => Math.abs(elem - value));
    const foundElemIndex = values.indexOf(Math.min(...values))
    return foundElemIndex;
  }
  set(value) {
    if (value > this.endValue || value < this.startValue) return;
    const curveLengths = this.arr.map((elem, ind, arr) => {
      return this.findCurveLength(arr, ind);
    });
    const Lin = (value - this.startValue) * this.L / (this.endValue-this.startValue);
    const foundElem = this.arr[this.findNearesELemIndex(Lin, curveLengths)];
    this.sliderHandle.style.left = foundElem.x - this.sliderHandle.offsetWidth / 2 + "px";
    this.sliderHandle.style.top = foundElem.y - this.sliderHandle.offsetHeight / 2 + "px";
  }

  init(elem, param) {
    const isValuesReseived = param.values ? true : false;
    this.startValue = isValuesReseived ? param.values.from : null;
    this.endValue = isValuesReseived ? param.values.to : null;
    this.arr = this.checkInput(param);
    const arr = this.arr;
    
    const maxInd = 20;
    let currL = 0;
    this.L = this.findCurveLength(arr);
    this.render(elem, arr);
    const sliderElem = document.querySelector(".slider");
    this.sliderHandle = document.querySelector(".slider_handle");
    const input = document.querySelector(".input");

    const sliderLeft = sliderElem.offsetLeft;
    const sliderTop = sliderElem.offsetTop;
    let currentElemIndex = 0;


    this.sliderHandle.style.left = arr[0].x - this.sliderHandle.offsetWidth / 2 + "px";
    this.sliderHandle.style.top = arr[0].y - this.sliderHandle.offsetHeight / 2 + "px";

    let onMouseDown = evt => {
      evt.preventDefault();

      let coords = {
        x: evt.clientX - sliderLeft,
        y: evt.clientY - sliderTop
      };

      let onMouseMove = moveEvt => {
        moveEvt.preventDefault();
        const foundElem = this.findNearest(coords.x, coords.y, arr);
        const foundElemIndex = arr.indexOf(foundElem);
        if (
          foundElemIndex - currentElemIndex < maxInd &&
          foundElemIndex - currentElemIndex > -maxInd
        ) {
          currentElemIndex = foundElemIndex;
          this.sliderHandle.style.left =
            foundElem.x - this.sliderHandle.offsetWidth / 2 + "px";
          this.sliderHandle.style.top =
            foundElem.y - this.sliderHandle.offsetHeight / 2 + "px";
        }

        coords = {
          x: moveEvt.clientX - sliderLeft,
          y: moveEvt.clientY - sliderTop
        };

        const currInd = arr.indexOf(foundElem);
        currL = this.findCurveLength(arr, currInd);
        if (isValuesReseived) {
          this.sliderValue = this.calculateValue(this.startValue, this.endValue, currL, this.L)
        }

        isValuesReseived && (input.innerHTML = this.sliderValue);
      };

      function onMouseUp(upEvt) {
        upEvt.preventDefault();
        document.removeEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      }
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };
    this.sliderHandle.addEventListener("mousedown", onMouseDown);
  }
}
