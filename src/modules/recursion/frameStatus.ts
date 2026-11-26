import type { FrameStatus } from '../../engine/types'

/** Icon + word for each status, so the state never depends on color alone. */
export const STATUS_META: Record<FrameStatus, { icon: string; label: string }> = {
  calling: { icon: '▶', label: 'running' },
  waiting: { icon: '⏸', label: 'waiting' },
  'base-case': { icon: '■', label: 'base case' },
  returning: { icon: '↩', label: 'returning' },
}
