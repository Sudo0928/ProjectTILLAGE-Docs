#!/bin/bash
# Claude Code Notification 훅 래퍼
# 권한 요청 / 입력 대기 알림을 Slack으로 전송 (실 처리는 _lib/slack-notify.mjs)
exec node "$(dirname "$0")/_lib/slack-notify.mjs" notification
