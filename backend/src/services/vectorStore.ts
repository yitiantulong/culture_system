import { OllamaEmbeddings } from "@langchain/ollama";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { config } from "../config/config.js";

export class VectorStoreService {
  private embeddings: OllamaEmbeddings;
  private vectorStore: MemoryVectorStore | null = null;

  constructor() {
    this.embeddings = new OllamaEmbeddings({
      model: config.ollama.embeddingModel,
      baseUrl: config.ollama.baseUrl,
    });
  }

  async initialize(): Promise<void> {
    try {
      // 初始化空的向量存储
      this.vectorStore = new MemoryVectorStore(this.embeddings);
      console.log("向量存储初始化成功");
    } catch (error) {
      console.error("向量存储初始化失败:", error);
      throw error;
    }
  }

  async addDocuments(documents: Document[]): Promise<void> {
    if (!this.vectorStore) {
      throw new Error("向量存储未初始化");
    }

    try {
      await this.vectorStore.addDocuments(documents);
      console.log(`成功添加 ${documents.length} 个文档到向量存储`);
    } catch (error) {
      console.error("添加文档到向量存储失败:", error);
      throw error;
    }
  }

  async similaritySearch(query: string, k: number = config.rag.maxRetrievedDocs): Promise<Document[]> {
    if (!this.vectorStore) {
      throw new Error("向量存储未初始化");
    }

    try {
      const results = await this.vectorStore.similaritySearch(query, k);
      console.log(`相似性搜索返回 ${results.length} 个结果`);
      return results;
    } catch (error) {
      console.error("相似性搜索失败:", error);
      throw error;
    }
  }

  async getDocumentCount(): Promise<number> {
    if (!this.vectorStore) {
      return 0;
    }
    
    // MemoryVectorStore 没有直接的计数方法，我们通过搜索空字符串来估算
    try {
      const allDocs = await this.vectorStore.similaritySearch("", 1000);
      return allDocs.length;
    } catch {
      return 0;
    }
  }

  async clearStore(): Promise<void> {
    if (this.vectorStore) {
      this.vectorStore = new MemoryVectorStore(this.embeddings);
      console.log("向量存储已清空");
    }
  }
} 