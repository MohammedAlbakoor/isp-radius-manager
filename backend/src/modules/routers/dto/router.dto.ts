import {
  IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean,
  IsUUID, IsEnum, Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRouterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiProperty({ example: '192.168.1.1' })
  @IsString()
  @IsNotEmpty()
  nasIp: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apiHost?: string;

  @ApiPropertyOptional({ default: 8728 })
  @IsOptional()
  @IsInt()
  @Min(1)
  apiPort?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  restEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  restPort?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  radiusSecret: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apiUsername?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apiPassword?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateRouterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nasIp?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apiHost?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  apiPort?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apiUsername?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apiPassword?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  radiusSecret?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'maintenance'] })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'maintenance'])
  status?: 'active' | 'inactive' | 'maintenance';
}
