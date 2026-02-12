import { useNavigate, useLocation } from 'react-router-dom'
import {
    BookSearch as Browse,
    LibraryBig as Library,
    Settings,
    UserRound as User
} from 'lucide-react'
import { SidebarLink } from '@components'

const Sidebar = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const routes = [
        { type: 'page', path: '/', icon: Library, label: 'Library' },
        { type: 'divider' },
        { type: 'page', path: '/browse', icon: Browse, label: 'Browse' },
        { type: 'spacer' },
        { type: 'page', path: '/settings', icon: Settings, label: 'Settings' },
        { type: 'divider' },
        { type: 'page', path: '/profile', icon: User, label: 'Profile' }
    ]

    // Track type counts for generating semantic keys
    const typeCounts = {}

    return (
        <nav className="sidebar bg-secondary text-snow z-1 flex h-screen w-max flex-col p-2 shadow-xl shadow-black/30">
            <ul className="top-nav flex h-full flex-col items-center gap-1">
                {routes.map((route) => {
                    if (!typeCounts[route.type]) {
                        typeCounts[route.type] = 0
                    }
                    const typeKey = `${route.type}-${typeCounts[route.type]}`
                    typeCounts[route.type]++

                    if (route.type === 'divider') {
                        return (
                            <div
                                key={typeKey}
                                id={typeKey}
                                className="divider bg-border my-0.5 h-px w-3/4"
                            ></div>
                        )
                    }
                    if (route.type === 'spacer') {
                        return <div key={typeKey} id={typeKey} className="spacer w-full grow" />
                    }
                    return (
                        <SidebarLink
                            key={typeKey}
                            id={typeKey}
                            icon={route.icon}
                            isActive={location.pathname === route.path}
                            onClick={() => navigate(route.path)}
                            label={route.label}
                        />
                    )
                })}
            </ul>
        </nav>
    )
}

export default Sidebar
