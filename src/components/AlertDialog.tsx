"use client"

import type React from "react"

import { cn } from "@/lib/utils"

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  return (
    <>
      {open && <div className="fixed inset-0 z-50 bg-black/50" onClick={() => onOpenChange(false)} />}
      {open && <div className="fixed inset-0 z-50 flex items-center justify-center">{children}</div>}
    </>
  )
}

interface AlertDialogContentProps {
  className?: string
  children: React.ReactNode
}

export function AlertDialogContent({ className, children }: AlertDialogContentProps) {
  return (
    <div
      className={cn("relative w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg", className)}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  )
}

interface AlertDialogHeaderProps {
  className?: string
  children: React.ReactNode
}

export function AlertDialogHeader({ className, children }: AlertDialogHeaderProps) {
  return <div className={cn("flex flex-col space-y-2", className)}>{children}</div>
}

interface AlertDialogTitleProps {
  className?: string
  children: React.ReactNode
}

export function AlertDialogTitle({ className, children }: AlertDialogTitleProps) {
  return <h2 className={cn("text-lg font-semibold", className)}>{children}</h2>
}

interface AlertDialogDescriptionProps {
  className?: string
  children: React.ReactNode
}

export function AlertDialogDescription({ className, children }: AlertDialogDescriptionProps) {
  return <p className={cn("text-sm text-foreground/60", className)}>{children}</p>
}

interface AlertDialogActionProps {
  onClick: () => void
  className?: string
  children: React.ReactNode
}

export function AlertDialogAction({ onClick, className, children }: AlertDialogActionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-white hover:bg-destructive/90",
        className,
      )}
    >
      {children}
    </button>
  )
}

interface AlertDialogCancelProps {
  className?: string
  children: React.ReactNode
}

export function AlertDialogCancel({ className, children }: AlertDialogCancelProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-card",
        className,
      )}
    >
      {children}
    </button>
  )
}
