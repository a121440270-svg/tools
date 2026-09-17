---
name: tools-style-rules
description: "Use when: 检查 tools 项目脚本风格与提交规范"
applyTo: ["src/**", "scripts/**"]
---

- 脚本风格：遵循项目 eslint/tsconfig 规则，Node 脚本使用 `#!/usr/bin/env node`。
- 提交信息：使用 Conventional Commits（feat|fix|chore）。
- 发布脚本：放在 `scripts/release.sh` 并在说明里标明权限需求。
