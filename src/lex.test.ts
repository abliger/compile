import { expect, test } from "vitest";
import { lex } from "./lex.js";
import fs from "fs";

const input = fs.readFileSync("./src/test.txt", "utf-8");

console.log(input);

test("测试语法分析器", () => {
  const tokens = lex(input);
  expect(tokens).toEqual([
    { type: "key", value: "var" },
    { type: "name", value: "content" },
    { type: "eq", value: "=" },
    { type: "number", value: "4" },
    { type: "mult", value: "*" },
    { type: "number", value: "5" },
    { type: "plus", value: "+" },
    { type: "number", value: "1" },
    { type: "semicolon", value: ";" },
    { type: "key", value: "const" },
    { type: "name", value: "c" },
    { type: "eq", value: "=" },
    { type: "name", value: "c" },
    { type: "square", value: "^" },
    { type: "number", value: "2" },
    { type: "semicolon", value: ";" },
  ]);
});
