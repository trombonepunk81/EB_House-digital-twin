import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ViewerPage from './viewer/ViewerPage'
import AssetsPage from './assets/AssetsPage'
import DashboardPage from './components/DashboardPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/viewer" element={<ViewerPage />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/assets/:id" element={<AssetsPage />} />
      </Routes>
    </Layout>
  )
}
