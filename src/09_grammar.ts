/*
语法分析器:
用来将词法分析器生成的 token 流解析是否符合语法规则，并构建抽象语法树（AST）。
语法分析器的主要功能包括：
- 解析程序结构，包括语句、表达式和赋值等。
- 验证 token 流是否符合预定义的语法规则。
- 构建抽象语法树（AST），用于后续的代码生成或解释执行。
*/

export function parse(tokens: any[]): void {
  // 使用 rightComple.ebnf 中定义的语法规则进行递归下降语法分析
  parseProgram(tokens);
}

function parseProgram(tokens: any[]): void {
  // program := statement* EOF ;
  while (tokens.length > 0) {
    parseStatement(tokens);
  }
  // 检查是否到达文件结束符 (EOF)
  if (tokens.length > 0) {
    throw new Error("Unexpected tokens after program end");
  }
}

function parseStatement(tokens: any[]): void {
  // statement := assignment | expression | '//' COMMENT ;
  const token = tokens[0];
  if (token.type === "key" || token.type === "name") {
    parseAssignment(tokens);
  } else if (
    token.type === "number" ||
    token.type === "name" ||
    token.content === "("
  ) {
    parseExpression(tokens);
  } else if (token.content === "//") {
    // 跳过注释
    tokens.shift(); // 移除 '//' token
    while (tokens.length > 0 && tokens[0].content !== "\n") {
      tokens.shift(); // 移除注释内容
    }
  } else if (token.type === "semicolon") {
    tokens.shift(); // 移除分号 token
  } else {
    throw new Error(`Unexpected token: ${token.content}`);
  }
}

function parseAssignment(tokens: any[]): void {
  // assignment := (keyword)? NAME '=' expression ;
  const token = tokens[0];
  if (token.type === "key") {
    tokens.shift(); // 移除关键字 token
  } else if (token.type === "name") {
    tokens.shift(); // 移除标识符 token
    if (tokens.length > 0 && tokens[0].content === "=") {
      tokens.shift(); // 移除 '=' token
      parseExpression(tokens);
    } else {
      throw new Error("Expected '=' after identifier in assignment");
    }
  } else {
    throw new Error(`Unexpected token in assignment: ${token.content}`);
  }
}

function parseExpression(tokens: any[]): void {
  // expression := mut (('+' | '-') expression)? ;
  const token = tokens[0];
  if (
    token.type === "number" ||
    token.type === "name" ||
    token.content === "("
  ) {
    parseMut(tokens);

    while (
      tokens.length > 0 &&
      (tokens[0].content === "+" || tokens[0].content === "-")
    ) {
      tokens.shift(); // 移除 '+' 或 '-' token
      parseMut(tokens);
    }
  }

  function parseMut(tokens: any[]): void {
    // mut := term ('^' mut)?;
    parseTerm(tokens);
    while (tokens.length > 0 && tokens[0].content === "^") {
      tokens.shift(); // 移除 '^' token
      parseMut(tokens);
    }
  }
}

function parseTerm(tokens: any[]): void {
  // term := factor (('*' | '/') term)? ;
  const token = tokens[0];
  if (
    token.type === "number" ||
    token.type === "name" ||
    token.content === "("
  ) {
    parseFactor(tokens);

    while (
      tokens.length > 0 &&
      (tokens[0].content === "*" || tokens[0].content === "/")
    ) {
      tokens.shift(); // 移除 '*' 或 '/' token
      parseFactor(tokens);
    }
  }
}

function parseFactor(tokens: any[]): void {
  // factor := NUMBER | NAME | '(' expression ')' ;
  const token = tokens[0];
  if (token.type === "number" || token.type === "name") {
    tokens.shift(); // 移除数字或标识符 token
  } else if (token.content === "(") {
    parseClose(tokens);
  } else {
    throw new Error(`Unexpected token in factor: ${token.content}`);
  }
}

function parseClose(tokens: any[]): void {
  const token = tokens[0];
  if (token.content === "(") {
    tokens.shift(); // 移除 '(' token
  } else {
    throw new Error(`Unexpected token in close: ${token.content}`);
  }
  parseExpression(tokens);
  if (tokens.length > 0 && tokens[0].content === ")") {
    tokens.shift(); // 移除 ')' token
  }
}
