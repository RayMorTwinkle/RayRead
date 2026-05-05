# Tasks

- [x] Task 1: ParsedChunk 增加 endType 字段
  - [x] 1.1: 修改 `src/lib/parser.ts`，在 `ParsedChunk` 接口中增加 `endType: 'sentence' | 'clause' | 'paragraph'` 字段
  - [x] 1.2: 在 `parseTextToChunks` 中追踪原始段落边界，为每个 chunk 判定 endType
  - [x] 1.3: 判定逻辑：段落结尾（原始文本中该句后紧跟 `\n` 或是全文末尾）→ `'paragraph'`；句尾标点结尾 → `'sentence'`；分句标点结尾 → `'clause'`
  - [x] 1.4: 验证：`npm run typecheck` 通过

- [x] Task 2: 语义感知巡航节奏
  - [x] 2.1: 修改 `src/hooks/useAutoPlay.ts`，引入 `PAUSE_MULTIPLIERS` 常量 `{ sentence: 1.0, clause: 0.6, paragraph: 1.4 }`
  - [x] 2.2: 修改 duration 计算：`baseDuration * (PAUSE_MULTIPLIERS[currentChunk.endType] ?? 1.0)`
  - [x] 2.3: 验证：手动测试歌词模式和文稿模式下不同标点结尾的句子停顿时长差异

- [x] Task 3: 阅读进度保存
  - [x] 3.1: 修改 `src/store/reading-store.ts`，为 reading store 增加 `zustand/persist` 中间件
  - [x] 3.2: 使用 `skipHydration: true` + `partialize` 只持久化 `rawText` 和 `currentIndex`（chunks 不持久化，恢复时重新 parse）
  - [x] 3.3: 新增 `src/hooks/useHydrateReadingStore.ts`，在客户端手动调用 `rehydrate()`
  - [x] 3.4: 在 `RayReadApp.tsx` 中调用 `useHydrateReadingStore()`
  - [x] 3.5: 恢复逻辑：rehydrate 后如果 rawText 非空，自动调用 `parseText(rawText)` 重建 chunks，然后恢复 currentIndex
  - [x] 3.6: `clearText` 时同步清除 Local Storage 中的阅读进度
  - [x] 3.7: 验证：刷新页面后阅读位置恢复；清空文本后刷新不恢复

- [x] Task 4: 从文件导入
  - [x] 4.1: 在 `ReaderBoard.tsx` 中新增文件导入按钮（使用 `<input type="file" accept=".txt">`）
  - [x] 4.2: 实现 FileReader 读取 .txt 文件内容，调用 `parseText(content)`
  - [x] 4.3: 在阅读区域添加拖拽事件处理（onDragOver、onDrop），支持拖拽 .txt 文件导入
  - [x] 4.4: 拖拽时显示视觉反馈（边框高亮）
  - [x] 4.5: 非 .txt 文件显示提示"目前仅支持 .txt 文本文件"
  - [x] 4.6: 验证：选择文件和拖拽文件均可正常导入

- [x] Task 5: 从 URL 导入
  - [x] 5.1: 新增 `src/app/api/fetch-url/route.ts`，实现服务端代理抓取 URL 内容
  - [x] 5.2: API 逻辑：接收 URL 参数 → fetch 目标页面 → 使用正则提取 `<body>` 或 `<article>` 内的文本 → 去除 HTML 标签 → 返回纯文本
  - [x] 5.3: 在 `ReaderBoard.tsx` 中新增 URL 输入框和"导入"按钮
  - [x] 5.4: URL 验证：仅允许 http/https 协议，非法 URL 禁用导入按钮
  - [x] 5.5: 加载状态：导入过程中显示 loading 状态
  - [x] 5.6: 错误处理：抓取失败显示友好提示
  - [x] 5.7: 验证：粘贴 URL 可成功导入正文内容

- [x] Task 6: 阅读统计
  - [x] 6.1: 新增 `src/hooks/useReadingStats.ts`，追踪阅读时长、已读句数
  - [x] 6.2: 阅读时长：isPlaying 为 true 时累加计时，暂停时停止，使用 `useRef` + `useEffect` + `setInterval(1000)` 实现
  - [x] 6.3: 已读句数：取 `currentIndex + 1` 与上次记录的最大值比较，只增不减
  - [x] 6.4: 预估剩余时间：根据未读句子总字符数和 readingSpeed 计算
  - [x] 6.5: 在 `ControlPanel.tsx` 中新增阅读统计展示区，显示阅读时长（mm:ss）、已读/总句数、预估剩余时间
  - [x] 6.6: 清空文本时重置统计数据
  - [x] 6.7: 验证：播放时计时正常、暂停停止、预估时间合理

- [x] Task 7: 最终验证与文档更新
  - [x] 7.1: 运行 `npm run lint` 确保无 lint 错误
  - [x] 7.2: 运行 `npm run typecheck` 确保无类型错误
  - [x] 7.3: 运行 `npm run build` 确保构建成功
  - [x] 7.4: 手动验证歌词模式和文稿模式下所有新功能正常
  - [x] 7.5: 更新 `AGENTS.md` 中相关说明（新增的文件、修改的数据模型、新增的踩坑记录）
  - [x] 7.6: 更新 `readme.md` 中的功能特点和使用方式

# Task Dependencies

- [Task 2] depends on [Task 1] (useAutoPlay 需要 ParsedChunk.endType)
- [Task 3] depends on [Task 1] (阅读进度恢复需要重新 parse 得到带 endType 的 chunks)
- [Task 6] depends on [Task 1] (阅读统计的已读句数依赖 chunks)
- [Task 4] and [Task 5] 可并行
- [Task 7] depends on all other tasks
