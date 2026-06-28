/*
语法分析器:
用来将词法分析器生成的 token 流解析是否符合语法规则，并构建抽象语法树（AST）。
语法分析器的主要功能包括：
- 解析程序结构，包括语句、表达式和赋值等。
- 验证 token 流是否符合预定义的语法规则。
- 构建抽象语法树（AST），用于后续的代码生成或解释执行。
*/

import type { Token } from "./07_lex.ts";
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
  // 使用 rightComple.ebnf 中定义的语法规则进行递归下降语法分析
  return parseProgram(tokens);
}

function parseProgram(tokens: Token[]): ProgramNode {
  const programNode = new ProgramNode(0, 0); // 根节点，表示整个程序
  // program := statement* EOF ;
  while (tokens.length > 0) {
    const statement = parseStatement(tokens);
    if (statement !== null) {
      programNode.statements.push(statement);
    }
  }
  return programNode; // 返回构建的程序节点
}

function parseStatement(tokens: Token[]): StatementNode | null {
  // statement := assignment ';' | expression ';' | ';' ;
  // 注意：注释在词法分析阶段已被跳过，不会到达语法分析器
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
  // assignment := (keyword)? NAME '=' expression ;
  let keyword: string | null = null;

  if (tokens[0].type === "key") {
    keyword = tokens.shift()!.content;
  }

  if (tokens.length === 0 || tokens[0].type !== "name") {
    throw new Error("Expected identifier in assignment");
  }

  const name = tokens.shift()!.content;

  if (tokens.length === 0 || tokens[0].content !== "=") {
    throw new Error("Expected '=' after identifier in assignment");
  }

  tokens.shift(); // 移除 '=' token

  const value = parseExpression(tokens);

  return new AssignmentNode(keyword, name, value, 0, 0);
}

function parseExpression(tokens: Token[]): ExpressionNode {
  // expression := mut (('+' | '-') expression)? ;
  let left = parseMut(tokens);
  while (
    tokens.length > 0 &&
    (tokens[0].content === "+" || tokens[0].content === "-")
  ) {
    const op = tokens.shift()!; // 移除 '+' 或 '-' token
    const right = parseMut(tokens);
    left = new BinaryExprNode(op.content, left, right, 0, 0);
  }
  return left;
}

function parseMut(tokens: Token[]): ExpressionNode {
  // mut := term ('^' mut)?;  右结合
  let left = parseTerm(tokens);
  while (tokens.length > 0 && tokens[0].content === "^") {
    const op = tokens.shift()!; // 移除 '^' token
    const right = parseMut(tokens);
    left = new BinaryExprNode(op.content, left, right, 0, 0);
  }
  return left;
}

function parseTerm(tokens: Token[]): ExpressionNode {
  // term := factor (('*' | '/') term)? ;
  let left = parseFactor(tokens);
  while (
    tokens.length > 0 &&
    (tokens[0].content === "*" || tokens[0].content === "/")
  ) {
    const op = tokens.shift()!; // 移除 '*' 或 '/' token
    const right = parseFactor(tokens);
    left = new BinaryExprNode(op.content, left, right, 0, 0);
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
    return new NumberLiteralNode(parseFloat(token.content), 0, 0);
  }

  if (token.type === "name") {
    tokens.shift();
    return new NameNode(token.content, 0, 0);
  }

  if (token.content === "(") {
    tokens.shift(); // 移除 '(' token
    const expression = parseExpression(tokens);
    if (tokens.length === 0 || tokens[0].content !== ")") {
      throw new Error("Expected ')' in factor");
    }
    tokens.shift(); // 移除 ')' token
    return new GroupingNode(expression, 0, 0);
  }

  throw new Error(`Unexpected token in expression: ${token.content}`);
}
