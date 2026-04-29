import {
  IsString, IsNotEmpty, IsOptional, IsInt, IsNumber,
  IsBoolean, IsEnum, Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePackageDto {
  @ApiProperty({ example: 'Basic 5M' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  downloadSpeed: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  uploadSpeed: number;

  @ApiPropertyOptional({ enum: ['K', 'M', 'G'], default: 'M' })
  @IsOptional()
  @IsEnum(['K', 'M', 'G'])
  speedUnit?: 'K' | 'M' | 'G';

  @ApiPropertyOptional({ example: '5M/1M' })
  @IsOptional()
  @IsString()
  mikrotikRateLimit?: string;

  @ApiProperty({ example: 25.0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(1)
  durationDays: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  dataLimitBytes?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isUnlimited?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  priority?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  burstLimit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  burstThreshold?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  burstTime?: string;
}

export class UpdatePackageDto extends CreatePackageDto {}
