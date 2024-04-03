function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map(item=>typeof item==='object'?item:createTextElement(item))
        }
    }
}

function createTextElement(text) {
    return {
        type: 'TEXT_ELEMENT',
        props: {
            nodeValue: text,
            children: [],
        }
    }
}

export default createElement;