## Примеры формирования объекта options
Для кругового слайдера необходимо задать только один параметр: радиус окружности
```js
const options = {
  type: {
    curve: 'circle',
    r: 100
  }
}
```
Для спирального слайдера необходимо задать: начальные и конечные углы и радиусы

```js
const options = {
  type: {
    curve: 'spiral',
    fi1: 0,
    fi2: 720,
    r1: 0,
    r2: 200
  }
}
```
```js
const options = {
  type: {
    curve: 'line',
    x1: 100,
    x2: 400,
    y1: 100,
    y2: 200
  }
}
```
##События на слайдере
Для доступка к событиям необходимо использовать метод listen('eventType', callback):
```js
anySlider.listen('start', () => {
  /*
  some incredible code
  */
});
```
Доступно 3 вида событий:
- start (Нажатие на слайдер)
- move (Движение слайдера)
- end (Окончание движения)

TODO: 
- [X]: Реализовать ограничение по переходу между точками 
- []: Рендер точек без определения N так, чтобы расстояние между точками было 1px
- []: Значения по умолчанию
- []: Модульная структура
- [X]: Подписка на события
- [X]: Координаты центра круга (кажется, должны быть просто равны радиусу)
- [X]: Методы get и set
- []: Нарисовать свой слайдер
- [X]: Задание начало и конца
- []: Задание опорных точек на кривой и доводка к ним
- [X]: Touch события
- [X]: Рендер точек на canvas