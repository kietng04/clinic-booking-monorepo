import React from 'react'
import PropTypes from 'prop-types'

/**
 * Textarea component with consistent styling
 */
export const Textarea = React.forwardRef(
  ({ className = '', error, helperText, label, ...props }, ref) => {
    const baseClasses =
      'w-full px-4 py-3 rounded-lg border border-sage-200 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-colors resize-vertical min-h-[100px]'
    const errorClasses = error ? 'border-red-500 focus:ring-red-500' : ''

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-sage-700 mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`${baseClasses} ${errorClasses} ${className}`}
          {...props}
        />
        {helperText && (
          <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-sage-500'}`}>
            {helperText}
          </p>
        )}
        {error && !helperText && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

Textarea.propTypes = {
  className: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  label: PropTypes.string,
}

export default Textarea
