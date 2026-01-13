import { useNavigate } from 'react-router-dom'

const NotFoundPage = () => {
    const navigate = useNavigate()
    const location = window.location.pathname

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center">
            <h1 className="text-4xl font-bold">404</h1>
            <p className="mt-2 text-lg text-gray-400">Page `{location}` not found.</p>
            <div className="mt-6 max-w-md text-center">
                <p className="text-sm text-gray-500">
                    This application is currently in active development. Some pages may not be
                    available yet.
                </p>
                <p className="mt-3 text-xs text-gray-600">
                    If you believe this is an error, please reach out to us on{' '}
                    <a
                        href="https://discord.gg/hazHVm3nXe"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-accent-light"
                    >
                        Discord
                    </a>{' '}
                    or create an issue on{' '}
                    <a
                        href="https://github.com" // TODO: Update GitHub issues URL on 404 page
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-accent-light"
                    >
                        GitHub
                    </a>
                    .
                </p>
            </div>
            <button
                onClick={() => navigate('/')}
                className="bg-accent hover:bg-accent-dark text-snow mt-8 rounded px-4 py-2 transition-colors hover:cursor-pointer"
            >
                Go Home
            </button>
        </div>
    )
}

export default NotFoundPage
