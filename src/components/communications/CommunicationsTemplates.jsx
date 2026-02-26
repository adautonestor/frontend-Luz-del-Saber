import React from 'react'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'

/**
 * Sección de plantillas de comunicaciones predefinidas
 * Muestra 6 plantillas con diferentes categorías y contenidos
 */
const CommunicationsTemplates = ({ setFormData, formData, setIsModalOpen, setActiveTab }) => {
  const templates = [
    {
      id: 1,
      name: 'Citación a Padres',
      description: 'Plantilla para citar a padres de familia',
      categoria: 'reuniones',
      type: 'comunicado',
      prioridad: 'alta',
      uso: 45,
      contenido: `Estimados padres de familia:

Por medio de la presente, hacemos de su conocimiento que se ha programado una reunión con ustedes para tratar asuntos importantes relacionados con el desempeño académico y comportamiento de su hijo(a).

FECHA: [Indicar fecha]
HORA: [Indicar hora]
LUGAR: [Indicar lugar]

Su asistencia es obligatoria. En caso de no poder asistir, deberá justificar su inasistencia con anticipación.

Atentamente,
La Dirección`
    },
    {
      id: 2,
      name: 'Comunicado de Pagos',
      description: 'Recordatorio de pagos pendientes',
      categoria: 'pagos',
      type: 'comunicado',
      prioridad: 'media',
      uso: 78,
      contenido: `Estimados padres de familia:

Les recordamos que tienen pagos pendientes por concepto de pensiones escolares correspondientes al mes de [mes].

MONTO PENDIENTE: S/ [monto]
FECHA LÍMITE DE PAGO: [fecha]

Les agradeceremos regularizar su situación a la brevedad posible para evitar inconvenientes en el servicio educativo de su hijo(a).

Para mayor información, pueden comunicarse con la oficina de administración.

Atentamente,
Área de Administración`
    },
    {
      id: 3,
      name: 'Actividad Extracurricular',
      description: 'Invitación a actividades del colegio',
      categoria: 'eventos',
      type: 'anuncio',
      prioridad: 'normal',
      uso: 23,
      contenido: `Estimada comunidad educativa:

Nos complace invitarles a participar en [nombre de la actividad] que se realizará en nuestra institución.

ACTIVIDAD: [Nombre de la actividad]
FECHA: [fecha]
HORA: [hora]
LUGAR: [lugar]

Esta actividad tiene como objetivo [descripción del objetivo]. La participación es libre y contaremos con [descripción de lo que habrá].

¡Los esperamos!

Atentamente,
La Dirección`
    },
    {
      id: 4,
      name: 'Reunión de Docentes',
      description: 'Convocatoria a reunión docente',
      categoria: 'reuniones',
      type: 'comunicado',
      prioridad: 'alta',
      uso: 12,
      contenido: `Estimados docentes:

Se les convoca a reunión de coordinación para tratar los siguientes puntos:

AGENDA:
1. [Punto 1]
2. [Punto 2]
3. [Punto 3]

FECHA: [fecha]
HORA: [hora]
LUGAR: [lugar]

Su asistencia es obligatoria. Por favor, confirmar su participación.

Atentamente,
La Dirección`
    },
    {
      id: 5,
      name: 'Boletín Informativo',
      description: 'Plantilla de boletín mensual',
      categoria: 'informativos',
      type: 'circular',
      prioridad: 'normal',
      uso: 8,
      contenido: `BOLETÍN INFORMATIVO - [Mes/Año]

Estimada comunidad educativa:

Compartimos con ustedes las novedades y actividades más importantes del mes:

LOGROS DESTACADOS:
• [Logro 1]
• [Logro 2]

ACTIVIDADES REALIZADAS:
• [Actividad 1]
• [Actividad 2]

PRÓXIMAS ACTIVIDADES:
• [Actividad futura 1]
• [Actividad futura 2]

RECORDATORIOS IMPORTANTES:
• [Recordatorio 1]
• [Recordatorio 2]

Agradecemos su colaboración y compromiso con nuestra institución.

Atentamente,
La Dirección`
    },
    {
      id: 6,
      name: 'Suspensión de Clases',
      description: 'Aviso de suspensión de actividades',
      categoria: 'urgente',
      type: 'notificacion',
      prioridad: 'alta',
      uso: 3,
      contenido: `COMUNICADO URGENTE

Estimada comunidad educativa:

Informamos que las clases del día [fecha] quedan SUSPENDIDAS por el siguiente motivo:

MOTIVO: [Indicar motivo de la suspensión]

Las actividades se reanudarán normalmente el día [fecha de reanudación].

Pedimos disculpas por las molestias que esto pueda ocasionar.

Atentamente,
La Dirección`
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <motion.div
          key={template.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card hover:shadow-lg transition-shadow"
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <FileText className="h-8 w-8 text-primary-600" />
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                template.categoria === 'urgente'
                  ? 'bg-red-100 text-red-800'
                  : template.categoria === 'pagos'
                  ? 'bg-yellow-100 text-yellow-800'
                  : template.categoria === 'eventos'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {template.categoria}
              </span>
            </div>

            <h3 className="font-semibold text-gray-900 mb-2">
              {template.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {template.description}
            </p>

            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Usado {template.uso} veces
              </span>
              <button
                onClick={() => {
                  setFormData({
                    ...formData,
                    type: template.type,
                    titulo: template.name,
                    contenido: template.contenido,
                    prioridad: template.prioridad
                  })
                  setIsModalOpen(true)
                  setActiveTab('messages')
                }}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Usar plantilla
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default CommunicationsTemplates
