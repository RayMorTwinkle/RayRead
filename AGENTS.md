# AGENTS.md — AI Agent 代码导航指南

本文件供 AI 编码助手理解项目架构，快速定位代码并做出合理修改。

## 项目概述
- RayRead 是一个面向中文阅读场景的专注阅读工具，支持将长文本按句切分，并以逐句高亮、自动巡航和多种阅读模式帮助用户跟读。
- 线上地址：仓库内未提供。

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js | `^15.5.15` |
| 前端 | React | `^18.3.1` |
| 前端 | React DOM | `^18.3.1` |
| 语言 | TypeScript | `^5.9.3` |
| UI 组件库 | animal-island-ui | `^0.7.4` |
| 样式 | Tailwind CSS | `^3.4.18` |
| 样式 | tailwind-merge | `^3.3.1` |
| 样式 | clsx | `^2.1.1` |
| 动画 | framer-motion | `^12.23.24` |
| 状态管理 | zustand | `^5.0.8` |
| 图标 | lucide-react | `^0.546.0` |
| Lint | eslint | `^9.39.4` |
| Lint 配置 | eslint-config-next | `^15.5.15` |
| CSS 工具链 | postcss | `^8.5.6` |
| CSS 工具链 | autoprefixer | `^10.4.21` |

**路径别名：** `@/*` → `./src/*`

**Tailwind 自定义 token：** 在 `tailwind.config.ts` 中扩展了三个颜色 — `parchment`（#f8f8f0，页面背景色）、`island`（#19c8b9，青绿强调色）、`bark`（#725d42，主文字色）。`text-bark` 在多个组件中直接使用。字体栈也通过 `fontFamily.island` 注入。

## 开发命令

```bash
npm run dev        # 启动 Next.js 开发服务器
npm run build      # 构建生产版本
npm run start      # 启动生产构建后的应用
npm run lint       # 对 src 下的 .ts/.tsx 文件运行 ESLint
npm run typecheck  # 使用 tsc --noEmit 执行类型检查
```

## 部署架构

### 服务列表
| 服务 | 用途 | 配置位置 |
|------|------|---------|
| Next.js App Router | 承载整个前端应用与页面路由 | `src/app/`, `next.config.mjs` |
| 浏览器 Local Storage | 持久化用户阅读偏好配置 | `src/store/config-store.ts` |
| animal-island-ui | 提供主要视觉组件、Footer、Cursor、Typewriter 等 UI 能力 | `src/app/layout.tsx`, `src/components/**` |

### 环境变量
当前仓库未发现 `.env.example`，代码中也未发现 `process.env.*` 读取。

### 配置文件
- `next.config.mjs`：仅启用 `reactStrictMode: true`，无其他自定义配置。
- `tailwind.config.ts`：扩展了 `parchment`/`island`/`bark` 三个颜色 token 和 `fontFamily.island` 字体栈，content 指向 `./src/**/*.{ts,tsx}`。
- `postcss.config.js`：标准 Tailwind + autoprefixer 配置。
- `tsconfig.json`：`strict: true`，`paths: { "@/*": ["./src/*"] }`。

### 部署命令和工作流
- 部署方式：仓库内未显式配置 Vercel、Docker 或 GitHub Actions，推断为标准 Next.js 手动部署流程。
- 构建命令：`npm run build`
- 启动命令：`npm run start`
- 工作流约定：修改后至少运行 `npm run lint` 与 `npm run typecheck`；如需发布，再补跑 `npm run build`。

## 关键架构决策

