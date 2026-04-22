import { HashRouter, Routes, Route } from 'react-router-dom'
import { Sidebar, Titlebar } from '@components'
import { BrowsePage, LibraryPage, NotFoundPage } from '@routes'

function App() {
    const isWindows = window.env.platform === 'win32'

    return (
        <HashRouter>
            <div className="app bg-primary flex h-screen w-full">
                <Sidebar />
                {isWindows && <Titlebar />}
                <div className="flex w-full grow items-center justify-center overflow-hidden">
                    <Routes>
                        <Route path="/library" element={<LibraryPage />} />
                        <Route path="/browse" element={<BrowsePage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </div>
            </div>
        </HashRouter>
    )
}

export default App
