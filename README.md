# PubMed IA Scholar Helper

一个基于 `Manifest V3` 的 Chrome 扩展。

它只做一件事：在 PubMed 文献详情页里读取 DOI，然后在页面右侧插入一个 `Internet Archive Scholar` 按钮，点击后用 `POST` 请求打开 `https://scholar.archive.org/search`，查询语句固定为 `doi:<DOI>`。

## 项目目标

- 从 PubMed 页面自动提取 DOI
- 在合适的位置插入一个简洁的搜索入口
- 没有 DOI 时自动禁用按钮，避免无效请求
- 不增加多余的权限、页面和交互

## 当前能力

- 只支持 PubMed 文章详情页
- 只读取 DOI，不读取标题、PMID 或作者等其他字段
- 不提供设置页、弹窗页和后台页
- 不需要额外权限

## 目录结构

当前仓库是一个最小可用的 Chrome 扩展，结构如下：

```text
PubMed-IA-Scholar-Helper/
├── manifest.json   # 扩展声明文件
├── content.js      # 内容脚本，负责读取 DOI 和注入按钮
├── content.css     # 内容脚本样式
└── README.md       # 项目说明
```

如果后续要继续扩展，比较常见的 Chrome 扩展结构可以拆成：

```text
src/
├── content/
├── popup/
├── options/
├── background/
└── assets/
```

但就当前功能来说，没有必要提前拆分。

## 工作方式

插件在 `https://pubmed.ncbi.nlm.nih.gov/*` 页面上注入内容脚本。

脚本会按下面的顺序处理：

1. 等待页面加载完成
2. 尝试读取 `meta[name="citation_doi"]`
3. 如果没有找到，再从页面里的 DOI 链接里补充读取
4. 把 DOI 规范化成 `10.xxxx/...` 形式
5. 在 `Full text links`、`full-view-sidebar` 或 `article-actions` 附近插入按钮
6. 如果页面没有 DOI，按钮会禁用

按钮提交的是一个隐藏表单，使用 `POST` 打开 IA Scholar 新标签页，避免把 DOI 拼到地址栏里。

## 安装方法

1. 打开 Chrome
2. 进入 `chrome://extensions`
3. 打开右上角 `Developer mode`
4. 点击 `Load unpacked`
5. 选择本仓库目录

## 使用方法

1. 打开任意 PubMed 文献详情页
2. 找到右侧插入的 `Find in Internet Archive Scholar`
3. 点击按钮
4. 浏览器会在新标签页中打开 IA Scholar 搜索结果

如果页面没有 DOI，按钮会显示为禁用状态。

## 测试地址

可以用下面这个页面验证：

- `https://pubmed.ncbi.nlm.nih.gov/30110311/`

正常情况下，页面右侧会出现一个简洁卡片，显示 DOI，并提供搜索按钮。

## 代码说明

### `manifest.json`

- 使用 `manifest_version: 3`
- 只注入 `content.js` 和 `content.css`
- 只匹配 PubMed 域名

### `content.js`

- 创建和维护页面上的卡片
- 读取 DOI
- 将 DOI 传给 IA Scholar 搜索表单
- 在页面结构变化时重新挂载卡片

### `content.css`

- 定义卡片的基础样式
- 处理固定定位状态
- 控制按钮、提示文案和 DOI 标签的视觉样式

## 设计原则

这个项目刻意保持简单：

- 只做一个入口
- 只处理一个站点
- 只依赖内容脚本
- 只保留必要状态

这样做的目的，是让扩展更容易维护，也更不容易和 PubMed 页面本身的结构冲突。

## 已知限制

- PubMed 页面结构变化后，插入位置可能需要调整
- 当前只支持 DOI 这一路径
- 当前没有独立配置项，查询逻辑是固定的

## 许可

如需补充许可证文件，可以在仓库根目录新增 `LICENSE`。
