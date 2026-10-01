# Nuxt Workres

## WeChat tool notifications

Set the Cloudflare Worker secrets `WECHAT_APP_ID`, `WECHAT_APP_SECRET`, `WECHAT_OPENID`, and `WECHAT_TEMPLATE_ID`. Apply the D1 migration with `npx wrangler d1 migrations apply tools --remote`. The access token is cached in D1 until five minutes before its WeChat expiry.

[公式ドキュメントを参考に作成](https://developers.cloudflare.com/workers/frameworks/framework-guides/nuxt/)

## How to make

```zsh
# 1. プロジェクトを作成
npm create cloudflare@latest my-nuxt-app -- --framework=nuxt --experimental
# → 実行後に./my-nuxt-app内のファイルをルートディレクトリに移動された

# 2. デプロイ
npm run deploy
```
