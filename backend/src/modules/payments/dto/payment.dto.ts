import {
  IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsUUID, Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty()
  @IsUUID()
  customerId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  internetAccountId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  subscriptionId?: string;

  @ApiProperty({ example: 25.0 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ enum: ['cash', 'card', 'bank_transfer', 'wallet', 'other'] })
  @IsEnum(['cash', 'card', 'bank_transfer', 'wallet', 'other'])
  method: 'cash' | 'card' | 'bank_transfer' | 'wallet' | 'other';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
