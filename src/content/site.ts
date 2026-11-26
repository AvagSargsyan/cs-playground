export const SITE = {
  name: 'CS Playground',
  tagline: 'Interactive Computer Science Lessons',
  author: 'Avag Sargsyan',
  linkedin: 'https://www.linkedin.com/in/avag-sargsyan/',
  github: 'https://github.com/AvagSargsyan/cs-playground',
  school: 'UWC Dilijan',
  role: 'Computer Science Teacher',
  year: 2026,
} as const

export const DEMO_NOTICE = `Demo project by ${SITE.author}, prepared for the ${SITE.role} application at ${SITE.school}. Not an official ${SITE.school} website.`
