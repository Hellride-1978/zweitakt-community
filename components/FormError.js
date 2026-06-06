'use client'

import { useEffect, useRef } from 'react'

export default function FormError({ message, fieldId, className }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!message) return
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })

    if (fieldId) {
      const field = document.getElementById(fieldId)
      if (field) {
        field.classList.add('input-error-highlight')
        field.focus({ preventScroll: true })
        const remove = () => field.classList.remove('input-error-highlight')
        field.addEventListener('input', remove, { once: true })
      }
    }
  }, [message, fieldId])

  if (!message) return null

  return (
    <div ref={ref} className={className ?? 'zh-error'} role="alert">
      {message}
    </div>
  )
}
