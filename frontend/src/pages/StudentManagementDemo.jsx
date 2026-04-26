import { useDeferredValue, useState } from 'react'
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Filter,
  GraduationCap,
  LayoutPanelLeft,
  Loader2,
  Mail,
  Search,
  Sparkles,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

const teamMembers = [
  { studentId: '3122410193', name: 'Nguyen Phan Tuan Kiet' },
  { studentId: '3122410301', name: 'Vo Tan Phat' },
  { studentId: '3122410291', name: 'Ha Tran Duy Phat' },
  { studentId: '3122560015', name: 'Nguyen Minh Hau' },
]

const initialStudents = [
  {
    studentCode: '3122410193',
    fullName: 'Nguyen Phan Tuan Kiet',
    className: 'DCT124C2',
    major: 'Cong nghe thong tin',
    schoolEmail: '3122410193@student.sgu.edu.vn',
    hometown: 'TP. Ho Chi Minh',
    advisor: 'ThS. Tran Hoang Nam',
    gender: 'Nam',
    academicStatus: 'Dang hoc',
    gpa: '3.46',
  },
  {
    studentCode: '3122410301',
    fullName: 'Vo Tan Phat',
    className: 'DCT124C2',
    major: 'Ky thuat phan mem',
    schoolEmail: '3122410301@student.sgu.edu.vn',
    hometown: 'Binh Duong',
    advisor: 'ThS. Nguyen Thi Van',
    gender: 'Nam',
    academicStatus: 'Canh bao',
    gpa: '2.38',
  },
  {
    studentCode: '3122410291',
    fullName: 'Ha Tran Duy Phat',
    className: 'DCT124C1',
    major: 'He thong thong tin',
    schoolEmail: '3122410291@student.sgu.edu.vn',
    hometown: 'Dong Nai',
    advisor: 'ThS. Le Thi Minh',
    gender: 'Nam',
    academicStatus: 'Dang hoc',
    gpa: '3.12',
  },
  {
    studentCode: '3122560015',
    fullName: 'Nguyen Minh Hau',
    className: 'DCT125C1',
    major: 'Cong nghe thong tin',
    schoolEmail: '3122560015@student.sgu.edu.vn',
    hometown: 'Long An',
    advisor: 'ThS. Tran Hoang Nam',
    gender: 'Nam',
    academicStatus: 'Hoc bong',
    gpa: '3.81',
  },
]

const emptyForm = {
  fullName: '',
  studentCode: '',
  className: '',
  major: '',
  schoolEmail: '',
  hometown: '',
  advisor: '',
  gender: 'Nam',
  academicStatus: 'Dang hoc',
  gpa: '',
}

const academicStatuses = [
  { value: 'Tat ca', label: 'Tat ca' },
  { value: 'Dang hoc', label: 'Dang hoc' },
  { value: 'Hoc bong', label: 'Hoc bong' },
  { value: 'Canh bao', label: 'Canh bao' },
  { value: 'Bao luu', label: 'Bao luu' },
]

const majors = [
  { value: 'Cong nghe thong tin', label: 'Cong nghe thong tin' },
  { value: 'Ky thuat phan mem', label: 'Ky thuat phan mem' },
  { value: 'He thong thong tin', label: 'He thong thong tin' },
  { value: 'Khoa hoc du lieu', label: 'Khoa hoc du lieu' },
]

const statusStyles = {
  'Dang hoc': 'bg-sage-100 text-sage-700',
  'Hoc bong': 'bg-amber-100 text-amber-700',
  'Canh bao': 'bg-rose-100 text-rose-700',
  'Bao luu': 'bg-slate-100 text-slate-700',
}

async function exportStudentPdf(students) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text('Student Management Report', 14, 18)
  doc.setFontSize(11)
  doc.text('De tai: Xay dung giao dien quan ly sinh vien bang ReactJS', 14, 28)
  doc.text('Nhom thuc hien: Nguyen Phan Tuan Kiet, Vo Tan Phat, Ha Tran Duy Phat, Nguyen Minh Hau', 14, 36)

  autoTable(doc, {
    startY: 44,
    head: [['MSSV', 'Ho va ten', 'Lop', 'Chuyen nganh', 'Trang thai', 'GPA']],
    body: students.map((student) => [
      student.studentCode,
      student.fullName,
      student.className,
      student.major,
      student.academicStatus,
      student.gpa,
    ]),
    styles: {
      fontSize: 9,
    },
    headStyles: {
      fillColor: [74, 108, 87],
    },
  })

  doc.save('student-management-report.pdf')
}

