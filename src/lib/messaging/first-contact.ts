/** Parse the contact form on an ad page, never accepting an ad ID from another page. */
export function parseFirstContactForm(html: string, requestedAdId: number): {
  csrfToken: string;
  adType: string;
} {
  const form = html.match(/<form\b(?=[^>]*\bid=["']viewad-contact-modal-form["'])[^>]*>([\s\S]*?)<\/form>/i)?.[1];
  if (!form) throw new Error('Kontaktformular nicht verfügbar; Anmeldung oder Anzeige prüfen.');

  const inputValue = (name: string): string | undefined => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const input = form.match(new RegExp(`<input\\b(?=[^>]*\\bname=["']${escaped}["'])[^>]*>`, 'i'))?.[0];
    return input?.match(/\bvalue=["']([^"']*)["']/i)?.[1];
  };
  const adId = inputValue('adId');
  const adType = inputValue('adType');
  const csrfToken = html.match(/<meta\b(?=[^>]*\bname=["']_csrf["'])[^>]*>/i)?.[0]
    ?.match(/\bcontent=["']([^"']+)["']/i)?.[1];

  if (adId !== String(requestedAdId)) throw new Error('Kontaktformular gehört nicht zur angeforderten Anzeige.');
  if (!adType || !csrfToken) throw new Error('Kontaktformular unvollständig; kein Versand.');
  return { csrfToken, adType };
}
