// 서버 전용 모듈 — 'use client' 파일에서 import 금지 (값 자체는 안전하지만 일관성 유지)

/**
 * Notion 페이지 ID ↔ URL 슬러그 변환 + 분류 이름 슬러그 헬퍼
 *
 * 설계 원칙:
 *   - 페이지 ID는 32자 hex (Notion UUID에서 하이픈 제거) — URL-safe + 충돌 0%
 *   - 분류 이름은 이모지 + 공백 + 슬래시를 하이픈으로 정규화하되 한글 그대로 유지
 *   - 분류 슬러그 → 원본 이름 역변환은 categories[] 배열을 인자로 받아 인메모리 매칭
 */

/**
 * Notion 페이지 ID에서 URL 슬러그 생성 (하이픈 제거, 32자 hex)
 *
 * @param id Notion 페이지 ID (UUID 형식 또는 하이픈 없는 32자)
 * @returns 32자 hex 슬러그
 *
 * @example
 * slugFromPageId('12345678-90ab-cdef-1234-567890abcdef')
 * // → '1234567890abcdef1234567890abcdef'
 */
export function slugFromPageId(id: string): string {
  return id.replace(/-/g, '')
}

/**
 * URL 슬러그에서 Notion 페이지 ID 복원 (UUID 형식 8-4-4-4-12)
 *
 * 입력은 32자 hex 또는 이미 하이픈이 포함된 UUID 형식 모두 허용.
 * 길이가 32 ≠ 시 한국어 Error throw — 호출 측이 try/catch로 잡아 ErrorState 노출.
 *
 * @param slug 32자 hex 또는 표준 UUID 형식 페이지 슬러그
 * @returns Notion API 호환 UUID 형식 페이지 ID
 * @throws {Error} 슬러그 길이가 32 (하이픈 제거 후) ≠ 시 한국어 안내
 */
export function pageIdFromSlug(slug: string): string {
  const cleaned = slug.replace(/-/g, '')
  if (cleaned.length !== 32) {
    throw new Error('잘못된 페이지 슬러그 형식입니다.')
  }
  return `${cleaned.slice(0, 8)}-${cleaned.slice(8, 12)}-${cleaned.slice(12, 16)}-${cleaned.slice(16, 20)}-${cleaned.slice(20, 32)}`
}

/**
 * 분류 이름에서 URL 슬러그 생성 (이모지 + 공백 + 슬래시 정규화, 한글 유지)
 *
 * 변환 규칙:
 *   1. Extended_Pictographic(이모지) + variation selector(️) + ZWJ(‍) 제거
 *   2. 공백 / 슬래시 → 하이픈
 *   3. 연속 하이픈 → 단일 하이픈
 *   4. 앞뒤 하이픈 제거
 *   5. trim
 *
 * @example
 * slugFromCategoryName('📌 핵심 정의 문서')      // → '핵심-정의-문서'
 * slugFromCategoryName('🎞️내러티브 기획')        // → '내러티브-기획' (이모지 + variation selector 제거)
 * slugFromCategoryName('⏏️ 출시 / 운영 기획')   // → '출시-운영-기획' (슬래시 → 하이픈)
 * slugFromCategoryName('🎨 UI/UX 기획')          // → 'UI-UX-기획' (대소문자 유지)
 */
export function slugFromCategoryName(name: string): string {
  return name
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/[️‍]/g, '')
    .trim()
    .replace(/[\s/]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * URL 슬러그 → 원본 분류 이름 역매칭
 *
 * 인자로 받은 분류 이름 배열에서 slugFromCategoryName 결과가 일치하는 첫 항목 반환.
 * 일치 없으면 null (호출 측이 빈 분류 안내로 분기).
 *
 * @param slug URL에서 디코딩된 분류 슬러그
 * @param categories 모든 분류 이름 배열 (Notion 응답 또는 큐레이션 정적 매핑)
 * @returns 원본 분류 이름 또는 null
 */
export function categoryNameFromSlug(
  slug: string,
  categories: readonly string[]
): string | null {
  return categories.find(name => slugFromCategoryName(name) === slug) ?? null
}
