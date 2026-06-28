import { expect, test } from "vitest";
import { lexString } from "./15_lex.ts";
import { parse } from "./16_grammarAst.ts";
import { generateIR, printIR } from "./17_ir.ts";

function compile(code: string) {
  const tokens = lexString(code);
  const ast = parse(tokens!);
  return generateIR(ast);
}

test("生成常量赋值的中间代码", () => {
  const ir = compile("const x = 5;");
  expect(ir).toEqual([
    { op: "PUSH", arg: 5 },
    { op: "STORE", arg: "x" },
    { op: "HALT" },
  ]);
});

test("生成带优先级的二元表达式", () => {
  const ir = compile("const x = 1 + 2 * 3;");
  expect(ir).toEqual([
    { op: "PUSH", arg: 1 },
    { op: "PUSH", arg: 2 },
    { op: "PUSH", arg: 3 },
    { op: "MUL" },
    { op: "ADD" },
    { op: "STORE", arg: "x" },
    { op: "HALT" },
  ]);
});

test("幂运算保持右结合", () => {
  const ir = compile("const x = 2^3^2;");
  expect(ir).toEqual([
    { op: "PUSH", arg: 2 },
    { op: "PUSH", arg: 3 },
    { op: "PUSH", arg: 2 },
    { op: "POW" },
    { op: "POW" },
    { op: "STORE", arg: "x" },
    { op: "HALT" },
  ]);
});

test("变量引用生成 LOAD", () => {
  const ir = compile("const y = x + 1;");
  expect(ir).toEqual([
    { op: "LOAD", arg: "x" },
    { op: "PUSH", arg: 1 },
    { op: "ADD" },
    { op: "STORE", arg: "y" },
    { op: "HALT" },
  ]);
});

test("括号分组不改变指令只改变顺序", () => {
  const ir = compile("const x = (1 + 2) * 3;");
  expect(ir).toEqual([
    { op: "PUSH", arg: 1 },
    { op: "PUSH", arg: 2 },
    { op: "ADD" },
    { op: "PUSH", arg: 3 },
    { op: "MUL" },
    { op: "STORE", arg: "x" },
    { op: "HALT" },
  ]);
});

test("裸表达式语句会 POP 结果", () => {
  const ir = compile("1 + 2;");
  expect(ir).toEqual([
    { op: "PUSH", arg: 1 },
    { op: "PUSH", arg: 2 },
    { op: "ADD" },
    { op: "POP" },
    { op: "HALT" },
  ]);
});

test("多条语句顺序生成", () => {
  const ir = compile(`
    const a = 1;
    const b = a + 2;
  `);
  expect(ir).toEqual([
    { op: "PUSH", arg: 1 },
    { op: "STORE", arg: "a" },
    { op: "LOAD", arg: "a" },
    { op: "PUSH", arg: 2 },
    { op: "ADD" },
    { op: "STORE", arg: "b" },
    { op: "HALT" },
  ]);
});

test("printIR 输出可读格式", () => {
  const ir = compile("const x = 1 + 2;");
  expect(printIR(ir)).toEqual("PUSH 1\nPUSH 2\nADD\nSTORE x\nHALT");
});

test("测试运算", () => {
  const ir = compile("1+2*4 +6 +5*2;");
  expect(printIR(ir)).toEqual(
    "PUSH 1\nPUSH 2\nPUSH 4\nMUL\nADD\nPUSH 6\nADD\nPUSH 5\nPUSH 2\nMUL\nADD\nPOP\nHALT",
  );
});
