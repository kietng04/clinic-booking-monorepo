import { useState, useRef, useCallback } from 'react'

export function OtpInput({ length = 6, onComplete, onChange }) {
  const [values, setValues] = useState(Array(length).fill(''))
  const inputs = useRef([])

  const handleChange = useCallback((index, value) => {
    if (value && !/^\d$/.test(value)) return

    const newValues = [...values]
    newValues[index] = value
    setValues(newValues)

    if (onChange) onChange(newValues.join(''))

    if (value && index < length - 1) {
      inputs.current[index + 1]?.focus()
    }

    if (value && index === length - 1) {
      const code = newValues.join('')
      if (code.length === length && onComplete) onComplete(code)
    }
  }, [values, length, onComplete, onChange])

  const handleKeyDown = useCallback((index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const newValues = [...values]
      if (newValues[index]) {
        newValues[index] = ''
        setValues(newValues)
        if (onChange) onChange(newValues.join(''))
      } else if (index > 0) {
        newValues[index - 1] = ''
        setValues(newValues)
        if (onChange) onChange(newValues.join(''))
        inputs.current[index - 1]?.focus()
      }
    }
  }, [values, onChange])

  const handlePaste = useCallback((e) => {
    e.preventDefault()
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    const newValues = Array(length).fill('')
    paste.split('').forEach((char, i) => { newValues[i] = char })
    setValues(newValues)
    if (onChange) onChange(newValues.join(''))
    if (paste.length === length && onComplete) onComplete(paste)
    inputs.current[Math.min(paste.length, length - 1)]?.focus()
  }, [length, onComplete, onChange])

  return (
    <div className="flex gap-2 justify-center">
      {values.map((value, index) => (
        <input
          key={index}
          ref={(el) => { inputs.current[index] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-11 h-14 text-center text-xl font-bold border-2 rounded-lg border-sage-300 dark:border-sage-600 focus:border-sage-600 dark:focus:border-sage-400 focus:outline-none transition-colors bg-white dark:bg-sage-800 text-sage-900 dark:text-cream-100"
        />
      ))}
    </div>
  )
}
