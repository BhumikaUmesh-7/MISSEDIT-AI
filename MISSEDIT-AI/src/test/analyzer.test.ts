import { describe, it, expect } from 'vitest';
import { analyzeConversation } from '../engine/analyzer';

describe('Conversation Analyzer Engine', () => {
  it('correctly scores urgency and extracts action items', () => {
    const raw = `12/10/2026, 09:10 AM - Rohan: @Alex please review and push the UI components by 1:00 PM today.
12/10/2026, 09:12 AM - Alex: I will handle the styling.
12/10/2026, 09:15 AM - Priya: URGENT: The build is broken on main! Need to fix immediately!
12/10/2026, 09:20 AM - Rohan: ok sounds good`;

    const result = analyzeConversation(raw, 'Alex', 'Sprint Chat');

    // Stats
    expect(result.stats.userMessages).toBe(4);
    expect(result.stats.urgentCount).toBeGreaterThanOrEqual(1);

    // Urgent message detection
    const urgentMsg = result.messages.find((m) => m.content.includes('URGENT: The build is broken'));
    expect(urgentMsg?.priority).toBe('urgent');

    // Action item assignment for Alex
    const alexTask = result.actionItems.find((t) => t.assignmentType === 'assigned_to_me');
    expect(alexTask).toBeDefined();
    expect(alexTask?.assignee.toLowerCase()).toContain('alex');

    // Low priority detection for acknowledgment
    const lowMsg = result.messages.find((m) => m.content === 'ok sounds good');
    expect(lowMsg?.priority).toBe('low');
  });

  it('detects decisions and confidence levels', () => {
    const raw = `12/10/2026, 09:30 AM - Rohan: We decided to deploy using local client-side processing.
12/10/2026, 09:32 AM - Vikram: Approved: final decision on the demo pitch.`;

    const result = analyzeConversation(raw);
    expect(result.decisions.length).toBeGreaterThanOrEqual(2);
    expect(result.decisions[0].confidence).toBe('final');
  });

  it('extracts and categorizes deadlines properly', () => {
    const raw = `12/10/2026, 10:00 AM - Rohan: Submit by today at 5:00 PM.
12/10/2026, 10:05 AM - Priya: Presentation draft is due Friday at 10:00 AM.`;

    const result = analyzeConversation(raw);
    expect(result.deadlines.length).toBe(2);

    const todayDeadline = result.deadlines.find((d) => d.category === 'due_today');
    expect(todayDeadline).toBeDefined();

    const upcomingDeadline = result.deadlines.find((d) => d.category === 'upcoming');
    expect(upcomingDeadline).toBeDefined();
  });
});
