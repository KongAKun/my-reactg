function createDom(fiber) {
  // 创建父节点
  const dom =
    fiber.type == 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type);

  // 赋值属性
  Object.keys(fiber.props)
    .filter((key) => key !== 'children')
    .forEach((key) => (dom[key] = fiber.props[key]));

  return dom;
}

function render(element, container) {
  // Root Fiber
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    child: null,
    altername: currentRoot,
  };
  deletion = [];
  nextUnionOfWork= wipRoot;
}

function commitRoot() {
  deletion.forEach((item) => commitWork(item));
  commitWork(wipRoot.child);
  // commit完成后，把wipRoot变为currentRoot
  currentRoot = wipRoot;
  wipRoot = null;
}

function updateDOM(dom, prevProps, nextPorps) {
  const isEvent = (key) => key.startsWith('on');
  // 删除已经没有的props
  Object.keys(prevProps)
    .filter((key) => key != 'children' && !isEvent(key))
    // 不在nextProps中
    .filter((key) => !key in nextPorps)
    .forEach((key) => {
      // 清空属性
      dom[key] = '';
    });

  // 添加新增的属性/修改变化的属性
  Object.keys(nextPorps)
    .filter((key) => key !== 'children' && !isEvent(key))
    // 不再prevProps中
    .filter((key) => !key in prevProps || prevProps[key] !== nextPorps[key])
    .forEach((key) => {
      dom[key] = nextPorps[key];
    });

  // 删除事件处理函数
  Object.keys(prevProps)
    .filter(isEvent)
    // 新的属性没有，或者有变化
    .filter((key) => !key in nextPorps || prevProps[key] !== nextPorps[key])
    .forEach((key) => {
      const eventType = key.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[key]);
    });

  // 添加新的事件处理函数
  Object.keys(nextPorps)
    .filter(isEvent)
    .filter((key) => prevProps[key] !== nextPorps[key])
    .forEach((key) => {
      const eventType = key.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextPorps[key]);
    });
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  const domParent = fiber.parent.dom;
  if (fiber.effectTag === 'PLACEMENT' && fiber.dom) {
    domParent.append(fiber.dom);
  } else if (fiber.effectTag === 'DELETION' && fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom) {
    // dom，之前的props，现在的props
    updateDOM(fiber.dom, fiber.altername.props, fiber.props);
  }
  commitWork(fiber.child);
  commitWork(fiber.subling);
}

let nextUnionOfWork= null;
let wipRoot = null;
let currentRoot = null;
let deletion = null;

function workLoop(deadline) {
  // shouldYield 表示线程繁忙，应该中断渲染
  let shouldYield = false;
  while (nextUnionOfWork&& !shouldYield) {
    nextUnionOfWork= performUnitOfWork(nextUnionOfWork);
    // 检查线程是否繁忙
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnionOfWork&& wipRoot) {
    commitRoot();
  }

  // 重新请求
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
  // 新建DOM元素
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  reconclieChildren(fiber, fiber.props.children);

  // 如果有child，就返回child fiber
  if (fiber.child) {
    return fiber.child;
  }
  // 没有就优先返回兄弟，向上查找
  // 如果没有，就不返回，返回值为undefined
  let nextFiber = fiber;
  while (nextFiber) {
    // 有sibling
    if (nextFiber.subling) {
      return nextFiber.subling;
    }
    // 向上查找
    nextFiber = nextFiber.parent;
  }
}

function reconclieChildren(wipFiber, elements) {
  let index = 0;
  // 如果有alternate，就返回它的child，没有，就返回undefined
  let oldFiber = wipFiber.altername && wipFiber.altername.child;

  let preSibLing= null;

  // 注意这里是或
  while (index < elements.length || oldFiber) {
    const element = elements[index];
    const sameType = oldFiber && element && oldFiber.type === element.type;

    let newFiber = null;

    if (sameType) {
      // 更新
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        // 继承dom
        dom: oldFiber.dom,
        parent: wipFiber,
        altername: oldFiber,
        effectTag: 'UPDATE',
      };
    }
    if (element && !sameType) {
      // 新建
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        altername: null,
        effectTag: 'PLACEMENT',
      };
    }
    if (oldFiber && !sameType) {
      // 删除
      oldFiber.effectTag = 'DELETION';
      deletion.push(oldFiber);
    }

    if (oldFiber) {
      // 下一个oldFiber
      oldFiber = oldFiber.subling;
    }

    // 第一个child才可以作为child，其他的就是sibling
    if (index === 0) {
      wipFiber.child = newFiber;
    } else {
      preSibLing.subling = newFiber;
    }
    preSibLing= newFiber;
    index++;
  }
}

export default render;