
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'sales',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    source TEXT NOT NULL,
    status TEXT DEFAULT 'New',
    "dealValue" DECIMAL(12, 2) DEFAULT 0,
    "assignedToId" TEXT REFERENCES users(id),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    "leadId" TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    "userId" TEXT NOT NULL REFERENCES users(id),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads("assignedToId");
CREATE INDEX IF NOT EXISTS idx_notes_lead_id ON notes("leadId");


INSERT INTO users (id, email, password, name, role) 
VALUES ('admin_1', 'admin@example.com', '$2b$10$VCWXpyLsYGy2XjjVXjGsBO3BGnjuGxRjnicxbvqqAAiVvVyO.k9Rq', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, email, password, name, role)
VALUES 
    ('sales_1', 'john@example.com', '$2b$10$VCWXpyLsYGy2XjjVXjGsBO3BGnjuGxRjnicxbvqqAAiVvVyO.k9Rq', 'John Smith', 'sales'),
    ('sales_2', 'jane@example.com', '$2b$10$VCWXpyLsYGy2XjjVXjGsBO3BGnjuGxRjnicxbvqqAAiVvVyO.k9Rq', 'Jane Doe', 'sales')
ON CONFLICT (email) DO NOTHING;


INSERT INTO leads (id, name, company, email, phone, source, status, "dealValue", "assignedToId")
VALUES 
    ('lead_1', 'Sarah Jenkins', 'Acme Corp', 'sarah@acme.com', '+1 555-0101', 'LinkedIn', 'Won', 50000, 'admin_1'),
    ('lead_2', 'Michael Chen', 'TechFlow', 'm.chen@techflow.io', '+1 555-0102', 'Website', 'Qualified', 25000, 'admin_1'),
    ('lead_3', 'Emma Wilson', 'Global Logistics', 'emma@globallog.com', '+1 555-0103', 'Referral', 'New', 12000, 'admin_1'),
    ('lead_4', 'David Ross', 'Skyline Ventures', 'david@skyline.vc', '+1 555-0104', 'Cold Email', 'Proposal Sent', 85000, 'admin_1'),
    ('lead_5', 'Olivia Brown', 'Blue Wave Tech', 'olivia@bluewave.com', '+1 555-0105', 'Event', 'Contacted', 15000, 'admin_1'),
    ('lead_6', 'James Miller', 'Apex Systems', 'james@apex.com', '+1 555-0106', 'Website', 'Won', 30000, 'admin_1'),
    ('lead_7', 'Sophia Lee', 'NextGen Media', 'sophia@nextgen.com', '+1 555-0107', 'Referral', 'Lost', 5000, 'admin_1')
ON CONFLICT (id) DO NOTHING;


INSERT INTO notes (id, content, "leadId", "userId")
VALUES
    ('note_1', 'Had a great initial call. Very interested in the enterprise plan.', 'lead_1', 'admin_1'),
    ('note_2', 'Sent the proposal. Waiting for feedback.', 'lead_4', 'admin_1')
ON CONFLICT (id) DO NOTHING;
