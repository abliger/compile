import { expect, test } from "vitest";
import { parse } from "./12_grammarAst.ts";
import { lex, lexString } from "./07_lex.ts";

test("解析文件 01_test.txt", () => {
  const tokens = lex("./src/01_test.txt");
  const node = parse(tokens!);
  expect(node.statements).toHaveLength(2);
  expect(node.statements[0].type).toEqual("Assignment");
  expect(node.statements[1].type).toEqual("Assignment");
});

test("解析复杂表达式", () => {
  const code = `
  const content = 4 * 5 + (1 + (3+2) * 2^3+ 1);
  `;
  const tokens = lexString(code);
  const node = parse(tokens!);
  expect(node.statements).toHaveLength(1);
  expect(node.statements[0].type).toEqual("Assignment");
});

test("解析多行赋值（开头/结尾空行和分号被忽略）", () => {
  const code = `
  var content = 4 * 5 + 1;
  const c = content ^ 2;
  `;
  const tokens = lexString(code);
  const node = parse(tokens!);
  expect(node.statements).toHaveLength(2);
  expect(node.statements[0].type).equals("Assignment");
  expect(node.statements[1].type).equals("Assignment");
});

test("解析带幂运算的括号表达式", () => {
  const code = `const content = 4 * 5 + (1 + (3+2) * 2^3+ 1)^4;`;
  const tokens = lexString(code);
  const node = parse(tokens!);
  expect(node.statements).toHaveLength(1);
  expect(node.statements[0].type).toEqual("Assignment");
});

test("无关键字赋值 keyword 为 null", () => {
  const code = `content = 4 * 5 + 1;`;
  const tokens = lexString(code);
  const node = parse(tokens!);
  expect(node.statements).toHaveLength(1);
  const assignment = node.statements[0] as any;
  expect(assignment.type).toEqual("Assignment");
  expect(assignment.keyword).toBeNull();
  expect(assignment.name).toEqual("content");
});

test("纯表达式语句（name 不作为赋值）", () => {
  const code = `foo;`;
  const tokens = lexString(code);
  const node = parse(tokens!);
  expect(node.statements).toHaveLength(1);
  expect(node.statements[0].type).toEqual("Name");
});

test("二元表达式优先级", () => {
  const code = `const x = 1 + 2 * 3;`;
  const tokens = lexString(code);
  const node = parse(tokens!);
  const assignment = node.statements[0] as any;
  expect(assignment.value.operator).toEqual("+");
  expect(assignment.value.left.value).toEqual(1);
  expect(assignment.value.right.operator).toEqual("*");
});

test("幂运算右结合", () => {
  const code = `const x = 2^3^2;`;
  const tokens = lexString(code);
  const node = parse(tokens!);
  const assignment = node.statements[0] as any;
  expect(assignment.value.operator).toEqual("^");
  expect(assignment.value.left.value).toEqual(2);
  expect(assignment.value.right.operator).toEqual("^");
  expect(assignment.value.right.left.value).toEqual(3);
  expect(assignment.value.right.right.value).toEqual(2);
});

test("缺少分号报错", () => {
  const code = `const x = 1`;
  const tokens = lexString(code);
  expect(() => parse(tokens!)).toThrow("Expected ';' after statement");
});

test("缺少赋值右值报错", () => {
  const code = `const x = ;`;
  const tokens = lexString(code);
  expect(() => parse(tokens!)).toThrow();
});
