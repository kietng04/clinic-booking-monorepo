const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const PAGE_MARGIN = 14
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2

const COLORS = {
  primary: [15, 76, 92],
  secondary: [18, 110, 130],
  accent: [242, 153, 74],
  ink: [31, 41, 55],
  muted: [100, 116, 139],
  surface: [248, 250, 252],
  border: [226, 232, 240],
  successSurface: [236, 253, 245],
  infoSurface: [239, 246, 255],
  warningSurface: [255, 247, 237],
}

export function sanitizePdfText(value, fallback = 'N/A') {
  if (value === null || value === undefined || value === '') {
    return fallback
  }

  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/\u0110/g, 'D')
    .replace(/[^\x20-\x7E\n]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim() || fallback
}

function formatPdfDate(value) {
  if (!value) return 'N/A'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return sanitizePdfText(value)
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatPdfDateTime(value) {
  if (!value) return 'N/A'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return sanitizePdfText(value)
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatValue(value, fallback = 'N/A') {
  return sanitizePdfText(value, fallback)
}

function buildInfoCards(record) {
  return [
    {
      label: 'Record ID',
      value: `#${formatValue(record.id)}`,
      surface: COLORS.infoSurface,
      text: COLORS.secondary,
    },
    {
      label: 'Visit date',
      value: formatPdfDate(record.createdAt),
      surface: COLORS.successSurface,
      text: COLORS.primary,
    },
    {
      label: 'Doctor',
      value: formatValue(record.doctorName),
      surface: COLORS.warningSurface,
      text: COLORS.accent,
    },
    {
      label: 'Follow-up',
      value: formatPdfDate(record.followUpDate),
      surface: COLORS.surface,
      text: COLORS.ink,
    },
  ]
}

function drawCard(doc, x, y, width, height, card) {
  doc.setFillColor(...card.surface)
  doc.setDrawColor(...COLORS.border)
  doc.roundedRect(x, y, width, height, 4, 4, 'FD')

  doc.setTextColor(...COLORS.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(card.label, x + 4, y + 6)

  doc.setTextColor(...card.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  const lines = doc.splitTextToSize(card.value, width - 8)
  doc.text(lines, x + 4, y + 13)
}

function drawTextSection(doc, { title, body, x, y, width, fillColor }) {
  const safeBody = formatValue(body, 'No details recorded')
  const textLines = doc.splitTextToSize(safeBody, width - 10)
  const height = Math.max(26, 12 + textLines.length * 5 + 8)

  doc.setFillColor(...fillColor)
  doc.setDrawColor(...COLORS.border)
  doc.roundedRect(x, y, width, height, 4, 4, 'FD')

  doc.setTextColor(...COLORS.ink)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(title, x + 5, y + 8)

  doc.setTextColor(...COLORS.ink)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(textLines, x + 5, y + 15)

  return height
}

function drawFooter(doc, pageNumber = doc.internal.getNumberOfPages()) {
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, PAGE_HEIGHT - 12, PAGE_WIDTH, 12, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(
    `HealthFlow Medical Record | Generated ${formatPdfDateTime(new Date())} | Page ${pageNumber}`,
    PAGE_WIDTH / 2,
    PAGE_HEIGHT - 4.5,
    { align: 'center' }
  )
}

function ensurePageSpace(doc, currentY, requiredHeight) {
  if (currentY + requiredHeight <= PAGE_HEIGHT - 18) {
    return currentY
  }

  drawFooter(doc)
  doc.addPage()

  doc.setFillColor(...COLORS.surface)
  doc.setDrawColor(...COLORS.border)
  doc.roundedRect(PAGE_MARGIN, 12, CONTENT_WIDTH, 12, 4, 4, 'FD')
  doc.setTextColor(...COLORS.primary)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Medical Record Continuation', PAGE_MARGIN + 5, 20)

  return 32
}

export function buildMedicalRecordPdfFilename(record) {
  const date = new Date(record?.createdAt)
  const safeDate = Number.isNaN(date.getTime())
    ? 'record-date'
    : date.toISOString().slice(0, 10)

  return `medical-record-${record?.id || 'detail'}-${safeDate}.pdf`
}

export async function downloadMedicalRecordPdf({ record, prescriptions = [] }) {
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default
  const { saveAs } = await import('file-saver')

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, PAGE_WIDTH, 38, 'F')

  doc.setFillColor(...COLORS.secondary)
  doc.circle(183, 14, 18, 'F')
  doc.setFillColor(...COLORS.accent)
  doc.circle(193, 26, 10, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.text('MEDICAL RECORD', PAGE_MARGIN, 16)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('Clinical summary for patient follow-up and document download', PAGE_MARGIN, 24)
  doc.text(`Generated at ${formatPdfDateTime(new Date())}`, PAGE_MARGIN, 30)

  doc.setFillColor(...COLORS.surface)
  doc.setDrawColor(...COLORS.border)
  doc.roundedRect(PAGE_MARGIN, 44, CONTENT_WIDTH, 28, 5, 5, 'FD')

  doc.setTextColor(...COLORS.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('Patient', PAGE_MARGIN + 6, 53)
  doc.text('Appointment', PAGE_MARGIN + 106, 53)

  doc.setTextColor(...COLORS.ink)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text(formatValue(record.patientName), PAGE_MARGIN + 6, 61)
  doc.text(`#${formatValue(record.appointmentId)}`, PAGE_MARGIN + 106, 61)

  doc.setTextColor(...COLORS.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Patient ID: ${formatValue(record.patientId)}`, PAGE_MARGIN + 6, 67)
  doc.text(`Doctor ID: ${formatValue(record.doctorId)}`, PAGE_MARGIN + 106, 67)

  const cards = buildInfoCards(record)
  const cardGap = 4
  const cardWidth = (CONTENT_WIDTH - cardGap) / 2
  let y = 80

  cards.forEach((card, index) => {
    const cardX = PAGE_MARGIN + (index % 2) * (cardWidth + cardGap)
    const cardY = y + Math.floor(index / 2) * 24
    drawCard(doc, cardX, cardY, cardWidth, 20, card)
  })

  y += 50

  doc.setFillColor(...COLORS.warningSurface)
  doc.setDrawColor(...COLORS.accent)
  doc.roundedRect(PAGE_MARGIN, y, CONTENT_WIDTH, 24, 5, 5, 'FD')
  doc.setTextColor(...COLORS.accent)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('PRIMARY DIAGNOSIS', PAGE_MARGIN + 6, y + 7)

  doc.setTextColor(...COLORS.ink)
  doc.setFontSize(14)
  const diagnosisLines = doc.splitTextToSize(
    formatValue(record.diagnosis, 'No diagnosis recorded'),
    CONTENT_WIDTH - 12
  )
  doc.text(diagnosisLines, PAGE_MARGIN + 6, y + 15)

  y += Math.max(30, 14 + diagnosisLines.length * 5)

  const leftWidth = (CONTENT_WIDTH - 4) / 2
  const symptomsHeight = drawTextSection(doc, {
    title: 'Symptoms',
    body: record.symptoms,
    x: PAGE_MARGIN,
    y,
    width: leftWidth,
    fillColor: COLORS.infoSurface,
  })

  const treatmentHeight = drawTextSection(doc, {
    title: 'Treatment plan',
    body: record.treatmentPlan,
    x: PAGE_MARGIN + leftWidth + 4,
    y,
    width: leftWidth,
    fillColor: COLORS.successSurface,
  })

  y += Math.max(symptomsHeight, treatmentHeight) + 8

  if (prescriptions.length > 0) {
    y = ensurePageSpace(doc, y, 45)

    doc.setTextColor(...COLORS.ink)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.text(`Prescription summary (${prescriptions.length} items)`, PAGE_MARGIN, y)

    autoTable(doc, {
      startY: y + 4,
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
      head: [['Medication', 'Dosage', 'Frequency', 'Duration', 'Instructions']],
      body: prescriptions.map((prescription) => ([
        formatValue(prescription.medicationName),
        formatValue(prescription.dosage),
        formatValue(prescription.frequency),
        formatValue(prescription.duration),
        formatValue(prescription.instructions),
      ])),
      headStyles: {
        fillColor: COLORS.primary,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        textColor: COLORS.ink,
        fontSize: 9,
        cellPadding: 3,
        valign: 'middle',
      },
      alternateRowStyles: {
        fillColor: COLORS.surface,
      },
      styles: {
        lineColor: COLORS.border,
        lineWidth: 0.1,
        overflow: 'linebreak',
      },
      didDrawPage: (data) => {
        drawFooter(doc, data.pageNumber)
      },
    })

    y = doc.lastAutoTable.finalY + 8
  }

  y = ensurePageSpace(doc, y, 40)
  const notesHeight = drawTextSection(doc, {
    title: 'Doctor notes',
    body: record.notes,
    x: PAGE_MARGIN,
    y,
    width: CONTENT_WIDTH,
    fillColor: COLORS.surface,
  })

  y += notesHeight + 6

  if (record.attachments?.length) {
    y = ensurePageSpace(doc, y, 32)
    const attachments = record.attachments.map((attachment, index) => (
      `${index + 1}. ${formatValue(attachment)}`
    )).join('\n')

    drawTextSection(doc, {
      title: 'Attachments',
      body: attachments,
      x: PAGE_MARGIN,
      y,
      width: CONTENT_WIDTH,
      fillColor: COLORS.infoSurface,
    })
  }

  drawFooter(doc)

  const pdfArrayBuffer = doc.output('arraybuffer')
  const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' })
  saveAs(pdfBlob, buildMedicalRecordPdfFilename(record))
}
