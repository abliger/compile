/*
  带有位置信息的语法分析器。
  在 12_grammarAst.ts 的基础上，利用 15_lex.ts 生成的 token 位置信息，
  为每个 AST 节点填充正确的行号与列号，方便后续错误定位与源码映射。
*/

import type { Token } from "./15_lex.ts";
import {
  AssignmentNode,
  BinaryExprNode,
  ExpressionNode,
  GroupingNode,
  NameNode,
  NumberLiteralNode,
  ProgramNode,
  StatementNode,
} from "./11_ast.ts";

export function parse(tokens: Token[]): ProgramNode {
  return parseProgram(tokens);
}

function parseProgram(tokens: Token[]): ProgramNode {
  const programNode = new ProgramNode(0, 0);

  while (tokens.length > 0) {
    const statement = parseStatement(tokens);
    if (statement !== null) {
      programNode.statements.push(statement);
    }
  }

  // 程序根节点位置取第一条语句的位置；没有语句则保持 (0, 0)
  if (programNode.statements.length > 0) {
    const first = programNode.statements[0];
    programNode.line = first.line;
    programNode.column = first.column;
  }

  return programNode;
}

function parseStatement(tokens: Token[]): StatementNode | null {
  const token = tokens[0];

  if (token.type === "semicolon") {
    tokens.shift(); // 空语句，直接消费分号
    return null;
  }

  let statement: StatementNode;
  if (token.type === "key") {
    // 关键字开头：var/let/const NAME = expression
    statement = parseAssignment(tokens);
  } else if (
    token.type === "name" &&
    tokens.length > 1 &&
    tokens[1].content === "="
  ) {
    // name 后面紧跟 '=' 才是赋值
    statement = parseAssignment(tokens);
  } else if (
    token.type === "name" ||
    token.type === "number" ||
    token.content === "("
  ) {
    statement = parseExpression(tokens);
  } else {
    throw new Error(`Unexpected token: ${token.content}`);
  }

  // 语句结束统一消费分号
  if (tokens.length === 0 || tokens[0].type !== "semicolon") {
    throw new Error("Expected ';' after statement");
  }
  tokens.shift();

  return statement;
}

function parseAssignment(tokens: Token[]): AssignmentNode {
  let keyword: string | null = null;
  let line = 0;
  let column = 0;

  if (tokens[0].type === "key") {
    const keyToken = tokens.shift()!;
    keyword = keyToken.content;
    line = keyToken.line;
    column = keyToken.start;
  }

  if (tokens.length === 0 || tokens[0].type !== "name") {
    throw new Error("Expected identifier in assignment");
  }
  const nameToken = tokens.shift()!;

  // 没有关键字时，位置从标识符开始
  if (line === 0) {
    line = nameToken.line;
    column = nameToken.start;
  }

  if (tokens.length === 0 || tokens[0].content !== "=") {
    throw new Error("Expected '=' after identifier in assignment");
  }
  tokens.shift(); // 移除 '=' token

  const value = parseExpression(tokens);

  return new AssignmentNode(keyword, nameToken.content, value, line, column);
}

function parseExpression(tokens: Token[]): ExpressionNode {
  // expression := mut (('+' | '-') expression)? ;
  const left = parseMut(tokens);
  if (
    tokens.length > 0 &&
    (tokens[0].content === "+" || tokens[0].content === "-")
  ) {
    const op = tokens.shift()!;
    const right = parseExpression(tokens);
    return new BinaryExprNode(op.content, left, right, left.line, left.column);
  }
  return left;
}

function parseMut(tokens: Token[]): ExpressionNode {
  // mut := term ('^' mut)?;  右结合
  const left = parseTerm(tokens);
  if (tokens.length > 0 && tokens[0].content === "^") {
    const op = tokens.shift()!;
    const right = parseMut(tokens);
    return new BinaryExprNode(op.content, left, right, left.line, left.column);
  }
  return left;
}

function parseTerm(tokens: Token[]): ExpressionNode {
  // term := factor (('*' | '/') term)? ;
  const left = parseFactor(tokens);
  if (
    tokens.length > 0 &&
    (tokens[0].content === "*" || tokens[0].content === "/")
  ) {
    const op = tokens.shift()!;
    const right = parseTerm(tokens);
    return new BinaryExprNode(op.content, left, right, left.line, left.column);
  }
  return left;
}

function parseFactor(tokens: Token[]): ExpressionNode {
  // factor := NUMBER | NAME | '(' expression ')' ;
  if (tokens.length === 0) {
    throw new Error("Unexpected end of input in expression");
  }

  const token = tokens[0];
  if (token.type === "number") {
    tokens.shift();
    return new NumberLiteralNode(parseFloat(token.content), token.line, token.start);
  }

  if (token.type === "name") {
    tokens.shift();
    return new NameNode(token.content, token.line, token.start);
  }

  if (token.content === "(") {
    const lparen = tokens.shift()!;
    const expression = parseExpression(tokens);
    if (tokens.length === 0 || tokens[0].content !== ")") {
      throw new Error("Expected ')' in factor");
    }
    tokens.shift(); // 移除 ')' token
    return new GroupingNode(expression, lparen.line, lparen.start);
  }

  throw new Error(`Unexpected token in expression: ${token.content}`);
}
