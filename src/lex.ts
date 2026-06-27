/*
  词法分析器
  一个简单的词法分析器，用于将源代码分解为标记（tokens）。
  它使用 RList 类来读取源代码文件，并根据预定义的规则识别不同类型的标记。
  标记包括关键字、标识符、运算符、分隔符和数字等。
  词法分析器的主要功能包括：
  - 跳过空格和换行符。
  - 识别关键字（如 let、var、const）。
  - 识别标识符（由字母、数字和下划线组成）。
  - 识别运算符（如 +、-、*、/、= 等）。
  - 识别分隔符（如 ;、()、{}、[] 等）。
  - 跳过单行注释（以 // 开头的行）。
  词法分析器的输出是一个标记数组，每个标记包含其内容和类型。
  词法分析器的实现依赖于 RList 类，该类提供了对源代码文件的逐字节读取和预读功能。
  通过使用 RList，词法分析器能够高效地处理大文件，并在需要时切换缓冲区。
  词法分析器的主要函数是 lex，它接受一个文件路径作为输入，并返回一个标记数组。
  lex 函数内部使用 getNextToken 函数来逐个获取标记，直到文件结束。
  getNextToken 函数根据当前字符的类型决定如何处理，并返回相应的标记。
*/
import { RList } from "./RList.ts";

export interface Token {
  content: string;
  type: string;
}
export function lex(filePath: string): Token[] | void {
  const rList = new RList(filePath);
  const tokens: Token[] = [];
  while (true) {
    const token = getNextToken(rList);
    if (token === undefined) {
      break;
    }
    tokens.push(token);
  }
  return tokens;
}

function getNextToken(rList: RList): Token | void {
  while (true) {
    const char = rList.getCurrentByte();
    if (char == null) {
      break;
    }
    switch (char) {
      case " ":
        continue;
      case "\n":
        return { content: ";", type: "semicolon" };
      case "=":
        if (rList.peek() === "=") {
          rList.getCurrentByte();
          return { content: "==", type: "eqeq" };
        } else {
          return { content: "=", type: "eq" };
        }
      case "+":
        if (rList.peek() === "+") {
          rList.getCurrentByte();
          return { content: "++", type: "plusplus" };
        } else if (rList.peek() === "=") {
          rList.getCurrentByte();
          return { content: "+=", type: "plusequals" };
        } else {
          return { content: "+", type: "plus" };
        }
      case "-":
        if (rList.peek() === "-") {
          rList.getCurrentByte();
          return { content: "--", type: "minusminus" };
        } else if (rList.peek() === "=") {
          rList.getCurrentByte();
          return { content: "-=", type: "minusequals" };
        } else {
          return { content: "-", type: "minus" };
        }
      case "*":
        if (rList.peek() === "=") {
          rList.getCurrentByte();
          return { content: "*=", type: "multequals" };
        } else {
          return { content: "*", type: "mult" };
        }
      case "/":
        if (rList.peek() === "/") {
          // 跳过单行注释
          while (true) {
            const nextChar = rList.getCurrentByte();
            if (nextChar === null || nextChar === "\n") {
              break;
            }
          }
          continue;
        } else if (rList.peek() === "=") {
          rList.getCurrentByte();
          return { content: "/=", type: "divequals" };
        } else {
          return { content: "/", type: "div" };
        }
      case "^":
        if (rList.peek() === "=") {
          rList.getCurrentByte();
          return { content: "^=", type: "squareequals" };
        } else {
          return { content: "^", type: "square" };
        }
      case ";":
        return { content: ";", type: "semicolon" };
      case "(":
        return { content: "(", type: "lparen" };
      case ")":
        return { content: ")", type: "rparen" };
      case "{":
        return { content: "{", type: "lbrace" };
      case "}":
        return { content: "}", type: "rbrace" };
      case "[":
        return { content: "[", type: "lbracket" };
      case "]":
        return { content: "]", type: "rbracket" };
      default:
        if (/[a-zA-Z_]/.test(char)) {
          let identifier = char;
          var flag = false;
          while (!flag) {
            const nextChar = rList.peek();
            if (nextChar !== null && /[a-zA-Z0-9_]/.test(nextChar)) {
              identifier += rList.getCurrentByte();
            } else {
              flag = true;
            }
          }
          const keywords = [
            "var",
            "let",
            "const",
            "function",
            "if",
            "else",
            "return",
          ];
          if (keywords.includes(identifier)) {
            return { content: identifier, type: "key" };
          } else {
            return { content: identifier, type: "name" };
          }
        } else if (/[0-9]/.test(char)) {
          let number = char;
          var flag = false;
          while (!flag) {
            const nextChar = rList.peek();
            if (nextChar !== null && /[0-9]/.test(nextChar)) {
              number += rList.getCurrentByte();
            } else {
              flag = true;
            }
          }
          return { content: number, type: "number" };
        } else {
          throw new Error(`Unexpected character: ${char}`);
        }
    }
  }
  rList.close();
}
