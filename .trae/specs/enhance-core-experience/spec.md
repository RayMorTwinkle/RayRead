# 核心体验增强 Spec

## Why

RayRead 当前的阅读体验存在两个关键断裂点：刷新页面后阅读进度完全丢失，自动巡航对所有标点一视同仁导致节奏僵硬。同时，内容输入方式单一（仅支持粘贴），缺乏阅读反馈机制。这四个问题让产品感觉"还没到位"，需要先解决核心体验再考虑扩展形式。

## What Changes

- **阅读进度保存**：将 `rawText`、`currentIndex` 持久化到 Local Storage，刷新后自动恢复阅读位置
- **语义感知巡航节奏**：根据句子末尾标点类型（句号/问号/感叹号 vs 逗号/顿号/分号 vs 段落结尾）计算不同停留时长
- **从 URL/文件导入**：支持粘贴 URL 通过服务端代理抓取正文、支持拖拽/选择 TXT 文件导入
- **阅读统计**：记录本次阅读时长、已读句数/总句数、平均阅读速度，在控制面板展示

## Impact

- Affected code:
  - `src/store/reading-store.ts` — 新增持久化逻辑
  - `src/hooks/useAutoPlay.ts` — 修改 duration 计算公式
  - `src/lib/parser.ts` — ParsedChunk 增加 punctuation 类型标记
  - `src/components/ReaderBoard/ReaderBoard.tsx` — 新增 URL 输入和文件导入 UI
  - `src/components/ControlPanel/ControlPanel.tsx` — 新增阅读统计展示区
  - `src/app/api/fetch-url/route.ts` — 新增 API 路由（URL 代理抓取）
  - `src/hooks/useReadingStats.ts` — 新增阅读统计 Hook

---

## ADDED Requirements

### Requirement: 阅读进度保存

系统 SHALL 将阅读状态（rawText、currentIndex）持久化到浏览器 Local Storage，并在页面加载时自动恢复。

#### Scenario: 用户刷新页面后恢复阅读位置
- **WHEN** 用户正在阅读第 N 句并刷新页面
- **THEN** 页面重新加载后自动恢复 rawText 和 currentIndex，用户停留在第 N 句

#### Scenario: 用户清空文本时清除进度
- **WHEN** 用户点击"清空"按钮
- **THEN** Local Storage 中的阅读进度数据被清除

#### Scenario: 首次访问无历史数据
- **WHEN** 用户首次访问 RayRead
- **THEN** 阅读区域显示空状态，不尝试恢复任何数据

#### Scenario: 持久化数据与配置水合一致
- **WHEN** 页面加载时同时恢复配置和阅读进度
- **THEN** 阅读进度的恢复不引发 SSR/CSR hydration mismatch，使用与 config-store 相同的 skipHydration + 手动 rehydrate 策略

---

### Requirement: 语义感知巡航节奏

系统 SHALL 根据句子末尾标点类型调整自动巡航的停留时长，使阅读节奏更自然。

#### Scenario: 句号/问号/感叹号结尾的句子
- **WHEN** 当前句以 `。！？.!?` 结尾
- **THEN** 停留时长 = 基础时长 × 1.0（标准停顿）

#### Scenario: 逗号/顿号/分号结尾的分句
- **WHEN** 当前句以 `，、；,;` 结尾
- **THEN** 停留时长 = 基础时长 × 0.6（短停顿，分句间节奏更快）

#### Scenario: 段落结尾的句子
- **WHEN** 当前句是某个原始段落的最后一句（原始文本中该句后紧跟换行符）
- **THEN** 停留时长 = 基础时长 × 1.4（段落间长停顿）

#### Scenario: 基础时长计算不变
- **WHEN** 计算基础时长
- **THEN** 公式仍为 `Math.max(700, (chunk.text.length / readingSpeed) * 1000)`

#### Scenario: ParsedChunk 携带标点类型信息
- **WHEN** parser 切分文本生成 ParsedChunk
- **THEN** 每个 chunk 包含 `endType` 字段，值为 `'sentence'` | `'clause'` | `'paragraph'`，供 useAutoPlay 消费

---

### Requirement: 从 URL 导入文本

系统 SHALL 支持用户粘贴网页 URL，通过服务端代理抓取正文内容并导入阅读。

#### Scenario: 用户粘贴有效 URL
- **WHEN** 用户在 URL 输入框粘贴一个有效的 HTTP/HTTPS URL 并点击"导入"
- **THEN** 系统通过服务端 API 代理抓取该 URL 的正文内容，自动填入阅读区域并开始切句

#### Scenario: URL 抓取失败
- **WHEN** URL 无法访问或内容提取失败
- **THEN** 显示友好的错误提示"无法获取该网页内容，请尝试直接粘贴文本"

#### Scenario: URL 输入验证
- **WHEN** 用户输入的文本不是有效的 HTTP/HTTPS URL
- **THEN** 导入按钮处于禁用状态

---

### Requirement: 从文件导入文本

系统 SHALL 支持用户通过拖拽或文件选择器导入 TXT 文件内容。

#### Scenario: 用户选择 TXT 文件
- **WHEN** 用户点击文件选择按钮并选择一个 .txt 文件
- **THEN** 文件内容自动读入阅读区域并开始切句

#### Scenario: 用户拖拽 TXT 文件到阅读区域
- **WHEN** 用户将 .txt 文件拖拽到阅读区域
- **THEN** 文件内容自动读入阅读区域并开始切句，并显示拖拽视觉反馈

#### Scenario: 非文本文件
- **WHEN** 用户选择或拖拽非 .txt 文件
- **THEN** 显示提示"目前仅支持 .txt 文本文件"

---

### Requirement: 阅读统计

系统 SHALL 记录并展示当前阅读会话的统计数据。

#### Scenario: 展示阅读统计
- **WHEN** 用户开始阅读（isPlaying 为 true）
- **THEN** 控制面板显示：本次阅读时长（mm:ss 格式）、已读句数/总句数、预估剩余时间

#### Scenario: 阅读时长计时
- **WHEN** isPlaying 为 true 时
- **THEN** 阅读时长持续累加；暂停时停止计时；继续播放时继续累加

#### Scenario: 预估剩余时间
- **WHEN** 用户正在阅读
- **THEN** 根据剩余未读句子的总字符数和当前阅读速度，预估剩余阅读时间

#### Scenario: 清空文本时重置统计
- **WHEN** 用户点击"清空"
- **THEN** 阅读统计数据重置为零

---

## MODIFIED Requirements

### Requirement: ParsedChunk 数据结构

原有 `ParsedChunk` 接口为 `{ id: string; text: string; length: number }`。

修改为 `{ id: string; text: string; length: number; endType: 'sentence' | 'clause' | 'paragraph' }`。

`endType` 判定逻辑：
- `'paragraph'`：该 chunk 是原始文本中某个段落的最后一个分句（原始文本中该句后紧跟 `\n` 或是全文最后一句）
- `'sentence'`：该 chunk 以句尾标点（`。！？.!?`）结尾但不是段落结尾
- `'clause'`：该 chunk 以分句标点（`，、；,;`）结尾

### Requirement: useAutoPlay Hook

原有 duration 计算：`Math.max(700, (currentChunk.text.length / readingSpeed) * 1000)`

修改为：
```
const baseDuration = Math.max(700, (currentChunk.text.length / readingSpeed) * 1000)
const PAUSE_MULTIPLIERS = { sentence: 1.0, clause: 0.6, paragraph: 1.4 }
const duration = baseDuration * (PAUSE_MULTIPLIERS[currentChunk.endType] ?? 1.0)
```

## REMOVED Requirements

无移除的需求。