1. **使用 App Router 单页入口**：项目只在 `src/app/page.tsx` 暴露 `/` 路由，把所有业务集中到 `RayReadApp`，适合当前单功能产品，代价是未来多页面扩展时需要再拆路由段。
2. **阅读状态与配置状态分离**：`useReadingStore` 只保存文本、切分结果和播放状态，`useConfigStore` 只保存阅读偏好，减少了 UI 修改时的耦合。
3. **配置持久化而阅读内容不持久化**：偏好配置通过 `zustand/persist` 落到 Local Storage，而原始文本不落盘，兼顾了体验和隐私。`hasHydrated` 为内部状态，不写入 `partialize`。
4. **显式处理 Hydration**：`skipHydration: true` 配合 `useHydrateConfigStore()` 手动 `rehydrate()`，避免 Next.js SSR/CSR 水合不一致。
5. **阅读引擎建立在纯函数分句上**：文本切分集中在 `src/lib/parser.ts`，采用"先按句切 → 再按分句切 → 合并短分句"三阶段策略，组件不直接操作正则。
6. **确定性随机样式替代 `Math.random()`**：`hashString`（FNV-1a）、`seededPercent`、`pickWeighted` 保证服务端和客户端渲染一致，避免 hydration mismatch。
7. **视觉样式生成独立模块化**：`src/lib/chunk-style.ts` 单独负责"多巴胺模式"的字号、字重、斜体、下划线、背景色和文字色分配，UI 层只消费 `ChunkVisualStyle` 结果对象。
8. **多巴胺三档强度系统**：`DopamineLevel`（gentle / dopamine / jumpy）控制字号、加粗、斜体、下划线、背景色和文字色的出现概率，由 `LEVEL_CONFIGS` 统一驱动。
9. **自动巡航由 Hook 驱动**：`useAutoPlay()` 根据 `readingSpeed` 和句长计算停留时长（`Math.max(700, 句长/速度*1000)`），到达最后一句自动停止播放，把计时逻辑从组件剥离。
10. **键盘导航全局接管但避开输入框**：`useKeyboardNavigation()` 统一处理 `ArrowRight`、`Space`、`ArrowLeft`，会跳过 `textarea`、文本类 `input` 和 `contenteditable`，并对已聚焦的控件执行 `blur()` 防止连续触发。
11. **阅读视图与控制面板分区明确**：左侧 `ReaderBoard` 专注文本流，右侧 `ControlPanel` 专注控制行为，符合"输入/输出"和"控制/展示"分层。
12. **保留两种阅读模式共用同一数据源**：`lyrics` 与 `document` 模式都基于相同 `chunks` 和 `currentIndex`，避免两套状态机并存。
13. **以 UI 组件库为主、Tailwind 为辅**：业务组件使用 `animal-island-ui` 承担视觉主风格，Tailwind 主要做布局、尺寸和间距，减少重复造轮子。
14. **无服务端、无数据库的纯前端架构**：当前没有 `src/server/`、API 路由或 ORM，所有核心逻辑均在客户端执行，开发快但不适合多端同步或多人协作场景。
15. **页面滚动优先于局部滚动**：当前布局已调整为整页自然纵向滚动，避免右侧参数展开后顶部主按钮不可达的问题。
16. **小模块 + 自定义 Hook 约束大组件膨胀**：复杂行为通过 `useAutoPlay`、`useKeyboardNavigation`、`useHydrateConfigStore` 抽离，保留组件树可读性。
17. **字号用任意值类避免 Tailwind 预设 line-height**：`text-[1rem/1.1rem/1.25rem]` 配合 `leading-[inherit]` 继承父容器行距，防止文稿模式下字号变化撑爆排版。
18. **阅读进度持久化与配置持久化采用相同策略**：`reading-store` 使用 `zustand/persist` + `skipHydration: true`，只持久化 `rawText` 和 `currentIndex`，chunks 在恢复时重新 parse。`onRehydrateStorage` 回调中调用 `restoreReading` 重建 chunks 并恢复 currentIndex，避免 hydration mismatch。
19. **语义感知巡航节奏**：`useAutoPlay` 根据 `ParsedChunk.endType`（sentence/clause/paragraph）乘以不同系数（1.0/0.6/1.4），逗号结尾分句停顿更短，段落结尾停顿更长。
20. **URL 导入通过服务端代理**：`/api/fetch-url` 路由在服务端 fetch 目标页面并提取正文，避免客户端跨域限制。优先提取 `<article>` 标签，回退到 `<body>`。
21. **阅读统计不持久化**：`useReadingStats` 追踪的阅读时长和已读句数仅在当前会话有效，清空文本时重置。

## 用户流程

```text
访问首页 `/` → `RayReadApp` 装载配置水合/键盘/自动巡航 Hook → 用户在左侧粘贴文本或载入示例 → `parseText()` 重置索引并切出 `chunks` → `ReaderBoard` 按当前阅读模式渲染句子 → 用户点击"开始阅读"或使用键盘控制 → `currentIndex` 变化 → 高亮句子滚动到中心 → 自动巡航按句长和速度推进，到末句自动停止
```

## 文件地图

### API 路由
| 路径 | 文件 | 说明 |
|------|------|------|
| `/api/fetch-url` | `src/app/api/fetch-url/route.ts` | URL 代理抓取，接收 url 参数，返回提取的纯文本。 |

