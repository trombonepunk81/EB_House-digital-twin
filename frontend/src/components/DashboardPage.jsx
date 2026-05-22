import { useNavigate } from 'react-router-dom'
import { Box, ClipboardList, AlertTriangle, CheckCircle } from 'lucide-react'

const STAT_CARDS = [
  { icon: Box,           label: 'Model Loaded',        value: 'None',  sub: 'No IFC loaded yet',       color: 'text-[var(--color-text-dim)]' },
  { icon: ClipboardList, label: 'Assets Registered',   value: '0',     sub: 'Add your first asset',    color: 'text-accent' },
  { icon: AlertTriangle, label: 'Maintenance Due',      value: '0',     sub: 'All clear',               color: 'text-[var(--color-success)]' },
  { icon: CheckCircle,   label: 'Warranties Active',    value: '0',     sub: 'Track warranties',        color: 'text-[var(--color-highlight)]' },
]

export default function DashboardPage() {
  const navigate = useNavigate()

  return (
    <div className="h-full overflow-auto p-8">
      {/* Header */}
      <div className="mb-10">
        <p className="font-display text-xs tracking-widest text-[var(--color-text-dim)] uppercase mb-1">
          Digital Twin Platform
        </p>
        <h1 className="font-display text-3xl text-[var(--color-text)]">
          EB Residence
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        {STAT_CARDS.map(({ icon: Icon, label, value, sub, color }) => (
          <div
            key={label}
            className="bg-surface-1 border border-surface-2 rounded-xl p-5 flex flex-col gap-3"
          >
            <div className="flex items-center gap-2">
              <Icon size={16} className={color} />
              <span className="text-xs text-[var(--color-text-dim)] font-display uppercase tracking-wider">
                {label}
              </span>
            </div>
            <div className="font-display text-2xl text-[var(--color-text)]">{value}</div>
            <div className="text-xs text-[var(--color-text-dim)]">{sub}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-6">
        <p className="font-display text-xs tracking-widest text-[var(--color-text-dim)] uppercase mb-4">
          Quick Actions
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/viewer')}
            className="flex-1 bg-accent hover:bg-accent-dim text-white font-display text-sm py-3 px-5 rounded-lg transition-colors"
          >
            Open 3D Viewer
          </button>
          <button
            onClick={() => navigate('/assets')}
            className="flex-1 bg-surface-2 hover:bg-surface-3 text-[var(--color-text)] font-display text-sm py-3 px-5 rounded-lg border border-surface-3 transition-colors"
          >
            Manage Assets
          </button>
        </div>
      </div>

      {/* Getting started guide */}
      <div className="bg-surface-1 border border-surface-2 rounded-xl p-6">
        <p className="font-display text-xs tracking-widest text-[var(--color-text-dim)] uppercase mb-4">
          Getting Started
        </p>
        <ol className="space-y-3">
          {[
            'Export your Revit model as IFC (File → Export → IFC)',
            'Open the 3D Viewer and load your .ifc file',
            'Click elements in the model to inspect their properties',
            'Register elements as assets and add maintenance info',
          ].map((step, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="font-display text-xs text-accent mt-0.5 w-5 shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-sm text-[var(--color-text)]">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
