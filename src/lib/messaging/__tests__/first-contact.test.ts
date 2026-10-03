import { describe, expect, it } from 'vitest';
import { parseFirstContactForm } from '../first-contact';

const page = `<meta content="csrf-123" name="_csrf" />
<form action="/s-anbieter-kontaktieren.json" id="viewad-contact-modal-form">
  <textarea name="message"></textarea>
  <input value="3454175352" name="adId"/>
  <input name="adType" value="unknown"/>
</form>`;

describe('parseFirstContactForm', () => {
  it('reads the form for the exact requested ad', () => {
    expect(parseFirstContactForm(page, 3454175352)).toEqual({
      csrfToken: 'csrf-123', adType: 'unknown',
    });
  });

  it('refuses another ad, a missing form, and a missing CSRF token', () => {
    expect(() => parseFirstContactForm(page, 123)).toThrow('nicht zur angeforderten');
    expect(() => parseFirstContactForm(page.replace('viewad-contact-modal-form', 'other'), 3454175352)).toThrow('nicht verfügbar');
    expect(() => parseFirstContactForm(page.replace('csrf-123', ''), 3454175352)).toThrow('unvollständig');
  });
});
