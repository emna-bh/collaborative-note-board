import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { NOTE_COLORS } from '../note-colors';

export class QueryNotesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(NOTE_COLORS)
  color?: string;
}
