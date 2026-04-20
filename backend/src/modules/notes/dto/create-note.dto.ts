import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, IsNumber } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  title!: string;

  @ApiProperty()
  @IsString()
  content!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  position?: number;
}
