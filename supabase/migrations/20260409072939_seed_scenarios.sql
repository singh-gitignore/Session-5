/*
  # Seed Professional Scenarios

  Inserts 12 diverse scenarios across 4 categories at 3 difficulty levels.
  Each scenario is realistic and contextually appropriate for corporate skill development.
*/

INSERT INTO scenarios (title, description, category, difficulty) VALUES
-- Workplace Conflict (Easy, Medium, Hard)
('Disagreement with Colleague', 
'Your colleague frequently dismisses your ideas in team meetings without listening. Today, they interrupted you again and said your suggestion was "the same thing we tried before." You''re frustrated and want to address this behavior.', 
'workplace_conflict', 'easy'),

('Conflict with Remote Team Member', 
'A remote team member has stopped responding to messages and missed two deadlines without explanation. The rest of the team is frustrated. You need to address this professionally without jumping to conclusions about what''s happening.', 
'workplace_conflict', 'medium'),

('Managing Underperformance During Restructuring', 
'Your direct report''s performance has declined significantly since the company restructuring. They''re avoiding feedback and seem withdrawn. You discover through casual conversation they''re worried about job security. You need to support them while maintaining team standards.', 
'workplace_conflict', 'hard'),

-- Leadership Decisions (Easy, Medium, Hard)
('First Time Delegation Challenge', 
'You''ve been promoted to team lead and need to delegate a critical project for the first time. Your team has mixed experience levels. You''re worried about overloading your junior team member, but you also want to develop them. How do you approach this?', 
'leadership', 'easy'),

('Balancing Team Morale with Business Urgency', 
'Your team is exhausted from back-to-back projects. A major client just submitted an urgent request that requires weekend work. You need to deliver, but you''re concerned about burnout. How do you communicate this to your team?', 
'leadership', 'medium'),

('Difficult Feedback to Influential Employee', 
'Your most productive employee is behaving in ways that undermine team cohesion—they''re dismissive of others'' contributions and create an intimidating presence in meetings. Senior leadership values their output but the culture is suffering. How do you approach this?', 
'leadership', 'hard'),

-- Crisis Management (Easy, Medium, Hard)
('System Outage Communication', 
'Your application went down unexpectedly for 2 hours. Customers are complaining and stakeholders are asking for explanations. It''s now back up, but you need to communicate clearly about what happened and next steps.', 
'crisis_management', 'easy'),

('Budget Cut Mid-Project', 
'Your executive sponsor just informed you that project budget will be cut by 30% due to company-wide cost-cutting. The project timeline remains the same. You must communicate this to your team and deliver a revised plan within 24 hours.', 
'crisis_management', 'medium'),

('Public Customer Complaint and Team Blame', 
'A major customer publicly posted a complaint on social media about your product. Initial investigation shows it was a user error, but your team made the setup process confusing. The post is getting shared. You need to respond publicly while internally addressing team accountability.', 
'crisis_management', 'hard'),

-- Communication Challenges (Easy, Medium, Hard)
('Explaining Technical Concepts to Non-Technical Stakeholders', 
'You need to present a technical architecture decision to senior leaders who don''t have engineering backgrounds. They''re skeptical about the approach. You have 15 minutes to convince them it''s the right choice.', 
'communication', 'easy'),

('Delivering Bad News to Disappointed Team', 
'The big project your team worked on for 3 months just got canceled due to business priorities. The team was excited about it and spent considerable effort. You need to break this news and help them understand the reasoning.', 
'communication', 'medium'),

('Navigating Cross-Cultural Misunderstanding', 
'You made a comment in a global meeting that was unintentionally offensive to a team member from a different cultural background. They''ve gone quiet and others noticed the tension. You need to address this genuinely and move forward without making it awkward.', 
'communication', 'hard');
