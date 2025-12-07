import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsInt,
  Min,
  Max,
  MinLength,
  MaxLength,
  Matches,
  IsUUID,
  IsIn,
} from "class-validator";
import { Type } from "class-transformer";

/**
 * Query DTO cho GET /api/venues
 */
export class GetAllVenuesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Số trang phải là số nguyên" })
  @Min(1, { message: "Số trang phải lớn hơn hoặc bằng 1" })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Số lượng items phải là số nguyên" })
  @Min(1, { message: "Số lượng items phải lớn hơn hoặc bằng 1" })
  @Max(100, { message: "Số lượng items tối đa là 100" })
  limit?: number;

  @IsOptional()
  @IsString({ message: "Từ khóa tìm kiếm phải là chuỗi" })
  @MinLength(1, { message: "Từ khóa tìm kiếm không được để trống" })
  search?: string;

  @IsOptional()
  @IsIn(["true", "false"], { message: "is_active phải là 'true' hoặc 'false'" })
  is_active?: string;

  @IsOptional()
  @IsIn(["true", "false"], {
    message: "is_under_maintenance phải là 'true' hoặc 'false'",
  })
  is_under_maintenance?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "province_id phải là số nguyên" })
  @Min(1, { message: "province_id phải lớn hơn 0" })
  province_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "district_id phải là số nguyên" })
  @Min(1, { message: "district_id phải lớn hơn 0" })
  district_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "ward_id phải là số nguyên" })
  @Min(1, { message: "ward_id phải lớn hơn 0" })
  ward_id?: number;

  @IsOptional()
  @IsUUID("4", { message: "owner_id phải là UUID hợp lệ" })
  owner_id?: string;

  @IsOptional()
  @IsIn(["name", "created_at", "updated_at"], {
    message: "sortBy phải là một trong: name, created_at, updated_at",
  })
  sortBy?: string;

  @IsOptional()
  @IsIn(["asc", "desc"], { message: "sortOrder phải là 'asc' hoặc 'desc'" })
  sortOrder?: string;
}

/**
 * Body DTO cho POST /api/venues
 */
export class CreateVenueDto {
  @IsString({ message: "Tên sân phải là chuỗi" })
  @MinLength(3, { message: "Tên sân phải có ít nhất 3 ký tự" })
  @MaxLength(255, { message: "Tên sân không được vượt quá 255 ký tự" })
  name!: string;

  @IsOptional()
  @IsString({ message: "Mô tả phải là chuỗi" })
  description?: string;

  @IsOptional()
  @IsString({ message: "Địa chỉ phải là chuỗi" })
  address?: string;

  @IsOptional()
  @IsNumber({}, { message: "Vĩ độ phải là số" })
  @Min(-90, { message: "Vĩ độ phải từ -90 đến 90" })
  @Max(90, { message: "Vĩ độ phải từ -90 đến 90" })
  lat?: number;

  @IsOptional()
  @IsNumber({}, { message: "Kinh độ phải là số" })
  @Min(-180, { message: "Kinh độ phải từ -180 đến 180" })
  @Max(180, { message: "Kinh độ phải từ -180 đến 180" })
  lng?: number;

  @IsOptional()
  @IsString({ message: "URL hình ảnh phải là chuỗi" })
  image?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "province_id phải là số nguyên" })
  @Min(1, { message: "province_id phải lớn hơn 0" })
  province_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "district_id phải là số nguyên" })
  @Min(1, { message: "district_id phải lớn hơn 0" })
  district_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "ward_id phải là số nguyên" })
  @Min(1, { message: "ward_id phải lớn hơn 0" })
  ward_id?: number;

  @IsOptional()
  @IsString({ message: "Giờ mở cửa phải là chuỗi" })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Giờ mở cửa phải có định dạng HH:mm (ví dụ: 08:00)",
  })
  opening_time?: string;

  @IsOptional()
  @IsString({ message: "Giờ đóng cửa phải là chuỗi" })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Giờ đóng cửa phải có định dạng HH:mm (ví dụ: 22:00)",
  })
  closing_time?: string;
}

