export const SITE = {
  name: 'CS Playground',
  author: 'Avag Sargsyan',
  authorInitials: 'AS',
  linkedin: 'https://www.linkedin.com/in/avag-sargsyan/',
  github: 'https://github.com/AvagSargsyan/cs-playground',
  school: 'UWC Dilijan',
  role: 'Computer Science Teacher',
  year: 2026,
} as const

/** Formal wording, used in the footer and page metadata. */
export const DEMO_NOTICE = `Built by ${SITE.author} for demo purposes for ${SITE.school}. Not an official ${SITE.school} website.`
