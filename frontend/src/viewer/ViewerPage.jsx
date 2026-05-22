import { useRef, useCallback } from 'react'
import { Upload, Loader2, AlertCircle, ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import { useIFCViewer } from './useIFCViewer'
import { useViewerStore } from '../store/viewerStore'
import ElementInspector from './ElementInspector'

export default function ViewerPage() {
  const containerRef  = useRef(null)
  const fileInputRef  = useRef(null)
  const { handleClick, loadIFC } = useIFCViewer(containerRef)
  const { loadingState, modelMetadata, selectedElement } = useViewerStore()

  const onFileChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) loadIFC(file)
  }, [loadIFC])

  const onCanvasClick = useCallback((e) => {
    handleClick(e)
  }, [handleClick])

  return (
    <div className="flex h-full relative">

      {/* 3D Canvas */}
      <div
        ref={containerRef}
        className="flex-1 ifc-canvas-container"
        onClick={onCanvasClick}
      />

      {/* Toolbar overlay */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-surface-1 border border-surface-2 hover:border-accent text-sm font-display px-4 py-2 rounded-lg transition-colors"
        >
          <Upload size={14} />
          Load IFC Model
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".ifc"
          className="hidden"
          onChange={onFileChange}
        />

        {modelMetadata && (
          <div className="bg-surface-1 border border-surface-2 px-4 py-2 rounded-lg text-xs font-display text-[var(--color-text-dim)]">
            <span className="text-[var(--color-text)]">{modelMetadata.fileName}</span>
            <span className="ml-2 text-accent">{modelMetadata.elementCount} elements</span>
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {loadingState.loading && (
        <div className="absolute inset-0 bg-surface-0/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4 pointer-events-none">
          <Loader2 size={32} className="text-accent animate-spin" />
          <div className="font-display text-sm text-[var(--color-text)]">
            Loading IFC model... {loadingState.progress}%
          </div>
          <div className="w-48 h-1 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${loadingState.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {loadingState.error && (
        <div className="absolute top-16 left-4 bg-red-950 border border-red-800 text-red-300 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {loadingState.error}
        </div>
      )}

      {/* Empty state */}
      {!modelMetadata && !loadingState.loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none">
          <div className="text-[var(--color-text-dim)] text-center">
            <div className="font-display text-4xl mb-3 opacity-20">⬡</div>
            <p className="font-display text-sm text-[var(--color-text-dim)]">No model loaded</p>
            <p className="text-xs text-[var(--color-text-dim)] mt-1 opacity-60">
              Click "Load IFC Model" to import your Revit export
            </p>
          </div>
        </div>
      )}

      {/* Element Inspector panel (right side) */}
      {selectedElement && (
        <ElementInspector element={selectedElement} />
      )}
    </div>
  )
}