/**
 * Body DTO cho PUT /api/venues/:id
 */
export class UpdateVenueDto {
  @IsOptional()
  @IsString({ message: "Tên sân phải là chuỗi" })
  @MinLength(3, { message: "Tên sân phải có ít nhất 3 ký tự" })
  @MaxLength(255, { message: "Tên sân không được vượt quá 255 ký tự" })
  name?: string;

  @IsOptional()
  @IsString({ message: "Mô tả phải là chuỗi" })
  description?: string;

  @IsOptional()
  @IsString({ message: "Địa chỉ phải là chuỗi" })
  address?: string;

  @IsOptional()
  @IsNumber({}, { message: "Vĩ độ phải là số" })
  @Min(-90, { message: "Vĩ độ phải từ -90 đến 90" })
  @Max(90, { message: "Vĩ độ phải từ -90 đến 90" })
  lat?: number;

  @IsOptional()
  @IsNumber({}, { message: "Kinh độ phải là số" })
  @Min(-180, { message: "Kinh độ phải từ -180 đến 180" })
  @Max(180, { message: "Kinh độ phải từ -180 đến 180" })
  lng?: number;

  @IsOptional()
  @IsString({ message: "URL hình ảnh phải là chuỗi" })
  image?: string;

  @IsOptional()
  @IsBoolean({ message: "is_active phải là boolean (true/false)" })
  is_active?: boolean;

  @IsOptional()
  @IsBoolean({ message: "is_under_maintenance phải là boolean (true/false)" })
  is_under_maintenance?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "province_id phải là số nguyên" })
  @Min(1, { message: "province_id phải lớn hơn 0" })
  province_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "district_id phải là số nguyên" })
  @Min(1, { message: "district_id phải lớn hơn 0" })
  district_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "ward_id phải là số nguyên" })
  @Min(1, { message: "ward_id phải lớn hơn 0" })
  ward_id?: number;

  @IsOptional()
  @IsString({ message: "Giờ mở cửa phải là chuỗi" })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Giờ mở cửa phải có định dạng HH:mm (ví dụ: 08:00)",
  })
  opening_time?: string;

  @IsOptional()
  @IsString({ message: "Giờ đóng cửa phải là chuỗi" })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Giờ đóng cửa phải có định dạng HH:mm (ví dụ: 22:00)",
  })
  closing_time?: string;
}

/**
 * Query DTO cho GET /api/venues/search
 */
export class SearchVenuesQueryDto {
  @IsString({ message: "Từ khóa tìm kiếm phải là chuỗi" })
  @MinLength(2, { message: "Từ khóa tìm kiếm phải có ít nhất 2 ký tự" })
  keyword!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Số trang phải là số nguyên" })
  @Min(1, { message: "Số trang phải lớn hơn hoặc bằng 1" })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Số lượng items phải là số nguyên" })
  @Min(1, { message: "Số lượng items phải lớn hơn hoặc bằng 1" })
  @Max(100, { message: "Số lượng items tối đa là 100" })
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "province_id phải là số nguyên" })
  @Min(1, { message: "province_id phải lớn hơn 0" })
  province_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "district_id phải là số nguyên" })
  @Min(1, { message: "district_id phải lớn hơn 0" })
  district_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "ward_id phải là số nguyên" })
  @Min(1, { message: "ward_id phải lớn hơn 0" })
  ward_id?: number;
}

/**
 * Params DTO cho GET /api/venues/:id
 */
export class VenueIdParamDto {
  @IsUUID("4", { message: "ID sân không hợp lệ" })
  id!: string;
}

/**
 * Params DTO cho GET /api/venues/owner/:ownerId
 */
export class OwnerIdParamDto {
  @IsUUID("4", { message: "ID chủ sân không hợp lệ" })
  ownerId!: string;
}

/**
 * Response pagination metadata
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
