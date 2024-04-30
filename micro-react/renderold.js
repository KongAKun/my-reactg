function commitRoot() {
    deletion.forEach(commitWork);
    commitWork(wipRoot.child);
    currentRoot = wipRoot;
    wipRoot = null;
  }
  
  function commitWork(fiber) {
    if (!fiber) return;
    const parentDom = fiber.parent.dom;
    if (fiber.effectTag === 'PLACEMENT' && fiber.dom) {
      parentDom.append(fiber.dom);
    } else if (fiber.effectTag === 'DELETION' && fiber.dom) {
      parentDom.removeChild(fiber.dom);
    } else if (fiber.effectTag === 'UPDATE' && fiber.dom) {
      // dom，之前的props，现在的props
      updateDOM(fiber.dom, fiber.alternate.props, fiber.props);
    }
    parentDom.append(fiber.dom);
    commitWork(fiber.child);
    commitWork(fiber.subling);
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
      },
      altername: currentRoot,
    };
    nextUnionOfWork = wipRoot;
    deletion = [];
  }
  
  let nextUnionOfWork = null;
  let wipRoot = null;
  let currentRoot = null;
  let deletion = null;
  
  function workLoop(deadLine) {
    let shouldYeild = false;
    // console.log(deadLine.timeRemaining())
    while (nextUnionOfWork && !shouldYeild) {
      nextUnionOfWork = performUntionOfWork(nextUnionOfWork);
      shouldYeild = deadLine.timeRemaining() < 1;
    }
  
    if (!nextUnionOfWork && wipRoot) {
      commitRoot();
    }
  
    requestIdleCallback(workLoop);
  }
  
  requestIdleCallback(workLoop);
  
  function performUntionOfWork(fiber) {
    if (!fiber.dom) {
      fiber.dom = createDom(fiber);
    }
  
    const elements = fiber.props.children;
  
    reconclieChildren(fiber, elements);
  
    if (fiber.child) return fiber.child;
    let nextFiber = fiber;
    while (nextFiber) {
      if (nextFiber.subling) return nextFiber.subling;
      nextFiber = nextFiber.parent;
    }
  }
  
  function reconclieChildren(wipFiber, elements) {
    let index = 0;
    let oldFiber = wipFiber?.altername?.child;
    let preSibLing = null;
  
    while (index < elements.length || oldFiber) {
      const element = elements[index];
      const sameType = element && oldFiber && oldFiber.type == element.type;
      let newFiber = null;
  
      if (sameType) {
        newFiber = {
          type: oldFiber.type,
          props: oldFiber.props,
          dom: oldFiber.dom,
          parent: wipFiber,
          altername: oldFiber,
          effectTag: "UPDATE",
        };
      }
      if (element && !sameType) {
        newFiber = {
          type: element.type,
          props: element.props,
          dom: null,
          parent: wipFiber,
          altername: null,
          effectTag: "PLACEMENT",
        };
      }
      if (oldFiber && !sameType) {
        oldFiber.effectTag = "DELETION";
        deletion.push(oldFiber);
      }
      if (oldFiber) {
        oldFiber = oldFiber.subling;
      }
  
      if (index == 0) {
        wipFiber.child = newFiber;
      } else {
        preSibLing.subling = newFiber;
      }
      preSibLing = newFiber;
      index++;
    }
  }
  
  export default render;
  