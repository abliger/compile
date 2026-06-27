// 输入源抽象层
// 为词法分析器提供统一的字节读取接口，无论底层是文件还是字符串。
export interface Source {
  // 读取并消费当前字节，返回 null 表示已结束
  getCurrentByte(): string | null;
  // 预读下一个将要被消费的字节，不移动指针
  peek(): string | null;
  // 关闭源（如关闭文件句柄），字符串源可空实现
  close(): void;
}
