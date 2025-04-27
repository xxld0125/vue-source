import { parseHTML } from "./parse";

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配插值, 比如 {{ message }}

// 将attrs转换成字符串
function genProps(attrs) {
  let str = "";
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    if (attr.name === "style") {
      // 将style转换成对象
      let obj = {};
      attr.value.split(";").forEach((item) => {
        if (item) {
          const [key, value] = item.split(":");
          obj[key] = value.trim();
        }
      });
      attr.value = obj;
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`;
  }
  return `{${str.slice(0, -1)}}`;
}

function gen(node) {
  // 1. 如果是元素节点
  if (node.type === 1) {
    return codegen(node);
  } else {
    let text = node.text;
    if (!defaultTagRE.test(text)) {
      // 2. 如果是纯文本节点
      return `_v(${JSON.stringify(text)})`;
    } else {
      // 3. 如果是插值节点
      let tokens = [];
      let match;
      defaultTagRE.lastIndex = 0; // 重置lastIndex, 避免全局匹配
      let lastIndex = 0;
      while ((match = defaultTagRE.exec(text))) {
        let index = match.index;
        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        }
        tokens.push(`_s(${match[1].trim()})`);
        lastIndex = index + match[0].length;
      }
      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)));
      }
      return `_v(${tokens.join("+")})`;
    }
  }
}

// 将children转换成字符串
function genChildren(children) {
  return children.map((child) => gen(child)).join(",");
}

// 将ast转换成render函数
function codegen(ast) {
  let code = `_c('${ast.tag}', ${
    ast.attrs?.length > 0 ? genProps(ast.attrs) : "null"
  }
  ${ast.children?.length > 0 ? `,${genChildren(ast.children)}` : ""}
  )`;

  return code;
}

export function compileToFunction(template) {
  // 1.将模版编译成ast语法树
  let ast = parseHTML(template);

  // 2.将ast语法树编译成render函数
  let code = codegen(ast);

  // 模版引擎的实现原理就是 with + new Function

  // 创建render函数
  const render = new Function(`with(this){return ${code}}`);

  return render;
}
