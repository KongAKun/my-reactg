function render(element, container) {
  // 创建元素
  const dom =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);

  // 赋值属性
  Object.keys(element.props)
    .filter((key) => key !== "children")
    .forEach((key) => (dom[key] = element.props[key]));
  // 追加到父节点
  container.append(dom);
}

let nextUnionOfWork = null;

function workLoop(deadLine) {
    let shouldYeild = false;
    while( nextUnionOfWork && !shouldYeild ) {
        nextUnionOfWork = performUntionOfWork(nextUnionOfWork);
        shouldYeild = deadLine.timeRemaining() < 1;
    }
    requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUntionOfWork(work) {

}

export default render;
