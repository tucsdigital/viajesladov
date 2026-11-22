import { ClubLevel, ClubSettings } from '@/types';

export const DEFAULT_CLUB_SETTINGS: ClubSettings = {
  signupBonusPoints: 10,
  plusFromPoints: 100,
  eliteFromPoints: 300,
  autoLevelEnabled: true,
  autoApproveSignup: false,
  emailFromName: 'Club Lado V',
  replyTo: '',
  commercialMessage: 'Accedé a beneficios exclusivos y experiencias premium todo el año.',
};

export const recalcLevel = (
  points: number,
  settings: Pick<ClubSettings, 'plusFromPoints' | 'eliteFromPoints'>
): ClubLevel => {
  if (points >= settings.eliteFromPoints) return 'elite';
  if (points >= settings.plusFromPoints) return 'plus';
  return 'base';
};