### 页面路由
| 路径 | 文件 | 说明 |
|------|------|------|
| `/` | `src/app/page.tsx` | 首页入口，直接渲染 `RayReadApp`。 |

### 组件目录
| 文件 | 作用 |
|------|------|
| `src/components/RayReadApp/RayReadApp.tsx` | 顶层客户端应用容器，组合布局、Footer（`pointer-events-none` 包裹）、Cursor 和三个核心 Hook。 |
| `src/components/ReaderBoard/ReaderBoard.tsx` | 左侧阅读主区域，负责文本输入、示例载入、进度展示（`currentIndex+1 / chunks.length`）、两种阅读模式渲染和活动句滚动（`scrollIntoView({ block: 'center' })`）。 |
| `src/components/ReaderBoard/ChunkItem.tsx` | 句子渲染单元，支持块级（lyrics，默认 `block`）和 inline（document）两种展示模式，附带 Framer Motion 动画。活动句叠加 `bg-[#fff7d6]` 高亮，多巴胺装饰色通过 `backgroundColor` 内联样式叠加。 |
| `src/components/ControlPanel/ControlPanel.tsx` | 右侧控制面板，负责播放/暂停按钮（原生 `<button>` 内联颜色）、翻句（animal-island-ui Button）、阅读模式切换、速度滑杆、色彩池单选、多巴胺开关与三档按钮组、沉浸高亮开关、高级设置（字号变化/背景色）。 |

### Hooks
| 文件 | 作用 |
|------|------|
| `src/hooks/useAutoPlay.ts` | 根据当前句长度和 `readingSpeed` 自动推进到下一句，句末自动停止播放。 |
| `src/hooks/useHydrateConfigStore.ts` | 在客户端触发 `useConfigStore.persist.rehydrate()`。 |
| `src/hooks/useKeyboardNavigation.ts` | 注册全局键盘事件，实现空格/方向键翻句，阻止默认滚动，对非输入控件执行 `blur()`。 |
| `src/hooks/useHydrateReadingStore.ts` | 在客户端触发 `useReadingStore.persist.rehydrate()`。 |
| `src/hooks/useReadingStats.ts` | 追踪阅读时长、已读句数、预估剩余时间，仅在当前会话有效。 |

### 状态管理
| 文件 | 作用 |
|------|------|
| `src/store/reading-store.ts` | 阅读业务状态：原始文本、切分结果、当前索引、播放状态及相关操作。支持 `zustand/persist` 持久化 `rawText` 和 `currentIndex` 到 Local Storage，chunks 在恢复时重新 parse。`hasHydrated` 为内部水合标记，不持久化。 |
| `src/store/config-store.ts` | 用户偏好配置：速度、色彩池、阅读模式、多巴胺开关与档位、字号变化、背景高亮、聚焦模式，支持 `zustand/persist` 持久化到 Local Storage。`hasHydrated` 为内部水合标记，不持久化。 |

### 工具文件
| 文件 | 作用 |
|------|------|
| `src/lib/parser.ts` | 以中英文标点切句并保留原标点，采用"句子切分 → 分句切分 → 合并短分句（有效长度 ≤5）"三阶段策略，输出 `ParsedChunk[]`。 |
| `src/lib/chunk-style.ts` | 依据文本和索引生成确定性随机视觉样式（字号、字重、斜体、下划线、背景色、文字色），由 `LEVEL_CONFIGS` 驱动三档强度。`getChunkVisualStyle(text, index, palette, enabled, level, enableSizeVariation, enableBackgroundHighlight)` 返回 `ChunkVisualStyle`。 |
| `src/lib/utils.ts` | `cn`（class 合并）、`hashString`（FNV-1a 哈希，种子 `2166136261`）、`seededPercent`（种子百分比）、`pickWeighted`（加权选择）等基础工具。 |
| `src/app/layout.tsx` | 根布局，导入 `animal-island-ui/style` 与全局 CSS，并设置 metadata。 |
| `src/app/globals.css` | 全局配色变量、背景渐变、字体栈（Nunito / Noto Sans SC / Zen Maru Gothic）、`textarea` 禁止缩放、滑杆 `.rayread-range` 样式。 |
| `tailwind.config.ts` | 扩展 `parchment`/`island`/`bark` 三个颜色 token 和 `fontFamily.island` 字体栈。 |
| `next.config.mjs` | 仅启用 `reactStrictMode: true`，无其他自定义配置。 |
| `postcss.config.js` | 标准 Tailwind + autoprefixer 配置。 |
| `docs/animal-island-ui/AI_USAGE.md` | animal-island-ui 组件库 API 参考（Button/Switch/Card/Collapse/Divider/Typewriter 等）。修改 UI 组件用法时优先查阅。 |
| `docs/animal-island-ui/DESIGN_PROMPT.md` | animal-island-ui 视觉风格提示词，供 v0/Figma AI/Framer AI 或图片生成工具参考。 |
| `docs/animal-island-ui/SKILL.md` | animal-island-ui 的 AI Skill 风格规范，包含设计 token、组件精确样式和新增组件 checklist。 |

