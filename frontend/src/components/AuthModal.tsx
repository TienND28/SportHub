import { useState } from 'react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'login' | 'register';
    onSwitchMode: (mode: 'login' | 'register') => void;
}

export default function AuthModal({ isOpen, onClose, mode, onSwitchMode }: AuthModalProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement authentication logic
        console.log('Submit:', { email, password, name, phone, rememberMe, mode });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                </h2>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'register' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Họ và tên
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Nhập họ và tên"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nhập email"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nhập mật khẩu"
                            required
                        />
                    </div>

                    {mode === 'login' && (
                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</span>
                            </label>
                            <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                                Quên mật khẩu?
                            </a>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                        {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                    </button>
                </form>

                {/* Switch Mode */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    {mode === 'login' ? (
                        <>
                            Chưa có tài khoản?{' '}
                            <button
                                onClick={() => onSwitchMode('register')}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Đăng ký ngay
                            </button>
                        </>
                    ) : (
                        <>
                            Đã có tài khoản?{' '}
                            <button
                                onClick={() => onSwitchMode('login')}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Đăng nhập
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
