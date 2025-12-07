import { useState, useEffect } from "react";
import venueService from "../../services/venue.service";
import type {
    Venue,
    VenueFilters,
    PaginationMeta,
} from "../../services/venue.service";
import { toast } from "react-toastify";
import {
    MapPinIcon,
    ClockIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
} from "@heroicons/react/24/outline";

export default function VenuesPage() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [filters, setFilters] = useState<VenueFilters>({
        page: 1,
        limit: 12,
        sortBy: "created_at",
        sortOrder: "desc",
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchVenues();
    }, [filters]);

    const fetchVenues = async () => {
        try {
            setLoading(true);
            const response = await venueService.getAllVenues(filters);
            setVenues(response.data);
            setPagination(response.pagination);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi tải danh sách sân");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchKeyword.trim()) {
            fetchVenues();
            return;
        }

        try {
            setLoading(true);
            const response = await venueService.searchVenues(searchKeyword, {
                page: filters.page,
                limit: filters.limit,
            });
            setVenues(response.data);
            setPagination(response.pagination);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi tìm kiếm");
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        setFilters({ ...filters, page: newPage });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const formatTime = (time?: string) => {
        if (!time) return "N/A";
        return new Date(time).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Khám Phá Sân Thể Thao
                    </h1>
                    <p className="mt-2 text-slate-600">
                        Tìm kiếm và đặt sân thể thao phù hợp với bạn
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search and Filters */}
                <div className="mb-8 space-y-4">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="flex-1 relative">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                placeholder="Tìm kiếm sân theo tên..."
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium"
                        >
                            Tìm kiếm
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className="px-6 py-3 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2"
                        >
                            <FunnelIcon className="w-5 h-5" />
                            Lọc
                        </button>
                    </form>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Sắp xếp theo
                                    </label>
                                    <select
                                        value={filters.sortBy}
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                sortBy: e.target.value as any,
                                            })
                                        }
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    >
                                        <option value="created_at">Mới nhất</option>
                                        <option value="name">Tên</option>
                                        <option value="updated_at">Cập nhật gần đây</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Thứ tự
                                    </label>
                                    <select
                                        value={filters.sortOrder}
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                sortOrder: e.target.value as any,
                                            })
                                        }
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    >
                                        <option value="desc">Giảm dần</option>
                                        <option value="asc">Tăng dần</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Số lượng/trang
                                    </label>
                                    <select
                                        value={filters.limit}
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                limit: Number(e.target.value),
                                                page: 1,
                                            })
                                        }
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    >
                                        <option value="12">12</option>
                                        <option value="24">24</option>
                                        <option value="48">48</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                )}

                {/* Venues Grid */}
                {!loading && venues.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {venues.map((venue) => (
                                <div
                                    key={venue.id}
                                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-slate-200"
                                >
                                    {/* Image */}
                                    <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
                                        {venue.image ? (
                                            <img
                                                src={venue.image}
                                                alt={venue.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <MapPinIcon className="w-16 h-16 text-blue-300" />
                                            </div>
                                        )}
                                        {venue.is_under_maintenance && (
                                            <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                                Bảo trì
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
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
                                                <MapPinIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
                                                <span className="line-clamp-2">{venue.address}</span>
                                            </div>
                                        )}

                                        {/* Opening Hours */}
                                        {(venue.opening_time || venue.closing_time) && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                                                <ClockIcon className="w-4 h-4 text-blue-500" />
                                                <span>
                                                    {formatTime(venue.opening_time)} -{" "}
                                                    {formatTime(venue.closing_time)}
                                                </span>
                                            </div>
                                        )}

                                        {/* Action Button */}
                                        <button className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-medium">
                                            Xem chi tiết
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={!pagination.hasPrevPage}
                                    className="px-4 py-2 rounded-lg bg-white border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
                                >
                                    Trước
                                </button>

                                <div className="flex gap-2">
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                        .filter(
                                            (page) =>
                                                page === 1 ||
                                                page === pagination.totalPages ||
                                                Math.abs(page - pagination.currentPage) <= 1
                                        )
                                        .map((page, index, array) => (
                                            <>
                                                {index > 0 && array[index - 1] !== page - 1 && (
                                                    <span className="px-3 py-2">...</span>
                                                )}
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`px-4 py-2 rounded-lg transition-all ${page === pagination.currentPage
                                                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                                                        : "bg-white border border-slate-300 hover:bg-slate-50"
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            </>
                                        ))}
                                </div>

                                <button
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={!pagination.hasNextPage}
                                    className="px-4 py-2 rounded-lg bg-white border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Empty State */}
                {!loading && venues.length === 0 && (
                    <div className="text-center py-20">
                        <MapPinIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">
                            Không tìm thấy sân nào
                        </h3>
                        <p className="text-slate-500">
                            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
