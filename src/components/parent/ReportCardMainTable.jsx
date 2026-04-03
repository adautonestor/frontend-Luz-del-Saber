import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { styles } from '../../styles/finalReportCardStyles'
import { PERIODOS } from '../../config/reportCardConfig'

/**
 * Componente del header de la tabla (reutilizable para múltiples páginas)
 */
const TableHeader = () => (
  <>
    {/* Header principal */}
    <View style={styles.tableHeader} fixed>
      <View style={[styles.headerCell, { width: 60 }]}>
        <Text>Área curricular</Text>
      </View>
      <View style={[styles.headerCell, { width: 120 }]}>
        <Text>Competencias</Text>
      </View>
      <View style={[styles.headerCell, { width: 95 }]}>
        <Text>{PERIODOS.BIMESTRE_1}</Text>
      </View>
      <View style={[styles.headerCell, { width: 95 }]}>
        <Text>{PERIODOS.BIMESTRE_2}</Text>
      </View>
      <View style={[styles.headerCell, { width: 95 }]}>
        <Text>{PERIODOS.BIMESTRE_3}</Text>
      </View>
      <View style={[styles.headerCell, { width: 95 }]}>
        <Text>{PERIODOS.BIMESTRE_4}</Text>
      </View>
    </View>

    {/* Subheader con NL y Conclusión */}
    <View style={styles.bimesterSubheader} fixed>
      <View style={[styles.subHeaderCell, { width: 60 }]}><Text></Text></View>
      <View style={[styles.subHeaderCell, { width: 120 }]}><Text></Text></View>

      {/* Bimestre 1 */}
      <View style={[styles.subHeaderCell, { width: 18 }]}><Text>NL</Text></View>
      <View style={[styles.subHeaderCell, { width: 77 }]}><Text>Conclusión descriptiva</Text></View>

      {/* Bimestre 2 */}
      <View style={[styles.subHeaderCell, { width: 18 }]}><Text>NL</Text></View>
      <View style={[styles.subHeaderCell, { width: 77 }]}><Text>Conclusión descriptiva</Text></View>

      {/* Bimestre 3 */}
      <View style={[styles.subHeaderCell, { width: 18 }]}><Text>NL</Text></View>
      <View style={[styles.subHeaderCell, { width: 77 }]}><Text>Conclusión descriptiva</Text></View>

      {/* Bimestre 4 */}
      <View style={[styles.subHeaderCell, { width: 18 }]}><Text>NL</Text></View>
      <View style={[styles.subHeaderCell, { width: 77 }]}><Text>Conclusión descriptiva</Text></View>

    </View>
  </>
)

/**
 * Componente de fila de competencia
 */
const CompetenciaRow = ({ comp, ROW_HEIGHT }) => (
  <View style={[styles.competenciaRow, { minHeight: ROW_HEIGHT }]}>
    {/* Competencia */}
    <View style={styles.competenceCellInner}>
      <Text>{comp.competencia}</Text>
    </View>

    {/* Bimestre 1: NL + Conclusión */}
    <View style={styles.gradeCellInner}>
      <Text>{comp.bim1.nota || ''}</Text>
    </View>
    <View style={styles.conclusionCellInner}>
      <Text>{comp.bim1.conclusion}</Text>
    </View>

    {/* Bimestre 2: NL + Conclusión */}
    <View style={styles.gradeCellInner}>
      <Text>{comp.bim2.nota || ''}</Text>
    </View>
    <View style={styles.conclusionCellInner}>
      <Text>{comp.bim2.conclusion}</Text>
    </View>

    {/* Bimestre 3: NL + Conclusión */}
    <View style={styles.gradeCellInner}>
      <Text>{comp.bim3.nota || ''}</Text>
    </View>
    <View style={styles.conclusionCellInner}>
      <Text>{comp.bim3.conclusion}</Text>
    </View>

    {/* Bimestre 4: NL + Conclusión */}
    <View style={styles.gradeCellInner}>
      <Text>{comp.bim4.nota || ''}</Text>
    </View>
    <View style={styles.conclusionCellInner}>
      <Text>{comp.bim4.conclusion}</Text>
    </View>

  </View>
)

/**
 * Componente de fila completa (área + competencia + notas)
 * Cada fila tiene su propia celda de área para evitar problemas con saltos de página
 */
const FullCompetenciaRow = ({ areaName, comp, isFirst, isLast, ROW_HEIGHT }) => (
  <View
    style={[
      styles.fullDataRow,
      { minHeight: ROW_HEIGHT },
      isLast ? { borderBottom: '1.5pt solid black' } : {}
    ]}
    wrap={false}
  >
    {/* Celda del área */}
    <View style={[
      styles.areaCellRow,
      isFirst ? { borderTop: '1pt solid black' } : {},
    ]}>
      {isFirst && <Text style={styles.areaCellText}>{areaName}</Text>}
    </View>

    {/* Competencia */}
    <View style={styles.competenceCellInner}>
      <Text>{comp.competencia}</Text>
    </View>

    {/* Bimestre 1: NL + Conclusión */}
    <View style={styles.gradeCellInner}>
      <Text>{comp.bim1.nota || ''}</Text>
    </View>
    <View style={styles.conclusionCellInner}>
      <Text>{comp.bim1.conclusion}</Text>
    </View>

    {/* Bimestre 2: NL + Conclusión */}
    <View style={styles.gradeCellInner}>
      <Text>{comp.bim2.nota || ''}</Text>
    </View>
    <View style={styles.conclusionCellInner}>
      <Text>{comp.bim2.conclusion}</Text>
    </View>

    {/* Bimestre 3: NL + Conclusión */}
    <View style={styles.gradeCellInner}>
      <Text>{comp.bim3.nota || ''}</Text>
    </View>
    <View style={styles.conclusionCellInner}>
      <Text>{comp.bim3.conclusion}</Text>
    </View>

    {/* Bimestre 4: NL + Conclusión */}
    <View style={styles.gradeCellInner}>
      <Text>{comp.bim4.nota || ''}</Text>
    </View>
    <View style={styles.conclusionCellInner}>
      <Text>{comp.bim4.conclusion}</Text>
    </View>

  </View>
)

/**
 * Componente de la tabla principal de competencias por área curricular
 * Muestra las calificaciones y conclusiones descriptivas por bimestre
 * @param {Map} areaMap - Map con áreas curriculares y sus competencias
 */
const ReportCardMainTable = ({ areaMap }) => {
  const ROW_HEIGHT = 18

  return (
    <View style={styles.mainTable}>
      <TableHeader />

      {/* Filas de datos - cada competencia es una fila independiente */}
      {Array.from(areaMap.entries()).map(([areaName, competencias], areaIdx) => (
        competencias.map((comp, compIdx) => (
          <FullCompetenciaRow
            key={`${areaIdx}-${compIdx}`}
            areaName={areaName}
            comp={comp}
            isFirst={compIdx === 0}
            isLast={compIdx === competencias.length - 1}
            ROW_HEIGHT={ROW_HEIGHT}
          />
        ))
      ))}
    </View>
  )
}

export default ReportCardMainTable
