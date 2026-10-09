import { describe, it, expect } from 'vitest';
import { parseWhatsAppChat } from '../engine/whatsappParser';

describe('WhatsApp Parser', () => {
  it('parses standard hyphen export format (12h with AM/PM)', () => {
    const raw = `12/10/2026, 10:30 AM - Rahul: The presentation is due Friday.
12/10/2026, 10:31 AM - Priya: I will prepare the slides.`;
    const result = parseWhatsAppChat(raw);
    expect(result.messages.length).toBe(2);
    expect(result.messages[0].sender).toBe('Rahul');
    expect(result.messages[0].content).toBe('The presentation is due Friday.');
    expect(result.messages[1].sender).toBe('Priya');
    expect(result.detectedSpeakers).toContain('Rahul');
    expect(result.detectedSpeakers).toContain('Priya');
  });

  it('parses bracketed export format [DD/MM/YYYY, HH:MM]', () => {
    const raw = `[12/10/2026, 10:32 AM] Priya: I will prepare the slides.
[12/10/2026, 10:33 AM] Alex: Got it, I will handle the backend.`;
    const result = parseWhatsAppChat(raw);
    expect(result.messages.length).toBe(2);
    expect(result.messages[0].sender).toBe('Priya');
    expect(result.messages[1].sender).toBe('Alex');
  });

  it('parses 24-hour timestamp formats', () => {
    const raw = `10/12/26, 22:30 - Arun: We decided to move the meeting.`;
    const result = parseWhatsAppChat(raw);
    expect(result.messages.length).toBe(1);
    expect(result.messages[0].sender).toBe('Arun');
    expect(result.messages[0].content).toBe('We decided to move the meeting.');
  });

  it('appends multiline message continuations to the parent message', () => {
    const raw = `12/10/2026, 10:30 AM - Rahul: First line of message.
Second line with details.
Third line conclusion.
12/10/2026, 10:35 AM - Priya: Got your message.`;
    const result = parseWhatsAppChat(raw);
    expect(result.messages.length).toBe(2);
    expect(result.messages[0].content).toContain('First line of message.\nSecond line with details.\nThird line conclusion.');
  });

  it('correctly identifies and flags system messages', () => {
    const raw = `12/10/2026, 09:00 AM - Messages and calls are end-to-end encrypted. No one outside of this chat can read or listen to them.
12/10/2026, 09:05 AM - Alex: Hey everyone!`;
    const result = parseWhatsAppChat(raw);
    expect(result.systemMessageCount).toBe(1);
    expect(result.messages[0].isSystem).toBe(true);
    expect(result.messages[1].isSystem).toBe(false);
  });

  it('preserves unstructured text lines as fallback without discarding data', () => {
    const raw = `Meeting notes without date header
Someone wrote something here`;
    const result = parseWhatsAppChat(raw);
    expect(result.messages.length).toBe(2);
    expect(result.messages[0].confidence).toBe('low');
  });
});
