import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import ResultsPage from './pages/ResultsPage'
import BrowsePage from './pages/BrowsePage'
import ToolDetailPage from './pages/ToolDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg-base">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/tool/:id" element={<ToolDetailPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
