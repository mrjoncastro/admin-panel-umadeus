import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: {},
  LinearScale: {},
  BarElement: {},
  LineElement: {},
  PointElement: {},
  ArcElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
}))

describe('setupCharts', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('registra os componentes apenas uma vez', async () => {
    const { setupCharts } = await import('../lib/chartSetup')
    const { Chart } = await import('chart.js')

    setupCharts()
    setupCharts()

    expect(Chart.register).toHaveBeenCalledTimes(1)
  })

  it('envia todos os modulos para ChartJS.register', async () => {
    const { setupCharts } = await import('../lib/chartSetup')
    const chart = await import('chart.js')

    setupCharts()

    expect(chart.Chart.register).toHaveBeenCalledWith(
      chart.CategoryScale,
      chart.LinearScale,
      chart.BarElement,
      chart.LineElement,
      chart.PointElement,
      chart.ArcElement,
      chart.Title,
      chart.Tooltip,
      chart.Legend,
    )
  })
})
