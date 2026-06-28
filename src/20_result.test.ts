import { expect, test } from "vitest";
import { lexString } from "./15_lex.ts";
import { parse } from "./16_grammarAst.ts";
import { generateIR, printIR } from "./17_ir.ts";
import { run } from "./19_run.ts";

function result(code: string) {
  const tokens = lexString(code);
  const ast = parse(tokens!);
  const irs = generateIR(ast);
  return run(irs);
}

test("生成常量赋值的中间代码", () => {
  const number = result("const x = 5;");
  expect(number).toEqual(5);
});

test("生成带优先级的二元表达式", () => {
  const number = result("const x = 1 + 2 * 3;");
  expect(number).toEqual(7);
});

test("括号结合", () => {
  const number = result("1+2*2-3*(3+1);");
  expect(number).toEqual(-7);
});

test("变量使用", () => {
  const number = result("const a =1+2*2;const b= 1-2;b+a+3*(3+1);");
  expect(number).toEqual(16);
});
