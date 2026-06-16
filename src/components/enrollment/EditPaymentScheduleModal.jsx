import React, { useState, useEffect, useMemo } from 'react'
import { X, Plus, Trash2, Lock, Calendar, AlertCircle, Save } from 'lucide-react'
import { useAcademicStore } from '../../stores/academicStore'
import { usePaymentsStore } from '../../stores/paymentsStore'
import { paymentsService } from '../../services/paymentsService'

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const numToMonth = (n) => (n >= 1 && n <= 12 ? MONTHS[n - 1] : '—')
const toYmd = (d) => {
  if (!d) return ''
  const s = typeof d === 'string' ? d : new Date(d).toISOString()
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.split('T')[0] : new Date(d).toISOString().split('T')[0]
}
let _tmp = 0
const tmpKey = () => `new-${++_tmp}`

/**
 * Modal para EDITAR el cronograma de pagos de un estudiante (mismo patrón en cascada).
 * Permite ajustar monto, fecha y exoneración, agregar y quitar cuotas.
 * Las cuotas YA PAGADAS quedan bloqueadas (no se editan monto/exoneración ni se eliminan).
 */
const EditPaymentScheduleModal = ({ student, onClose, onSuccess }) => {
  const { academicYears, initialize: initializeAcademic } = useAcademicStore()
  const { concepts, initialize: initializePayments } = usePaymentsStore()

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const yearValue = useMemo(() => {
    if (student.academic_year && !isNaN(student.academic_year)) return parseInt(student.academic_year)
    const ay = academicYears.find(a => String(a.id) === String(student.academic_year_id))
    return ay ? (ay.year || null) : null
  }, [academicYears, student])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        if (!academicYears.length) await initializeAcademic()
        if (!concepts || concepts.length === 0) { try { await initializePayments() } catch (e) {} }

        const yv = student.academic_year && !isNaN(student.academic_year)
          ? parseInt(student.academic_year)
          : (useAcademicStore.getState().academicYears.find(a => String(a.id) === String(student.academic_year_id))?.year || null)

        const obligations = await paymentsService.getObligationsByStudent(student.id, yv)
        const list = Array.isArray(obligations) ? obligations : []
        setRows(list.map(o => {
          const paid = Number(o.paid_amount) || 0
          const locked = o.status === 'paid' || paid > 0
          return {
            rowKey: `id-${o.id}`,
            id: o.id,
            concept_id: o.concept_id,
            concept_name: o.concept_name || o.concepto || `Concepto ${o.concept_id}`,
            due_month: o.due_month ?? null,
            due_date: toYmd(o.due_date),
            total_amount: Number(o.total_amount) || 0,
            paid_amount: paid,
            status: o.status,
            exonerado: o.status === 'exonerado' || o.exonerado === true,
            locked,
            isNew: false
          }
        }))
      } catch (e) {
        setError(e.message || 'Error al cargar el cronograma')
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const activeConcepts = useMemo(
    () => (concepts || []).filter(c => (c.state || c.status) === 'active'),
    [concepts]
  )

  const updateRow = (key, patch) => setRows(prev => prev.map(r => r.rowKey === key ? { ...r, ...patch } : r))
  const removeRow = (key) => setRows(prev => prev.filter(r => r.rowKey !== key))

  const addRow = () => {
    setRows(prev => [...prev, {
      rowKey: tmpKey(), id: null, concept_id: '', concept_name: '',
      due_month: null, due_date: '', total_amount: 0, paid_amount: 0,
      status: 'pending', exonerado: false, locked: false, isNew: true
    }])
  }

  const onConceptChange = (key, conceptId) => {
    const c = activeConcepts.find(x => String(x.id) === String(conceptId))
    updateRow(key, {
      concept_id: conceptId ? parseInt(conceptId) : '',
      concept_name: c?.name || '',
      total_amount: c ? (Number(c.amount) || 0) : 0
    })
  }

  const total = useMemo(
    () => rows.reduce((s, r) => s + (r.exonerado ? 0 : (Number(r.total_amount) || 0)), 0),
    [rows]
  )

  const handleSave = async () => {
    setError('')
    // Validación de filas nuevas
    for (const r of rows) {
      if (r.isNew) {
        if (!r.concept_id) return setError('Hay una cuota nueva sin concepto seleccionado')
        if (!r.due_date) return setError('Hay una cuota nueva sin fecha de vencimiento')
        if (r.total_amount === '' || r.total_amount === null || isNaN(Number(r.total_amount))) return setError('Hay una cuota nueva sin monto válido')
      }
    }
    if (!yearValue) return setError('No se pudo determinar el año lectivo del estudiante')

    setSaving(true)
    try {
      const items = rows.map(r => ({
        id: r.isNew ? undefined : r.id,
        concept_id: r.concept_id,
        due_month: r.due_month || null,
        due_date: r.due_date,
        total_amount: Number(r.total_amount) || 0,
        exonerado: r.exonerado === true
      }))
      await paymentsService.updateStudentSchedule(student.id, yearValue, items)
      onSuccess?.()
      onClose()
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Error al guardar el cronograma')
    } finally {
      setSaving(false)
    }
  }

  const fullName = `${student.first_names || ''} ${`${student.paternal_last_name || ''} ${student.maternal_last_name || ''}`.trim() || student.last_names || ''}`.trim()

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="mr-2" size={20} /> Editar Cronograma de Pagos
            </h3>
            <p className="text-sm text-gray-500">{fullName} · Año {yearValue || '—'}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-start">
            <AlertCircle className="text-red-500 mr-2 flex-shrink-0 mt-0.5" size={18} />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 flex items-center justify-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" /> Cargando cronograma...
          </div>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Concepto</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mes</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Monto (S/.)</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vencimiento</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Exonerar</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rows.length === 0 && (
                      <tr><td colSpan="7" className="px-3 py-6 text-center text-gray-500">Sin cuotas. Usa "Agregar cuota".</td></tr>
                    )}
                    {rows.map(r => (
                      <tr key={r.rowKey} className={r.locked ? 'bg-green-50/40' : 'hover:bg-gray-50'}>
                        <td className="px-3 py-2">
                          {r.isNew ? (
                            <select value={r.concept_id} onChange={e => onConceptChange(r.rowKey, e.target.value)}
                              className="w-full px-2 py-1 border rounded">
                              <option value="">Seleccionar...</option>
                              {activeConcepts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          ) : (
                            <span className="text-gray-900">{r.concept_name}</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {r.isNew ? (
                            <select value={r.due_month ?? ''} onChange={e => updateRow(r.rowKey, { due_month: e.target.value ? parseInt(e.target.value) : null })}
                              className="w-full px-2 py-1 border rounded">
                              <option value="">Ninguno (único)</option>
                              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                            </select>
                          ) : (
                            <span className="text-gray-600">{numToMonth(r.due_month)}</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" step="0.01" min="0" value={r.total_amount}
                            disabled={r.locked}
                            onChange={e => updateRow(r.rowKey, { total_amount: e.target.value })}
                            className={`w-24 px-2 py-1 border rounded ${r.locked ? 'bg-gray-100 cursor-not-allowed' : ''}`} />
                        </td>
                        <td className="px-3 py-2">
                          <input type="date" value={r.due_date}
                            disabled={r.locked}
                            onChange={e => updateRow(r.rowKey, { due_date: e.target.value })}
                            className={`px-2 py-1 border rounded ${r.locked ? 'bg-gray-100 cursor-not-allowed' : ''}`} />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input type="checkbox" checked={r.exonerado} disabled={r.locked}
                            onChange={e => updateRow(r.rowKey, { exonerado: e.target.checked })}
                            className="w-4 h-4" />
                        </td>
                        <td className="px-3 py-2 text-center">
                          {r.locked ? (
                            <span className="inline-flex items-center text-xs text-green-700"><Lock size={12} className="mr-1" /> Pagado</span>
                          ) : r.exonerado ? (
                            <span className="text-xs text-orange-600">Exonerado</span>
                          ) : (
                            <span className="text-xs text-gray-500">Pendiente</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {!r.locked && (
                            <button onClick={() => removeRow(r.rowKey)} className="text-red-500 hover:text-red-700" title="Quitar cuota">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="2" className="px-3 py-2 text-right font-semibold text-gray-900">Total a pagar:</td>
                      <td className="px-3 py-2 font-bold text-primary-600">S/. {total.toFixed(2)}</td>
                      <td colSpan="4"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <button onClick={addRow} className="inline-flex items-center px-3 py-2 text-sm border border-primary-600 text-primary-600 rounded hover:bg-primary-50">
                <Plus size={16} className="mr-1" /> Agregar cuota
              </button>
              <p className="text-xs text-gray-500 flex items-center">
                <AlertCircle size={14} className="mr-1" /> Las cuotas pagadas no se pueden editar ni eliminar.
              </p>
            </div>

            <div className="flex gap-3 pt-5">
              <button type="button" onClick={onClose} className="btn btn-outline flex-1" disabled={saving}>Cancelar</button>
              <button type="button" onClick={handleSave} className="btn btn-primary flex-1 flex items-center justify-center" disabled={saving}>
                {saving ? 'Guardando...' : (<><Save size={16} className="mr-2" /> Guardar Cronograma</>)}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default EditPaymentScheduleModal
