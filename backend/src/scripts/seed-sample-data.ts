import * as dotenv from 'dotenv';
dotenv.config();

import { firebaseAuth } from '../firebase/firebase-admin.provider';
import { firestoreDb } from '../firebase/firestore.provider';
import { NOTE_COLORS } from '../modules/notes/note-colors';

type SeedUser = {
  uid: string;
  email: string;
  password: string;
  displayName: string;
};

type SeedNote = {
  title: string;
  content: string;
  color: (typeof NOTE_COLORS)[number];
  userIndex: number;
};

const seedUsers: SeedUser[] = [
  {
    uid: 'seed-user-one',
    email: 'one.user@example.com',
    password: 'Password123!',
    displayName: 'One User',
  },
  {
    uid: 'seed-user-two',
    email: 'two.user@example.com',
    password: 'Password123!',
    displayName: 'Two User',
  },
];

const seedNotes: SeedNote[] = [
  {
    title: 'Sprint kickoff notes',
    content:
      '## Goals\n- Align on priorities\n- Confirm owners\n- Capture launch blockers',
    color: NOTE_COLORS[0],
    userIndex: 0,
  },
  {
    title: 'API cleanup backlog',
    content:
      'Refactor the notes endpoints and remove duplicated validation before the next demo.',
    color: NOTE_COLORS[4],
    userIndex: 1,
  },
  {
    title: 'Design polish ideas',
    content:
      'Try softer gradients, sharper spacing, and a clearer hover state on activity cards.',
    color: NOTE_COLORS[1],
    userIndex: 0,
  },
  {
    title: 'Auth emulator checklist',
    content:
      '- Seed sample users\n- Verify tokens in backend\n- Confirm protected routes reject anonymous calls',
    color: NOTE_COLORS[5],
    userIndex: 1,
  },
  {
    title: 'Retro action items',
    content:
      '1. Reduce UI edge cases\n2. Improve health endpoint docs\n3. Add sample data script',
    color: NOTE_COLORS[2],
    userIndex: 0,
  },
  {
    title: 'Realtime feed tweaks',
    content:
      'Keep new activity noticeable, but avoid layout jumps or extra spacing while the badge is visible.',
    color: NOTE_COLORS[3],
    userIndex: 1,
  },
  {
    title: 'Release prep',
    content:
      'Confirm Docker compose works, emulator ports respond, and the board renders with seeded data.',
    color: NOTE_COLORS[4],
    userIndex: 0,
  },
  {
    title: 'Nice-to-have follow-ups',
    content:
      'Consider grouped activity entries and richer user presence once the core board is stable.',
    color: NOTE_COLORS[0],
    userIndex: 1,
  },
];

function ensureEmulatorEnv() {
  const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST;

  if (!authHost || !firestoreHost) {
    throw new Error(
      'Seed script requires FIREBASE_AUTH_EMULATOR_HOST and FIRESTORE_EMULATOR_HOST to be set.',
    );
  }
}

async function upsertUsers(users: SeedUser[]) {
  for (const user of users) {
    try {
      await firebaseAuth.getUser(user.uid);
      await firebaseAuth.updateUser(user.uid, {
        email: user.email,
        password: user.password,
        displayName: user.displayName,
        emailVerified: true,
      });
    } catch (error) {
      const code =
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        typeof (error as { code?: string }).code === 'string'
          ? (error as { code: string }).code
          : '';

      if (code !== 'auth/user-not-found') {
        throw error;
      }

      await firebaseAuth.createUser({
        uid: user.uid,
        email: user.email,
        password: user.password,
        displayName: user.displayName,
        emailVerified: true,
      });
    }
  }
}

async function deleteDocsByIds(collectionName: string, ids: string[]) {
  if (ids.length === 0) {
    return;
  }

  const batch = firestoreDb.batch();

  ids.forEach((id) => {
    batch.delete(firestoreDb.collection(collectionName).doc(id));
  });

  await batch.commit();
}

async function clearPreviousSeedData(userIds: string[]) {
  const notesSnapshot = await firestoreDb.collection('notes').get();
  const seededNotes = notesSnapshot.docs.filter((doc) => {
    const data = doc.data() as { creatorId?: string };
    return data.creatorId ? userIds.includes(data.creatorId) : false;
  });

  const seededNoteIds = seededNotes.map((doc) => doc.id);
  await deleteDocsByIds('notes', seededNoteIds);

  const activitiesSnapshot = await firestoreDb.collection('activities').get();
  const seededActivities = activitiesSnapshot.docs.filter((doc) => {
    const data = doc.data() as { userId?: string; noteId?: string };

    return (
      (data.userId ? userIds.includes(data.userId) : false) ||
      (data.noteId ? seededNoteIds.includes(data.noteId) : false)
    );
  });

  await deleteDocsByIds(
    'activities',
    seededActivities.map((doc) => doc.id),
  );

  const remainingNotes = notesSnapshot.docs.filter(
    (doc) => !seededNoteIds.includes(doc.id),
  );

  return remainingNotes.length;
}

async function createSeedNotes(basePosition: number) {
  const notesCollection = firestoreDb.collection('notes');
  const activitiesCollection = firestoreDb.collection('activities');
  const now = Date.now();

  for (const [index, seedNote] of seedNotes.entries()) {
    const user = seedUsers[seedNote.userIndex];
    const createdAt = new Date(
      now - (seedNotes.length - index) * 60_000,
    ).toISOString();

    const noteRef = notesCollection.doc();

    await noteRef.set({
      title: seedNote.title,
      content: seedNote.content,
      color: seedNote.color,
      creatorId: user.uid,
      creatorEmail: user.email,
      creatorName: user.displayName,
      position: basePosition + index,
      createdAt,
      updatedAt: createdAt,
    });

    await activitiesCollection.add({
      type: 'created',
      noteId: noteRef.id,
      noteTitle: seedNote.title,
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName,
      createdAt,
    });
  }
}

async function main() {
  ensureEmulatorEnv();

  await upsertUsers(seedUsers);
  const remainingNotesCount = await clearPreviousSeedData(
    seedUsers.map((user) => user.uid),
  );
  await createSeedNotes(remainingNotesCount);

  console.log('Sample data seeded successfully.');
  console.log('');
  console.log('Sample users:');

  seedUsers.forEach((user) => {
    console.log(`- ${user.displayName}: ${user.email} / ${user.password}`);
  });

  console.log('');
  console.log(`Created ${seedNotes.length} sample notes.`);
}

void main().catch((error) => {
  console.error('Failed to seed sample data:', error);
  process.exit(1);
});
