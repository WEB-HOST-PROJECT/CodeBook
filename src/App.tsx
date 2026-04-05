import { Route, Routes, Navigate } from 'react-router-dom'
import Teacher from './pages/Teacher'
import Students from './pages/Students'
import Header from './components/Header'
import Login from './pages/Login'
import TeacherAuth from './pages/TeacherAuth'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

const App = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <Header />
        <main className="flex-1 flex flex-col relative w-full pt-6 px-4 pb-12 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/teacher-portal-access" element={<TeacherAuth />} />
            <Route path="/students" element={
              <ProtectedRoute allowedRoles={['student']}>
                <Students />
              </ProtectedRoute>
            } />
            <Route path="/teacher" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <Teacher />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}

export default App