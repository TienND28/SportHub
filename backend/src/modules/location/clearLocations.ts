import prisma from "../../config/database";

async function clearAllLocations() {
    try {
        console.log("🗑️  Bắt đầu xóa dữ liệu location...");

        // Xóa theo thứ tự (do có foreign key constraints)
        const deletedWards = await prisma.wards.deleteMany({});
        console.log(`✅ Đã xóa ${deletedWards.count} phường/xã`);

        const deletedDistricts = await prisma.districts.deleteMany({});
        console.log(`✅ Đã xóa ${deletedDistricts.count} quận/huyện`);

        const deletedProvinces = await prisma.provinces.deleteMany({});
        console.log(`✅ Đã xóa ${deletedProvinces.count} tỉnh/thành phố`);

        console.log("\n🎉 Đã xóa toàn bộ dữ liệu location!");
    } catch (error) {
        console.error("❌ Lỗi khi xóa dữ liệu:", error);
        if (error instanceof Error) {
            console.error("Chi tiết:", error.message);
        }
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        console.log("🔌 Đã ngắt kết nối database");
    }
}

// Run the clear
clearAllLocations();