### 服务端模块
当前未发现 `src/server/` 目录，也没有数据库或服务端业务模块。

## 数据模型

当前没有 Prisma、Drizzle、TypeORM 等 ORM schema。

项目内部主要依赖以下前端状态结构：

| 类型 | 说明 | 关键字段 |
|------|------|---------|
| `ParsedChunk` | 分句后的阅读单元 | `id`（`hash-${index}` 十六进制）, `text`, `length`, `endType`（`'sentence' \| 'clause' \| 'paragraph'`） |
| `ReadingState` | 阅读状态机 | `rawText`, `chunks`, `currentIndex`, `isPlaying`, `hasHydrated`（内部水合标记，不持久化）, `restoreReading`（恢复阅读进度） |
| `AppConfigState` | 配置偏好（部分持久化） | `readingSpeed`（默认 10）, `colorPalette`（默认 `'macaron'`）, `readingMode`（默认 `'lyrics'`）, `enableDopamine`（默认 `true`）, `dopamineLevel`（默认 `'dopamine'`）, `enableFocus`（默认 `true`）, `enableSizeVariation`（默认 `false`）, `enableBackgroundHighlight`（默认 `true`）, `hasHydrated`（内部水合标记，不持久化） |
| `ColorPalette` | 色彩池类型 | `'mid-century' \| 'morandi' \| 'macaron' \| 'ink-wash'` |
| `ReadingMode` | 阅读模式类型 | `'lyrics' \| 'document'` |
| `DopamineLevel` | 多巴胺强度档位 | `'gentle' \| 'dopamine' \| 'jumpy'` |
| `ChunkVisualStyle` | 句子视觉样式结果 | `sizeClass`, `weightClass`, `italicClass`, `underlineClass`, `backgroundColor`, `textColor` |
| `ReadingStats` | 阅读统计数据 | `readingTimeSeconds`, `readSentenceCount`, `totalSentenceCount`, `estimatedRemainingSeconds` |

## 特性系统

### 多巴胺视觉装饰系统

系统通过 `chunk-style.ts` 中的 `LEVEL_CONFIGS` 实现三档强度：

| 档位 | 字号 S/M/L 权重 | 加粗概率 | 斜体概率 | 下划线概率 | 背景色概率 | 文字色概率 |
|------|----------------|---------|---------|----------|----------|----------|
| `gentle` | 15 / 55 / 30 | 22% | 0% | 8% | 7% | 18% |
| `dopamine` | 18 / 50 / 32 | 35% | 6% | 18% | 16% | 42% |
| `jumpy` | 18 / 42 / 40 | 50% | 14% | 30% | 28% | 70% |

**字号常量：**
- `SIZE_S = 'text-[1rem] leading-[inherit]'`
- `SIZE_M = 'text-[1.1rem] leading-[inherit]'`
- `SIZE_L = 'text-[1.25rem] leading-[inherit]'`

使用任意值类避免 Tailwind 预设字号自带的 line-height。`enableSizeVariation` 默认关闭，此时所有句子统一为 `SIZE_M`。

**下划线变体（统一 `decoration-2`）：**
- `UNDERLINE_BASE`：实线 `underline decoration-2 underline-offset-4`
- `UNDERLINE_WAVY`：波浪线 `underline decoration-wavy decoration-2 underline-offset-4`
- `UNDERLINE_DOUBLE`：双线 `underline decoration-double decoration-2 underline-offset-4`

**关闭多巴胺时**：`getChunkVisualStyle` 返回 `PLAIN_STYLE`，固定 `SIZE_M` + `font-medium`，无装饰色。

### 色彩池系统

4 套配色方案，遵循"浅色背景 + 深色文字"原则，`backgrounds` 附加 `66` alpha（约 40% 不透明度）以半透明形式渲染：

