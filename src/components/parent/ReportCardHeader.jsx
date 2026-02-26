import React from 'react'
import { View, Text, Image } from '@react-pdf/renderer'
import { styles } from '../../styles/finalReportCardStyles'
import { INSTITUTION_INFO, IMAGES } from '../../config/reportCardConfig'
import { getTutorName } from '../../utils/reportCardUtils'

/**
 * Componente del header de la boleta final
 * Incluye logos laterales y tabla central con información del estudiante
 * @param {Object} studentData - Datos del estudiante
 */
const ReportCardHeader = ({ studentData }) => {
  return (
    <View style={styles.mainHeader}>
      {/* Logo Ministerio (izquierda) */}
      <Image
        src={IMAGES.logoMinisterio}
        style={styles.logoLeft}
      />

      {/* Tabla de información del estudiante (centro) */}
      <View style={styles.infoTable}>
        {/* Fila 1: DRE / UGEL */}
        <View style={styles.infoRow}>
          <View style={[styles.infoCellLabel, { width: '25%' }]}>
            <Text>DRE:</Text>
          </View>
          <View style={[styles.infoCell, { width: '25%' }]}>
            <Text>{INSTITUTION_INFO.dre}</Text>
          </View>
          <View style={[styles.infoCellLabel, { width: '25%' }]}>
            <Text>UGEL:</Text>
          </View>
          <View style={[styles.infoCellNoBorder, { width: '25%' }]}>
            <Text>{INSTITUTION_INFO.ugel}</Text>
          </View>
        </View>

        {/* Fila 2: Nivel / Código Modular */}
        <View style={styles.infoRow}>
          <View style={[styles.infoCellLabel, { width: '25%' }]}>
            <Text>Nivel:</Text>
          </View>
          <View style={[styles.infoCell, { width: '25%' }]}>
            <Text>{studentData.nivel || 'Primaria'}</Text>
          </View>
          <View style={[styles.infoCellLabel, { width: '25%' }]}>
            <Text>Código Modular:</Text>
          </View>
          <View style={[styles.infoCellNoBorder, { width: '25%' }]}>
            <Text>{INSTITUTION_INFO.codigoModular}</Text>
          </View>
        </View>

        {/* Fila 3: Institución educativa */}
        <View style={styles.infoRow}>
          <View style={[styles.infoCellLabel, { width: '25%' }]}>
            <Text>Institución educativa:</Text>
          </View>
          <View style={[styles.infoCellNoBorder, { width: '75%' }]}>
            <Text>{INSTITUTION_INFO.nombreInstitucion}</Text>
          </View>
        </View>

        {/* Fila 4: Grado / Sección */}
        <View style={styles.infoRow}>
          <View style={[styles.infoCellLabel, { width: '25%' }]}>
            <Text>Grado:</Text>
          </View>
          <View style={[styles.infoCell, { width: '25%' }]}>
            <Text>{studentData.gradeName || studentData.grado || ''}</Text>
          </View>
          <View style={[styles.infoCellLabel, { width: '25%' }]}>
            <Text>Sección:</Text>
          </View>
          <View style={[styles.infoCellNoBorder, { width: '25%' }]}>
            <Text>{studentData.seccion || INSTITUTION_INFO.seccionDefecto}</Text>
          </View>
        </View>

        {/* Fila 5: Apellidos y nombres */}
        <View style={styles.infoRow}>
          <View style={[styles.infoCellLabel, { width: '25%' }]}>
            <Text>Apellidos y nombres del estudiante:</Text>
          </View>
          <View style={[styles.infoCellNoBorder, { width: '75%' }]}>
            <Text>{studentData.last_names}, {studentData.first_names}</Text>
          </View>
        </View>

        {/* Fila 6: Código / DNI */}
        <View style={styles.infoRow}>
          <View style={[styles.infoCellLabel, { width: '25%' }]}>
            <Text>Código del estudiante:</Text>
          </View>
          <View style={[styles.infoCell, { width: '25%' }]}>
            <Text>{studentData.code || studentData.id}</Text>
          </View>
          <View style={[styles.infoCellLabel, { width: '25%' }]}>
            <Text>DNI:</Text>
          </View>
          <View style={[styles.infoCellNoBorder, { width: '25%' }]}>
            <Text>{studentData.dni || '00000000'}</Text>
          </View>
        </View>

        {/* Fila 7: Docente tutor */}
        <View style={styles.infoRowLast}>
          <View style={[styles.infoCellLabel, { width: '25%' }]}>
            <Text>Apellidos y nombres del docente o tutor:</Text>
          </View>
          <View style={[styles.infoCellNoBorder, { width: '75%' }]}>
            <Text>{getTutorName(studentData)}</Text>
          </View>
        </View>
      </View>

      {/* Logo IEP (derecha) */}
      <Image
        src={IMAGES.logoColegio}
        style={styles.logoRight}
      />
    </View>
  )
}

export default ReportCardHeader
