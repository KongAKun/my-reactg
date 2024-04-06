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
  // 递归渲染孩子
  element.props.children.forEach((child) => render(child, dom));
  // 追加到父节点
  container.append(dom);
}

export default render;
