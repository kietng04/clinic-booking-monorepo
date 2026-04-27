import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import {
  Activity,
  Heart,
  Weight,
  Droplet,
  TrendingUp,
  Plus,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { SkeletonCard } from '@/components/ui/Loading'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { healthMetricsApi } from '@/api/healthMetricsApiWrapper'
import { formatDate } from '@/lib/utils'
import { vi } from '@/lib/translations'

const HealthMetrics = () => {
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const [metrics, setMetrics] = useState([])
  const [selectedType, setSelectedType] = useState('BLOOD_PRESSURE')
  const [chartData, setChartData] = useState([])
  const [dateRange, setDateRange] = useState('30days')
  const [isLoading, setIsLoading] = useState(true)
  const [showLogModal, setShowLogModal] = useState(false)
  const [newMetric, setNewMetric] = useState({
    type: 'BLOOD_PRESSURE',
    value: '',
    systolic: '',
    diastolic: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  useEffect(() => {
    fetchMetrics()
  }, [])

  useEffect(() => {
    updateChartData()
  }, [selectedType, dateRange, metrics])

  const fetchMetrics = async () => {
    setIsLoading(true)
    try {
      const data = await healthMetricsApi.getMetricsByPatient(user.id, { size: 200 })
      const normalized = (data || []).map((metric) => ({
        ...metric,
        type: metric.type || metric.metricType,
        date: metric.measuredAt ? metric.measuredAt.split('T')[0] : metric.date,
        measuredAt: metric.measuredAt || metric.createdAt || metric.date,
      }))
      normalized.sort((a, b) => new Date(b.measuredAt) - new Date(a.measuredAt))
      setMetrics(normalized)
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Không thể tải chỉ số sức khỏe',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateChartData = () => {
    const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days + 1)

    const filtered = metrics
      .filter(m => m.type === selectedType)
      .filter(m => new Date(m.measuredAt) >= cutoff)
      .sort((a, b) => new Date(a.measuredAt) - new Date(b.measuredAt))

    const data = filtered.map((metric) => {
      if (selectedType === 'BLOOD_PRESSURE') {
        const [systolic, diastolic] = String(metric.value || '').split('/').map(Number)
        return {
          date: metric.date,
          systolic: Number.isFinite(systolic) ? systolic : null,
          diastolic: Number.isFinite(diastolic) ? diastolic : null,
        }
      }

      const numericValue = Number.parseFloat(metric.value)
      return {
        date: metric.date,
        value: Number.isFinite(numericValue) ? numericValue : null,
      }
    }).filter((metric) => metric.date)

    setChartData(data)
  }

  const handleLogMetric = async () => {
    try {
      const unitMap = {
        BLOOD_PRESSURE: vi.healthMetrics.units.mmHg,
        HEART_RATE: vi.healthMetrics.units.bpm,
        WEIGHT: vi.healthMetrics.units.kg,
        BLOOD_SUGAR: vi.healthMetrics.units['mg/dL'],
        TEMPERATURE: vi.healthMetrics.units.celsius || '°C',
        OXYGEN_SATURATION: vi.healthMetrics.units.percent || '%',
      }

      const metricData = {
        patientId: user.id,
        metricType: newMetric.type,
        value: newMetric.type === 'BLOOD_PRESSURE'
          ? `${newMetric.systolic}/${newMetric.diastolic}`
          : newMetric.value,
        unit: unitMap[newMetric.type] || null,
        measuredAt: `${newMetric.date}T00:00:00`,
        notes: newMetric.notes || null,
      }

      await healthMetricsApi.logMetric(metricData)
      showToast({
        type: 'success',
        message: 'Đã ghi nhận chỉ số sức khỏe',
      })
      setShowLogModal(false)
      setNewMetric({
        type: 'BLOOD_PRESSURE',
        value: '',
        systolic: '',
        diastolic: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      })
      fetchMetrics()
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Không thể ghi nhận chỉ số',
      })
    }
  }

  const getLatestMetric = (type) => {
      const typeMetrics = metrics.filter(m => m.type === type)
    return typeMetrics.length > 0 ? typeMetrics[0] : null
  }

  const metricTypes = [
    {
      id: 'BLOOD_PRESSURE',
      name: vi.healthMetrics.types.BLOOD_PRESSURE,
      icon: Activity,
      color: 'sage',
      normalRange: { min: 90, max: 120 },
      unit: vi.healthMetrics.units.mmHg,
    },
    {
      id: 'HEART_RATE',
      name: vi.healthMetrics.types.HEART_RATE,
      icon: Heart,
      color: 'red',
      normalRange: { min: 60, max: 100 },
      unit: vi.healthMetrics.units.bpm,
    },
    {
      id: 'WEIGHT',
      name: vi.healthMetrics.types.WEIGHT,
      icon: Weight,
      color: 'terra',
      normalRange: { min: 150, max: 200 },
      unit: vi.healthMetrics.units.kg,
    },
    {
      id: 'BLOOD_SUGAR',
      name: vi.healthMetrics.types.BLOOD_SUGAR,
      icon: Droplet,
      color: 'blue',
      normalRange: { min: 70, max: 140 },
      unit: vi.healthMetrics.units['mg/dL'],
    },
  ]

  const selectedMetricType = metricTypes.find(m => m.id === selectedType)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={vi.healthMetrics.title}
        description="Theo dõi các chỉ số sức khỏe theo thời gian, lọc theo loại dữ liệu và thêm bản ghi mới khi cần."
        action={(
          <Button onClick={() => setShowLogModal(true)} leftIcon={<Plus />}>
            {vi.healthMetrics.logNew}
          </Button>
        )}
      />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricTypes.map((metricType, index) => {
          const latest = getLatestMetric(metricType.id)
          const Icon = metricType.icon

          return (
            <motion.div
              key={metricType.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                hover
                onClick={() => setSelectedType(metricType.id)}
                className={`cursor-pointer ${
                  selectedType === metricType.id ? 'ring-2 ring-brand-600' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-${metricType.color}-100 rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${metricType.color}-600`} />
                    </div>
                    {latest && (
                      <div className="text-right">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-sage-600 mb-1">
                    {metricType.name}
                  </h3>
                  {latest ? (
                    <>
                      <p className="text-2xl font-bold text-sage-900 mb-1">
                        {latest.value}
                        <span className="text-sm font-normal text-sage-600 ml-1">
                          {metricType.unit}
                        </span>
                      </p>
                      <p className="text-xs text-sage-500">{formatDate(latest.date)}</p>
                    </>
                  ) : (
                    <p className="text-sm text-sage-500">{vi.healthMetrics.noMetrics}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>{selectedMetricType.name} - {vi.healthMetrics.chartTitle}</CardTitle>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              options={[
                { value: '7days', label: vi.healthMetrics.dateRange['7days'] },
                { value: '30days', label: vi.healthMetrics.dateRange['30days'] },
                { value: '90days', label: vi.healthMetrics.dateRange['3months'] },
              ]}
            />
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              {selectedType === 'BLOOD_PRESSURE' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getMonth() + 1}/${date.getDate()}`
                    }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    domain={[60, 160]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <ReferenceLine
                    y={120}
                    stroke="#dc2626"
                    strokeDasharray="3 3"
                    label={{ value: 'Max Normal', position: 'right', fontSize: 12 }}
                  />
                  <ReferenceLine
                    y={80}
                    stroke="#16a34a"
                    strokeDasharray="3 3"
                    label={{ value: 'Min Normal', position: 'right', fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="systolic"
                    stroke="#5d7a60"
                    strokeWidth={2}
                    name={vi.healthMetrics.systolic}
                    dot={{ fill: '#5d7a60', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    stroke="#bfa094"
                    strokeWidth={2}
                    name={vi.healthMetrics.diastolic}
                    dot={{ fill: '#bfa094', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              ) : (
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getMonth() + 1}/${date.getDate()}`
                    }}
                  />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#5d7a60"
                    fill="#5d7a60"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-96 flex items-center justify-center text-sage-500">
              Chưa có dữ liệu để hiển thị
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Metric Modal */}
      <Modal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        title={vi.healthMetrics.logMetric}
      >
        <div className="space-y-4">
          <Select
            label={vi.healthMetrics.selectMetricType}
            value={newMetric.type}
            onChange={(e) => setNewMetric({ ...newMetric, type: e.target.value })}
            options={metricTypes.map(m => ({ value: m.id, label: m.name }))}
          />

          {newMetric.type === 'BLOOD_PRESSURE' ? (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={vi.healthMetrics.systolic}
                type="number"
                value={newMetric.systolic}
                onChange={(e) => setNewMetric({ ...newMetric, systolic: e.target.value })}
                placeholder="120"
              />
              <Input
                label={vi.healthMetrics.diastolic}
                type="number"
                value={newMetric.diastolic}
                onChange={(e) => setNewMetric({ ...newMetric, diastolic: e.target.value })}
                placeholder="80"
              />
            </div>
          ) : (
            <Input
              label={vi.healthMetrics.value}
              type="number"
              value={newMetric.value}
              onChange={(e) => setNewMetric({ ...newMetric, value: e.target.value })}
              placeholder="Nhập giá trị"
            />
          )}

          <Input
            label="Ngày ghi nhận"
            type="date"
            value={newMetric.date}
            onChange={(e) => setNewMetric({ ...newMetric, date: e.target.value })}
          />

          <Input
            label="Ghi chú (tùy chọn)"
            as="textarea"
            rows={3}
            value={newMetric.notes}
            onChange={(e) => setNewMetric({ ...newMetric, notes: e.target.value })}
            placeholder="Thêm ghi chú..."
          />

          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowLogModal(false)}>
              {vi.common.cancel}
            </Button>
            <Button onClick={handleLogMetric}>
              {vi.common.save}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default HealthMetrics
