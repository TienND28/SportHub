import {
    IsString,
    IsOptional,
    IsArray,
    IsDateString,
    IsUrl,
    Length,
    Matches,
    ArrayMaxSize,
    IsIn,
    IsNotEmpty,
    MinLength,
    MaxLength,
    Validate,
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Custom validator to check if new password is different from old password
 */
@ValidatorConstraint({ name: 'isDifferentPassword', async: false })
export class IsDifferentPassword implements ValidatorConstraintInterface {
    validate(newPassword: string, args: ValidationArguments) {
        const object = args.object as ChangePasswordDto;
        return newPassword !== object.oldPassword;
    }

    defaultMessage(args: ValidationArguments) {
        return 'New password must be different from current password';
    }
}

/**
 * Update Profile DTO with class-validator decorators
 */
export class UpdateProfileDto {
    @IsString()
    @IsNotEmpty({ message: 'Full name is required' })
    @Length(2, 100, { message: 'Full name must be between 2 and 100 characters' })
    @Transform(({ value }) => value?.trim())
    full_name!: string;

    @IsOptional()
    @IsString()
    @Matches(/^[0-9+\\-\\s()]+$/, { message: 'Invalid phone number format' })
    @Transform(({ value }) => {
        const trimmed = value?.trim();
        return trimmed === '' ? null : trimmed;
    })
    phone?: string | null;

    @IsOptional()
    @IsDateString({}, { message: 'Invalid date format' })
    @Transform(({ value }) => value === '' ? null : value)
    date_of_birth?: string | null;

    @IsOptional()
    @IsString()
    @IsIn(['male', 'female', 'other'], {
        message: 'Gender must be one of: male, female, other'
    })
    @Transform(({ value }) => {
        if (!value || value.trim() === '') return null;
        return value.toLowerCase();
    })
    gender?: string | null;

    @IsOptional()
    @IsUrl({}, { message: 'Invalid avatar URL format' })
    @Transform(({ value }) => {
        const trimmed = value?.trim();
        return trimmed === '' ? null : trimmed;
    })
    avatar?: string | null;

    @IsOptional()
    @IsArray({ message: 'Favorite sports must be an array' })
    @ArrayMaxSize(10, { message: 'You can select up to 10 favorite sports' })
    @IsString({ each: true })
    @IsIn(['football', 'badminton', 'pickleball', 'basketball', 'volleyball'], {
        each: true,
        message: 'Invalid sport. Valid options are: football, badminton, pickleball, basketball, volleyball'
    })
    favorite_sports?: string[];
}

/**
 * Change Password DTO with class-validator decorators
 */
export class ChangePasswordDto {
    @IsNotEmpty({ message: 'Old password is required' })
    @IsString()
    oldPassword!: string;

    @IsNotEmpty({ message: 'New password is required' })
    @IsString()
    @MinLength(6, { message: 'New password must be at least 6 characters long' })
    @MaxLength(100, { message: 'New password must not exceed 100 characters' })
    @Validate(IsDifferentPassword)
    newPassword!: string;
}

/**
 * User DTO - represents user data returned to client
 */
export interface UserDto {
    id: string;
    email: string;
    full_name: string;
    phone: string | null;
    role: string;
    avatar: string | null;
    date_of_birth: Date | null;
    gender: string | null;
    favorite_sports: string[];
    is_verified: boolean;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

/**
 * User response - sanitized user data without sensitive fields
 */
export interface UserResponse {
    id: string;
    email: string;
    full_name: string;
    phone: string | null;
    role: string;
    avatar: string | null;
    date_of_birth: Date | null;
    gender: string | null;
    favorite_sports: string[];
    is_verified: boolean;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

/**
 * Get All Users Query DTO - for filtering, sorting, and pagination
 */
export class GetAllUsersQueryDto {
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    search?: string;

    @IsOptional()
    @IsIn(['customer', 'owner', 'admin'], {
        message: 'Role must be one of: customer, owner, admin'
    })
    role?: string;

    @IsOptional()
    @IsIn(['male', 'female', 'other'], {
        message: 'Gender must be one of: male, female, other'
    })
    gender?: string;

    @IsOptional()
    @IsIn(['true', 'false'], {
        message: 'is_verified must be true or false'
    })
    is_verified?: string;

    @IsOptional()
    @IsIn(['true', 'false'], {
        message: 'is_active must be true or false'
    })
    is_active?: string;

    @IsOptional()
    @IsIn(['created_at', 'updated_at', 'full_name', 'email'], {
        message: 'sortBy must be one of: created_at, updated_at, full_name, email'
    })
    sortBy?: string;

    @IsOptional()
    @IsIn(['asc', 'desc'], {
        message: 'sortOrder must be asc or desc'
    })
    sortOrder?: string;

    @IsOptional()
    @IsString()
    page?: string;

    @IsOptional()
    @IsString()
    limit?: string;
}

/**
 * Update User Role DTO - for admin to update user roles
 */
export class UpdateUserRoleDto {
    @IsNotEmpty({ message: 'Role is required' })
    @IsString()
    @IsIn(['customer', 'owner', 'admin'], {
        message: 'Role must be one of: customer, owner, admin'
    })
    role!: string;
}

/**
 * Paginated Users Response
 */
export interface PaginatedUsersResponse {
    users: UserResponse[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}