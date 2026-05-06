#!/usr/bin/env node
// Claude Code → Slack 알림 통합 핸들러
// 사용법: node slack-notify.mjs <type>
//   type: notification | stop | ask
// stdin: Claude Code hook payload JSON
// env:  SLACK_WEBHOOK_URL (없으면 조용히 skip)
//
// 실패해도 항상 exit 0 — Claude Code 작업 흐름을 절대 막지 않는다.

import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

const TYPE = process.argv[2] || 'notification';
const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const PROJECT = basename(PROJECT_DIR);
const PROJECT_UPPER = PROJECT.toUpperCase();

function loadDotenv() {
  if (process.env.SLACK_WEBHOOK_URL) return;
  try {
    const raw = readFileSync(`${PROJECT_DIR}/.env`, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let val = m[2];
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!(m[1] in process.env)) process.env[m[1]] = val;
    }
  } catch {
    // .env 없음 — 진행하면서 webhook url 체크에서 잡힘
  }
}

function readStdin() {
  try {
    return readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function parseInput() {
  const raw = readStdin();
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch (e) {
    process.stderr.write(`[slack-notify] invalid JSON on stdin: ${e.message}\n`);
    return {};
  }
}

function buildBlocks(input) {
  const message = input.message ?? '';
  const session = (input.session_id ?? '').toString().slice(0, 8);

  let header;
  let body;

  if (TYPE === 'stop') {
    if (input.stop_hook_active === true) return null; // 무한루프 방지
    header = `✅ [${PROJECT_UPPER}] 작업 완료`;
    body = 'Claude 응답이 종료되었습니다.';
  } else if (TYPE === 'ask') {
    const questions = input?.tool_input?.questions ?? [];
    const first = questions[0]?.question ?? '사용자에게 질문 중';
    const rest = questions.length > 1 ? `\n\n_(외 ${questions.length - 1}개 질문)_` : '';
    header = `❓ [${PROJECT_UPPER}] 질문 대기`;
    body = `${first}${rest}`;
  } else {
    // notification: 권한 요청만 알림. 그 외(입력 대기/idle 등)는 skip
    if (!/permission|approval|approve/i.test(message)) return null;
    header = `🔔 [${PROJECT_UPPER}] 권한 요청`;
    body = message || 'Claude가 도구 사용 권한을 요청합니다.';
  }

  const ts = new Date().toLocaleString('sv-SE', { hour12: false }).replace('T', ' ');
  const ctx = [
    `📂 ${PROJECT}`,
    `🕒 ${ts}`,
    session ? `session \`${session}\`` : null,
  ].filter(Boolean).join('  •  ');

  return {
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: header, emoji: true } },
      { type: 'section', text: { type: 'mrkdwn', text: body } },
      { type: 'context', elements: [{ type: 'mrkdwn', text: ctx }] },
    ],
  };
}

async function main() {
  loadDotenv();
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) {
    process.stderr.write('[slack-notify] SLACK_WEBHOOK_URL not set, skipping\n');
    return;
  }

  const input = parseInput();
  const payload = buildBlocks(input);
  if (payload === null) return; // stop_hook_active 가드

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      process.stderr.write(`[slack-notify] HTTP ${res.status}: ${txt.slice(0, 200)}\n`);
    }
  } catch (e) {
    process.stderr.write(`[slack-notify] delivery failed: ${e.message}\n`);
  } finally {
    clearTimeout(timer);
  }
}

// Claude 작업 흐름을 절대 막지 않는다 — 어떤 경우에도 exit code 0
process.exitCode = 0;
main().catch((e) => {
  process.stderr.write(`[slack-notify] fatal: ${e.message}\n`);
});
