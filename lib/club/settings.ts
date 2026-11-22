import 'server-only';
import { ClubSettings } from '@/types';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { DEFAULT_CLUB_SETTINGS } from '@/lib/club/levels';

const SETTINGS_DOC_ID = 'global';

export const getClubSettings = async (): Promise<ClubSettings> => {
  const db = getAdminDb();
  const ref = db.collection('club_settings').doc(SETTINGS_DOC_ID);
  const snapshot = await ref.get();
  if (!snapshot.exists) {
    return DEFAULT_CLUB_SETTINGS;
  }

  const data = snapshot.data() as Partial<ClubSettings>;
  return {
    ...DEFAULT_CLUB_SETTINGS,
    ...data,
  };
};
