import { JSONLoader } from "langchain/document_loaders/fs/json";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { config } from "../config/config.js";
import fs from "fs/promises";
import path from "path";

export class DocumentService {
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor() {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: config.rag.chunkSize,
      chunkOverlap: config.rag.chunkOverlap,
    });
  }

  async loadFromFile(filePath: string): Promise<Document[]> {
    try {
      const ext = path.extname(filePath).toLowerCase();
      let loader;

      switch (ext) {
        case '.json':
          loader = new JSONLoader(filePath);
          break;
        case '.txt':
          loader = new TextLoader(filePath);
          break;
        default:
          throw new Error(`不支持的文件类型: ${ext}`);
      }

      const docs = await loader.load();
      console.log(`从文件 ${filePath} 加载了 ${docs.length} 个文档`);
      return docs;
    } catch (error) {
      console.error(`加载文件失败 ${filePath}:`, error);
      throw error;
    }
  }

  async loadFromWeb(url: string, selector: string = "p"): Promise<Document[]> {
    try {
      const loader = new CheerioWebBaseLoader(url, {
        selector: selector as any
      });

      const docs = await loader.load();
      console.log(`从网页 ${url} 加载了 ${docs.length} 个文档`);
      return docs;
    } catch (error) {
      console.error(`加载网页失败 ${url}:`, error);
      throw error;
    }
  }

  async loadFromText(text: string, metadata: Record<string, any> = {}): Promise<Document[]> {
    try {
      const doc = new Document({
        pageContent: text,
        metadata: {
          source: "user_input",
          timestamp: new Date().toISOString(),
          ...metadata
        }
      });

      return [doc];
    } catch (error) {
      console.error("从文本创建文档失败:", error);
      throw error;
    }
  }

  async splitDocuments(documents: Document[]): Promise<Document[]> {
    try {
      const splitDocs = await this.textSplitter.splitDocuments(documents);
      console.log(`文档分割完成: ${documents.length} -> ${splitDocs.length} 个块`);
      return splitDocs;
    } catch (error) {
      console.error("文档分割失败:", error);
      throw error;
    }
  }

  async processUploadedFile(filePath: string): Promise<Document[]> {
    try {
      // 加载文档
      const docs = await this.loadFromFile(filePath);
      
      // 分割文档
      const splitDocs = await this.splitDocuments(docs);
      
      // 清理临时文件
      await fs.unlink(filePath);
      
      return splitDocs;
    } catch (error) {
      // 确保清理临时文件
      try {
        await fs.unlink(filePath);
      } catch (cleanupError) {
        console.error("清理临时文件失败:", cleanupError);
      }
      throw error;
    }
  }

  validateFileType(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return config.upload.allowedTypes.includes(ext);
  }

  async createSampleDocument(): Promise<Document[]> {
    const sampleText = `
    文化系统是一个复杂的社会现象，包含了价值观、信念、习俗、艺术、法律、道德等多个层面。
    
    文化的特征包括：
    1. 学习性：文化是通过学习获得的，不是天生的
    2. 共享性：文化是群体成员共同拥有的
    3. 象征性：文化使用符号和象征来传达意义
    4. 整合性：文化的各个部分相互关联，形成一个整体
    5. 适应性：文化能够适应环境的变化
    
    文化的功能：
    - 提供行为准则和价值标准
    - 促进社会整合和团结
    - 传承知识和经验
    - 满足精神需求
    - 适应环境变化
    `;

    return await this.loadFromText(sampleText, {
      title: "文化系统基础知识",
      type: "sample_document"
    });
  }
} 