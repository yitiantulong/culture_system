import express from "express";
import multer from "multer";
import path from "path";
import { RAGService } from "../services/ragService.js";
import { config } from "../config/config.js";

const router = express.Router();
const ragService = new RAGService();

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.upload.maxFileSize
  },
  fileFilter: (req, file, cb) => {
    if (ragService.validateFileType(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'));
    }
  }
});

// 初始化RAG服务
let isInitialized = false;

const ensureInitialized = async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  if (!isInitialized) {
    try {
      await ragService.initialize();
      isInitialized = true;
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "RAG服务初始化失败",
        error: error instanceof Error ? error.message : "未知错误"
      });
      return;
    }
  }
  next();
};

// 查询接口
router.post('/query', ensureInitialized, async (req, res): Promise<void> => {
  const startTime = Date.now();
  
  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string') {
      res.status(400).json({
        success: false,
        message: "请提供有效的问题"
      });
      return;
    }

    console.log(`🤔 开始处理问题: "${question.substring(0, 50)}${question.length > 50 ? '...' : ''}"`);
    
    const result = await ragService.query(question);
    
    const duration = Date.now() - startTime;
    console.log(`✅ 问题处理完成，耗时: ${duration}ms`);

    res.json({
      success: true,
      data: {
        answer: result.answer,
        question: result.question,
        contextCount: result.context.length,
        context: result.context.map(doc => ({
          content: doc.pageContent.substring(0, 200) + "...",
          metadata: doc.metadata
        })),
        processingTime: duration
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ 查询处理错误 (耗时: ${duration}ms):`, error);
    res.status(500).json({
      success: false,
      message: "查询处理失败",
      error: error instanceof Error ? error.message : "未知错误",
      processingTime: duration
    });
  }
});

// 上传文档接口
router.post('/upload', ensureInitialized, upload.single('document'), async (req, res): Promise<void> => {
  console.log('📤 开始处理文件上传...');
  
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "请上传文件"
      });
      return;
    }

    console.log(`📁 处理文件: ${req.file.originalname} (${req.file.size} bytes)`);
    
    // 设置响应头，告诉前端这可能需要一些时间
    res.setHeader('Content-Type', 'application/json');
    
    const documentCount = await ragService.addDocumentsFromFile(req.file.path);
    
    console.log(`✅ 文件处理完成: ${documentCount} 个文档块`);

    res.json({
      success: true,
      message: `成功添加 ${documentCount} 个文档块`,
      data: {
        filename: req.file.originalname,
        documentCount,
        fileSize: req.file.size
      }
    });
  } catch (error) {
    console.error("❌ 文件上传处理错误:", error);
    
    // 尝试清理失败的上传文件
    if (req.file?.path) {
      try {
        const fs = await import('fs/promises');
        await fs.unlink(req.file.path);
        console.log('🗑️ 已清理失败的上传文件');
      } catch (cleanupError) {
        console.error('清理文件失败:', cleanupError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: "文件处理失败",
      error: error instanceof Error ? error.message : "未知错误",
      details: "请检查文件格式是否正确，或重试上传"
    });
  }
});

// 添加文本文档接口
router.post('/add-text', ensureInitialized, async (req, res): Promise<void> => {
  try {
    const { text, metadata } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({
        success: false,
        message: "请提供有效的文本内容"
      });
      return;
    }

    const documentCount = await ragService.addDocumentsFromText(text, metadata);

    res.json({
      success: true,
      message: `成功添加 ${documentCount} 个文档块`,
      data: {
        documentCount
      }
    });
  } catch (error) {
    console.error("文本添加处理错误:", error);
    res.status(500).json({
      success: false,
      message: "文本处理失败",
      error: error instanceof Error ? error.message : "未知错误"
    });
  }
});

// 添加网页文档接口
router.post('/add-web', ensureInitialized, async (req, res): Promise<void> => {
  try {
    const { url, selector } = req.body;

    if (!url || typeof url !== 'string') {
      res.status(400).json({
        success: false,
        message: "请提供有效的URL"
      });
      return;
    }

    const documentCount = await ragService.addDocumentsFromWeb(url, selector);

    res.json({
      success: true,
      message: `成功添加 ${documentCount} 个文档块`,
      data: {
        url,
        documentCount
      }
    });
  } catch (error) {
    console.error("网页添加处理错误:", error);
    res.status(500).json({
      success: false,
      message: "网页处理失败",
      error: error instanceof Error ? error.message : "未知错误"
    });
  }
});

// 获取文档统计接口
router.get('/stats', ensureInitialized, async (req, res): Promise<void> => {
  try {
    const documentCount = await ragService.getDocumentCount();

    res.json({
      success: true,
      data: {
        documentCount,
        isInitialized
      }
    });
  } catch (error) {
    console.error("获取统计信息错误:", error);
    res.status(500).json({
      success: false,
      message: "获取统计信息失败",
      error: error instanceof Error ? error.message : "未知错误"
    });
  }
});

// 清空文档接口
router.delete('/documents', ensureInitialized, async (req, res): Promise<void> => {
  try {
    await ragService.clearDocuments();

    res.json({
      success: true,
      message: "文档已清空"
    });
  } catch (error) {
    console.error("清空文档错误:", error);
    res.status(500).json({
      success: false,
      message: "清空文档失败",
      error: error instanceof Error ? error.message : "未知错误"
    });
  }
});

// 服务状态检查接口
router.get('/health', async (req, res): Promise<void> => {
  try {
    const serviceStatus = await ragService.testServices();

    res.json({
      success: true,
      data: {
        isInitialized,
        services: serviceStatus
      }
    });
  } catch (error) {
    console.error("健康检查错误:", error);
    res.status(500).json({
      success: false,
      message: "健康检查失败",
      error: error instanceof Error ? error.message : "未知错误"
    });
  }
});

export default router; 