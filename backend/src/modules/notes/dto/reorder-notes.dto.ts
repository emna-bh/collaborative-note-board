import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, ArrayUnique, IsArray, IsString } from 'class-validator';

export class ReorderNotesDto {
  @ApiProperty({
    type: [String],
    description: 'Full ordered list of note ids for the board',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsString({ each: true })
  noteIds!: string[];
}
