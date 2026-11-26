import type { ModuleId } from '../../content/modules'
import { StagePlaceholder } from '../StagePlaceholder'

export default function Practice({ moduleId }: { moduleId: ModuleId }) {
  return <StagePlaceholder moduleId={moduleId} stage="practice" />
}
