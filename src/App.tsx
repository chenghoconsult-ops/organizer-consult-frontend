import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { CaseDetailPage } from './pages/CaseDetailPage'
import { CasesPage } from './pages/CasesPage'
import { ConsultantsPage } from './pages/ConsultantsPage'
import { ConsultationFormPage } from './pages/ConsultationFormPage'
import { LoginPage } from './pages/LoginPage'
import { PublicConsultationPage } from './pages/PublicConsultationPage'

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/booking" element={<PublicConsultationPage />} />
      <Route
        path="/cases"
        element={
          <ProtectedRoute>
            <CasesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases/:id"
        element={
          <ProtectedRoute>
            <CaseDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/consultation/new"
        element={
          <ProtectedRoute>
            <ConsultationFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/consultants"
        element={
          <ProtectedRoute>
            <ConsultantsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/cases" replace />} />
    </Routes>
  )
}
