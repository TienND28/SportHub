import { useState } from 'react';
import Header from '../components/Header';
import AuthModal from '../components/AuthModal';

export default function HomePage() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

    const handleOpenLogin = () => {
        setAuthMode('login');
        setIsAuthModalOpen(true);
    };

    const handleOpenRegister = () => {
        setAuthMode('register');
        setIsAuthModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-white">
            <Header onLoginClick={handleOpenLogin} />

            <main className="container mx-auto px-4 py-8">
                <div className="text-center py-20">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Chào mừng đến với SportHub
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Nền tảng quản lý sự kiện thể thao hàng đầu
                    </p>
                    <button
                        onClick={handleOpenRegister}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        Bắt đầu ngay
                    </button>
                </div>
            </main>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                mode={authMode}
                onSwitchMode={(mode) => setAuthMode(mode)}
            />
        </div>
    );
}
