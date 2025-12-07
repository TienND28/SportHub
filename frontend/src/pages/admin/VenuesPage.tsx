import { useState, useEffect } from "react";
import venueService from "../../services/venue.service";
import type {
    Venue,
    VenueFilters,
    PaginationMeta,
} from "../../services/venue.service";
import { toast } from "react-toastify";
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    CheckCircleIcon,
    XCircleIcon,
    PencilIcon,
    TrashIcon,
    MapPinIcon,
} from "@heroicons/react/24/outline";

export default function AdminVenuesPage() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [filters, setFilters] = useState<VenueFilters>({
        page: 1,
        limit: 20,
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

    const handleToggleStatus = async (venue: Venue) => {
        try {
            await venueService.updateVenue(venue.id, {
                is_active: !venue.is_active,
            });
            toast.success("Cập nhật trạng thái thành công!");
            fetchVenues();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi cập nhật trạng thái");
        }
    };

    const handleToggleMaintenance = async (venue: Venue) => {
        try {
            await venueService.updateVenue(venue.id, {
                is_under_maintenance: !venue.is_under_maintenance,
            });
            toast.success("Cập nhật trạng thái bảo trì thành công!");
            fetchVenues();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi cập nhật");
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Bạn có chắc muốn xóa sân "${name}"?`)) return;

        try {
            await venueService.deleteVenue(id);
            toast.success("Xóa sân thành công!");
            fetchVenues();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi xóa sân");
        }
    };

    const handlePageChange = (newPage: number) => {
        setFilters({ ...filters, page: newPage });
    };

    const formatTime = (time?: string) => {
        if (!time) return "N/A";
        return new Date(time).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        Quản Lý Tất Cả Sân
                    </h1>
                    <p className="mt-2 text-slate-600">
                        Quản lý và giám sát tất cả các sân trong hệ thống
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search and Filters */}
                <div className="mb-6 space-y-4">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="flex-1 relative">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                placeholder="Tìm kiếm sân..."
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
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

                    {showFilters && (
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Trạng thái
                                    </label>
                                    <select
                                        value={
                                            filters.is_active === undefined
                                                ? "all"
                                                : filters.is_active
                                                    ? "true"
                                                    : "false"
                                        }
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                is_active:
                                                    e.target.value === "all"
                                                        ? undefined
                                                        : e.target.value === "true",
                                                page: 1,
                                            })
                                        }
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                                    >
                                        <option value="all">Tất cả</option>
                                        <option value="true">Hoạt động</option>
                                        <option value="false">Tắt</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Sắp xếp theo
                                    </label>
                                    <select
                                        value={filters.sortBy}
                                        onChange={(e) =>
                                            setFilters({ ...filters, sortBy: e.target.value as any })
                                        }
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                                    >
                                        <option value="created_at">Ngày tạo</option>
                                        <option value="name">Tên</option>
                                        <option value="updated_at">Cập nhật</option>
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
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
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
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                                    >
                                        <option value="20">20</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent"></div>
                    </div>
                )}

                {/* Table */}
                {!loading && venues.length > 0 && (
                    <>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                                Sân
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                                Chủ sân
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                                Địa chỉ
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                                Giờ hoạt động
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                                Trạng thái
                                            </th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                                                Thao tác
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {venues.map((venue) => (
                                            <tr
                                                key={venue.id}
                                                className="hover:bg-slate-50 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center flex-shrink-0">
                                                            {venue.image ? (
                                                                <img
                                                                    src={venue.image}
                                                                    alt={venue.name}
                                                                    className="w-full h-full object-cover rounded-lg"
                                                                />
                                                            ) : (
                                                                <MapPinIcon className="w-6 h-6 text-orange-500" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-800">
                                                                {venue.name}
                                                            </div>
                                                            {venue.description && (
                                                                <div className="text-sm text-slate-500 line-clamp-1">
                                                                    {venue.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm">
                                                        <div className="font-medium text-slate-800">
                                                            {venue.users?.full_name}
                                                        </div>
                                                        <div className="text-slate-500">
                                                            {venue.users?.email}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-slate-600 max-w-xs line-clamp-2">
                                                        {venue.address || "N/A"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-slate-600">
                                                        {formatTime(venue.opening_time)} -{" "}
                                                        {formatTime(venue.closing_time)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-2">
                                                        <button
                                                            onClick={() => handleToggleStatus(venue)}
                                                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${venue.is_active
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-red-100 text-red-700"
                                                                }`}
                                                        >
                                                            {venue.is_active ? (
                                                                <CheckCircleIcon className="w-3 h-3" />
                                                            ) : (
                                                                <XCircleIcon className="w-3 h-3" />
                                                            )}
                                                            {venue.is_active ? "Hoạt động" : "Tắt"}
                                                        </button>
                                                        {venue.is_under_maintenance && (
                                                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                                                Bảo trì
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleToggleMaintenance(venue)}
                                                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all"
                                                            title="Toggle bảo trì"
                                                        >
                                                            <PencilIcon className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(venue.id, venue.name)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Xóa"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-6">
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
                                                        ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
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
