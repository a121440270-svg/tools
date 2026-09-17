---
name: release-helper
description: "Use when: tools 项目准备发布 / 生成 changelog"
---

步骤：
1. 更新 `CHANGELOG.md` 或 `CHANGELOG/latest.md`
2. 在 `scripts/` 下运行 `pnpm build` 并验证输出
3. 运行 `pnpm publish`（或触发 CI 发布）

资产建议：
- scripts/release.sh
- templates/release-notes.md
