"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Option {
  value: string
  label: string
}

interface FormSelectProps {
  name: string
  required?: boolean
  defaultValue?: string
  placeholder?: string
  options: Option[]
  onChange?: (value: string) => void
}

export function FormSelect({ name, required, defaultValue, placeholder, options, onChange }: FormSelectProps) {
  const [value, setValue] = useState(defaultValue ?? "")

  function handleChange(v: string | null) {
    const val = v ?? ""
    setValue(val)
    onChange?.(val)
  }

  return (
    <>
      <input type="hidden" name={name} value={value} required={required} />
      <Select value={value} onValueChange={handleChange} required={required}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )
}
