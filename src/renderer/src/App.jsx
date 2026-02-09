import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Sidebar } from '@components'
import { BrowsePage, LibraryPage, NotFoundPage } from '@routes'

function App() {
    return (
        <BrowserRouter>
            <div className="app bg-primary flex h-screen w-full">
                <Sidebar />
                <div className="flex w-full grow items-center justify-center overflow-hidden">
                    <Routes>
                        <Route path="/" element={<LibraryPage />} />
                        <Route path="/browse" element={<BrowsePage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    )
}

export default App
