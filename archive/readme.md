**[目标平台与技术栈]**
* **核心框架**：Next.js 14+ (App Router, 严格模式)
* **语言**：TypeScript (开启 `strict: true`，禁用 `any`)
* **样式体系**：`animal-island-ui` 组件库为主（保留 Tailwind CSS + Tailwind Merge + clsx 作为布局与补充）
* **全局状态管理**：Zustand + `zustand/middleware` (`persist` 持久化用户偏好)
* **动画与平滑过渡**：Framer Motion (用于文本的透明度渐变与焦点平滑滚动)
* **图标库**：Lucide React

**[核心数据结构与状态机]**
必须拆分为“阅读数据流”和“配置偏好”两个 Zustand Store，严禁将静态配置写死在组件中。

```typescript
// 核心状态必须包含以下定义，必须处理 Zustand Persist 导致的 Hydration 报错
interface AppConfigState {
  readingSpeed: number; // 自动播放速度，单位：字符/秒 (默认: 10)
  colorPalette: 'morandi' | 'macaron' | 'high-contrast'; // 当前色彩池
  enableDopamine: boolean; // 是否开启多巴胺随机样式
  enableFocus: boolean; // 是否开启沉浸高亮模式
  setTheme: (theme: AppConfigState['colorPalette']) => void;
  // ...其他 setter
}

interface ReadingState {
  rawText: string;
  chunks: ParsedChunk[]; // 切分后的文本块集合
  currentIndex: number; // 当前高亮句子的索引
  isPlaying: boolean; // 是否处于自动巡航状态
  parseText: (text: string) => void;
  nextChunk: () => void;
  prevChunk: () => void;
  togglePlay: () => void;
}

interface ParsedChunk {
  id: string; // 基于原文内容计算的 hash，用于 React Key
  text: string;
  length: number;
}
```

**[UI 开发前阅读与约束]**
在编写 UI 前，必须先阅读并遵循以下文档：
* `/Users/ray/Documents/Fork/LITTLEPRO/RayRead/SKILL.md`
* `/Users/ray/Documents/Fork/LITTLEPRO/RayRead/DESIGN_PROMPT.md`
* `/Users/ray/Documents/Fork/LITTLEPRO/RayRead/AI_USAGE.md`

UI 实施时必须注意：
* 在应用入口仅导入一次 `import 'animal-island-ui/style'`。
* 仅从 `animal-island-ui` 根导入组件与类型，不使用 deep import。
* 组件优先使用 `Button/Input/Switch/Card/Collapse/Modal/Divider/Footer/Cursor/Typewriter` 完成界面，不额外手写一套冲突视觉系统。
* 保持 SSR 安全：UI 渲染阶段不引入非确定性随机行为，避免 hydration mismatch。

**[UI 布局与视觉风格]**
界面风格统一为 `animal-island-ui`（动物森友会风格），但保留 RayRead 原计划的工作区结构与控件位置。
* **根容器**：保持 `h-screen w-full flex items-center justify-center p-8` 的整屏居中布局，背景、字体、装饰细节以 `animal-island-ui` 风格为准。
* **主工作区**：保持 `max-w-6xl w-full h-[85vh] flex gap-6`，用于固定阅读区与控制面板的空间关系。
* **左侧阅读区**：保持 `flex-1 p-8 relative overflow-hidden flex flex-col`，作为文本输入、解析结果与焦点阅读的主区域；外观优先使用 `Card` 等 `animal-island-ui` 组件承载。
* **右侧控制面板区**：保持 `w-[280px] flex flex-col gap-6`，主操作按钮仍位于顶部，参数调节区位于其下方并占据剩余空间。
* **开始/主操作按钮**：保持顶部大按钮的位置和约 `h-[100px] w-full` 的视觉权重，具体按钮样式使用 `animal-island-ui` 的 `Button`。
* **Other Options 参数区**：保持右侧下方的配置面板位置，用 `Card/Collapse/Switch/Input` 等组件组织滑动条、单选项和开关。
* 具体视觉细节（圆角、配色、阴影、字体、组件态）以 `animal-island-ui` 默认样式和文档规范为准；Tailwind 仅用于布局、间距和必要的响应式补充。

**[多巴胺/特效引擎数学模型]**
严禁在 React 渲染阶段（Render Phase）直接调用 `Math.random()`，这会导致 Next.js 的 SSR Hydration Mismatch 致命报错。
* **确定性随机算法**：必须编写一个基于文本内容和 Index 的 Hash 函数生成伪随机种子（例如：`hash(chunk.text + index) % max`），确保服务端渲染与客户端渲染的样式属性百分之百一致。
* **样式随机池与权重分配**：
    * **字号 (Size)**：`text-lg` (权重 60%), `text-xl` (权重 25%), `text-2xl` (权重 15%)。
    * **字重 (Weight)**：`font-normal` (权重 70%), `font-bold` (权重 30%)。
    * **色彩池 (Palettes)**：
        * *Macaron*：`['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF']`
        * *Morandi*：`['#E9E5CE', '#D2CDBB', '#A2A595', '#B5A8A4', '#E1DCD9']`
    * **装饰 (Decoration)**：下划线 (`underline`) 概率 10%，背景高亮色 (`bg-opacity-40`) 概率 20%。

**[核心交互与逻辑链路]**
1.  **文本切分引擎 (Text Parser)**：
    * 用户在左侧粘贴文本后，使用正则表达式按中英文标点 `([。！？.!?]+)` 切分文本。切分必须保留原标点符号。
2.  **焦点引擎与滚动劫持 (Focus & Scroll)**：
    * 当前 `currentIndex` 对应的文本块应用 `opacity-100` 并使用 Framer Motion 放大 `scale: 1.05`。
    * 其余所有块应用 `opacity-30`，`scale: 1`。
    * **必须实现**：使用 `React.useRef` 获取当前活动元素的 DOM，当 `currentIndex` 变化时，调用 `element.scrollIntoView({ behavior: 'smooth', block: 'center' })`，确保视线始终聚焦在屏幕中央区域。
3.  **键盘劫持与巡航控制**：
    * 注册全局 `keydown` 事件。`ArrowRight` / `Space` -> 下一句；`ArrowLeft` -> 上一句。**必须调用 `e.preventDefault()` 阻止 Space 键默认的页面滚动行为**。
    * 自动巡航逻辑：通过 `useEffect` 设置计时器。动态计算当前块停留时间公式：`停留毫秒 = (chunk.text.length / config.readingSpeed) * 1000`。

**[工程化与构建要求]**
必须采用高度模块化的目录结构：
* `/src/lib/utils.ts`：放置 `cn` (Tailwind Merge)、确定性伪随机数生成器。
* `/src/lib/parser.ts`：纯函数，存放文本切分正则与逻辑，必须包含完整的 TypeScript 类型推导。
* `/src/store/`：Zustand 状态定义。
* `/src/components/ReaderBoard/`：左侧核心阅读区组件，进一步拆分为 `ChunkItem.tsx`。
* `/src/components/ControlPanel/`：右侧配置面板，受控组件必须与 Zustand Store 深度绑定。
* **严禁大组件**：所有功能必须抽离成 Custom Hooks（如 `useKeyboardNavigation`、`useAutoPlay`），保持 UI 组件纯粹。
