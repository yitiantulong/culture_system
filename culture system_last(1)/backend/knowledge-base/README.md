# 知识库文件目录

这个目录用于存放RAG系统的知识库JSON文件。

## JSON文件格式要求

JSON文件应包含文档数组，每个文档包含以下字段：

```json
[
  {
    "title": "文档标题",
    "content": "文档内容...",
    "category": "分类（可选）",
    "tags": ["标签1", "标签2"]
  }
]
```

## 使用方法

1. 将您的JSON文件放在这个目录中
2. 通过RAG聊天界面上传文件
3. 系统会自动处理和索引文件内容

## 示例文件

- `sample.json` - 基础示例
- `cultural_heritage.json` - 文化遗产相关知识
- `traditional_arts.json` - 传统艺术相关知识

## 注意事项

- 文件大小限制：10MB
- 支持的格式：`.json`, `.txt`
- JSON文件需要是有效的UTF-8编码 