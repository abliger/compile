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
        if (rList.peek() === "=") {
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