function buildHighlightStats(students) {
  const activeStudents = students.filter((student) => student.academicStatus === 'Dang hoc').length
  const scholarshipStudents = students.filter((student) => student.academicStatus === 'Hoc bong').length
  const averageGpa = (
    students.reduce((total, student) => total + Number(student.gpa || 0), 0) / Math.max(students.length, 1)
  ).toFixed(2)

  return [
    {
      title: 'Tong sinh vien',
      value: students.length,
      note: 'Du lieu hien thi tren mot control tong hop',
      icon: Users,
    },
    {
      title: 'Dang hoc on dinh',
      value: activeStudents,
      note: 'Theo doi nhanh tinh hinh hoc tap',
      icon: GraduationCap,
    },
    {
      title: 'Dat hoc bong',
      value: scholarshipStudents,
      note: 'Nhom sinh vien noi bat trong hoc ky',
      icon: Sparkles,
    },
    {
      title: 'GPA trung binh',
      value: averageGpa,
      note: 'Tong hop de bao cao hoc vu',
      icon: BarChart3,
    },
  ]
}

export function StudentManagementDemo() {
  const [students, setStudents] = useState(initialStudents)
  const [formData, setFormData] = useState(emptyForm)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tat ca')
  const [formError, setFormError] = useState('')
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  const deferredSearchKeyword = useDeferredValue(searchKeyword)
  const stats = buildHighlightStats(students)
  const filteredStudents = students.filter((student) => {
    const matchesKeyword =
      student.fullName.toLowerCase().includes(deferredSearchKeyword.toLowerCase()) ||
      student.studentCode.includes(deferredSearchKeyword) ||
      student.className.toLowerCase().includes(deferredSearchKeyword.toLowerCase())
    const matchesStatus = statusFilter === 'Tat ca' || student.academicStatus === statusFilter

    return matchesKeyword && matchesStatus
  })

  const handleFieldChange = (field) => (event) => {
    const nextValue = event.target.value
    setFormData((current) => ({ ...current, [field]: nextValue }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const requiredFields = ['fullName', 'studentCode', 'className', 'major', 'schoolEmail']
    const hasMissingField = requiredFields.some((field) => !formData[field].trim())

    if (hasMissingField) {
      setFormError('Vui long nhap day du cac truong bat buoc truoc khi them sinh vien.')
      return
    }

    if (students.some((student) => student.studentCode === formData.studentCode.trim())) {
      setFormError('Ma so sinh vien da ton tai. Vui long nhap MSSV khac.')
      return
    }

    setFormError('')

    setStudents((current) => [
      {
        ...formData,
        studentCode: formData.studentCode.trim(),
        fullName: formData.fullName.trim(),
        className: formData.className.trim(),
        major: formData.major.trim(),
        schoolEmail: formData.schoolEmail.trim(),
        hometown: formData.hometown.trim() || 'Chua cap nhat',
        advisor: formData.advisor.trim() || 'Dang bo sung',
        gpa: formData.gpa.trim() || '0.00',
      },
      ...current,
    ])
    setFormData(emptyForm)
  }

  const handleReset = () => {
    setFormError('')
    setFormData(emptyForm)
  }

  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true)
      await exportStudentPdf(students)
    } finally {
      setIsExportingPdf(false)
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(232,214,186,0.55),_transparent_32%),linear-gradient(180deg,#fcfaf5_0%,#f5efe3_55%,#eef4ef_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 shadow-[0_24px_80px_rgba(58,76,61,0.12)] backdrop-blur">
          <div className="grid gap-8 border-b border-sage-100 px-6 py-8 lg:grid-cols-[1.45fr_0.85fr] lg:px-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-sage-100 px-4 py-2 text-sm font-medium text-sage-700">
                <LayoutPanelLeft className="h-4 w-4" />
                ReactJS student management demo inspired by WinForm dashboards
              </div>
              <h1 className="mt-5 text-4xl font-display font-bold leading-tight text-sage-950 sm:text-5xl">
                Student Management Dashboard
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-sage-700 sm:text-lg">
                Giao dien tong hop nhieu thanh phan tren cung mot form: khu vuc thong ke, bo loc,
                form nhap lieu nhieu field, bang du lieu va cum thao tac bao cao. Cach trinh bay nay
                mo phong tinh than cua cac control dashboard trong DevExpress va Infragistics.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  leftIcon={<Download className="h-4 w-4" />}
                  rightIcon={isExportingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  disabled={isExportingPdf}
                  onClick={() => void handleExportPdf()}
                >
                  {isExportingPdf ? 'Dang xuat PDF' : 'Xuat danh sach PDF'}
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<FileSpreadsheet className="h-4 w-4" />}
                  onClick={() => {
                    setStatusFilter('Tat ca')
                    setSearchKeyword('')
                  }}
                >
                  Lam moi bo loc
                </Button>
              </div>
            </div>

            <Card className="border-none bg-sage-950 text-cream-50 shadow-none">
              <CardHeader className="mb-2">
                <CardTitle className="text-2xl text-cream-50">Thanh vien nhom</CardTitle>
                <CardDescription className="text-sage-200">
                  Da an email va so dien thoai theo yeu cau.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.studentId}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <p className="text-base font-semibold">{member.name}</p>
                    <p className="text-sm text-sage-200">MSSV: {member.studentId}</p>
                  </div>
                ))}
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-sage-100">
                  Control tham khao: navigation panel, input editor, filter bar, data grid, stats cards.
                </div>
              </CardContent>
            </Card>
          </div>

          <section className="grid gap-4 px-6 py-6 sm:grid-cols-2 xl:grid-cols-4 xl:px-8">
            {stats.map((stat) => {
              const Icon = stat.icon

              return (
                <Card key={stat.title} className="border-sage-100 bg-white/80 p-0">
                  <CardContent className="flex items-start justify-between gap-4 p-5">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-sage-500">{stat.title}</p>
                      <p className="mt-3 text-3xl font-display font-bold text-sage-900">{stat.value}</p>
                      <p className="mt-2 text-sm text-sage-600">{stat.note}</p>
                    </div>
                    <div className="rounded-2xl bg-sage-100 p-3 text-sage-700">
                      <Icon className="h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </section>

          <section className="grid gap-6 px-6 pb-8 lg:grid-cols-[1.05fr_1.3fr] xl:px-8">
            <Card className="bg-white/90">
              <CardHeader>
                <CardTitle>Them sinh vien moi</CardTitle>
                <CardDescription>
                  Form nay gom nhieu field tren cung mot control de dap ung yeu cau bai tap.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
                  <Input label="Ho va ten" value={formData.fullName} onChange={handleFieldChange('fullName')} />
                  <Input label="Ma so sinh vien" value={formData.studentCode} onChange={handleFieldChange('studentCode')} />
                  <Input label="Lop" value={formData.className} onChange={handleFieldChange('className')} />
                  <Select label="Chuyen nganh" value={formData.major} onChange={handleFieldChange('major')} options={majors} placeholder="Chon chuyen nganh" />
                  <Input
                    label="Email truong"
                    type="email"
                    value={formData.schoolEmail}
                    onChange={handleFieldChange('schoolEmail')}
                    leftIcon={<Mail className="h-4 w-4" />}
                  />
                  <Input label="Que quan" value={formData.hometown} onChange={handleFieldChange('hometown')} />
                  <Input label="Co van hoc tap" value={formData.advisor} onChange={handleFieldChange('advisor')} />
                  <Input label="GPA" value={formData.gpa} onChange={handleFieldChange('gpa')} placeholder="Vi du: 3.25" />
                  <Select
                    label="Gioi tinh"
                    value={formData.gender}
                    onChange={handleFieldChange('gender')}
                    options={[
                      { value: 'Nam', label: 'Nam' },
                      { value: 'Nu', label: 'Nu' },
                      { value: 'Khac', label: 'Khac' },
                    ]}
                  />
                  <Select
                    label="Trang thai hoc tap"
                    value={formData.academicStatus}
                    onChange={handleFieldChange('academicStatus')}
                    options={academicStatuses.filter((status) => status.value !== 'Tat ca')}
                  />

                  {formError && (
                    <p className="sm:col-span-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {formError}
                    </p>
                  )}

                  <div className="sm:col-span-2 flex flex-wrap gap-3 pt-2">
                    <Button type="submit">Them sinh vien</Button>
                    <Button type="button" variant="outline" onClick={handleReset}>
                      Dat lai form
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="grid gap-6">
              <Card className="bg-white/90">
                <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <CardTitle>Bo loc va quan sat du lieu</CardTitle>
                    <CardDescription>
                      Ket hop thanh tim kiem, loc trang thai va bang hien thi de mo phong data grid.
                    </CardDescription>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 md:w-[420px]">
                    <Input
                      label="Tim kiem"
                      value={searchKeyword}
                      onChange={(event) => setSearchKeyword(event.target.value)}
                      placeholder="Nhap ten, MSSV hoac lop"
                      leftIcon={<Search className="h-4 w-4" />}
                    />
                    <Select
                      label="Loc theo trang thai"
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      options={academicStatuses}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-center justify-between rounded-2xl bg-sage-50 px-4 py-3 text-sm text-sage-700">
                    <div className="inline-flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Dang hien thi {filteredStudents.length} / {students.length} sinh vien
                    </div>
                    <span>Control trung tam: table + quick filters</span>
                  </div>

                  <div className="overflow-hidden rounded-[1.5rem] border border-sage-100">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-sage-100" aria-label="Danh sach sinh vien">
                        <thead className="bg-sage-950 text-left text-sm text-cream-50">
                          <tr>
                            <th className="px-4 py-3 font-medium">Sinh vien</th>
                            <th className="px-4 py-3 font-medium">Lop</th>
                            <th className="px-4 py-3 font-medium">Chuyen nganh</th>
                            <th className="px-4 py-3 font-medium">Co van</th>
                            <th className="px-4 py-3 font-medium">Trang thai</th>
                            <th className="px-4 py-3 font-medium">GPA</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-sage-100 bg-white text-sm text-sage-700">
                          {filteredStudents.map((student) => (
                            <tr key={student.studentCode}>
                              <td className="px-4 py-4">
                                <p className="font-semibold text-sage-900">{student.fullName}</p>
                                <p className="text-xs text-sage-500">{student.studentCode}</p>
                                <p className="text-xs text-sage-500">{student.schoolEmail}</p>
                              </td>
                              <td className="px-4 py-4">{student.className}</td>
                              <td className="px-4 py-4">{student.major}</td>
                              <td className="px-4 py-4">{student.advisor}</td>
                              <td className="px-4 py-4">
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[student.academicStatus] || 'bg-slate-100 text-slate-700'}`}
                                >
                                  {student.academicStatus}
                                </span>
                              </td>
                              <td className="px-4 py-4 font-semibold text-sage-900">{student.gpa}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[linear-gradient(135deg,rgba(74,108,87,0.08),rgba(218,173,124,0.18))]">
                <CardHeader>
                  <CardTitle>Huong dan trinh bay trong bao cao PDF</CardTitle>
                  <CardDescription>
                    Co the dua cac muc nay vao file Word/PDF de mo ta qua trinh thuc hien.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm leading-7 text-sage-700">
                  <p>1. Gioi thieu muc tieu xay dung mot giao dien quan ly sinh vien bang ReactJS.</p>
                  <p>2. Liet ke cac control da dung: cards, inputs, selects, filter bar, data table, export button.</p>
                  <p>3. Mo ta quy trinh: len y tuong bo cuc, tao form nhieu field, them bo loc, them bang du lieu, xuat PDF.</p>
                  <p>4. Danh gia ket qua va kha nang mo rong sang sua, xoa, ket noi API backend.</p>
                </CardContent>
              </Card>
            </div>
          </section>
        </section>
      </div>
    </main>
  )
}

export default StudentManagementDemo
