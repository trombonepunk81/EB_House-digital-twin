import { NavLink } from 'react-router-dom'
import { Home, Box, ClipboardList, Settings } from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { to: '/',       icon: Home,          label: 'Dashboard' },
  { to: '/viewer', icon: Box,           label: '3D Viewer' },
  { to: '/assets', icon: ClipboardList, label: 'Assets' },
]

export default function Layout({ children }) {
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-16 flex flex-col items-center py-6 gap-6 border-r border-surface-2 bg-surface-1 z-10 shrink-0">
        {/* Logo mark */}
        <div className="w-8 h-8 rounded bg-accent flex items-center justify-center mb-2">
          <span className="font-display text-xs font-medium text-white">EB</span>
        </div>

        {/* Nav icons */}
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={label}
            className={({ isActive }) =>
              clsx(
                'w-10 h-10 rounded-lg flex items-center justify-center transition-colors group relative',
                isActive
                  ? 'bg-accent text-white'
                  : 'text-[var(--color-text-dim)] hover:bg-surface-2 hover:text-[var(--color-text)]'
              )
            }
          >
            <Icon size={18} />
          </NavLink>
        ))}

        <div className="flex-1" />

        <button
          title="Settings"
          className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--color-text-dim)] hover:bg-surface-2 hover:text-[var(--color-text)] transition-colors"
        >
          <Settings size={18} />
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden bg-surface-0">
        {children}
      </main>
    </div>
  )
}
