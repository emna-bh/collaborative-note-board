import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { NOTE_COLORS } from '../note-colors';

export class CreateNoteDto {
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  title!: string;

  @ApiProperty({
    description: 'Markdown content for the note body',
  })
  @IsString()
  content!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(NOTE_COLORS)
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
