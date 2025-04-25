const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // 匹配标签名, 比如 div, div:id
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; // 匹配标签名, 比如 div, div:id
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配开始标签, 比如 <div

const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配结束标签, 比如 </div>
const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性, 比如 id="app"
const startTagClose = /^\s*(\/?)>/; // 匹配开始标签的闭合, 比如 />

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配插值, 比如 {{ message }}

function parseHTML(html) {
  const ELEMENT_TYPE = 1; // 元素类型
  const TEXT_TYPE = 3; // 文本类型
  const stack = []; // 栈, 用于存储元素
  let currentParent; // 当前父元素
  let root; // 根元素

  // 创建ast元素
  const createASTElement = (tagName, attrs) => {
    return {
      type: ELEMENT_TYPE,
      tag: tagName,
      attrs,
      children: [],
      parent: null,
    };
  };

  function start(tagName, attrs) {
    let node = createASTElement(tagName, attrs);
    if (!root) {
      root = node; // 如果根元素不存在, 则将当前元素设置为根元素
    }
    if (currentParent) {
      node.parent = currentParent; // 设置当前元素的父元素
      currentParent.children.push(node); // 将当前元素添加到父元素的children中
    }
    stack.push(node); // 将当前元素压入栈
    currentParent = node; // 将当前元素设置为当前父元素
  }

  function chars(text) {
    text = text.replace(/\s/g, "");
    if (text) {
      currentParent.children.push({
        type: TEXT_TYPE,
        text,
        parent: currentParent,
      });
    }
  }

  function end() {
    stack.pop();
    currentParent = stack[stack.length - 1];
  }

  function advance(n) {
    html = html.substring(n);
  }

  function parseStartTag() {
    const start = html.match(startTagOpen);

    // 如果匹配到开始标签
    if (start) {
      const match = {
        tagName: start[1], // 标签名
        attrs: [], // 属性
      };

      advance(start[0].length);

      // 如果不是开始标签的结束, 则继续匹配属性
      let attr, end;
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        advance(attr[0].length);
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5],
        });
      }

      // 如果匹配到开始标签的结束, 则返回匹配到的标签
      if (end) {
        advance(end[0].length);
        return match;
      }
    }

    return false; // 没有匹配到开始标签
  }

  // 解析html
  while (html) {
    let textEnd = html.indexOf("<");
    // 如果模板字符串以<开头, 则认为是开始标签
    if (textEnd === 0) {
      let startTagMatch = parseStartTag();
      if (startTagMatch) {
        // 如果匹配到开始标签, 则继续匹配
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }

      let endTagMatch = html.match(endTag);
      // 如果匹配到结束标签, 则继续匹配
      if (endTagMatch) {
        advance(endTagMatch[0].length);
        end(endTagMatch[1]);
        continue;
      }
      break;
    } else {
      let text = html.substring(0, textEnd);
      if (text) {
        chars(text);
        advance(text.length);
      }
    }
  }

  console.log(root);
}

export function compileToFunction(template) {
  // 1.将模版编译成ast语法树
  let ast = parseHTML(template);
  // 2.将ast语法树编译成render函数
  // 3.将render函数转换成虚拟dom
  // 4.将虚拟dom转换成真实dom
}
