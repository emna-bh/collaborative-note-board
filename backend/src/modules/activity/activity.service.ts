import { Injectable } from '@nestjs/common';
import { CurrentUser } from '../auth/interfaces/current-user.interface';
import { ActivityRepository } from './activity.repository';
import { Activity, ActivityType } from './entities/activity.entity';

type RecordActivityInput = {
  type: ActivityType;
  noteId: string;
  noteTitle: string;
  user: CurrentUser;
};

@Injectable()
export class ActivityService {
  constructor(private readonly activityRepository: ActivityRepository) {}

  async record(input: RecordActivityInput): Promise<Activity> {
    const activity = await this.activityRepository.create({
      type: input.type,
      noteId: input.noteId,
      noteTitle: input.noteTitle.trim() || 'Untitled note',
      userId: input.user.uid,
      userEmail: input.user.email ?? null,
      userName: input.user.name ?? null,
      createdAt: new Date().toISOString(),
    });

    return activity;
  }

  async findLatest(limit = 20): Promise<Activity[]> {
    return this.activityRepository.findLatest(limit);
  }
}
