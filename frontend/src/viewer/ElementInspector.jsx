import { useState } from 'react'
import { X, Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { useViewerStore } from '../store/viewerStore'
import { useNavigate } from 'react-router-dom'

function PropRow({ label, value }) {
  if (value === null || value === undefined) return null
  const display = typeof value === 'object' ? JSON.stringify(value) : String(value)
  return (
    <div className="flex gap-2 py-1.5 border-b border-surface-2 last:border-0">
      <span className="text-xs text-[var(--color-text-dim)] w-32 shrink-0 font-display">{label}</span>
      <span className="text-xs text-[var(--color-text)] break-all">{display}</span>
    </div>
  )
}

function PSet({ pset }) {
  const [open, setOpen] = useState(false)
  const name = pset.Name?.value ?? 'Property Set'
  const props = pset.HasProperties ?? []

  return (
    <div className="border border-surface-2 rounded-lg overflow-hidden mb-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-surface-2 hover:bg-surface-3 text-xs font-display transition-colors"
      >
        <span>{name}</span>
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>
      {open && (
        <div className="px-3 py-2 bg-surface-1">
          {props.map((p, i) => (
            <PropRow
              key={i}
              label={p.Name?.value ?? '—'}
              value={p.NominalValue?.value ?? p.Value?.value ?? '—'}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ElementInspector({ element }) {
  const { setSelectedElement } = useViewerStore()
  const navigate = useNavigate()
  const { expressID, props, psets = [] } = element

  const typeName = props?.ObjectType?.value ?? props?.Name?.value ?? 'Unknown Type'
  const globalID = props?.GlobalId?.value ?? expressID

  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-surface-1 border-l border-surface-2 flex flex-col overflow-hidden z-10">
      {/* Header */}
      <div className="px-4 py-3 border-b border-surface-2 flex items-start justify-between gap-2 shrink-0">
        <div>
          <p className="font-display text-xs tracking-widest text-accent uppercase mb-0.5">
            Element Inspector
          </p>
          <h2 className="font-display text-sm text-[var(--color-text)] leading-snug">
            {typeName}
          </h2>
          <p className="text-xs text-[var(--color-text-dim)] mt-0.5 font-mono">
            ID: {expressID}
          </p>
        </div>
        <button
          onClick={() => setSelectedElement(null)}
          className="text-[var(--color-text-dim)] hover:text-[var(--color-text)] mt-0.5 shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Core Properties */}
        <div>
          <p className="font-display text-xs tracking-widest text-[var(--color-text-dim)] uppercase mb-2">
            Core Properties
          </p>
          <div className="bg-surface-2 rounded-lg px-3 py-2">
            <PropRow label="Name"      value={props?.Name?.value} />
            <PropRow label="Type"      value={props?.ObjectType?.value} />
            <PropRow label="Tag"       value={props?.Tag?.value} />
            <PropRow label="GlobalID"  value={globalID} />
            <PropRow label="Description" value={props?.Description?.value} />
          </div>
        </div>

        {/* Property Sets */}
        {psets.length > 0 && (
          <div>
            <p className="font-display text-xs tracking-widest text-[var(--color-text-dim)] uppercase mb-2">
              Property Sets ({psets.length})
            </p>
            {psets.map((pset, i) => (
              <PSet key={i} pset={pset} />
            ))}
          </div>
        )}
      </div>

      {/* Footer action */}
      <div className="px-4 py-3 border-t border-surface-2 shrink-0">
        <button
          onClick={() => navigate(`/assets?ifc_id=${expressID}&name=${encodeURIComponent(typeName)}`)}
          className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dim text-white font-display text-xs py-2.5 rounded-lg transition-colors"
        >
          <Plus size={14} />
          Register as Asset
        </button>
      </div>
    </div>
  )
}
