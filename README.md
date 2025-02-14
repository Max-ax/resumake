# Resumake 智能简历优化工具 | Smart Resume Optimizer

[English](#english) | [中文](#chinese)

## <a name="chinese">中文说明</a>

### 📝 项目简介

Resumake 是一个智能简历优化工具，能够根据特定职位描述自动调整和优化您的简历。通过利用 DeepSeek API 的强大能力，我们的工具可以帮助您创建更有竞争力的求职简历。

### ✨ 主要特点

- 🔄 智能简历优化：根据目标职位描述自动调整简历内容
- 📤 简单上传：支持上传现有简历文件
- 🎯 职位匹配：根据职位描述智能调整简历重点
- 🤖 AI 驱动：采用 DeepSeek API 提供智能优化建议
- 🔒 隐私保护：确保您的个人信息安全

### 🚀 使用方法

选择以下任一方式使用：

1. 使用我们部署的版本
   - 直接访问我们的在线服务：[Resumake在线版本]
   - 无需配置，即可使用

2. 本地部署
   - 克隆项目到本地
   - 安装依赖：`npm install`
   - 在项目根目录创建 `.env` 文件
   - 添加您的 DeepSeek API 密钥：`DEEPSEEK_API_KEY=your_api_key`
   - 运行项目：`npm run dev`

使用步骤：
1. 打开网页
2. 粘贴目标职位描述
3. 上传您当前的简历
4. 等待系统生成优化后的简历
5. 下载并使用新的简历

> 注意：如果选择本地部署，您需要先在 [DeepSeek官网](https://deepseek.com) 申请 API 密钥

### 🛠️ 技术栈

- Next.js
- TypeScript
- Tailwind CSS
- DeepSeek API

### 🤝 贡献指南

我们欢迎社区贡献！如果您有任何改进建议或发现了 bug，请随时提交 Issue 或 Pull Request。

## <a name="english">English</a>

### 📝 Project Overview

Resumake is an intelligent resume optimization tool that automatically adjusts and enhances your resume based on specific job descriptions. Powered by the DeepSeek API, our tool helps you create more competitive resumes for your job applications.

### ✨ Key Features

- 🔄 Smart Resume Optimization: Automatically adjusts resume content based on target job descriptions
- 📤 Easy Upload: Support for existing resume uploads
- 🎯 Job Matching: Intelligent content adjustment based on job requirements
- 🤖 AI-Powered: Leverages DeepSeek API for smart suggestions
- 🔒 Privacy Focused: Ensures your personal information is secure

### 🚀 How to Use

Choose one of the following options:

1. Use Our Deployed Version
   - Visit our online service: [Resumake Online]
   - No configuration needed

2. Local Deployment
   - Clone the project
   - Install dependencies: `npm install`
   - Create `.env` file in the root directory
   - Add your DeepSeek API key: `DEEPSEEK_API_KEY=your_api_key`
   - Run the project: `npm run dev`

Usage Steps:
1. Open the website
2. Paste the target job description
3. Upload your current resume
4. Wait for the system to generate an optimized version
5. Download and use your new resume

> Note: For local deployment, you'll need to obtain an API key from [DeepSeek](https://deepseek.com) first

### 🛠️ Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- DeepSeek API

### 🤝 Contributing

We welcome community contributions! If you have any suggestions for improvements or find any bugs, feel free to submit an Issue or Pull Request.

---

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
