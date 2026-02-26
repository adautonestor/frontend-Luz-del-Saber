import React from 'react'
import { motion } from 'framer-motion'
import { Users, Calendar, Clock, Eye, Trash2, File, Link as LinkIcon, Download } from 'lucide-react'

const AvisoCard = ({
  aviso,
  setSelectedAviso,
  handleToggleActive,
  handleDelete,
  handleDownload,
  formatFileSize,
  isPDF
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{aviso.titulo}</h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                aviso.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {aviso.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Users size={14} />
                Padres y Docentes
              </span>
              {aviso.fechaCreacion && !isNaN(new Date(aviso.fechaCreacion).getTime()) ? (
                <>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(aviso.fechaCreacion).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(aviso.fechaCreacion).toLocaleTimeString('es-PE', {
                      timeZone: 'America/Lima',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </>
              ) : (
                <span className="flex items-center gap-1 text-gray-400">
                  <Calendar size={14} />
                  Sin fecha
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2 ml-4">
            <button
              onClick={() => setSelectedAviso(aviso)}
              className="text-primary-600 hover:text-primary-700"
              title="Ver detalles"
            >
              <Eye size={18} />
            </button>
            <button
              onClick={() => handleToggleActive(aviso.id)}
              className={aviso.activo ? 'text-gray-600 hover:text-gray-700' : 'text-green-600 hover:text-green-700'}
              title={aviso.activo ? 'Desactivar' : 'Activar'}
            >
              <Eye size={18} className={!aviso.activo ? 'opacity-50' : ''} />
            </button>
            <button
              onClick={() => handleDelete(aviso.id)}
              className="text-red-600 hover:text-red-700"
              title="Eliminar"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-gray-700 whitespace-pre-wrap mb-4">{aviso.contenido}</p>

        {/* Imagen */}
        {aviso.imagen && (
          <div className="mb-4">
            <img
              src={aviso.imagen.data}
              alt={aviso.imagen.name}
              className="w-full rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedAviso(aviso)}
              style={{ maxHeight: '500px', objectFit: 'contain' }}
            />
            <p className="text-xs text-gray-500 mt-2 text-center">{aviso.imagen.name}</p>
          </div>
        )}

        {/* Archivo */}
        {aviso.archivo && (
          <div className="mb-4">
            {isPDF(aviso.archivo) ? (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <File className="text-red-500" size={16} />
                    Archivo PDF adjunto
                  </h4>
                  <button
                    onClick={() => handleDownload(aviso.archivo)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs"
                  >
                    <Download size={14} />
                    Descargar PDF
                  </button>
                </div>
                <div className="border rounded-lg overflow-hidden shadow-md">
                  <iframe
                    src={aviso.archivo.data}
                    className="w-full"
                    style={{ height: '600px' }}
                    title={aviso.archivo.name}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {aviso.archivo.name} ({formatFileSize(aviso.archivo.tamaño)})
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <File className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{aviso.archivo.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(aviso.archivo.tamaño)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(aviso.archivo)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs"
                >
                  <Download size={14} />
                  Descargar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Enlace */}
        {aviso.enlace && (
          <div className="flex items-center gap-4 text-xs">
            <a
              href={aviso.enlace}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
            >
              <LinkIcon size={14} className="text-purple-500" />
              <span className="font-medium">Ver enlace externo</span>
            </a>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default AvisoCard
