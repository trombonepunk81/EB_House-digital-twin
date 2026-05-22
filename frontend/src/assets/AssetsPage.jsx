import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Plus, Search, Wrench, Calendar, Tag, Trash2, X, ChevronRight } from 'lucide-react'
import { useAssetStore } from '../store/viewerStore'
import clsx from 'clsx'

const CATEGORIES = ['Appliance', 'HVAC', 'Plumbing', 'Electrical', 'Structure', 'Finish', 'Other']
const STATUS_COLORS = {
  Good:        'bg-green-900/50 text-green-400 border-green-800',
  Monitor:     'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  Maintenance: 'bg-orange-900/50 text-orange-400 border-orange-800',
  Repair:      'bg-red-900/50 text-red-400 border-red-800',
}

function AssetCard({ asset, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-surface-1 border border-surface-2 hover:border-accent/50 rounded-xl p-4 transition-all group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <h3 className="font-display text-sm text-[var(--color-text)] group-hover:text-accent transition-colors">
            {asset.name}
          </h3>
          <p className="text-xs text-[var(--color-text-dim)] mt-0.5">{asset.category}</p>
        </div>
        <span className={clsx('text-xs px-2 py-0.5 rounded border font-display', STATUS_COLORS[asset.status] ?? STATUS_COLORS.Good)}>
          {asset.status ?? 'Good'}
        </span>
      </div>
      {asset.warrantyExpiry && (
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-dim)] mt-2">
          <Calendar size={11} />
          <span>Warranty: {asset.warrantyExpiry}</span>
        </div>
      )}
      {asset.ifcId && (
        <div className="flex items-center gap-1.5 text-xs text-accent/60 mt-1">
          <Tag size={11} />
          <span className="font-mono">IFC #{asset.ifcId}</span>
        </div>
      )}
    </button>
  )
}

