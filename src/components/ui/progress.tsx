"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value?: number }) {
  return (
    <div
      className={cn(
        "bg-slate-100 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <div
        className="bg-blue-600 h-full w-full flex-1 transition-all duration-500 ease-in-out"
        style={{ width: `${value || 0}%` }}
      />
    </div>
  )
}

export { Progress }