| 色彩池 | 背景色调 | 文字色调 | 设计理念 |
|--------|---------|---------|---------|
| `macaron`（默认） | `#F8D2CC` `#FBE3BC` `#FFF3C2` `#D4ECCF` `#CFE2EE` `#E0D2E8` | `#9a4942` `#9a6324` `#7d6312` `#34664a` `#385f78` `#5e4280` | 精致甜点色 |
| `mid-century` | `#CDE3E2` `#F8D9B5` `#F5C7B2` `#CCE2D4` `#DDEEE2` `#EBDDC0` | `#1f3d40` `#a35f1f` `#8a3414` `#23574a` `#4a7d63` `#7a6536` | 中世纪现代温暖知性 |
| `morandi` | `#F0E9D8` `#E5CDC4` `#CDD3D7` `#C2CCBC` `#DCC2B3` `#E5DDD2` | `#6f5e48` `#704c44` `#475763` `#4a5d44` `#704c3a` `#5f5852` | 灰调静物质感 |
| `ink-wash` | `#F2EBDC` `#D9DEE8` `#EAD0CB` `#D4E2DA` `#E8D8C0` `#D8D6E2` | `#1a1f2c` `#1e2e48` `#7a1d12` `#15463a` `#7a4c1c` `#2c2945` | 浅纸基底+深墨文字 |

### 阅读模式系统

- **歌词模式（`lyrics`）**：一句一行块级展示，使用 `motion.span` + `displayMode="block"` + 圆角卡片样式（`rounded-[26px] px-4 py-3`），`py-[30vh]` 上下留白保证高亮句居中。
- **文稿模式（`document`）**：连续文段排版，使用 `motion.span` + `displayMode="inline"`（`whitespace-pre-wrap break-words`），父容器 `leading-[2.1]` 固定行距，字号变化通过 `leading-[inherit]` 继承父行距，每个 chunk 末尾追加空格做 word-break。
- 两种模式共用相同 `chunks` 和 `currentIndex`，差异仅在渲染层。
- **活动句高亮**：`ChunkItem` 在活动句上叠加 `bg-[#fff7d6]`（固定黄色高亮），与多巴胺随机 `backgroundColor` 通过内联 `style` 叠加呈现。

### 灵活配置开关

| 开关 | 字段 | 默认值 | 说明 |
|------|------|--------|------|
| 多巴胺样式 | `enableDopamine` | `true` | 关闭后所有句子为 `PLAIN_STYLE`（`font-medium`，无装饰色） |
| 多巴胺档位 | `dopamineLevel` | `'dopamine'` | 三档按钮组切换（gentle / dopamine / jumpy） |
| 沉浸高亮 | `enableFocus` | `true` | 非活动句 `opacity: 0.3`，活动句 `scale: 1.05` |
| 字号变化 | `enableSizeVariation` | `false` | 开启后字号按档位权重随机变化 |
| 句子背景色 | `enableBackgroundHighlight` | `true` | 关闭后只用文字色变化，背景全透明 |

### 语义感知巡航节奏

自动巡航根据句子末尾标点类型调整停留时长：

| endType | 标点类型 | 停顿系数 | 说明 |
|---------|---------|---------|------|
| `sentence` | `。！？.!?` | 1.0 | 标准停顿 |
| `clause` | `，、；,;` | 0.6 | 分句间短停顿 |
| `paragraph` | 段落结尾 | 1.4 | 段落间长停顿 |

基础时长公式不变：`Math.max(700, (chunk.text.length / readingSpeed) * 1000)`。
最终停留时长 = 基础时长 × 停顿系数。

### 阅读进度保存

- 持久化字段：`rawText`、`currentIndex`
- 不持久化：`chunks`（恢复时重新 parse）、`isPlaying`（刷新后不自动播放）、`hasHydrated`
- 恢复逻辑：rehydrate 后若 rawText 非空，调用 `restoreReading` 重建 chunks 并恢复 currentIndex（带边界保护）
- Store name：`rayread-reading`
- 使用 `skipHydration: true` + 手动 `rehydrate()` 避免 hydration mismatch

### 内容导入

- **文件导入**：支持通过文件选择器或拖拽导入 `.txt` 文件，FileReader 读取内容后调用 `parseText()`
- **URL 导入**：通过 `/api/fetch-url` 服务端代理抓取网页正文，优先提取 `<article>` 标签，回退到 `<body>`，去除 HTML 标签后返回纯文本

