!function(e){var t={};function r(n){if(t[n])return t[n].exports;var i=t[n]={i:n,l:!1,exports:{}};return e[n].call(i.exports,i,i.exports,r),i.l=!0,i.exports}r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)r.d(n,i,function(t){return e[t]}.bind(null,i));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="/build/",r(r.s=0)}([function(e,t,r){"use strict";r.r(t);window.anySlider=new class{constructor(){this.sliderValue=null,this.sliderHandle=null,this.arr=null,this.startValue=null,this.endValue=null,this.L=null}render(e,t){e.innerHTML=`\n      <div class="slider_handle"></div>\n      <div class="test">\n        ${t.map(e=>`<div class='dot' style='left: ${e.x}px; top: ${e.y}px'></div>`).join("")}\n      </div>\n    `}createArray(e,t,r){const n=(t-e)/r,i=[e];for(let e=1;e<=r;e++)i.push(i[e-1]+n);return i}findCurveLength(e,t){const r=void 0!==t?t:e.length-1;return e.slice(0,r+1).reduce((e,t,r,n)=>e+(0===r?0:Math.sqrt(Math.pow(t.x-n[r-1].x,2)+Math.pow(t.y-n[r-1].y,2))),0)}findNearest(e,t,r){const n=r.map(r=>Math.sqrt(Math.pow(r.x-e,2)+Math.pow(r.y-t,2)));return r[n.indexOf(Math.min(...n))]}checkInput(e){const t=e.type.N||100;if(e.arr)return e.arr;if("circle"===e.type.curve){const r=e.type.r;return this.createArray(0,360,t).map(e=>e*Math.PI/180).map(e=>{return{x:r+r*Math.cos(e),y:r+r*Math.sin(e)}})}if("spiral"===e.type.curve){const{fi1:r,fi2:n,r1:i,r2:s}=e.type;return this.createArray(r,n,t).map(e=>e*Math.PI/180).map((e,r)=>{return{x:s+this.createArray(i,s,t)[r]*Math.cos(e),y:s+this.createArray(i,s,t)[r]*Math.sin(e)}})}if("arc"===e.type.curve){const{r:r,fi1:n,fi2:i}=e.type;return this.createArray(n,i,t).map(e=>e*Math.PI/180).map(e=>{return{x:xc+r*Math.cos(e),y:yc+r*Math.sin(e)}})}if("line"===e.type.curve){const{x1:r,x2:n,y1:i,y2:s}=e.type,a=this.createArray(r,n,t),l=this.createArray(i,s,t);return a.map((e,t)=>{return{x:e,y:l[t]}})}}calculateValue(e,t,r,n){return parseInt((t-e)*r/n+e)}get(){return this.sliderValue}findNearesELemIndex(e,t){const r=t.map(t=>Math.abs(t-e));return r.indexOf(Math.min(...r))}set(e){if(e>this.endValue||e<this.startValue)return void console.warn("Your value is out of your start or end values or you forgot to provied one");const t=this.arr.map((e,t,r)=>this.findCurveLength(r,t)),r=(e-this.startValue)*this.L/(this.endValue-this.startValue),n=this.arr[this.findNearesELemIndex(r,t)];this.sliderHandle.style.left=n.x-this.sliderHandle.offsetWidth/2+"px",this.sliderHandle.style.top=n.y-this.sliderHandle.offsetHeight/2+"px"}init(e,t){const r=!!t.values;this.startValue=r?t.values.from:null,this.endValue=r?t.values.to:null,this.arr=this.checkInput(t);const n=this.arr;let i=0;this.L=this.findCurveLength(n),this.render(e,n);const s=document.querySelector(".slider");this.sliderHandle=document.querySelector(".slider_handle");const a=document.querySelector(".input"),l=s.offsetLeft,u=s.offsetTop;let o=0;this.sliderHandle.style.left=n[0].x-this.sliderHandle.offsetWidth/2+"px",this.sliderHandle.style.top=n[0].y-this.sliderHandle.offsetHeight/2+"px";this.sliderHandle.addEventListener("mousedown",e=>{e.preventDefault();let t={x:e.clientX-l,y:e.clientY-u},s=e=>{e.preventDefault();const s=this.findNearest(t.x,t.y,n),d=n.indexOf(s);Math.abs(d-o)<20&&(o=d,this.sliderHandle.style.left=s.x-this.sliderHandle.offsetWidth/2+"px",this.sliderHandle.style.top=s.y-this.sliderHandle.offsetHeight/2+"px"),t={x:e.clientX-l,y:e.clientY-u};const c=n.indexOf(s);i=this.findCurveLength(n,c),r&&(this.sliderValue=this.calculateValue(this.startValue,this.endValue,i,this.L)),r&&(a.innerHTML=this.sliderValue)};document.addEventListener("mousemove",s),document.addEventListener("mouseup",(function e(t){t.preventDefault(),document.removeEventListener("mousemove",s),document.addEventListener("mouseup",e)}))})}};const n=document.querySelector(".slider"),i=200*Math.PI;anySlider.createArray(0,i,100).map(e=>{return{x:e,y:60*Math.sin(.02*e)}});anySlider.init(n,{type:{curve:"spiral",fi1:0,fi2:720,r1:0,r2:200},values:{from:0,to:300}})}]);
//# sourceMappingURL=build.js.map