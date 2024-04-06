import { createElement, render } from "./micro-react";

const ele = createElement(
  "h1",
  {
    id: "title",
    class: "hello",
    style: "background: red",
  },
  "helloworld",
  createElement("h2", { style:' background: blue'},'hhh')
);

const container = document.querySelector("#app");

render(ele, container);

console.log(ele);