### 阅读统计

- 阅读时长：isPlaying 为 true 时每秒累加，暂停时停止
- 已读句数：取 currentIndex + 1 的历史最大值，只增不减
- 预估剩余时间：根据未读句子总字符数和 readingSpeed 计算
- 统计数据不持久化，清空文本时重置

## 常见操作速查

### 如何添加新页面
1. 在 `src/app/<segment>/page.tsx` 创建新的 App Router 页面。
2. 如需共享布局，可增加 `src/app/<segment>/layout.tsx`。
3. 如果页面要复用现有阅读能力，优先从 `src/components/` 组合而不是在 `page.tsx` 里堆逻辑。
4. 注意事项：当前项目只有根页，新增页面后若涉及导航，还需要额外补导航入口。

### 如何新增一个阅读配置项
1. 在 `src/store/config-store.ts` 的 `AppConfigState` 中增加字段和 setter。
2. 决定是否需要持久化；若需要，记得补到 `partialize`（`hasHydrated` 等内部状态不要放入）。
3. 在 `src/components/ControlPanel/ControlPanel.tsx` 中增加受控 UI。
4. 在 `ReaderBoard`、Hook 或工具函数中消费新配置。
5. 注意事项：持久化字段要考虑 SSR 水合，避免直接在渲染阶段访问未恢复的浏览器状态。

### 如何新增一种阅读模式
1. 扩展 `src/store/config-store.ts` 中的 `ReadingMode` 联合类型。
2. 在 `src/components/ControlPanel/ControlPanel.tsx` 的 `READING_MODE_OPTIONS` 中添加选项。
3. 在 `src/components/ReaderBoard/ReaderBoard.tsx` 中为该模式增加渲染分支。
4. 如需要单句展示差异，可在 `src/components/ReaderBoard/ChunkItem.tsx` 增加展示模式或样式入口。
5. 注意事项：保持两种模式共用 `chunks/currentIndex`，不要复制一套新状态机。

### 如何调整多巴胺视觉参数
1. 修改 `src/lib/chunk-style.ts` 中 `LEVEL_CONFIGS` 对应档位的概率值。
2. 字号档位由 `SIZE_S` / `SIZE_M` / `SIZE_L` 三个常量定义，必须使用任意值类 + `leading-[inherit]`，禁止用 `text-lg` 等预设类。
3. 调色板由 `PALETTES` 对象定义，每个色彩池有 `backgrounds`（浅色）和 `texts`（深色）两个数组。
4. `getChunkVisualStyle()` 接收完整参数并返回 `ChunkVisualStyle`，UI 层只消费结果。
5. 注意事项：修改概率值后确认各档位间的视觉差异足够但不过度；`enableDopamine` 为 `false` 时直接返回 `PLAIN_STYLE`，不受档位影响。

### 如何调整自动巡航节奏
1. 修改 `src/hooks/useAutoPlay.ts` 中的 `duration` 计算公式（当前 `Math.max(700, (currentChunk.text.length / readingSpeed) * 1000)`）。
2. 如需调整速度上限/下限，同步修改 `src/store/config-store.ts` 的 `setReadingSpeed` 约束（当前 2-40）。
3. 如控件范围也要改，记得同步 `src/components/ControlPanel/ControlPanel.tsx` 中的 `<input type="range">`。
4. 注意事项：避免只改 UI 范围不改 store 限制，导致交互表现不一致；`nextChunk` 在到达最后一句时会自动将 `isPlaying` 设为 `false`。

### 如何修改分句规则
1. 编辑 `src/lib/parser.ts` 的 `SENTENCE_DELIMITER`（句尾标点）或 `CLAUSE_DELIMITER`（分句标点）正则。
2. 检查 `MIN_CLAUSE_LENGTH`（当前 5）和 `mergeShortClauses` 逻辑是否仍符合预期。
3. 手动验证中文、英文、混合标点和空白文本输入表现。
4. 注意事项：当前文稿模式依赖句子连续拼接，若改动 `trim()` 或空格处理，要同步验证文稿排版；`parseText()` 会同时重置 `currentIndex` 和 `isPlaying`。

### 如何新增一个控制面板组件块
1. 优先先看 `src/components/ControlPanel/ControlPanel.tsx` 现有结构，沿用 `Card`、`Collapse`、`Switch`、`Button` 组合模式。
2. 仅当逻辑明显独立时，再拆出 `src/components/ControlPanel/` 子组件。
3. 所有 UI 仍应与 Zustand store 受控绑定，避免临时 `useState` 与全局状态脱节。
4. 注意事项：不要绕过 `animal-island-ui` 自己重新造一套视觉系统；关键 CTA 按钮（如"开始阅读"）因组件库主题色问题改用原生 `<button>` + 内联颜色。

