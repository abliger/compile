import { expect, test } from "vitest";
import { RList } from "./RList.ts";
import { lex, lexString, Token } from "./lex.js";
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
  expect(str).toBe(
    "var content=4*5+1\n// this is a zhushi\nconst c=content^2\n",
  );
  rlist.close();
});

test("测试语法分析器", () => {
  const tokens = lex("src/test.txt");
  expect(tokens).toEqual([
    { type: "key", content: "var" },
    { type: "name", content: "content" },
    { type: "eq", content: "=" },
    { type: "number", content: "4" },
    { type: "mult", content: "*" },
    { type: "number", content: "5" },
    { type: "plus", content: "+" },
    { type: "number", content: "1" },
    { type: "semicolon", content: ";" },
    { type: "key", content: "const" },
    { type: "name", content: "c" },
    { type: "eq", content: "=" },
    { type: "name", content: "content" },
    { type: "square", content: "^" },
    { type: "number", content: "2" },
    { type: "semicolon", content: ";" },
  ] as Token[]);
});

test("从字符串分词", () => {
  const tokens = lexString("let x = 10 + 20\nvar y = x * 2");
  expect(tokens).toEqual([
    { type: "key", content: "let" },
    { type: "name", content: "x" },
    { type: "eq", content: "=" },
    { type: "number", content: "10" },
    { type: "plus", content: "+" },
    { type: "number", content: "20" },
    { type: "semicolon", content: ";" },
    { type: "key", content: "var" },
    { type: "name", content: "y" },
    { type: "eq", content: "=" },
    { type: "name", content: "x" },
    { type: "mult", content: "*" },
    { type: "number", content: "2" },
  ] as Token[]);
});

test("更多测试", () => {
  const tokens = lexString("/sdkfljk\n");
  console.log(tokens);
  expect(tokens).toEqual([
    { type: "div", content: "/" },
    { type: "name", content: "sdkfljk" },
    { type: "semicolon", content: ";" },
  ] as Token[]);
});

test("更多测试", () => {
  const tokens = lexString("\/sdkfljk\n");
  console.log(tokens);
  expect(tokens).toEqual([
    { type: "div", content: "/" },
    { type: "name", content: "sdkfljk" },
    { type: "semicolon", content: ";" },
  ] as Token[]);
});

test("更多测试", () => {
  const tokens = lexString("const a = 5");
  expect(tokens).toEqual([
    { type: "key", content: "const" },
    { type: "name", content: "a" },
    { type: "eq", content: "=" },
    { type: "number", content: "5" },
  ] as Token[]);
});
