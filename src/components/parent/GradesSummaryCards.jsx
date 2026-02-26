import React from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, BookOpen, Award, Target, TrendingUp } from 'lucide-react'
import { convertAverageValueToLetter } from '../../utils/gradeConversion'

const GradesSummaryCards = ({ selectedChildGrades, getGradeColor }) => {
  // Calcular total de competencias evaluadas
  const totalCompetencias = selectedChildGrades?.subjects?.reduce((total, subject) => {
    return total + (subject.competencias?.length || 0)
  }, 0) || 0

  // Encontrar la competencia con mejor promedio
  let mejorCompetencia = null
  let mejorPromedio = 0
  selectedChildGrades?.subjects?.forEach(subject => {
    subject.competencias?.forEach(comp => {
      if (comp.average !== null && comp.average > mejorPromedio) {
        mejorPromedio = comp.average
        mejorCompetencia = {
          name: comp.name,
          subject: subject.name,
          average: comp.average,
          // Usar averageDisplay si existe, sino convertir usando funcion centralizada
          averageDisplay: comp.averageDisplay || convertAverageValueToLetter(comp.average)
        }
      }
    })
  })

  const cards = [
    {
      icon: BookOpen,
      color: 'bg-blue-500',
      label: 'Materias',
      value: selectedChildGrades?.subjects?.length || 0
    },
    {
      icon: GraduationCap,
      color: 'bg-green-500',
      label: 'Competencias',
      value: totalCompetencias
    },
    {
      icon: Award,
      color: 'bg-purple-500',
      label: 'Mejor Competencia',
      value: mejorCompetencia ? `${mejorCompetencia.name}` : 'N/A',
      subtitle: mejorCompetencia ? `${mejorCompetencia.subject} (${mejorCompetencia.averageDisplay})` : null,
      isText: true
    },
    {
      icon: Target,
      color: 'bg-yellow-500',
      label: 'Tendencia',
      value: <><TrendingUp className="w-5 h-5 text-green-500 mr-1" /><span className="text-sm font-semibold text-green-600">Mejorando</span></>,
      isCustom: true
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {cards.map((card, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center">
            <div className={`${card.color} rounded-lg p-3`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{card.label}</p>
              {card.isCustom ? (
                <div className="flex items-center">{card.value}</div>
              ) : (
                <>
                  <p className={`${card.isText ? 'text-sm' : 'text-2xl'} font-semibold ${card.valueColor || 'text-gray-900'}`}>
                    {card.value}
                  </p>
                  {card.subtitle && (
                    <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default GradesSummaryCards
