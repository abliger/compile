/*
  中间代码生成器（基于栈式虚拟机指令）。
  将 16_grammarAst.ts 生成的 AST 转换为线性的中间指令序列，
  便于后续解释执行或进一步编译为机器码/字节码。

  指令格式：{ op: 操作码, arg?: 操作数 }
  操作数类型：string（变量名）| number（常量）
*/

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

export type IROpCode =
  | "PUSH"   // PUSH value        将常量压入栈
  | "LOAD"   // LOAD name         将变量值压入栈
  | "STORE"  // STORE name        弹出栈顶并保存到变量
  | "ADD"    // 弹出两个操作数，相加后压栈
  | "SUB"    // 弹出两个操作数，相减后压栈
  | "MUL"    // 弹出两个操作数，相乘后压栈
  | "DIV"    // 弹出两个操作数，相除后压栈
  | "POW"    // 弹出两个操作数，幂运算后压栈
  | "POP"    // 丢弃栈顶（裸表达式语句）
  | "HALT";  // 程序结束

export interface IRInstruction {
  op: IROpCode;
  arg?: string | number;
}

/**
 * 从 AST 生成中间代码。
 */
export function generateIR(program: ProgramNode): IRInstruction[] {
  const instructions: IRInstruction[] = [];

  for (const statement of program.statements) {
    generateStatement(statement, instructions);
  }

  instructions.push({ op: "HALT" });
  return instructions;
}

function generateStatement(
  node: StatementNode,
  out: IRInstruction[],
): void {
  if (node instanceof AssignmentNode) {
    generateExpression(node.value, out);
    out.push({ op: "STORE", arg: node.name });
    return;
  }

  if (
    node instanceof BinaryExprNode ||
    node instanceof NumberLiteralNode ||
    node instanceof NameNode ||
    node instanceof GroupingNode
  ) {
    // 裸表达式语句：计算后丢弃结果
    generateExpression(node, out);
    out.push({ op: "POP" });
    return;
  }

  // CommentNode / SemicolonNode 不会由 parser 产出
  throw new Error(`Unsupported statement type for IR generation: ${node.type}`);
}

function generateExpression(
  node: ExpressionNode,
  out: IRInstruction[],
): void {
  if (node instanceof NumberLiteralNode) {
    out.push({ op: "PUSH", arg: node.value });
    return;
  }

  if (node instanceof NameNode) {
    out.push({ op: "LOAD", arg: node.name });
    return;
  }

  if (node instanceof BinaryExprNode) {
    // 栈式求值：先左后右，最后应用操作符
    generateExpression(node.left, out);
    generateExpression(node.right, out);

    switch (node.operator) {
      case "+":
        out.push({ op: "ADD" });
        break;
      case "-":
        out.push({ op: "SUB" });
        break;
      case "*":
        out.push({ op: "MUL" });
        break;
      case "/":
        out.push({ op: "DIV" });
        break;
      case "^":
        out.push({ op: "POW" });
        break;
      default:
        throw new Error(`Unknown binary operator: ${node.operator}`);
    }
    return;
  }

  if (node instanceof GroupingNode) {
    generateExpression(node.expression, out);
    return;
  }

  throw new Error("Unsupported expression type for IR generation");
}

/**
 * 将中间代码序列格式化为可读字符串，便于调试。
 */
export function printIR(instructions: IRInstruction[]): string {
  return instructions
    .map((inst) => {
      if (inst.arg !== undefined) {
        return `${inst.op} ${inst.arg}`;
      }
      return inst.op;
    })
    .join("\n");
}
