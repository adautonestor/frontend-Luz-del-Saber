import { useState } from 'react'
import * as XLSX from 'xlsx'
import { usersService } from '../services/usersService'

/**
 * Hook para importación masiva de usuarios desde Excel
 * Integrado con APIs reales del backend
 */
export const useUsersImport = (loadUsers) => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importResults, setImportResults] = useState(null)
  const [isImporting, setIsImporting] = useState(false)

  const handleImportFile = (e) => {
    const file = e.target.files[0]
    if (file) {
      const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
      if (!validTypes.includes(file.type)) {
        alert('Por favor selecciona un archivo Excel válido (.xlsx o .xls)')
        return
      }
      setImportFile(file)
      setImportResults(null)
    }
  }

  const processExcelFile = async () => {
    if (!importFile) return

    setIsImporting(true)
    const results = {
      created: [],
      updated: [],
      errors: []
    }

    try {
      const data = await importFile.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i]
        const rowNumber = i + 2

        try {
          // Validar campos requeridos
          if (!row.first_name || !row.last_names || !row.dni) {
            results.errors.push({
              row: rowNumber,
              message: 'Faltan campos obligatorios (first_name, last_names, dni)'
            })
            continue
          }

          // Validar DNI
          const dni = String(row.dni).replace(/\D/g, '').slice(0, 8)
          if (dni.length !== 8) {
            results.errors.push({
              row: rowNumber,
              message: `DNI inválido: ${row.dni}`
            })
            continue
          }

          // Validar rol - CORREGIDO según roles reales en DB
          const rol = String(row.rol || 'profesor').toLowerCase()
          if (!['director', 'profesor', 'padre', 'secretaria'].includes(rol)) {
            results.errors.push({
              row: rowNumber,
              message: `Rol inválido: ${row.rol}. Roles válidos: director, profesor, padre, secretaria`
            })
            continue
          }

          // Validar teléfono
          let phone = row.phone ? String(row.phone).replace(/\D/g, '').slice(0, 9) : ''
          if (phone && (phone.length !== 9 || !phone.startsWith('9'))) {
            results.errors.push({
              row: rowNumber,
              message: `Teléfono inválido: ${row.phone}`
            })
            continue
          }

          // Generar email
          const email = row.email || `${String(row.first_name).toLowerCase().replace(/\s+/g, '.')}@luzdelsaber.edu.pe`

          // Mapeo de roles a role_id (debe coincidir con la DB)
          const roleToIdMap = {
            'director': 1,
            'profesor': 2,
            'padre': 3,
            'secretaria': 4
          }

          // Verificar si usuario existe (UPSERT logic)
          const allUsers = await usersService.getAll()
          const existingUser = allUsers.find(u => u.dni === dni)

          const userData = {
            first_name: String(row.first_name).trim(),
            last_names: String(row.last_names).trim(),
            dni: dni,
            document_type: row.document_type || 'DNI',
            email: email,
            role_id: roleToIdMap[rol], // Enviar role_id en vez de rol
            phone: phone || '',
            address: row.address ? String(row.address).trim() : '',
            status: row.status ? String(row.status).toLowerCase() : 'active',
            relationship: row.relationship ? String(row.relationship).toLowerCase() : ''
          }

          if (existingUser) {
            // ✅ ACTUALIZAR usuario existente
            await usersService.update(existingUser.id, userData)
            results.updated.push({
              row: rowNumber,
              name: `${userData.first_name} ${userData.last_names}`,
              dni: dni
            })
          } else {
            // ✅ CREAR nuevo usuario
            userData.password = dni // Solo incluir password en creación
            await usersService.create(userData)
            results.created.push({
              row: rowNumber,
              name: `${userData.first_name} ${userData.last_names}`,
              dni: dni
            })
          }

        } catch (error) {
          results.errors.push({
            row: rowNumber,
            message: error.message || 'Error al procesar fila'
          })
        }
      }

      setImportResults(results)
      loadUsers()

    } catch (error) {
      alert('Error al procesar el archivo: ' + error.message)
    } finally {
      setIsImporting(false)
    }
  }

  const downloadTemplate = () => {
    const template = [
      {
        first_name: 'Juan',
        last_names: 'Pérez García',
        dni: '12345678',
        email: 'juan.perez@luzdelsaber.edu.pe',
        rol: 'profesor',
        phone: '987654321',
        address: 'Av. Principal 123',
        state: 'active',
        relationship: ''
      },
      {
        first_name: 'María',
        last_names: 'López Rodríguez',
        dni: '87654321',
        email: '',
        rol: 'padre',
        phone: '912345678',
        address: 'Jr. Secundaria 456',
        state: 'active',
        relationship: 'madre'
      },
      {
        first_name: 'Carlos',
        last_names: 'Fernández Silva',
        dni: '23456789',
        email: '',
        rol: 'director',
        phone: '998765432',
        address: 'Calle Los Olivos 789',
        state: 'active',
        relationship: ''
      },
      {
        first_name: 'Ana',
        last_names: 'Torres Medina',
        dni: '34567890',
        email: 'ana.torres@luzdelsaber.edu.pe',
        rol: 'secretaria',
        phone: '987123456',
        address: 'Jr. Las Flores 321',
        state: 'active',
        relationship: ''
      }
    ]

    const worksheet = XLSX.utils.json_to_sheet(template)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios')
    XLSX.writeFile(workbook, 'plantilla_usuarios.xlsx')
  }

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false)
    setImportFile(null)
    setImportResults(null)
  }

  const exportUsers = (filteredUsers) => {
    if (filteredUsers.length === 0) {
      alert('⚠️ Sin Datos para Exportar\n\nNo hay usuarios que coincidan con los filtros aplicados.')
      return
    }

    // Exportar con la MISMA estructura que espera la importación
    const dataToExport = filteredUsers.map(user => ({
      first_name: user.first_name || '',
      last_names: user.last_names || '',
      dni: user.dni || '',
      email: user.email || '',
      rol: user.rol ? user.rol.toLowerCase() : 'profesor', // Normalizar a minúscula
      phone: user.phone || '',
      address: user.address || '',
      status: user.status || 'active',
      relationship: user.relationship || ''
    }))

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)

    // Ajustar anchos de columnas
    const columnWidths = [
      { wch: 20 }, // first_name
      { wch: 20 }, // last_names
      { wch: 12 }, // dni
      { wch: 30 }, // email
      { wch: 15 }, // rol
      { wch: 12 }, // phone
      { wch: 30 }, // address
      { wch: 10 }, // state
      { wch: 15 }  // relationship
    ]
    worksheet['!cols'] = columnWidths

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios')

    const now = new Date()
    const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_')
    const fileName = `usuarios_${timestamp}.xlsx`

    XLSX.writeFile(workbook, fileName)
  }

  return {
    isImportModalOpen,
    setIsImportModalOpen,
    importFile,
    importResults,
    isImporting,
    handleImportFile,
    processExcelFile,
    downloadTemplate,
    handleCloseImportModal,
    exportUsers
  }
}
