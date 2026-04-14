import { useNavigate, useLocation } from 'react-router-dom'
import {
    House as Home,
    LibraryBig as Library,
    Search as Browse,
    Bolt as Settings,
    CircleUser as Account
} from 'lucide-react'
import { SidebarLink } from '@components'
import Logo from '@assets/logo.png'

export const Sidebar = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const routes = [
        { type: 'logo', icon: Logo, label: 'Transeki' },
        { type: 'page', path: '/', icon: Home, label: 'Home' },
        { type: 'page', path: '/library', icon: Library, label: 'Library' },
        { type: 'page', path: '/browse', icon: Browse, label: 'Browse' },
        { type: 'spacer' },
        { type: 'page', path: '/settings', icon: Settings, label: 'Settings' },
        { type: 'page', path: '/profile', icon: Account, label: 'Profile' }
    ]

    // Track type counts for generating semantic keys
    const typeCounts = {}

    return (
        <nav className="sidebar text-snow z-1 flex h-screen w-max flex-col bg-transparent py-2">
            <ul className="top-nav flex h-full flex-col items-center gap-2">
                {routes.map((route) => {
                    if (!typeCounts[route.type]) {
                        typeCounts[route.type] = 0
                    }
                    const typeKey = `${route.type}-${typeCounts[route.type]}`
                    typeCounts[route.type]++

                    if (route.type === 'logo') {
                        return (
                            <li
                                key={typeKey}
                                id={typeKey}
                                className="logo my-2 flex w-full items-center justify-end select-none"
                            >
                                <img
                                    src={route.icon}
                                    alt={`${route.label} Logo`}
                                    className="h-10 w-auto select-none"
                                />
                            </li>
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
