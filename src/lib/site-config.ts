/**
 * 사이트 기본 정적 상수 단일 소스
 *   - F015 HERO Logline + 분위기 카피
 *   - 사이트 기본 메타데이터(SEO 템플릿)
 *
 * 페이지에서 하드코딩 금지 — 본 모듈에서만 import
 */
export const siteConfig = {
  name: 'ProjectTILLAGE-Docs',
  description:
    'Notion에 작성한 게임 기획서를 자동으로 웹에 게시하는 발행 사이트',
  hero: {
    /** PRD 게임 컨셉 — 글자 단위 일치 (변경 시 PRD 함께 갱신) */
    logline:
      '5년 안에 감염으로 죽을 주인공이 작은 섬에서 농사를 짓고 섬 사람들과 인연을 쌓아 가면서 삶의 의미를 찾아가는 게임',
    /**
     * INFERENCE: 분위기 카피 임시값 — PRD 게임 컨셉을 1줄로 요약한 추론값
     *   사용자 확정 권장. Phase 6 Task 018 페르소나 인터뷰에서 보완 예정
     */
    moodCaption:
      '포스트 아포칼립스 농사+생존 — 짧은 삶 속에서 의미를 찾아가는 이야기',
  },
  defaultMetadata: {
    titleTemplate: '%s | ProjectTILLAGE-Docs',
    defaultTitle: 'ProjectTILLAGE Docs',
  },
} as const
