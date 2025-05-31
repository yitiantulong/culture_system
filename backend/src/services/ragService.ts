import { Document } from "@langchain/core/documents";
import { VectorStoreService } from "./vectorStore.js";
import { LLMService } from "./llmService.js";
import { DocumentService } from "./documentService.js";
import { config } from "../config/config.js";
import path from 'path';

export interface RAGResponse {
  answer: string;
  context: Document[];
  question: string;
}

export class RAGService {
  private vectorStore: VectorStoreService;
  private llmService: LLMService;
  private documentService: DocumentService;

  constructor() {
    this.vectorStore = new VectorStoreService();
    this.llmService = new LLMService();
    this.documentService = new DocumentService();
  }

  async initialize(): Promise<void> {
    try {
      await this.vectorStore.initialize();
      
      // 先添加示例文档
      const sampleDocs = await this.documentService.createSampleDocument();
      const splitDocs = await this.documentService.splitDocuments(sampleDocs);
      await this.vectorStore.addDocuments(splitDocs);
      
      // 添加test-data/sample.json文件中的非遗文化知识
      try {
        const heritageJsonPath = path.join(process.cwd(), 'test-data', 'heritage_knowledge.json');
        const heritageDocuments = await this.documentService.loadFromFile(heritageJsonPath);
        const splitHeritageDocuments = await this.documentService.splitDocuments(heritageDocuments);
        await this.vectorStore.addDocuments(splitHeritageDocuments);
        console.log(`✅ 成功加载非遗文化知识库: ${splitHeritageDocuments.length} 个文档块`);
      } catch (error) {
        console.log(`⚠️  未找到heritage_knowledge.json文件，跳过非遗知识库加载: ${error}`);
      }
      
      console.log("RAG服务初始化完成");
    } catch (error) {
      console.error("RAG服务初始化失败:", error);
      throw error;
    }
  }

  async query(question: string): Promise<RAGResponse> {
    try {
      // 1. 检索相关文档
      const retrievedDocs = await this.vectorStore.similaritySearch(question);
      
      // 2. 生成回答
      const answer = await this.llmService.generateAnswer(question, retrievedDocs);
      
      return {
        answer,
        context: retrievedDocs,
        question
      };
    } catch (error) {
      console.error("RAG查询失败:", error);
      throw new Error("查询处理失败");
    }
  }

  async addDocumentsFromFile(filePath: string): Promise<number> {
    try {
      const documents = await this.documentService.processUploadedFile(filePath);
      await this.vectorStore.addDocuments(documents);
      return documents.length;
    } catch (error) {
      console.error("添加文档失败:", error);
      throw error;
    }
  }

  async addDocumentsFromText(text: string, metadata?: Record<string, any>): Promise<number> {
    try {
      const documents = await this.documentService.loadFromText(text, metadata);
      const splitDocs = await this.documentService.splitDocuments(documents);
      await this.vectorStore.addDocuments(splitDocs);
      return splitDocs.length;
    } catch (error) {
      console.error("从文本添加文档失败:", error);
      throw error;
    }
  }

  async addDocumentsFromWeb(url: string, selector?: string): Promise<number> {
    try {
      const documents = await this.documentService.loadFromWeb(url, selector);
      const splitDocs = await this.documentService.splitDocuments(documents);
      await this.vectorStore.addDocuments(splitDocs);
      return splitDocs.length;
    } catch (error) {
      console.error("从网页添加文档失败:", error);
      throw error;
    }
  }

  async getDocumentCount(): Promise<number> {
    return await this.vectorStore.getDocumentCount();
  }

  async clearDocuments(): Promise<void> {
    await this.vectorStore.clearStore();
  }

  async testServices(): Promise<{ vectorStore: boolean; llm: boolean }> {
    try {
      console.log('🔍 开始服务状态检查...');
      
      // 快速检查向量存储
      const vectorStoreTest = this.vectorStore !== null;
      console.log(`📊 向量存储状态: ${vectorStoreTest ? '✅ 正常' : '❌ 异常'}`);
      
      // 检查LLM服务（如果API Key未设置则跳过耗时的连接测试）
      let llmTest = false;
      if (!config.deepseek.apiKey || config.deepseek.apiKey === "your_deepseek_api_key_here") {
        console.log('⚠️  DeepSeek API Key 未设置，跳过连接测试');
        llmTest = false;
      } else {
        console.log('🤖 测试DeepSeek连接...');
        llmTest = await this.llmService.testConnection();
      }
      
      console.log(`🤖 LLM服务状态: ${llmTest ? '✅ 正常' : '❌ 异常'}`);
      
      return {
        vectorStore: vectorStoreTest,
        llm: llmTest
      };
    } catch (error) {
      console.error("❌ 服务测试失败:", error);
      return {
        vectorStore: false,
        llm: false
      };
    }
  }

  validateFileType(filename: string): boolean {
    return this.documentService.validateFileType(filename);
  }
} 