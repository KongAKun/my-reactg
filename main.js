import { createElement, render } from "./micro-react";

const handleChange = (e) => {
  renderer(e.target.value);
};

const container = document.querySelector('#app');

const renderer = (value) => {
  const element = createElement(
    'div',
    null,
    createElement('input', {
      value: value,
      oninput: (e) => {
        handleChange(e);
      },
    }),
    createElement('h2', null, value)
  );
  console.log(element)
  render(element, container);
};

renderer('Hello');
