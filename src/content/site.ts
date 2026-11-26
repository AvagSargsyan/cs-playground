export const SITE = {
  name: 'CS Playground',
  author: 'Avag Sargsyan',
  linkedin: 'https://www.linkedin.com/in/avag-sargsyan/',
  github: 'https://github.com/AvagSargsyan/cs-playground',
  school: 'UWC Dilijan',
  role: 'Computer Science Teacher',
  year: 2026,
} as const

/** Formal wording, used in the footer and page metadata. */
export const DEMO_NOTICE = `Built by ${SITE.author} for demo purposes for ${SITE.school}. Not an official ${SITE.school} website.`

/** The builder's motivation, in the first person. Shown on the homepage and the About page. */
export const MOTIVATION =
  'I believe students understand algorithms best when they can see every step, change the input and try it themselves. I built CS Playground to bring that kind of hands-on, curious learning into the classroom.'
