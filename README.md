<div align="center">
 <img width="200" height="200" alt="logo" src="https://github.com/user-attachments/assets/431cf92d-d8e6-4be7-a5b6-642ed6ab9898" />

# qbitwebui-cn (全界面汉化版)

### 适配多 qBittorrent 实例的现代 Web 管理界面

本项目 fork 自 [Maciejonos/qbitwebui](https://github.com/Maciejonos/qbitwebui)，并在其基础上进行了深度汉化。

[![GitHub stars](https://img.shields.io/github/stars/pipi20xx/qbitwebui-cn?style=for-the-badge&labelColor=101418&color=9ccbfb)](https://github.com/pipi20xx/qbitwebui-cn/stargazers)
[![GitHub License](https://img.shields.io/github/license/Maciejonos/qbitwebui?style=for-the-badge&labelColor=101418&color=abedd5)](https://github.com/Maciejonos/qbitwebui/blob/master/LICENSE)
[![Upstream Sync](https://img.shields.io/badge/Upstream-v2.42.3-blue?style=for-the-badge&labelColor=101418)](https://github.com/Maciejonos/qbitwebui)

**[官方文档](https://maciejonos.github.io/qbitwebui/)** · **[功能列表](https://maciejonos.github.io/qbitwebui/guide/features)**

</div>

---

## 🌏 汉化说明

本仓库致力于提供 **qbitwebui** 的完整中文本地化体验。与官方版本相比，主要改进如下：

- **全界面汉化**：包括桌面端和移动端的所有菜单、设置、工具栏及弹出对话框。
- **深度适配**：不仅汉化了静态文字，还对动态加载的统计周期（如“15 分钟”、“累计总量”）进行了 Hook 层面的中文适配。
- **外挂式架构**：采用非侵入式汉化方案，通过 `locales/` 目录进行覆盖，方便同步上游更新而不破坏汉化成果。

### 📌 当前同步信息
- **上游版本**：`v2.42.3`
- **同步日期**：2026-02-20
- **上游最后提交**：`f371eb7` (2026-02-15)

---

## ✨ 核心功能

- **多实例管理**：在一个仪表盘中同时管理多个 qBittorrent 实例。
- **辅种管理 (Cross Seed)**：直接在 UI 中配置和监控自动辅种功能（实验性）。
- **传输统计**：多维度的上传/下载流量统计，支持按实例和周期查看。
- **Prowlarr 集成**：集成索引器搜索，一键推送到指定的 qBittorrent 实例。
- **实时监控**：自动刷新种子状态、进度及速度，无需手动刷新页面。
- **自定义布局**：支持列显示/隐藏及拖拽排序。
- **文件浏览器**：支持远程浏览、重命名、移动及下载种子对应的文件。
- **网络工具箱**：内置 Speedtest、IP 检测、DNS 诊断等实用工具。

---

## 🐳 Docker 部署 (推荐)

可以直接使用预编译的汉化版镜像进行部署：

```yaml
services:
  qbitwebui:
    image: pipi20xx/qbitwebui-cn:latest
    container_name: qbitwebui-cn
    ports:
      - "3200:3000"
    environment:
      - TZ=Asia/Shanghai
      # 必填：用于加密存储的实例凭据 (openssl rand -hex 32)
      - ENCRYPTION_KEY=your-32-character-secret-key-here
      # 可选：如果你想使用文件浏览器，请取消下面注释并挂载目录
      # - DOWNLOADS_PATH=/downloads
      # 可选：允许自签名 SSL 证书 (连接 HTTPS 实例时可能需要)
      # - ALLOW_SELF_SIGNED_CERTS=true
      # 可选：设置为 true 时，将禁用登录验证（打开网页直接进入）
      # - DISABLE_AUTH=true
    volumes:
      - ./data:/data
      # 可选：挂载下载目录 (与 DOWNLOADS_PATH 配合使用)
      # - /path/to/your/downloads:/downloads
    restart: unless-stopped
```

如果您想基于源码自行构建：
```bash
docker compose up -d --build
```

---

## 🛠 开发与贡献

如果您发现了翻译错误或有更好的建议，欢迎提交 Pull Request。

```bash
# 生成加密密钥
export ENCRYPTION_KEY=$(openssl rand -hex 32)

bun install
bun run dev
```

## ⚖️ 许可

基于 MIT 许可证开源。

## 致谢

感谢 [Maciejonos/qbitwebui](https://github.com/Maciejonos/qbitwebui) 提供的优秀项目基础。
感谢 [cross-seed](https://github.com/cross-seed/cross-seed) 为辅种逻辑提供的灵感与参考。