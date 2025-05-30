import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: import.meta.env.VITE_DEEPSEEK_BASE_URL,
  apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
  dangerouslyAllowBrowser: true // 仅限前端调试使用
});

export const chatWithAI = async (messages: any[]) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages,
      stream: false
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("API Error:", error);
    return "服务暂时不可用，请稍后再试";
  }
};
