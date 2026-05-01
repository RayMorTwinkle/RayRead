# RayRead

RayRead 是一个面向中文阅读场景的专注阅读工具。它会把长文本切成更容易跟读的句子或短分句，并通过当前句高亮、自动巡航、键盘翻句和可调节的视觉样式，帮助你把注意力留在眼前这一句。

## 功能特点

- **智能切句**：支持中英文句号、问号、感叹号，以及逗号、顿号、分号等分句标点。
- **逐句高亮**：当前阅读句会被高亮，其余内容自动弱化，减少视觉干扰。
- **自动巡航**：根据句子长度和阅读速度自动推进，适合跟读和沉浸阅读。
- **键盘导航**：`Space` / `→` 下一句，`←` 上一句，并避免误触阅读模式等表单选项。
- **两种阅读模式**：歌词模式适合一句一行追焦阅读，文稿模式适合保留连续段落排版。
- **多巴胺视觉辅助**：支持温和 / 多巴胺 / 跳跃三档强度，随机加粗、下划线、文字色和背景色。
- **可调色彩池**：内置 Macaron、Mid-Century、Morandi、Ink Wash 四套浅背景 + 深文字配色。
- **高级设置**：可关闭字号变化或句子背景色，让阅读体验更稳定。
- **隐私友好**：阅读文本不持久化，偏好配置仅保存在浏览器 Local Storage。

## 技术栈

- Next.js 15 App Router
- React 18
- TypeScript
- Zustand
- Tailwind CSS
- framer-motion
- animal-island-ui
- lucide-react

## 环境准备

本项目使用 **npm** 作为包管理器（已包含 `package-lock.json`），请确保你的环境满足以下条件：

- **Node.js**：18.18 或更高版本（Next.js 15 要求）
- **包管理器**：npm（内置在 Node.js 中）

> 提示：项目不兼容 pnpm/yarn 的 lock 文件。如果你在全新环境中使用 pnpm，请先删除 `package-lock.json` 和 `node_modules`，再运行 `pnpm install` 重新生成 lock 文件。否则请继续使用 npm。

## 快速开始

在干净的环境中，执行以下命令即可启动开发：

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev
```

打开浏览器访问：

```text
http://localhost:3000
```

## 常用命令

```bash
npm run dev        # 启动开发服务器
npm run build      # 构建生产版本
npm run start      # 启动生产构建后的应用
npm run lint       # 运行 ESLint
npm run typecheck  # 运行 TypeScript 类型检查
```

## 使用方式

1. 在左侧输入框粘贴文章、笔记或小说片段。
2. RayRead 会自动把文本切分为句子和短分句。
3. 点击「开始阅读」或按 `Space` 开始逐句巡航。
4. 使用 `←` / `→` 手动切换句子。
5. 在右侧控制面板调整阅读速度、阅读模式、色彩池和多巴胺强度。

## 阅读模式

| 模式 | 适合场景 |
|------|----------|
| 歌词模式 | 一句一行，适合追焦阅读和跟读 |
| 文稿模式 | 保留连续文段排版，适合阅读文章和长段落 |

## 配置说明

| 配置 | 默认值 | 说明 |
|------|--------|------|
| 阅读速度 | `10` 字符/秒 | 影响自动巡航停留时间 |
| 色彩池 | `macaron` | 浅背景 + 深文字，降低阅读疲劳 |
| 多巴胺样式 | 开启 | 控制随机加粗、下划线、颜色等视觉辅助 |
| 多巴胺强度 | `dopamine` | 可选温和、多巴胺、跳跃 |
| 沉浸高亮 | 开启 | 弱化非当前句，突出当前句 |
| 字号变化 | 关闭 | 高级设置，开启后句子字号轻微变化 |
| 句子背景色 | 开启 | 高级设置，关闭后只保留文字颜色变化 |

## 项目结构

```text
src/
  app/                         # Next.js App Router 入口与全局样式
  components/
    RayReadApp/                # 顶层应用容器
    ReaderBoard/               # 文本输入与阅读区域
    ControlPanel/              # 阅读控制面板
  hooks/                       # 自动巡航、水合、键盘导航
  lib/                         # 文本解析、样式生成、工具函数
  store/                       # Zustand 阅读状态和配置状态
docs/
  animal-island-ui/            # animal-island-ui API、设计提示词和 Skill 文档
```

## 核心实现

- `src/lib/parser.ts`：将文本按句子和分句标点切成 `ParsedChunk[]`。
- `src/lib/chunk-style.ts`：基于文本和索引生成确定性视觉样式，避免 SSR/CSR 随机不一致。
- `src/store/reading-store.ts`：保存原始文本、切分结果、当前句索引和播放状态。
- `src/store/config-store.ts`：保存阅读偏好，并通过 Zustand persist 写入 Local Storage。
- `src/hooks/useAutoPlay.ts`：根据当前句长度和阅读速度自动翻句。
- `src/hooks/useKeyboardNavigation.ts`：全局接管 `Space`、`←`、`→`，实现稳定键盘阅读。

## 设计原则

- 默认舒适优先，视觉刺激可调节。
- 背景色保持浅色，文字色保持深色，减少长时间阅读疲劳。
- 阅读内容不落盘，偏好配置本地保存。
- 随机样式必须确定性生成，避免 Next.js hydration mismatch。
- 页面自然滚动优先，避免控制面板展开后重要按钮不可达。
