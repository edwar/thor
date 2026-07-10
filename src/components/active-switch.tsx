"use client"

import { useRef, useActionState } from "react"
import { Switch } from "@/components/ui/switch"

interface ActiveSwitchProps {
  checked: boolean
  formAction: (formData: FormData) => void
}

export function ActiveSwitch({ checked, formAction }: ActiveSwitchProps) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} action={formAction}>
      <Switch checked={checked} onCheckedChange={() => formRef.current?.requestSubmit()} />
    </form>
  )
}