## 已知踩坑记录

### 1. Zustand Persist 水合不一致风险
**现象**：带持久化的配置 store 在 Next.js 环境下容易出现 SSR 与客户端初次渲染不一致。
**根因**：浏览器 `localStorage` 只在客户端可用，直接自动读取会引发 hydration mismatch。
**修复**：`src/store/config-store.ts` 使用 `skipHydration: true`，并在 `src/hooks/useHydrateConfigStore.ts` 中手动 `rehydrate()`；`hasHydrated` 不放入 `partialize`。
**教训**：凡是带浏览器存储的 Zustand store，都要先考虑 Next.js 的水合边界。

### 2. 不能在渲染阶段直接使用 `Math.random()`
**现象**：多巴胺样式如果直接随机，服务端和客户端样式会不一致。
**根因**：SSR 和 CSR 各自执行随机函数，生成结果不同。
**修复**：`src/lib/utils.ts` 中实现 `hashString`（FNV-1a，种子 `2166136261`）、`seededPercent`、`pickWeighted`，`src/lib/chunk-style.ts` 基于 `${text}-${index}` 作为种子生成确定性样式。
**教训**：任何影响 UI 输出的随机结果，都必须可复现。

### 3. 固定高度布局会让控制面板顶部按钮不可达
**现象**：右侧 `Collapse` 展开后页面无法自由上滑，用户滚不回"开始阅读"按钮。
**根因**：使用 `h-screen`、局部 `overflow` 和固定一屏布局时，内容增长被局部容器吞掉。
**修复**：`RayReadApp.tsx` 改为 `min-h-screen` 和整页自然滚动，`ControlPanel.tsx` 移除会抢滚动的内部 `overflow-y-auto`。
**教训**：可展开的面板更适合整页滚动或明确的 sticky 布局，避免多层滚动容器叠加。

### 4. 文稿模式不能继续用块级 `<p>` 渲染单句
**现象**：想做连续文稿排版时，每句仍被浏览器拆成独立块，视觉上不像真正文稿。
**根因**：块级标签天然换行，无法形成 inline sentence flow。
**修复**：`ChunkItem.tsx` 支持 `displayMode`，文稿模式使用 inline `motion.span`（`whitespace-pre-wrap break-words`），并在末尾追加空格做 word-break。
**教训**：当一个组件服务两种排版模式时，标签语义和 display 策略必须一起设计。

### 5. Tailwind 预设字号类自带 line-height 会撑爆文稿行距
**现象**：文稿模式的 `leading-[2.1]` 行距被 `text-xl`（自带 `line-height: 1.75`）覆盖。
**根因**：Tailwind 预设如 `text-xl` 生成 `font-size + line-height` 两个属性，子元素的 line-height 会覆盖父容器设置。
**修复**：字号改为任意值类 `text-[1rem]` / `text-[1.1rem]` / `text-[1.25rem]`，每个都附加 `leading-[inherit]` 显式继承父行距。
**教训**：需要精确控制 line-height 的场景必须用任意值类，不能依赖 Tailwind 预设字号。

### 6. animal-island-ui 的 Button primary 在自定义主题下可能不生效
**现象**：`<Button type="primary">` 没有渲染出主色背景，显示为默认幽灵按钮。
**根因**：animal-island-ui 的主题色实现可能与 Next.js 的 CSS 加载顺序或 Tailwind 冲突。
**修复**：关键按钮（如"开始阅读"）改用原生 `<button>` + 内联 Tailwind 颜色和 shadow（`bg-[#19c8b9]` `border-[#0fa597]` `shadow-[0_4px_0_0_#0fa597]`），"上一句"/"下一句"仍保留 `animal-island-ui` 的 `Button`。
**教训**：当组件库的主题色渲染异常时，可以对关键 CTA 用原生元素 + 显式颜色兜底。

### 7. 键盘导航会困在已聚焦的 radio/switch 上
**现象**：按方向键翻句时，如果焦点在 radio 或 switch 上，浏览器会先切换 radio 选项。
**根因**：浏览器默认行为优先于自定义 keydown 处理。
**修复**：在 `useKeyboardNavigation` 中，对导航键调用 `event.preventDefault()` 后，再对 `event.target` 执行 `blur()`，把焦点从控件上移除。
**教训**：全局键盘监听要同时处理默认行为和焦点管理。

