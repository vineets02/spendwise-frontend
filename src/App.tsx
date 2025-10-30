
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
function Protected({children}:{children:React.ReactNode}){ const {token}=useAuth(); if(!token) return <Navigate to="/login" replace/>; return <>{children}</> }
function Shell({children}:{children:React.ReactNode}){
  const nav=useNavigate(); const {logout}=useAuth()
  return (<div className="min-h-screen">
    <header className="border-b bg-white"><div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
      <Link to="/" className="font-bold text-slate-900">SpendWise</Link>
      <nav className="flex gap-4 text-sm"><Link to="/app">Dashboard</Link><button onClick={()=>{logout();nav('/login')}} className="text-red-600">Logout</button></nav>
    </div></header>
    <main className="max-w-6xl mx-auto p-4">{children}</main></div>)
}
export default function App(){
  return (<AuthProvider>
    <Routes>
      <Route path="/login" element={<LoginPage/>} />
      <Route path="/register" element={<RegisterPage/>} />
      <Route path="/app" element={<Protected><Shell><Dashboard/></Shell></Protected>} />
      <Route path="/" element={<Navigate to="/app" />} />
    </Routes>
  </AuthProvider>)
}
