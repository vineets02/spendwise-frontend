import { clsx } from 'clsx'
import React, { forwardRef } from 'react'

export function Card({className='',children}:{className?:string;children:React.ReactNode}) {
  return <div className={clsx('bg-white rounded-2xl shadow-sm border border-slate-200 p-4',className)}>{children}</div>
}

export function Button(
  {children,className='',...rest}:{children:React.ReactNode;className?:string} & React.ButtonHTMLAttributes<HTMLButtonElement>
){
  return (
    <button
      className={clsx('px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50', className)}
      {...rest}
    >
      {children}
    </button>
  )
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      {...props}
      className={clsx(
        'w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400',
        className
      )}
    />
  )
)
Input.displayName = 'Input'

export function Label({children}:{children:React.ReactNode}) {
  return <label className="text-sm text-slate-600">{children}</label>
}

export function SectionTitle({children}:{children:React.ReactNode}) {
  return <h2 className="text-xl font-semibold text-slate-800 mb-3">{children}</h2>
}
