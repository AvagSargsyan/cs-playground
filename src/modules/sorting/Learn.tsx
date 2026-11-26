import type { ModuleId } from '../../content/modules'
import { StagePlaceholder } from '../StagePlaceholder'

export default function Learn({ moduleId }: { moduleId: ModuleId }) {
  return <StagePlaceholder moduleId={moduleId} stage="learn" />
}
