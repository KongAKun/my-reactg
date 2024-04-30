function commitRoot() {
  commitWork(wipRoot.child);
  wipRoot = null;
}

function commitWork(fiber) {
  if(!fiber) return ;
  const parentDom = fiber.parent.dom;
  parentDom.append(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.subling);
}

function createDom(fiber) {
  // 创建元素
  const dom =
  fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  // 赋值属性
  Object.keys(fiber.props)
    .filter((key) => key !== "children")
    .forEach((key) => (dom[key] = fiber.props[key]));
  return dom;
}

function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    }
  }
  nextUnionOfWork = wipRoot;
}

let nextUnionOfWork = null;
let wipRoot = null;

function workLoop(deadLine) {
  let shouldYeild = false;
  // console.log(deadLine.timeRemaining())
  while (nextUnionOfWork && !shouldYeild) {
    nextUnionOfWork = performUntionOfWork(nextUnionOfWork);
    shouldYeild = deadLine.timeRemaining() < 1;
  }

  if(!nextUnionOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUntionOfWork(fiber) {
  if(!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  const elements = fiber.props.children;
  let preSibLing = null;

  for(let i = 0; i < elements.length; i++) {
    const newFiber = {
      type: elements[i].type,
      props: elements[i].props,
      parent: fiber,
    }
    if(i==0) {
      fiber.child = newFiber;
    }else{
      preSibLing.subling = newFiber;
    }
    preSibLing = newFiber;
  }

  if(fiber.child) return fiber.child;
  let nextFiber = fiber;
  while(nextFiber){
    if(nextFiber.subling) return nextFiber.subling;
    nextFiber = nextFiber.parent;
  }
}

export default render;
