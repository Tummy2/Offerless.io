-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL CHECK (char_length(username) BETWEEN 3 AND 24),
    display_name TEXT,
    email TEXT NOT NULL,
    email_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create applications table
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    company TEXT NOT NULL CHECK (char_length(company) BETWEEN 1 AND 80),
    job_title TEXT NOT NULL CHECK (char_length(job_title) BETWEEN 1 AND 80),
    applied_at DATE NOT NULL CHECK (applied_at <= CURRENT_DATE),
    status TEXT NOT NULL CHECK (status IN ('applied','interviewing','rejected','ghosted','offer')),
    company_url TEXT NOT NULL,
    salary_amount NUMERIC(12,2) CHECK (salary_amount IS NULL OR salary_amount > 0),
    salary_type TEXT CHECK (salary_type IN ('hourly','salary')),
    location_label TEXT CHECK (char_length(location_label) <= 120),
    location_kind TEXT CHECK (location_kind IN ('onsite','remote')) DEFAULT 'onsite',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create leaderboard_snapshots table
CREATE TABLE leaderboard_snapshots (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    total_apps INTEGER NOT NULL DEFAULT 0,
    count_applied INTEGER NOT NULL DEFAULT 0,
    count_interviewing INTEGER NOT NULL DEFAULT 0,
    count_rejected INTEGER NOT NULL DEFAULT 0,
    count_ghosted INTEGER NOT NULL DEFAULT 0,
    count_offer INTEGER NOT NULL DEFAULT 0,
    computed_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX applications_user_idx ON applications(user_id, status, applied_at);
CREATE UNIQUE INDEX profiles_username_idx ON profiles(username);
CREATE INDEX leaderboard_snapshots_user_idx ON leaderboard_snapshots(user_id);
CREATE INDEX leaderboard_snapshots_computed_at_idx ON leaderboard_snapshots(computed_at DESC);

-- Add constraint to ensure salary_amount is required when salary_type is set
ALTER TABLE applications ADD CONSTRAINT salary_consistency 
CHECK (
    (salary_type IS NULL AND salary_amount IS NULL) OR 
    (salary_type IS NOT NULL AND salary_amount IS NOT NULL AND salary_amount > 0)
);

-- Add URL validation function
CREATE OR REPLACE FUNCTION validate_url(url TEXT) RETURNS BOOLEAN AS $$
BEGIN
    RETURN url ~ '^https?://[^\s/$.?#].[^\s]*$';
END;
$$ LANGUAGE plpgsql;

-- Add URL validation constraint
ALTER TABLE applications ADD CONSTRAINT valid_company_url 
CHECK (validate_url(company_url));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for applications
CREATE POLICY "Users can view own applications" ON applications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications" ON applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" ON applications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications" ON applications
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for leaderboard_snapshots (read-only for users)
CREATE POLICY "Anyone can view leaderboard snapshots" ON leaderboard_snapshots
    FOR SELECT TO authenticated USING (true);

-- Create public leaderboard view
CREATE VIEW public_leaderboard AS
SELECT 
    p.username,
    p.display_name,
    ls.total_apps,
    ls.count_applied,
    ls.count_interviewing,
    ls.count_rejected,
    ls.count_ghosted,
    ls.count_offer,
    ROW_NUMBER() OVER (ORDER BY ls.total_apps DESC, ls.computed_at ASC) as rank
FROM leaderboard_snapshots ls
JOIN profiles p ON ls.user_id = p.id
WHERE p.email_verified_at IS NOT NULL
ORDER BY ls.total_apps DESC, ls.computed_at ASC;

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, display_name)
  VALUES (new.id, new.email, 
          COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
          COALESCE(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to refresh leaderboard snapshots
CREATE OR REPLACE FUNCTION refresh_leaderboard_snapshots()
RETURNS void AS $$
BEGIN
    -- Delete old snapshots (keep only latest per user)
    DELETE FROM leaderboard_snapshots 
    WHERE id NOT IN (
        SELECT DISTINCT ON (user_id) id 
        FROM leaderboard_snapshots 
        ORDER BY user_id, computed_at DESC
    );
    
    -- Insert/Update current stats
    INSERT INTO leaderboard_snapshots (
        user_id, 
        total_apps, 
        count_applied, 
        count_interviewing, 
        count_rejected, 
        count_ghosted, 
        count_offer
    )
    SELECT 
        p.id,
        COALESCE(stats.total_apps, 0),
        COALESCE(stats.count_applied, 0),
        COALESCE(stats.count_interviewing, 0),
        COALESCE(stats.count_rejected, 0),
        COALESCE(stats.count_ghosted, 0),
        COALESCE(stats.count_offer, 0)
    FROM profiles p
    LEFT JOIN (
        SELECT 
            user_id,
            COUNT(*) as total_apps,
            COUNT(*) FILTER (WHERE status = 'applied') as count_applied,
            COUNT(*) FILTER (WHERE status = 'interviewing') as count_interviewing,
            COUNT(*) FILTER (WHERE status = 'rejected') as count_rejected,
            COUNT(*) FILTER (WHERE status = 'ghosted') as count_ghosted,
            COUNT(*) FILTER (WHERE status = 'offer') as count_offer
        FROM applications
        GROUP BY user_id
    ) stats ON p.id = stats.user_id
    ON CONFLICT (user_id) DO UPDATE SET
        total_apps = EXCLUDED.total_apps,
        count_applied = EXCLUDED.count_applied,
        count_interviewing = EXCLUDED.count_interviewing,
        count_rejected = EXCLUDED.count_rejected,
        count_ghosted = EXCLUDED.count_ghosted,
        count_offer = EXCLUDED.count_offer,
        computed_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;