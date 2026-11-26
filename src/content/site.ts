export const SITE = {
  name: 'CS Playground',
  tagline: 'Interactive Computer Science Lessons',
  author: 'Avag Sargsyan',
  authorInitials: 'AS',
  linkedin: 'https://www.linkedin.com/in/avag-sargsyan/',
  github: 'https://github.com/AvagSargsyan/cs-playground',
  school: 'UWC Dilijan',
  role: 'Computer Science Teacher',
  year: 2026,
} as const

/** Formal wording, used in the footer and page metadata. */
export const DEMO_NOTICE = `CS Playground is a demo by ${SITE.author}, made as part of an application for the ${SITE.role} position at ${SITE.school}. It is not an official ${SITE.school} website and is not endorsed by ${SITE.school}.`
