@rem switchenv.bat - ACTIVATE: put THIS project's account token (tools.toml) into wrangler's
@rem slot (~/.wrangler/config/default.toml), refreshing it first if needed. Safe with multi-account.
@node "%~dp0scripts\wrangler-refresh.mjs"
