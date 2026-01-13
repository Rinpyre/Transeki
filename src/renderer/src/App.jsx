import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from '@components/Sidebar'
import { BrowsePage, LibraryPage, NotFoundPage } from '@routes'

function App() {
    return (
        <BrowserRouter>
            <div className="app flex h-screen bg-gray-900">
                <Sidebar />
                <Routes>
                    <Route path="/" element={<LibraryPage />} />
                    <Route path="/browse" element={<BrowsePage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </div>
        </BrowserRouter>
    )
}

export default App
