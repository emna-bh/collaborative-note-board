import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryNotesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;
}
