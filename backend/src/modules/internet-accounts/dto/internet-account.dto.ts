import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID,
  IsInt, IsIP, Min, MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInternetAccountDto {
  @ApiProperty()
  @IsUUID()
  customerId: string;

  @ApiProperty({ example: 'ahmad_pppoe' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: ['pppoe', 'hotspot'] })
  @IsEnum(['pppoe', 'hotspot'])
  serviceType: 'pppoe' | 'hotspot';

  @ApiProperty()
  @IsUUID()
  packageId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  routerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIP()
  staticIp?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  macAddress?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  allowedSimultaneousSessions?: number;
}

export class UpdateInternetAccountDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  packageId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  routerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIP()
  staticIp?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  macAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  allowedSimultaneousSessions?: number;
}
