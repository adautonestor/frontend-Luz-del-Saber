import React from 'react'

/**
 * Sección de firmas (tutor y director)
 */
const SignaturesSection = ({ tutor, director }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
      <div className="text-center">
        <div className="border-t border-gray-400 pt-2 mt-12">
          <p className="font-medium text-gray-900">{tutor}</p>
          <p className="text-sm text-gray-600">Tutor(a)</p>
        </div>
      </div>
      <div className="text-center">
        <div className="border-t border-gray-400 pt-2 mt-12">
          <p className="font-medium text-gray-900">{director}</p>
          <p className="text-sm text-gray-600">Director(a)</p>
        </div>
      </div>
    </div>
  )
}

export default SignaturesSection
