/*
  词法分析器
  一个简单的词法分析器，用于将源代码分解为标记（tokens）。
  它通过 Source 抽象层读取输入（文件或字符串），并根据预定义的规则识别不同类型的标记。
  标记包括关键字、标识符、运算符、分隔符和数字等。
  词法分析器的主要功能包括：
  - 跳过空格和换行符。
  - 识别关键字（如 let、var、const）。
  - 识别标识符（由字母、数字和下划线组成）。
  - 识别运算符（如 +、-、*、/、= 等）。
  - 识别分隔符（如 ;、()、{}、[] 等）。
  - 跳过单行注释（以 // 开头的行）。
  词法分析器的输出是一个标记数组，每个标记包含其内容和类型。
  词法分析器的实现依赖于 Source 抽象层，它统一了逐字节读取和预读接口。
  RList 实现用于高效读取大文件，StringSource 实现用于直接读取内存字符串。
  主要入口包括 lex（文件路径）、lexSource（任意 Source）和 lexString（字符串）。
  lex 函数内部使用 getNextToken 函数来逐个获取标记，直到文件结束。
  getNextToken 函数根据当前字符的类型决定如何处理，并返回相应的标记。
*/
import { Source } from "./04_source.ts";
import { RList } from "./05_RList.ts";
import { StringSource } from "./06_StringSource.ts";

export interface Token {
  content: string;
  type: string;
}

// 从文件路径读取并分词（兼容旧接口）
export function lex(filePath: string): Token[] | void {
  return lexSource(new RList(filePath));
}

// 从任意 Source 实现读取并分词
export function lexSource(source: Source): Token[] | void {
  const tokens: Token[] = [];
  while (true) {
    const token = getNextToken(source);
    if (token === undefined) {
      break;
    }
    tokens.push(token);
  }
  source.close();
  return tokens;
}

// 从字符串直接读取并分词
export function lexString(content: string): Token[] | void {
  return lexSource(new StringSource(content));
}

function getNextToken(source: Source): Token | void {
  while (true) {
    const char = source.getCurrentByte();
    if (char == null) {
      break;
    }
    switch (char) {
      case " ":
        continue;
      case "\n":
        return { content: ";", type: "semicolon" };
      case "=":
        if (source.peek() === "=") {
          source.getCurrentByte();
          return { content: "==", type: "eqeq" };
        } else {
          return { content: "=", type: "eq" };
        }
      case "+":
        if (source.peek() === "+") {
          source.getCurrentByte();
          return { content: "++", type: "plusplus" };
        } else if (source.peek() === "=") {
          source.getCurrentByte();
          return { content: "+=", type: "plusequals" };
        } else {
          return { content: "+", type: "plus" };
        }
      case "-":
        if (source.peek() === "-") {
          source.getCurrentByte();
          return { content: "--", type: "minusminus" };
        } else if (source.peek() === "=") {
          source.getCurrentByte();
          return { content: "-=", type: "minusequals" };
        } else {
          return { content: "-", type: "minus" };
        }
      case "*":
        if (source.peek() === "=") {
          source.getCurrentByte();
          return { content: "*=", type: "multequals" };
        } else {
          return { content: "*", type: "mult" };
        }
      case "/":
        if (source.peek() === "/") {
          // 跳过单行注释
          while (true) {
            const nextChar = source.getCurrentByte();
            if (nextChar === null || nextChar === "\n") {
              break;
            }
          }
          continue;
        } else if (source.peek() === "=") {
          source.getCurrentByte();
          return { content: "/=", type: "divequals" };
        } else {
          return { content: "/", type: "div" };
        }
      case "^":
        if (source.peek() === "=") {
          source.getCurrentByte();
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
      case '"':
        let strLiteral = "";
        while (true) {
          const nextChar = source.getCurrentByte();
          if (nextChar === null) {
            throw new Error("Unterminated string literal");
          }
          if (nextChar === '"') {
            break;
          }
          strLiteral += nextChar;
        }
        return { content: strLiteral, type: "string" };
      case "\\":
        return { content: "\\", type: "backslash" };
      default:
        if (/[a-zA-Z_]/.test(char)) {
          let identifier = char;
          var flag = false;
          while (!flag) {
            const nextChar = source.peek();
            if (nextChar !== null && /[a-zA-Z0-9_]/.test(nextChar)) {
              identifier += source.getCurrentByte();
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
            const nextChar = source.peek();
            if (nextChar !== null && /[0-9]/.test(nextChar)) {
              number += source.getCurrentByte();
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
}
