import 'server-only';
import { Resend } from 'resend';
import { ClubLevel, ClubSettings } from '@/types';

interface SendClubWelcomeEmailInput {
  nombre: string;
  email: string;
  nivel: ClubLevel;
  puntos: number;
  settings: ClubSettings;
}

const levelLabel: Record<ClubLevel, string> = {
  base: 'Base',
  plus: 'Plus',
  elite: 'Elite',
};

const buildHtml = (input: SendClubWelcomeEmailInput) => {
  const appUrl = process.env.PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || '';
  const landingUrl = `${appUrl}/club-lado-v`;
  const panelUrl = `${appUrl}/club-lado-v`;
  const message =
    input.settings.commercialMessage ||
    'Accedé a preventas, beneficios y experiencias diseñadas para viajar con otro nivel.';

  return `
  <div style="font-family:Inter,Arial,sans-serif;background:#f5f7fb;padding:24px;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <tr>
        <td style="background:#19123C;padding:24px;text-align:center;">
          <div style="font-size:12px;letter-spacing:.12em;color:#b2f432;font-weight:700;text-transform:uppercase;">Club Lado V</div>
          <h1 style="margin:10px 0 0;color:#ffffff;font-size:24px;">Bienvenido/a, ${input.nombre} ✨</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">
          <p style="margin:0 0 12px;font-size:15px;line-height:1.6;">Tu membresía ya está registrada. Desde ahora formás parte del Club y empezás a disfrutar beneficios premium.</p>
          <p style="margin:0 0 4px;font-size:14px;color:#374151;"><strong>Nivel actual:</strong> ${levelLabel[input.nivel]}</p>
          <p style="margin:0 0 18px;font-size:14px;color:#374151;"><strong>Vueltas acumuladas:</strong> ${input.puntos}</p>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:14px;margin-bottom:18px;font-size:14px;line-height:1.6;color:#374151;">
            ${message}
          </div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding-bottom:10px;">
                <a href="${landingUrl}" style="display:inline-block;background:#B2F432;color:#19123C;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px;">Ver beneficios del Club</a>
              </td>
            </tr>
            <tr>
              <td>
                <a href="${panelUrl}" style="display:inline-block;background:#19123C;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px;">Ir a mi panel</a>
              </td>
            </tr>
          </table>
          <p style="margin:18px 0 0;font-size:13px;color:#6b7280;">¿Necesitás ayuda? Respondé este email o escribinos por WhatsApp.</p>
        </td>
      </tr>
    </table>
  </div>
  `;
};

export const sendClubWelcomeEmail = async (input: SendClubWelcomeEmailInput) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!apiKey || !from) {
    throw new Error('Faltan variables de Resend');
  }

  const resend = new Resend(apiKey);
  const fromName = input.settings.emailFromName || 'Club Lado V';
  const formattedFrom = `${fromName} <${from}>`;

  const { error } = await resend.emails.send({
    from: formattedFrom,
    to: input.email,
    subject: 'Bienvenido/a a Club Lado V ✨',
    replyTo: input.settings.replyTo || process.env.RESEND_REPLY_TO || undefined,
    html: buildHtml(input),
  });

  if (error) {
    throw new Error(error.message);
  }
};
