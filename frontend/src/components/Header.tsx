interface HeaderProps {
    onLoginClick: () => void;
}

export default function Header({ onLoginClick }: HeaderProps) {
    return (
        <header className="bg-white border-b border-gray-200">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-blue-600">
                            SportHub
                        </h1>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <a href="#" className="text-gray-600 hover:text-gray-900 transition">
                            Trang chủ
                        </a>
                        <a href="#" className="text-gray-600 hover:text-gray-900 transition">
                            Sự kiện
                        </a>
                        <a href="#" className="text-gray-600 hover:text-gray-900 transition">
                            Về chúng tôi
                        </a>
                    </nav>

                    {/* Login Button */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onLoginClick}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            Đăng nhập
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
