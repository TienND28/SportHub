import prisma from "../../config/database";
import axios from "axios";

const API_URL = "https://provinces.open-api.vn/api/?depth=3";

interface WardData {
  code: string;
  name: string;
}

interface DistrictData {
  code: string;
  name: string;
  wards: WardData[];
}

interface ProvinceData {
  code: string;
  name: string;
  districts: DistrictData[];
}

async function importAllLocations() {
  try {
    console.log(" Fetching data from API...");
    const response = await axios.get<ProvinceData[]>(API_URL);
    const provincesData = response.data;

    console.log(`📊 Found ${provincesData.length} provinces.`);

    let totalProvinces = 0;
    let totalDistricts = 0;
    let totalWards = 0;

    for (const prov of provincesData) {
      // ──────────────── 1. Province ────────────────
      const provinceDoc = await prisma.provinces.upsert({
        where: { code: String(prov.code) },
        update: {
          name: prov.name,
        },
        create: {
          code: String(prov.code),
          name: prov.name,
        },
      });

      totalProvinces++;

      // ──────────────── 2. Districts ────────────────
      for (const dist of prov.districts || []) {
        const districtDoc = await prisma.districts.upsert({
          where: { code: String(dist.code) },
          update: {
            name: dist.name,
            province_id: provinceDoc.id,
          },
          create: {
            code: String(dist.code),
            name: dist.name,
            province_id: provinceDoc.id,
          },
        });

        totalDistricts++;

        // ──────────────── 3. Wards ────────────────
        for (const ward of dist.wards || []) {
          await prisma.wards.upsert({
            where: { code: String(ward.code) },
            update: {
              name: ward.name,
              district_id: districtDoc.id,
            },
            create: {
              code: String(ward.code),
              name: ward.name,
              district_id: districtDoc.id,
            },
          });

          totalWards++;
        }
      }

      console.log(`✅ Imported: ${prov.name} (${prov.districts?.length || 0} districts)`);
    }

    console.log("\n🎉 Import completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - Provinces: ${totalProvinces}`);
    console.log(`   - Districts: ${totalDistricts}`);
    console.log(`   - Wards: ${totalWards}`);
  } catch (error) {
    console.error("❌ Error importing locations:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log("🔌 Disconnected from PostgreSQL");
  }
}

// Run the import
importAllLocations();
