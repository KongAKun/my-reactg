import { createElement } from "./micro-react";

const ele = createElement(
  'h1',
  {
    id:'title',
    class: 'hello',
  },
  'helloworld',
  createElement('h2')
);

console.log(ele)