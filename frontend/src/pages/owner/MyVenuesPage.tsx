import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import venueService from "../../services/venue.service";
import type {
    Venue,
    CreateVenueDto,
} from "../../services/venue.service";
import { toast } from "react-toastify";
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    MapPinIcon,
    ClockIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";

export default function MyVenuesPage() {
    const { user } = useAuth();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
    const [formData, setFormData] = useState<CreateVenueDto>({
        name: "",
        description: "",
        address: "",
        opening_time: "",
        closing_time: "",
    });

    useEffect(() => {
        if (user) {
            fetchMyVenues();
        }
    }, [user]);

    const fetchMyVenues = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const response = await venueService.getVenuesByOwnerId(user.id);
            setVenues(response.data);
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Lỗi khi tải danh sách sân"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (venue?: Venue) => {
        if (venue) {
            setEditingVenue(venue);
            setFormData({
                name: venue.name,
                description: venue.description || "",
                address: venue.address || "",
                opening_time: venue.opening_time
                    ? new Date(venue.opening_time).toTimeString().slice(0, 5)
                    : "",
                closing_time: venue.closing_time
                    ? new Date(venue.closing_time).toTimeString().slice(0, 5)
                    : "",
                lat: venue.lat,
                lng: venue.lng,
                image: venue.image,
            });
        } else {
            setEditingVenue(null);
            setFormData({
                name: "",
                description: "",
                address: "",
                opening_time: "",
                closing_time: "",
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingVenue(null);
        setFormData({
            name: "",
            description: "",
            address: "",
            opening_time: "",
            closing_time: "",
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingVenue) {
                await venueService.updateVenue(editingVenue.id, formData);
                toast.success("Cập nhật sân thành công!");
            } else {
                await venueService.createVenue(formData);
                toast.success("Tạo sân mới thành công!");
            }
            handleCloseModal();
            fetchMyVenues();
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ||
                `Lỗi khi ${editingVenue ? "cập nhật" : "tạo"} sân`
            );
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Bạn có chắc muốn xóa sân "${name}"?`)) return;

        try {
            await venueService.deleteVenue(id);
            toast.success("Xóa sân thành công!");
            fetchMyVenues();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi xóa sân");
        }
    };

    const handleToggleStatus = async (venue: Venue) => {
        try {
            await venueService.updateVenue(venue.id, {
                is_active: !venue.is_active,
            });
            toast.success(
                `${venue.is_active ? "Tắt" : "Bật"} hoạt động sân thành công!`
            );
            fetchMyVenues();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi cập nhật trạng thái");
        }
    };

    const formatTime = (time?: string) => {
        if (!time) return "N/A";
        return new Date(time).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Quản Lý Sân Của Tôi
                            </h1>
                            <p className="mt-2 text-slate-600">
                                Quản lý và cập nhật thông tin các sân của bạn
                            </p>
                        </div>
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Thêm Sân Mới
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
                    </div>
                )}

                {/* Venues List */}
                {!loading && venues.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {venues.map((venue) => (
                            <div
                                key={venue.id}
                                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200"
                            >
                                {/* Image */}
                                <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100">
                                    {venue.image ? (
                                        <img
                                            src={venue.image}
                                            alt={venue.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <MapPinIcon className="w-16 h-16 text-purple-300" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <button
                                            onClick={() =>
                                                handleToggleStatus(venue)
                                            }
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${venue.is_active
                                                ? "bg-green-500 text-white"
                                                : "bg-red-500 text-white"
                                                }`}
                                        >
                                            {venue.is_active ? "Hoạt động" : "Tắt"}
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                                        {venue.name}
                                    </h3>

                                    {venue.description && (
                                        <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                                            {venue.description}
                                        </p>
                                    )}

                                    {/* Location */}
                                    {venue.address && (
                                        <div className="flex items-start gap-2 text-sm text-slate-600 mb-3">
                                            <MapPinIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-500" />
                                            <span className="line-clamp-2">{venue.address}</span>
                                        </div>
                                    )}

                                    {/* Opening Hours */}
                                    {(venue.opening_time || venue.closing_time) && (
                                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                                            <ClockIcon className="w-4 h-4 text-purple-500" />
                                            <span>
                                                {formatTime(venue.opening_time)} -{" "}
                                                {formatTime(venue.closing_time)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenModal(venue)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all font-medium"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(venue.id, venue.name)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all font-medium"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && venues.length === 0 && (
                    <div className="text-center py-20">
                        <MapPinIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">
                            Chưa có sân nào
                        </h3>
                        <p className="text-slate-500 mb-6">
                            Bắt đầu bằng cách thêm sân đầu tiên của bạn
                        </p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Thêm Sân Mới
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-800">
                                {editingVenue ? "Chỉnh Sửa Sân" : "Thêm Sân Mới"}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Tên sân <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                    placeholder="Nhập tên sân"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Mô tả
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                    placeholder="Mô tả về sân"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Địa chỉ
                                </label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) =>
                                        setFormData({ ...formData, address: e.target.value })
                                    }
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                    placeholder="Địa chỉ sân"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Giờ mở cửa
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.opening_time}
                                        onChange={(e) =>
                                            setFormData({ ...formData, opening_time: e.target.value })
                                        }
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Giờ đóng cửa
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.closing_time}
                                        onChange={(e) =>
                                            setFormData({ ...formData, closing_time: e.target.value })
                                        }
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    URL hình ảnh
                                </label>
                                <input
                                    type="url"
                                    value={formData.image}
                                    onChange={(e) =>
                                        setFormData({ ...formData, image: e.target.value })
                                    }
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                                >
                                    {editingVenue ? "Cập nhật" : "Tạo mới"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
