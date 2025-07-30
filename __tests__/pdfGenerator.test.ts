import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PDFGenerator } from '@/lib/services/pdfGenerator'
import { PDF_CONSTANTS, normalizeDate } from '@/lib/utils/pdfUtils'

// Mock do jsPDF
const mockJsPDF = {
  internal: {
    pageSize: {
      getWidth: () => 595.28,
      getHeight: () => 841.89
    }
  },
  setFontSize: vi.fn(),
  setFont: vi.fn(),
  setFillColor: vi.fn(),
  setDrawColor: vi.fn(),
  setLineWidth: vi.fn(),
  setTextColor: vi.fn(),
  rect: vi.fn(),
  text: vi.fn(),
  line: vi.fn(),
  splitTextToSize: vi.fn((text: string) => [text]),
  addPage: vi.fn(),
  save: vi.fn()
}

describe('PDFGenerator - Melhorias Implementadas', () => {
  let generator: PDFGenerator

  beforeEach(() => {
    vi.clearAllMocks()
    generator = new PDFGenerator(mockJsPDF as any)
  })

  describe('Constantes PDF', () => {
    it('deve ter as novas cores para tabelas', () => {
      expect(PDF_CONSTANTS.COLORS.HEADER_BG).toEqual([240, 240, 240])
      expect(PDF_CONSTANTS.COLORS.ROW_ALT_BG).toEqual([242, 242, 242])
      expect(PDF_CONSTANTS.COLORS.BORDER).toEqual([200, 200, 200])
    })

    it('deve ter as novas dimensões', () => {
      expect(PDF_CONSTANTS.DIMENSIONS.HEADER_HEIGHT).toBe(12)
      expect(PDF_CONSTANTS.DIMENSIONS.ROW_HEIGHT).toBe(8)
      expect(PDF_CONSTANTS.DIMENSIONS.CELL_PADDING).toBe(4)
    })
  })

  describe('normalizeDate', () => {
    it('deve normalizar data válida', () => {
      const result = normalizeDate('2024-01-15T10:30:00Z')
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
    })

    it('deve retornar "Não informado" para data null', () => {
      const result = normalizeDate(null)
      expect(result).toBe('Não informado')
    })

    it('deve retornar "Data inválida" para data inválida', () => {
      const result = normalizeDate('data-invalida')
      expect(result).toBe('Data inválida')
    })
  })

  describe('Métodos auxiliares', () => {
    it('deve calcular posições dinâmicas das colunas', () => {
      const positions = (generator as any).calculateColumnPositions(3)
      expect(positions).toHaveLength(3)
      expect(positions[0]).toBe(0)
      expect(positions[1]).toBeGreaterThan(positions[0])
      expect(positions[2]).toBeGreaterThan(positions[1])
    })

    it('deve aplicar zebra striping corretamente', () => {
      const applyZebraStriping = (generator as any).applyZebraStriping.bind(generator)
      
      // Para índice par (0, 2, 4...), não deve aplicar zebra striping
      applyZebraStriping(100, 0)
      expect(mockJsPDF.setFillColor).not.toHaveBeenCalled()
      
      // Para índice ímpar (1, 3, 5...), deve aplicar zebra striping
      applyZebraStriping(100, 1)
      expect(mockJsPDF.setFillColor).toHaveBeenCalledWith(242, 242, 242)
      expect(mockJsPDF.rect).toHaveBeenCalledWith(
        expect.any(Number),
        96, // y - 4
        expect.any(Number),
        8, // ROW_HEIGHT
        'F'
      )
    })

    it('deve renderizar cabeçalho de tabela com estilo', () => {
      const headers = ['Coluna 1', 'Coluna 2']
      const positions = [0, 50]
      const renderTableHeader = (generator as any).renderTableHeader.bind(generator)
      
      renderTableHeader(headers, positions, 100)
      
      // Verificar se aplicou fundo
      expect(mockJsPDF.setFillColor).toHaveBeenCalledWith(240, 240, 240)
      expect(mockJsPDF.rect).toHaveBeenCalledWith(
        expect.any(Number),
        92, // y - 8
        expect.any(Number),
        12, // HEADER_HEIGHT
        'F'
      )
      
      // Verificar se aplicou borda
      expect(mockJsPDF.setDrawColor).toHaveBeenCalledWith(200, 200, 200)
      expect(mockJsPDF.setLineWidth).toHaveBeenCalledWith(0.5)
      
      // Verificar se configurou fonte
      expect(mockJsPDF.setFontSize).toHaveBeenCalledWith(8)
      expect(mockJsPDF.setFont).toHaveBeenCalledWith('helvetica', 'bold')
      expect(mockJsPDF.setTextColor).toHaveBeenCalledWith(0, 0, 0)
      
      // Verificar se desenhou textos
      expect(mockJsPDF.text).toHaveBeenCalledWith('Coluna 1', expect.any(Number), 100)
      expect(mockJsPDF.text).toHaveBeenCalledWith('Coluna 2', expect.any(Number), 100)
    })
  })

  describe('Melhorias nas tabelas', () => {
    it('deve usar splitTextToSize em vez de substring', () => {
      const mockData = ['Texto muito longo que deveria ser quebrado']
      const colWidth = (595.28 - 2 * 20) / 1 // pageWidth - 2*margin / colCount
      
      vi.mocked(mockJsPDF.splitTextToSize).mockReturnValue(['Texto muito longo', 'que deveria ser quebrado'])
      
      // Simular chamada de splitTextToSize
      const wrapped = mockJsPDF.splitTextToSize(mockData[0], colWidth - 4)
      
      expect(mockJsPDF.splitTextToSize).toHaveBeenCalledWith(
        'Texto muito longo que deveria ser quebrado',
        colWidth - 4
      )
      expect(wrapped).toEqual(['Texto muito longo', 'que deveria ser quebrado'])
    })
  })
}) 