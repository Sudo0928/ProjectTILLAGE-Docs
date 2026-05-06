// 서버 전용 모듈 — 'use client' 파일에서 import 금지

import { Client } from '@notionhq/client'

import { env } from '@/lib/env'

/**
 * Notion SDK 단일 진입점 — Client 인스턴스 싱글톤 + 환경 변수 가드
 *
 * 사용 패턴 (Phase 2 Task 005 이후 데이터 함수에서):
 *   const notion = getNotionClient()
 *   const dbId = getNotionDatabaseId()
 *   const result = await notion.databases.query({ database_id: dbId, ... })
 *
 * 핵심 정책:
 *   - 모듈 import 시점에 env 검증 안 함 — 빌드 차단 회피 (env optional 정책, shrimp-rules.md 5.5 + 10.5)
 *   - process.env 직접 접근 금지 — `@/lib/env` 단일 진입점만 사용 (절대 금지 #6)
 *   - 'use client' 파일에서 import 금지 — 토큰 노출 방지 (절대 금지 #7)
 *   - NEXT_PUBLIC_NOTION_* 등 클라이언트 노출 변수 도입 금지 (절대 금지 #8)
 */

/** 모듈 스코프 비공개 캐시 — 외부에서 reset 우회 불가 (export 안 함) */
let cachedClient: Client | null = null

/** Notion v5 dataSources.query에 필요한 data_source_id 캐시 — 첫 해석 후 재사용 */
let cachedDataSourceId: string | null = null

/**
 * Notion 환경 변수 가드 — env.NOTION_TOKEN / env.NOTION_DATABASE_ID 모두 설정되었는지 검증
 *
 * 누락 시 친절한 한국어 에러를 throw (호출 측이 try/catch로 잡아 ErrorState UI로 변환).
 * 두 값 모두 누락된 경우 NOTION_TOKEN 메시지가 우선 (NOTION_TOKEN 검사 후 NOTION_DATABASE_ID 순서).
 *
 * @returns 검증된 토큰과 데이터베이스 ID 객체 (TS strict narrowing — non-null assertion 회피)
 * @throws {Error} 환경 변수 미설정 시 한국어 안내 메시지
 */
export function assertNotionEnv(): { token: string; databaseId: string } {
  if (!env.NOTION_TOKEN) {
    throw new Error(
      'NOTION_TOKEN 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.'
    )
  }
  if (!env.NOTION_DATABASE_ID) {
    throw new Error(
      'NOTION_DATABASE_ID 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.'
    )
  }
  return { token: env.NOTION_TOKEN, databaseId: env.NOTION_DATABASE_ID }
}

/**
 * 싱글톤 Notion Client 인스턴스 반환
 *
 * 첫 호출 시 assertNotionEnv()로 토큰 검증 후 new Client({ auth })로 인스턴스 생성하여 모듈 캐시에 저장.
 * 이후 호출은 캐시된 인스턴스를 재사용 (===) — Notion API 인스턴스 중복 생성 방지.
 * timeoutMs / retry / notionVersion 옵션은 현재 기본값 사용 (Phase 2 Task 005 이후 필요 시 튜닝).
 *
 * @returns Notion Client 싱글톤 인스턴스
 * @throws {Error} env.NOTION_TOKEN 미설정 시 한국어 안내 메시지 (assertNotionEnv 경유)
 */
export function getNotionClient(): Client {
  if (cachedClient !== null) {
    return cachedClient
  }
  const { token } = assertNotionEnv()
  cachedClient = new Client({ auth: token })
  return cachedClient
}

/**
 * 검증된 Notion 데이터베이스 ID 반환
 *
 * Phase 2 Task 005 이후 데이터 함수가 `env.NOTION_DATABASE_ID!` non-null assertion 패턴을 쓰지 않도록
 * 헬퍼 제공. 매 호출에서 assertNotionEnv()를 실행하므로 호출 시점마다 env 검증 동작.
 *
 * @returns 검증된 Notion 데이터베이스 ID 문자열
 * @throws {Error} env.NOTION_DATABASE_ID 미설정 시 한국어 안내 메시지 (assertNotionEnv 경유)
 */
export function getNotionDatabaseId(): string {
  return assertNotionEnv().databaseId
}

/**
 * Notion 데이터 소스 ID 반환 (v5 SDK `dataSources.query`에 필요)
 *
 * Notion v5 SDK는 `databases.query` 대신 `dataSources.query`를 사용하며 `data_source_id`가 필요.
 * env의 `NOTION_DATABASE_ID`는 v5 환경에서는 사실상 **data source ID**(예: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)로
 * 저장하는 것이 권장된다 — Notion 통합 페이지/관리 페이지에서 노출되는 ID가 data source ID이며 query 호출 시 그대로 사용 가능.
 *
 * 첫 호출 시 env 값을 그대로 캐시하여 이후 호출은 즉시 반환 (싱글톤 패턴).
 * env 값이 잘못된 경우(예: 통합 권한 없음, 존재하지 않는 ID)는 실제 `dataSources.query` 호출 시점에서 Notion API가 한국어/영문 에러로 알려줌.
 *
 * @returns env에서 가져온 data source ID 문자열
 * @throws {Error} env 미설정 시 한국어 안내 메시지 (assertNotionEnv 경유)
 */
export async function getNotionDataSourceId(): Promise<string> {
  if (cachedDataSourceId !== null) {
    return cachedDataSourceId
  }
  cachedDataSourceId = getNotionDatabaseId()
  return cachedDataSourceId
}
