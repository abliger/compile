/*
语法分析器:
用来将词法分析器生成的 token 流解析是否符合语法规则，并构建抽象语法树（AST）。
语法分析器的主要功能包括：
- 解析程序结构，包括语句、表达式和赋值等。
- 验证 token 流是否符合预定义的语法规则。
- 构建抽象语法树（AST），用于后续的代码生成或解释执行。
*/

import {
  AssignmentNode,
  BinaryExprNode,
  CommentNode,
  ExpressionNode,
  GroupingNode,
  NameNode,
  NumberLiteralNode,
  ProgramNode,
  SemicolonNode,
  StatementNode,
} from "./11_ast.ts";

export function parse(tokens: any[]): ProgramNode {
  // 使用 rightComple.ebnf 中定义的语法规则进行递归下降语法分析
  return parseProgram(tokens);
}

function parseProgram(tokens: any[]): ProgramNode {
  const programNode = new ProgramNode(0, 0); // 根节点，表示整个程序
  // program := statement* EOF ;
  while (tokens.length > 0) {
    programNode.statements.push(parseStatement(tokens));
  }
  // 检查是否到达文件结束符 (EOF)
  if (tokens.length > 0) {
    throw new Error("Unexpected tokens after program end");
  }
  return programNode; // 返回构建的程序节点
}

function parseStatement(tokens: any[]): StatementNode {
  // statement := assignment | expression | '//' COMMENT ;
  const token = tokens[0];
  if (token.type === "key" || token.type === "name") {
    return parseAssignment(tokens);
  } else if (
    token.type === "number" ||
    token.type === "name" ||
    token.content === "("
  ) {
    return parseExpression(tokens);
  } else if (token.content === "//") {
    // 跳过注释
    tokens.shift(); // 移除 '//' token
    while (tokens.length > 0 && tokens[0].content !== "\n") {
      tokens.shift(); // 移除注释内容
    }
    return new CommentNode(tokens[0].content, 0, 0);
  } else if (token.type === "semicolon") {
    tokens.shift(); // 移除分号 token
    return new SemicolonNode(0, 0);
  } else {
    throw new Error(`Unexpected token: ${token.content}`);
  }
}

function parseAssignment(tokens: any[]): AssignmentNode {
  // assignment := (keyword)? NAME '=' expression ;
  var token = tokens[0];
  var key = token.content;
  var name = null;
  var node = null;
  while (token.content !== ";") {
    if (token.type === "key") {
      tokens.shift(); // 移除关键字 token
      token = tokens[0]; // 更新当前 token
    } else if (token.type === "name") {
      name = token.content; // 保存标识符名称
      tokens.shift(); // 移除标识符 token
      token = tokens[0]; // 更新当前 token
      if (tokens.length > 0 && tokens[0].content === "=") {
        tokens.shift(); // 移除 '=' token
        node = parseExpression(tokens);
        token = tokens[0];
      } else {
        throw new Error("Expected '=' after identifier in assignment");
      }
    } else {
      throw new Error(`Unexpected token in assignment: ${token.content}`);
    }
  }
  return new AssignmentNode(key, name, node!, 0, 0);
}

function parseExpression(tokens: any[]): ExpressionNode {
  // expression := mut (('+' | '-') expression)? ;
  const token = tokens[0];
  if (
    token.type === "number" ||
    token.type === "name" ||
    token.content === "("
  ) {
    const left = parseMut(tokens);
    if (
      tokens.length > 0 &&
      (tokens[0].content === "+" || tokens[0].content === "-")
    ) {
      const op = tokens.shift(); // 移除 '+' 或 '-' token
      const right = parseExpression(tokens);
      return new BinaryExprNode(op.content, left, right, 0, 0);
    }
    return left;
  } else {
    throw new Error(`Unexpected token in expression: ${token.content}`);
  }
}

function parseMut(tokens: any[]): ExpressionNode {
  // mut := term ('^' mut)?;
  const left = parseTerm(tokens);
  if (tokens.length > 0 && tokens[0].content === "^") {
    const op = tokens.shift(); // 移除 '^' token
    const right = parseMut(tokens);
    return new BinaryExprNode(op.content, left, right, 0, 0);
  }
  return left;
}

function parseTerm(tokens: any[]): ExpressionNode {
  // term := factor (('*' | '/') term)? ;
  const left = parseFactor(tokens);

  if (
    tokens.length > 0 &&
    (tokens[0].content === "*" || tokens[0].content === "/")
  ) {
    const op = tokens.shift(); // 移除 '*' 或 '/' token
    const right = parseTerm(tokens);
    return new BinaryExprNode(op.content, left, right, 0, 0);
  }
  return left;
}

function parseFactor(tokens: any[]): ExpressionNode {
  // factor := NUMBER | NAME | '(' expression ')' ;
  const token = tokens[0];
  if (token.type === "number") {
    tokens.shift(); // 移除数字或标识符 token
    return new NumberLiteralNode(parseFloat(token.content), 0, 0); // 返回数字字面量节点
  } else if (token.type === "name") {
    tokens.shift();
    return new NameNode(token.content, 0, 0);
  } else if (token.content === "(") {
    tokens.shift(); // 移除 '(' token
    const groupingNode = parseExpression(tokens);
    if (tokens.length > 0 && tokens[0].content === ")") {
      tokens.shift(); // 移除 ')' token
      return new GroupingNode(groupingNode, 0, 0); // 返回分组节点
    } else {
      throw new Error("Expected ')' in factor");
    }
  } else {
    throw new Error(`Unexpected token in factor: ${token.content}`);
  }
}
