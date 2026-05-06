import { z } from 'zod'

/**
 * 환경 변수 스키마 정의 및 런타임 검증
 * PRD 환경 변수 명세 기반: NOTION_TOKEN, NOTION_DATABASE_ID, NEXT_PUBLIC_SITE_URL
 *
 * NOTION_TOKEN / NOTION_DATABASE_ID 는 서버 사이드 전용이므로
 * 빌드 타임 파싱 오류를 피하기 위해 optional로 선언하고,
 * 실제 Notion API 호출부에서 존재 여부를 확인합니다.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  NOTION_TOKEN: z.string().optional(),
  NOTION_DATABASE_ID: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
})

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NOTION_TOKEN: process.env.NOTION_TOKEN,
  NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
})

export type Env = z.infer<typeof envSchema>
