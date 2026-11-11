@rem switchenvbk.bat - ARCHIVE: copy the slot's token back into tools.toml, but ONLY after
@rem verifying it belongs to this project's account (refuses on mismatch). To switch this
@rem project to a different account, use: node scripts\wrangler-refresh.mjs --adopt
@node "%~dp0scripts\wrangler-refresh.mjs" --archive