function AssetForm({ initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initial.name ?? '',
    category: initial.category ?? 'Appliance',
    status: initial.status ?? 'Good',
    brand: initial.brand ?? '',
    model: initial.model ?? '',
    serialNumber: initial.serialNumber ?? '',
    installDate: initial.installDate ?? '',
    warrantyExpiry: initial.warrantyExpiry ?? '',
    notes: initial.notes ?? '',
    ifcId: initial.ifcId ?? '',
    location: initial.location ?? '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const Field = ({ label, name, type = 'text', options }) => (
    <div>
      <label className="block font-display text-xs text-[var(--color-text-dim)] uppercase tracking-wider mb-1">
        {label}
      </label>
      {options ? (
        <select
          value={form[name]}
          onChange={e => set(name, e.target.value)}
          className="w-full bg-surface-0 border border-surface-3 rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-accent"
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={form[name]}
          onChange={e => set(name, e.target.value)}
          className="w-full bg-surface-0 border border-surface-3 rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-accent"
        />
      )}
    </div>
  )

  return (
    <div className="space-y-4">
      <Field label="Name *"        name="name" />
      <Field label="Category"      name="category"  options={CATEGORIES} />
      <Field label="Status"        name="status"    options={Object.keys(STATUS_COLORS)} />
      <Field label="Location/Room" name="location" />
      <Field label="Brand"         name="brand" />
      <Field label="Model Number"  name="model" />
      <Field label="Serial Number" name="serialNumber" />
      <Field label="Install Date"  name="installDate"    type="date" />
      <Field label="Warranty Expiry" name="warrantyExpiry" type="date" />
      <div>
        <label className="block font-display text-xs text-[var(--color-text-dim)] uppercase tracking-wider mb-1">
          Notes
        </label>
        <textarea
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          rows={3}
          className="w-full bg-surface-0 border border-surface-3 rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-accent resize-none"
        />
      </div>
      {form.ifcId && (
        <div className="flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-lg px-3 py-2 text-xs">
          <Tag size={12} className="text-accent" />
          <span className="text-accent font-display">Linked to IFC element #{form.ifcId}</span>
        </div>
      )}
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => form.name && onSave(form)}
          className="flex-1 bg-accent hover:bg-accent-dim text-white font-display text-sm py-2.5 rounded-lg transition-colors"
        >
          Save Asset
        </button>
        <button
          onClick={onCancel}
          className="px-4 bg-surface-2 hover:bg-surface-3 text-[var(--color-text-dim)] font-display text-sm py-2.5 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function AssetsPage() {
  const { assets, addAsset, deleteAsset } = useAssetStore()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)
  const [selected, setSelected] = useState(null)

  // Auto-open form when coming from viewer with IFC element
  const ifcId   = searchParams.get('ifc_id')
  const ifcName = searchParams.get('name')

  useEffect(() => {
    if (ifcId) setAdding(true)
  }, [ifcId])

  const filtered = assets.filter(a =>
    a.name.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  )

  const handleSave = (form) => {
    addAsset(form)
    setAdding(false)
    navigate('/assets')
  }

  return (
    <div className="flex h-full">
      {/* Asset list */}
      <div className="w-80 border-r border-surface-2 flex flex-col shrink-0">
        {/* Header */}
        <div className="px-4 py-4 border-b border-surface-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-display text-xs tracking-widest text-[var(--color-text-dim)] uppercase">Assets</p>
              <h2 className="font-display text-lg text-[var(--color-text)]">{assets.length} Items</h2>
            </div>
            <button
              onClick={() => { setAdding(true); setSelected(null) }}
              className="w-8 h-8 bg-accent hover:bg-accent-dim rounded-lg flex items-center justify-center transition-colors"
            >
              <Plus size={16} className="text-white" />
            </button>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search assets..."
              className="w-full bg-surface-2 border border-surface-3 rounded-lg pl-8 pr-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-accent placeholder:text-[var(--color-text-dim)]"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="font-display text-xs text-[var(--color-text-dim)] uppercase tracking-wider">No assets yet</p>
              <p className="text-xs text-[var(--color-text-dim)] mt-2 opacity-60">
                Add your first asset or click an element in the 3D viewer
              </p>
            </div>
          )}
          {filtered.map(asset => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onClick={() => { setSelected(asset); setAdding(false) }}
            />
          ))}
        </div>
      </div>

      {/* Detail / Form panel */}
      <div className="flex-1 overflow-y-auto p-8">
        {adding && (
          <div className="max-w-lg">
            <h2 className="font-display text-xl text-[var(--color-text)] mb-6">
              {ifcId ? `Register IFC Element` : 'Add New Asset'}
            </h2>
            <AssetForm
              initial={{ name: ifcName ?? '', ifcId: ifcId ?? '' }}
              onSave={handleSave}
              onCancel={() => { setAdding(false); navigate('/assets') }}
            />
          </div>
        )}

        {selected && !adding && (
          <div className="max-w-lg">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="font-display text-xs tracking-widest text-[var(--color-text-dim)] uppercase mb-1">
                  {selected.category}
                </p>
                <h2 className="font-display text-2xl text-[var(--color-text)]">{selected.name}</h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => deleteAsset(selected.id) && setSelected(null)}
                  className="w-8 h-8 bg-surface-2 hover:bg-red-900 rounded-lg flex items-center justify-center text-[var(--color-text-dim)] hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 bg-surface-2 hover:bg-surface-3 rounded-lg flex items-center justify-center text-[var(--color-text-dim)] transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {[
                ['Status',          selected.status],
                ['Location',        selected.location],
                ['Brand',           selected.brand],
                ['Model',           selected.model],
                ['Serial Number',   selected.serialNumber],
                ['Install Date',    selected.installDate],
                ['Warranty Expiry', selected.warrantyExpiry],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label} className="flex gap-3 py-2 border-b border-surface-2">
                  <span className="font-display text-xs text-[var(--color-text-dim)] uppercase tracking-wider w-36 shrink-0">
                    {label}
                  </span>
                  <span className="text-sm text-[var(--color-text)]">{value}</span>
                </div>
              ))}
              {selected.notes && (
                <div className="py-3">
                  <p className="font-display text-xs text-[var(--color-text-dim)] uppercase tracking-wider mb-2">Notes</p>
                  <p className="text-sm text-[var(--color-text)] leading-relaxed">{selected.notes}</p>
                </div>
              )}
              {selected.ifcId && (
                <div className="flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-lg px-3 py-2 text-xs mt-4">
                  <Tag size={12} className="text-accent" />
                  <span className="text-accent font-display">IFC Element #{selected.ifcId}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {!adding && !selected && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Wrench size={32} className="text-surface-3 mb-4" />
            <p className="font-display text-sm text-[var(--color-text-dim)]">Select an asset to view details</p>
            <p className="text-xs text-[var(--color-text-dim)] mt-1 opacity-60">or click + to add a new one</p>
          </div>
        )}
      </div>
    </div>
  )
}
