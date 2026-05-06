/**
 * F015 비기획자 진입 큐레이션 — 5개 페르소나 ↔ 분류 묶음 정적 매핑
 *
 * 단일 진실 소스: docs/PRD.md "페르소나별 진입 시나리오" 표
 *
 * 핵심 제약:
 *   - 5개 페르소나 모두 서로 다른 분류 묶음을 가져야 함
 *     → assertDistinctPersonaCategorySets() 헬퍼로 단언 보장
 *   - categories 배열의 분류 이름은 Notion "분류" select 옵션과 글자 단위(이모지 포함) 일치
 *     INFERENCE: 본 모듈의 categories는 PRD 표 추론값 — Notion 실제 옵션 변경 시 동기화 필수
 */

export type PersonaSlug =
  | 'artist'
  | 'sound'
  | 'programmer'
  | 'marketer'
  | 'external'

export interface Persona {
  slug: PersonaSlug
  emoji: string
  /** 한국어 페르소나 명 */
  title: string
  /** 한 줄 후킹 카피 (홈 PersonaCard에 노출) */
  hookCopy: string
  /** Notion "분류" select 옵션과 글자 단위 일치 */
  categories: readonly string[]
}

/**
 * 5개 페르소나 큐레이션 정적 상수
 *   - 분류 이름은 PRD 17개 분류 옵션과 글자 단위 일치 (이모지 포함)
 *   - external emoji '🌟'는 PRD 미명시 — INFERENCE 임시값, 사용자 확정 권장
 */
export const personaCuration = [
  {
    slug: 'artist',
    emoji: '🎨',
    title: '아티스트',
    hookCopy: '비주얼 무드와 캐릭터 톤을 빠르게',
    categories: ['📹 비주얼 기획', '🎨 UI/UX 기획'],
  },
  {
    slug: 'sound',
    emoji: '🎶',
    title: '사운드 디자이너',
    hookCopy: '핵심 감정과 사운드 방향성',
    categories: ['🎶 사운드 기획', '🎞️내러티브 기획'],
  },
  {
    slug: 'programmer',
    emoji: '⚙️',
    title: '외부 프로그래머',
    hookCopy: '핵심 시스템 1개의 동작 흐름',
    categories: ['📌 핵심 정의 문서', '⚙️ 시스템 기획', '🛠️ 기술 기획'],
  },
  {
    slug: 'marketer',
    emoji: '🪙',
    title: '마케터/홍보',
    hookCopy: '핵심 셀링 3가지를 빠르게',
    categories: ['🛫 방향성 기획', '🪙 수익화 기획'],
  },
  {
    slug: 'external',
    emoji: '🌟', // INFERENCE: PRD 미명시 임시값
    title: '외부(투자자/지인)',
    hookCopy: '한 줄 컨셉과 5분 개요',
    categories: ['📌 핵심 정의 문서', '📹 비주얼 기획'],
  },
] as const satisfies readonly Persona[]

/**
 * 5개 페르소나의 categories 배열이 서로 다른 집합인지 단언
 *   - sort + JSON.stringify 핑거프린트를 Set으로 비교
 *   - 중복 발견 시 한국어 에러 throw
 *   - Phase 5 Task 016 회귀 점검에서도 동일 함수 재사용
 */
export function assertDistinctPersonaCategorySets(): void {
  const fingerprints = personaCuration.map(persona =>
    JSON.stringify([...persona.categories].sort())
  )
  const unique = new Set(fingerprints)
  if (unique.size !== personaCuration.length) {
    throw new Error(
      '페르소나 분류 묶음이 중복되었습니다 — persona-curation.ts 점검 필요'
    )
  }
}
