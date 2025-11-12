'use client'

import type { ReactNode } from 'react'

type NeonBackgroundProps = {
  children: ReactNode
  className?: string
}

export const NeonBackground = ({ children, className }: NeonBackgroundProps) => {
  return (
    <div className={`relative min-h-screen w-full overflow-hidden bg-slate-950 text-white ${className ?? ''}`}>
      <div
        className="pointer-events-none absolute inset-0 neon-gradient-bg opacity-90"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/40 to-slate-950" />
      <div className="absolute inset-0 opacity-[0.15]" aria-hidden>
        <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.25),_transparent_55%)]" />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col">{children}</div>
    </div>
  )
}

export default NeonBackground
