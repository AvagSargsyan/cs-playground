import { Callout } from '../components/ui'
import {
  MODULES,
  STAGE_BLURBS,
  STAGE_LABELS,
  type ModuleId,
  type StageId,
} from '../content/modules'

/** Temporary content for stages that are built in Phase 2. Removed before release. */
export function StagePlaceholder({ moduleId, stage }: { moduleId: ModuleId; stage: StageId }) {
  return (
    <div className="container reading">
      <h2>
        {STAGE_LABELS[stage]}: {MODULES[moduleId].title}
      </h2>
      <p className="lead">{STAGE_BLURBS[stage]}</p>
      <Callout kind="info" title="Under construction">
        <p>This stage is being built right now and will appear here soon.</p>
      </Callout>
    </div>
  )
}
