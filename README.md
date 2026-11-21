# 3D Magic Christmas Tree & Polaroid Postcard Gallery

> 零构建工具、零外部首屏依赖的 3D 交互式粒子圣诞树与拍立得明信片相册（`Three.js` + `Canvas 2D` + `Web Audio API` + 可选 `MediaPipe Hands`）。

**在线体验（Live Demo）**

- 中文站（国内访问）：[https://simplemkt.cn/zh/lab/christmas-tree-3d/](https://simplemkt.cn/zh/lab/christmas-tree-3d/)
- International（Global）：[https://simplemkt.cc/en/lab/christmas-tree-3d/](https://simplemkt.cc/en/lab/christmas-tree-3d/)

开箱即用，支持直接部署至 **GitHub Pages** 或任意静态站点目录。

---

## 核心特性

- **4 款节日主题一键切换**：经典翡翠金（Classic）、冰雪极光晶（Aurora）、糖果游乐园（Candy）、赛博霓虹星（Cyber），包含视差氛围背景、4,500 颗粒子圣诞树、3D 金属丝带、双螺旋跑马灯、萤火虫、雪地礼盒与主题色 3D 烟花。
- **实体质感拍立得与明信片翻转**：
  - 默认内置 12 张 AI 生成的冬日圣诞胶片风示例照片（无真人肖像、无第三方版权风险，并保留程序化插画作为加载占位兜底），搭配棉质相纸纹理、烫金双线框、金属厚度切边、悬停 3D 磁吸微倾与动态流光。
  - 点击「五指炸裂」展开 3D 弧形照片墙后，点击居中卡片可触发 **二阶阻尼弹簧 180° 翻转**，查看带火漆印章的圣诞明信片背面。
- **零外部音频文件的 Web Audio 合成器**：内置 3 首多声部圣诞编曲与 5 种交互微音效（点击开场按钮「开启圣诞魔法」后开始播放），并支持点击左上角 **「选歌」** 导入本地 MP3/WAV 循环播放。
- **键鼠 / 触屏全兼容 + 可选摄像头手势**：
  - 鼠标拖拽旋转、滚轮/双指缩放、双击天空放烟花、键盘方向键切图 / 空格展开收起 / 回车翻转明信片。
  - 点击右上角 **OPEN** 可按需开启摄像头手势：五指张开炸裂、左右挥手翻页、握拳还原圣诞树、单指拨动加速旋转。

---

## 隐私与离线说明

- **本地处理、绝不上传**：通过「换照片」「选歌」加载的本地图片与音频，以及开启摄像头后的视频画面，均仅在你的浏览器本地内存中运行，**不会上传至任何服务器**。
- **零首屏外部 CDN 依赖**：核心 3D 引擎 `vendor/three.min.js`（Three.js r128，MIT 许可）已内置于仓库，无外部 Google Fonts 阻塞请求，在中国大陆及离线局域网环境下亦可秒开。仅在用户主动点击右上角 **OPEN** 启用摄像头手势时，才按需从公共 CDN 拉取 MediaPipe Hands 模型（可在 `src/config.js` 的 `MEDIAPIPE_CDN_BASES` 中替换为自有镜像）。

---

## 快速运行

本项目使用浏览器原生 `ES Module`，无需 `npm install` 或打包构建。请通过任意本地静态 HTTP 服务访问（勿直接双击 `file://` 打开）：

```bash
# 方式一（推荐）：使用内置零依赖 Node 服务（需 Node.js 18+）
node server.mjs
# 或 npm start

# 方式二：使用 Python 一行启动
python3 -m http.server 4186
```

启动后在浏览器访问 `http://127.0.0.1:4186` 即可体验。

### 部署至 GitHub Pages

1. 将本仓库推送至 GitHub。
2. 进入仓库 **Settings -> Pages**。
3. 在 **Build and deployment -> Source** 中选择 `Deploy from a branch`，分支选 `main`、目录选 `/ (root)`，保存后等待约 1 分钟即可通过 `https://<username>.github.io/<repo>/` 访问（HTTPS 环境下可正常启用摄像头手势）。

---

## 自定义照片与寄语

- **网页内快速替换（纯本机存储，刷新不丢失）**：
  - **拖入 / 粘贴即换**：直接把本地图片拖进网页任意位置，或复制图片后按 `Cmd+V` / `Ctrl+V` 即可装入拍立得相册（按序替换前 N 张并保留其余圣诞示例照，不再重复铺满）。
  - **可视化相册管理面板**：点击底部 **「换照片」** 打开 12 格缩略图相册，支持批量导入、单张换图/还原、实时编辑每张拍立得的正面标题与背面明信片寄语，以及一键恢复默认示例照；展开照片墙后也可点击居中卡片下方的 **「换这张」** 快速替换。
  - 所有自定义图片均经浏览器本地压缩并保存在当前浏览器的 `IndexedDB` 中，绝不上传任何服务器。
- **永久替换仓库默认相册**：
  1. 将允许公开的图片放入 `assets/photos/`（如 `photo_01.jpg`）。
  2. 编辑 `src/config.js` 中的 `DEFAULT_PHOTOS`，为条目配置 `src`、`caption`（正面标题）和 `wish`（背面明信片寄语）：
     ```js
     { src: './assets/photos/photo_01.jpg', caption: 'Winter Walk', wish: '愿这个冬天温暖而明亮。' }
     ```

---

## 项目结构

```text
.
├── index.html              # 语义化页面骨架与控件入口
├── styles/
│   └── main.css            # 4 套主题变量、玻璃拟态 UI 与响应式样式
├── src/
│   ├── config.js           # 默认相册、4 套主题、3 首内置曲目与手势 CDN 配置
│   ├── state.js            # 弹簧物理与交互共享状态
│   ├── scene.js            # Three.js 场景、粒子树、挂件、雪花、烟花与显存释放
│   ├── polaroid-art.js     # 12 张原创程序化冬日插画占位渲染器
│   ├── polaroids.js        # 3D 拍立得正反面纹理、单卡局部刷新与弹簧翻转动画
│   ├── gallery-store.js    # 客户端图片压缩与 IndexedDB 本机相册持久化
│   ├── gallery-editor.js   # 相册管理抽屉、全局拖拽/粘贴换图与寄语实时编辑
│   ├── audio.js            # Web Audio 多声部合成器与本地音频播放
│   ├── stardust.js         # 2D 指针星尘拖尾画布
│   ├── gestures.js         # 可选 MediaPipe Hands 摄像头手势识别
│   └── main.js             # 交互编排、射线拾取与主动画循环
├── vendor/
│   ├── three.min.js        # 内置 Three.js r128
│   └── THREE.LICENSE       # Three.js MIT 许可归属
├── assets/
│   ├── brand/              # SimpleMkt 获批反白字标（归属声明见 LICENSE）
│   ├── bg/                 # 圣诞雪村与北欧极光视差氛围底图
│   └── photos/             # 12 张 AI 生成的冬日圣诞胶片风示例照片（photo_01.jpg ~ photo_12.jpg）
├── server.mjs              # 零依赖本地静态预览服务器
├── package.json            # 项目元信息与启动脚本
└── LICENSE                 # MIT 开源许可
```

---

## 开源许可与致谢

- 本项目源码及示例节庆图采用 [MIT License](LICENSE) 开源；`assets/brand/` 下的 SimpleMkt 品牌字标仅用于官方演示与署名，二次分发或部署为自有品牌时请按 [LICENSE](LICENSE) 说明替换为你的品牌资产（集中配置于 `src/config.js` 的 `BRAND_CONFIG`）。
- `vendor/three.min.js` 为 Three.js r128，遵循其原有 [MIT License](vendor/THREE.LICENSE)。
