import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { CurrentUserDecorator } from '../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../auth/interfaces/current-user.interface';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { QueryNotesDto } from './dto/query-notes.dto';

@ApiTags('notes')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a note' })
  @ApiResponse({ status: 201, description: 'Note created' })
  create(
    @Body() dto: CreateNoteDto,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return this.notesService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List all notes' })
  findAll(@Query() query: QueryNotesDto) {
    return this.notesService.findAll(query);
  }

  @Get(':noteId')
  @ApiOperation({ summary: 'Get one note' })
  findOne(@Param('noteId') noteId: string) {
    return this.notesService.findOne(noteId);
  }

  @Patch(':noteId')
  @ApiOperation({ summary: 'Update a note' })
  update(@Param('noteId') noteId: string, @Body() dto: UpdateNoteDto) {
    return this.notesService.update(noteId, dto);
  }

  @Delete(':noteId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a note' })
  @ApiResponse({ status: 204, description: 'Note deleted' })
  remove(@Param('noteId') noteId: string) {
    return this.notesService.remove(noteId);
  }
}