### 8. Reading Store 持久化需要与 Config Store 使用相同的水合策略
**现象**：reading store 直接使用 `zustand/persist` 自动水合会导致 SSR/CSR 不一致。
**根因**：与 config store 相同，浏览器 `localStorage` 只在客户端可用。
**修复**：使用 `skipHydration: true` + `useHydrateReadingStore()` 手动 `rehydrate()`，`hasHydrated` 不放入 `partialize`。
**教训**：项目中所有带持久化的 Zustand store 都必须使用相同的水合策略。

### 9. URL 导入必须在服务端代理执行
**现象**：客户端直接 fetch 外部 URL 会被 CORS 策略阻止。
**根因**：浏览器同源策略限制跨域请求。
**修复**：新增 `/api/fetch-url` API 路由在服务端执行 fetch，客户端只调用同源 API。
**教训**：需要访问外部资源的操作应通过 Next.js API Routes 在服务端执行。

## 编码约定

- 命名规范：组件使用 PascalCase 文件名和导出名，如 `ReaderBoard.tsx`；Hook 使用 `useXxx`；工具函数和状态字段使用 camelCase。
- 代码风格：TypeScript 严格模式，使用单引号、2 空格缩进。
- 路径导入：优先使用 `@/` 路径别名，而不是复杂相对路径。
- 注释规范：注释整体较少，主要依靠清晰命名；当存在架构性约束时，优先写在 AGENTS.md。
- 面向用户语言：UI 文案以中文为主，少量英文标签如 `Paste Text`、`Other Options` 混用。
- 组件拆分约定：页面负责组合，复杂行为抽成 Hook，视觉重复单元抽成组件，纯逻辑留在 `src/lib/`。
- 状态管理约定：业务共享状态优先进 Zustand，不在多个组件里复制局部状态。
- 样式约定：优先使用 `animal-island-ui` 组件，Tailwind 负责布局和少量视觉补充，全局样式集中在 `src/app/globals.css`。
- SSR 约定：不要在渲染阶段引入非确定性逻辑；涉及浏览器 API 的逻辑放到 `useEffect` 或 client component 内处理。
- 动画约定：句子切换和高亮变化使用 Framer Motion，`layout` + `animate={{ opacity, scale }}` 实现平滑过渡。
- class 合并：使用 `cn()`（`clsx` + `tailwind-merge`）处理条件类名，尤其在动态样式和多模式组件中。

## 提交前检查清单

1. **`npm run lint` 是否通过？** → 当前仓库以 ESLint 作为主要静态检查。
2. **`npm run typecheck` 是否通过？** → TypeScript 严格模式下必须保证无类型错误。
3. **是否修改了持久化配置字段？** → 检查 `src/store/config-store.ts` 的 `partialize` 是否同步更新（内部状态如 `hasHydrated` 不要放入）。
4. **是否修改了阅读模式或分句逻辑？** → 手动验证 `lyrics` 和 `document` 两种模式都可正常滚动与高亮。
5. **是否引入了浏览器 API？** → 确认没有在 SSR 渲染阶段直接访问 `window`、`localStorage` 或随机值。
6. **是否新增了布局滚动容器？** → 检查是否会再次导致控制面板展开后主按钮不可达。
7. **是否改了 UI 组件的使用方式？** → 确认仍只从 `animal-island-ui` 根入口导入，且 `import 'animal-island-ui/style'` 只在 `src/app/layout.tsx` 导入一次。
8. **是否修改了影响 UI 的随机逻辑？** → 确保仍使用 `hashString`/`seededPercent` 等确定性方法，不能用 `Math.random()`。
9. **是否改了字号类？** → 确认仍使用任意值类 `text-[...rem] leading-[inherit]`，不能用 `text-lg`/`text-xl` 等预设类。
10. **是否需要更新文档？** → 如新增阅读模式、配置项或关键交互，更新 `AGENTS.md`、`readme.md` 中对应说明。
11. **是否修改了阅读进度持久化字段？** → 检查 `src/store/reading-store.ts` 的 `partialize` 是否同步更新（内部状态如 `hasHydrated` 不要放入）。
12. **是否修改了 API 路由？** → 确认 `/api/fetch-url` 的 URL 验证和超时设置合理。
