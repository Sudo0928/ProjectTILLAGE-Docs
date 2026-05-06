#!/bin/bash
# Claude Code Stop 훅 래퍼 — 작업 완료 알림 (실 처리는 _lib/slack-notify.mjs)
exec node "$(dirname "$0")/_lib/slack-notify.mjs" stop
