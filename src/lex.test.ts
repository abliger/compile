import { expect, test } from "vitest";
import { lex, RList } from "./lex.js";
import fs from "fs";

const filePath = "./src/test.txt";

test("测试读取文件", () => {
  const fd = fs.openSync(filePath, "r");
  const buf = Buffer.alloc(1);
  let bytesRead: number;
  while ((bytesRead = fs.readSync(fd, buf, 0, 1, null)) > 0) {
    console.log(buf[0]); // 单个字节
  }
  fs.closeSync(fd);
});

test("测试读取文件", () => {
  const rlist = new RList(filePath);
  rlist.read();
  var char = rlist.getCurrentByte();

  expect(char).not.toBeNull();
  expect(char).toBe("v"); // 读取到的第一个字节应该是 'v'
  char = rlist.peek(); // 预读下一个字节
  expect(char).not.toBeNull();
  expect(char).toBe("a"); // 读取到的第一个字节应该是 'v'
  char = rlist.getCurrentByte(); // 消费下一个字节
  expect(char).not.toBeNull();
  expect(char).toBe("a"); // 读取到的第一个字节应该是 'v'
  char = rlist.getCurrentByte(); // 消费下一个字节
  expect(char).not.toBeNull();
  expect(char).toBe("r"); // 读取到的第一个字节应该是 'v'
  rlist.close();
});

test("测试读取文件", () => {
  const rlist = new RList(filePath);
  rlist.read();
  let str = "";
  while (true) {
    const char = rlist.getCurrentByte();
    if (char === null) break;
    str += char;
  }
  expect(str).toBe("var content=4*5+1\nconst c=content^2");
  rlist.close();
});

// test("测试语法分析器", () => {
//   const tokens = lex(input);
//   expect(tokens).toEqual([
//     { type: "key", value: "var" },
//     { type: "name", value: "content" },
//     { type: "eq", value: "=" },
//     { type: "number", value: "4" },
//     { type: "mult", value: "*" },
//     { type: "number", value: "5" },
//     { type: "plus", value: "+" },
//     { type: "number", value: "1" },
//     { type: "semicolon", value: ";" },
//     { type: "key", value: "const" },
//     { type: "name", value: "c" },
//     { type: "eq", value: "=" },
//     { type: "name", value: "c" },
//     { type: "square", value: "^" },
//     { type: "number", value: "2" },
//     { type: "semicolon", value: ";" },
//   ]);
// });
