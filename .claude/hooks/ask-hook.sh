#!/bin/bash
# Claude Code PreToolUse(AskUserQuestion) 훅 래퍼 — 질문 시점 알림
exec node "$(dirname "$0")/_lib/slack-notify.mjs" ask
