import { handleApiError } from '@/lib/api/error-handler';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { startConversation } from '@/lib/messaging/gateway';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ detail: 'Authentication required' }, { status: 401 });

    const body = await request.json();
    const adId = body.adId;
    const message = body.message;
    if (!Number.isSafeInteger(adId) || adId <= 0) {
      return NextResponse.json({ detail: 'Gültige Anzeigen-ID erforderlich' }, { status: 400 });
    }
    if (typeof message !== 'string' || !message.trim() || message.length > 5000) {
      return NextResponse.json({ detail: 'Nachricht leer oder zu lang' }, { status: 400 });
    }
    if (body.confirmation !== 'SENDEN') {
      return NextResponse.json({ detail: 'Ausdrückliche Sendebestätigung erforderlich' }, { status: 400 });
    }
    if (body.contactName !== undefined &&
        (typeof body.contactName !== 'string' || body.contactName.length > 150)) {
      return NextResponse.json({ detail: 'Ungültiger Kontaktname' }, { status: 400 });
    }
    const result = await startConversation(user.workspace, adId, message.trim(), body.contactName);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
