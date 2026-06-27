// 基础节点接口
abstract class ASTNode {
  type: string;
  line: number;
  column: number;
  constructor(type: string, line: number, column: number) {
    this.type = type;
    this.line = line;
    this.column = column;
  }
}

// 程序根节点
export class ProgramNode extends ASTNode {
  statements: StatementNode[];
  constructor(line: number = 0, column: number = 0) {
    super("Program", line, column);
    this.statements = [];
  }

  setStatements(statements: StatementNode[]) {
    this.statements = statements;
  }
}

// 语句类型联合
export type StatementNode =
  | AssignmentNode
  | ExpressionNode
  | CommentNode
  | SemicolonNode;

// 赋值语句: let x = 5 或 x = 5
export class AssignmentNode extends ASTNode {
  keyword: string | null; // "let", "const" 等，可为 null
  name: string;
  value: ExpressionNode;

  constructor(
    keyword: string | null,
    name: string,
    value: ExpressionNode,
    line: number = 0,
    column: number = 0,
  ) {
    super("Assignment", line, column);
    this.keyword = keyword;
    this.name = name;
    this.value = value;
  }
}

// 表达式类型联合
export type ExpressionNode =
  | BinaryExprNode
  | NumberLiteralNode
  | NameNode
  | GroupingNode;

// 二元表达式: a + b, a * b, a ^ b
export class BinaryExprNode extends ASTNode {
  operator: string; // "+", "-", "*", "/", "^"
  left: ExpressionNode;
  right: ExpressionNode;

  constructor(
    operator: string,
    left: ExpressionNode,
    right: ExpressionNode,
    line: number = 0,
    column: number = 0,
  ) {
    super("BinaryExpr", line, column);
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
}

// 数字字面量
export class NumberLiteralNode extends ASTNode {
  value: number;

  constructor(value: number, line: number = 0, column: number = 0) {
    super("NumberLiteral", line, column);
    this.value = value;
  }
}

// 标识符引用
export class NameNode extends ASTNode {
  name: string;

  constructor(name: string, line: number = 0, column: number = 0) {
    super("Name", line, column);
    this.name = name;
  }
}

// 括号分组: (expr)
export class GroupingNode extends ASTNode {
  expression: ExpressionNode;

  constructor(
    expression: ExpressionNode,
    line: number = 0,
    column: number = 0,
  ) {
    super("Grouping", line, column);
    this.expression = expression;
  }
}

export class CommentNode extends ASTNode {
  content: string;

  constructor(content: string, line: number = 0, column: number = 0) {
    super("Comment", line, column);
    this.content = content;
  }
}

export class SemicolonNode extends ASTNode {
  constructor(line: number = 0, column: number = 0) {
    super("Semicolon", line, column);
  }
}
