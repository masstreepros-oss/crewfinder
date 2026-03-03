-- CrewFinder Supabase Row Level Security (RLS) Policies
-- This script enables RLS on all CrewFinder tables and creates appropriate security policies
-- Paste this entire file into the Supabase SQL Editor to apply all policies at once

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- Users can read all profiles (public), but only update their own

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read all profiles
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (true);

-- Allow users to update only their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to insert their own profile (for new accounts)
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- JOBS TABLE
-- ============================================================================
-- Anyone can read job postings, only the poster (company) can create/update/delete

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read all jobs
CREATE POLICY "jobs_select_all"
  ON jobs FOR SELECT
  USING (true);

-- Allow users to insert jobs (they become the company/poster)
CREATE POLICY "jobs_insert_own"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() = posted_by);

-- Allow users to update only their own jobs
CREATE POLICY "jobs_update_own"
  ON jobs FOR UPDATE
  USING (auth.uid() = posted_by)
  WITH CHECK (auth.uid() = posted_by);

-- Allow users to delete only their own jobs
CREATE POLICY "jobs_delete_own"
  ON jobs FOR DELETE
  USING (auth.uid() = posted_by);

-- ============================================================================
-- WORKERS TABLE
-- ============================================================================
-- Anyone can read worker profiles, only the worker can update their own

ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read all worker profiles
CREATE POLICY "workers_select_all"
  ON workers FOR SELECT
  USING (true);

-- Allow workers to insert their own profile
CREATE POLICY "workers_insert_own"
  ON workers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow workers to update only their own profile
CREATE POLICY "workers_update_own"
  ON workers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- WORKER_SKILLS TABLE
-- ============================================================================
-- Anyone can read skills, only the worker can manage their own

ALTER TABLE worker_skills ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read all worker skills
CREATE POLICY "worker_skills_select_all"
  ON worker_skills FOR SELECT
  USING (true);

-- Allow workers to insert their own skills
CREATE POLICY "worker_skills_insert_own"
  ON worker_skills FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM workers WHERE id = worker_id));

-- Allow workers to delete their own skills
CREATE POLICY "worker_skills_delete_own"
  ON worker_skills FOR DELETE
  USING (auth.uid() = (SELECT user_id FROM workers WHERE id = worker_id));

-- ============================================================================
-- JOB_STATUSES / JOB_RESPONSES TABLE
-- ============================================================================
-- Only the job poster and applicant can view/modify responses

ALTER TABLE job_responses ENABLE ROW LEVEL SECURITY;

-- Allow job poster and applicant to read responses
CREATE POLICY "job_responses_select_own"
  ON job_responses FOR SELECT
  USING (
    auth.uid() = applicant_id OR
    auth.uid() = (SELECT posted_by FROM jobs WHERE id = job_id)
  );

-- Allow applicant to create responses to jobs
CREATE POLICY "job_responses_insert_own"
  ON job_responses FOR INSERT
  WITH CHECK (auth.uid() = applicant_id);

-- Allow applicant to update their own responses
CREATE POLICY "job_responses_update_applicant"
  ON job_responses FOR UPDATE
  USING (auth.uid() = applicant_id)
  WITH CHECK (auth.uid() = applicant_id);

-- Allow job poster to update response status
CREATE POLICY "job_responses_update_poster"
  ON job_responses FOR UPDATE
  USING (auth.uid() = (SELECT posted_by FROM jobs WHERE id = job_id))
  WITH CHECK (auth.uid() = (SELECT posted_by FROM jobs WHERE id = job_id));

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================
-- Only sender and receiver can read/create messages

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow sender and receiver to read messages
CREATE POLICY "messages_select_own"
  ON messages FOR SELECT
  USING (
    auth.uid() = sender_id OR
    auth.uid() = receiver_id
  );

-- Allow authenticated users to create messages
CREATE POLICY "messages_insert_own"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Allow sender or receiver to update messages (for read status, etc.)
CREATE POLICY "messages_update_own"
  ON messages FOR UPDATE
  USING (
    auth.uid() = sender_id OR
    auth.uid() = receiver_id
  )
  WITH CHECK (
    auth.uid() = sender_id OR
    auth.uid() = receiver_id
  );

-- ============================================================================
-- REVIEWS TABLE
-- ============================================================================
-- Anyone can read reviews, only authenticated users can create (one per worker per reviewer)

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read all reviews
CREATE POLICY "reviews_select_all"
  ON reviews FOR SELECT
  USING (true);

-- Allow authenticated users to create reviews
CREATE POLICY "reviews_insert_authenticated"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id AND auth.uid() IS NOT NULL);

-- Allow reviewers to update their own reviews
CREATE POLICY "reviews_update_own"
  ON reviews FOR UPDATE
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

-- Allow reviewers to delete their own reviews
CREATE POLICY "reviews_delete_own"
  ON reviews FOR DELETE
  USING (auth.uid() = reviewer_id);

-- ============================================================================
-- SAVED_WORKERS TABLE (Crew Lists)
-- ============================================================================
-- Only the business owner can CRUD their own saved workers

ALTER TABLE saved_workers ENABLE ROW LEVEL SECURITY;

-- Allow business owner to read their saved workers
CREATE POLICY "saved_workers_select_own"
  ON saved_workers FOR SELECT
  USING (auth.uid() = business_id);

-- Allow business owner to create saved workers
CREATE POLICY "saved_workers_insert_own"
  ON saved_workers FOR INSERT
  WITH CHECK (auth.uid() = business_id);

-- Allow business owner to update their saved workers
CREATE POLICY "saved_workers_update_own"
  ON saved_workers FOR UPDATE
  USING (auth.uid() = business_id)
  WITH CHECK (auth.uid() = business_id);

-- Allow business owner to delete their saved workers
CREATE POLICY "saved_workers_delete_own"
  ON saved_workers FOR DELETE
  USING (auth.uid() = business_id);

-- ============================================================================
-- EQUIPMENT_LISTINGS TABLE
-- ============================================================================
-- Anyone can read listings, only the poster can update/delete

ALTER TABLE equipment_listings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read all equipment listings
CREATE POLICY "equipment_listings_select_all"
  ON equipment_listings FOR SELECT
  USING (true);

-- Allow users to create equipment listings
CREATE POLICY "equipment_listings_insert_own"
  ON equipment_listings FOR INSERT
  WITH CHECK (auth.uid() = posted_by);

-- Allow users to update only their own listings
CREATE POLICY "equipment_listings_update_own"
  ON equipment_listings FOR UPDATE
  USING (auth.uid() = posted_by)
  WITH CHECK (auth.uid() = posted_by);

-- Allow users to delete only their own listings
CREATE POLICY "equipment_listings_delete_own"
  ON equipment_listings FOR DELETE
  USING (auth.uid() = posted_by);

-- ============================================================================
-- WORK_PHOTOS TABLE (Portfolio Images)
-- ============================================================================
-- Anyone can read photos, only the worker can manage their own

ALTER TABLE work_photos ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read all work photos
CREATE POLICY "work_photos_select_all"
  ON work_photos FOR SELECT
  USING (true);

-- Allow workers to insert their own photos
CREATE POLICY "work_photos_insert_own"
  ON work_photos FOR INSERT
  WITH CHECK (auth.uid() = worker_id);

-- Allow workers to update their own photos
CREATE POLICY "work_photos_update_own"
  ON work_photos FOR UPDATE
  USING (auth.uid() = worker_id)
  WITH CHECK (auth.uid() = worker_id);

-- Allow workers to delete their own photos
CREATE POLICY "work_photos_delete_own"
  ON work_photos FOR DELETE
  USING (auth.uid() = worker_id);

-- ============================================================================
-- CREW_AVAILABILITY TABLE (Calendar Entries)
-- ============================================================================
-- Anyone can read availability, only the user can manage their own

ALTER TABLE crew_availability ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read all availability information
CREATE POLICY "crew_availability_select_all"
  ON crew_availability FOR SELECT
  USING (true);

-- Allow users to insert their own availability
CREATE POLICY "crew_availability_insert_own"
  ON crew_availability FOR INSERT
  WITH CHECK (auth.uid() = worker_id);

-- Allow users to update their own availability
CREATE POLICY "crew_availability_update_own"
  ON crew_availability FOR UPDATE
  USING (auth.uid() = worker_id)
  WITH CHECK (auth.uid() = worker_id);

-- Allow users to delete their own availability
CREATE POLICY "crew_availability_delete_own"
  ON crew_availability FOR DELETE
  USING (auth.uid() = worker_id);

-- ============================================================================
-- STORM_BOARD TABLE (Emergency Posts)
-- ============================================================================
-- Anyone can read emergency posts, authenticated users can create

ALTER TABLE storm_board ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read all emergency posts
CREATE POLICY "storm_board_select_all"
  ON storm_board FOR SELECT
  USING (true);

-- Allow authenticated users to create posts
CREATE POLICY "storm_board_insert_authenticated"
  ON storm_board FOR INSERT
  WITH CHECK (auth.uid() = posted_by AND auth.uid() IS NOT NULL);

-- Allow post creators to update their own posts
CREATE POLICY "storm_board_update_own"
  ON storm_board FOR UPDATE
  USING (auth.uid() = posted_by)
  WITH CHECK (auth.uid() = posted_by);

-- Allow post creators to delete their own posts
CREATE POLICY "storm_board_delete_own"
  ON storm_board FOR DELETE
  USING (auth.uid() = posted_by);

-- ============================================================================
-- INDUSTRY_NEWS TABLE (Read-Only for Most Users)
-- ============================================================================
-- Anyone can read, only admins can create/update/delete

ALTER TABLE industry_news ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read all news articles
CREATE POLICY "industry_news_select_all"
  ON industry_news FOR SELECT
  USING (true);

-- Allow only admins to create news articles
-- Note: You'll need to set up admin role/field in your auth system
CREATE POLICY "industry_news_insert_admin"
  ON industry_news FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Allow only admins to update news articles
CREATE POLICY "industry_news_update_admin"
  ON industry_news FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Allow only admins to delete news articles
CREATE POLICY "industry_news_delete_admin"
  ON industry_news FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- ============================================================================
-- UNCLAIMED_BUSINESSES TABLE (Caller Portal)
-- ============================================================================
-- Only callers can read, admins can CRUD

ALTER TABLE unclaimed_businesses ENABLE ROW LEVEL SECURITY;

-- Allow callers to read unclaimed businesses
-- Adjust the role check based on your actual roles system
CREATE POLICY "unclaimed_businesses_select_callers"
  ON unclaimed_businesses FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'caller'
    )
  );

-- Allow admins to create unclaimed businesses
CREATE POLICY "unclaimed_businesses_insert_admin"
  ON unclaimed_businesses FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Allow admins to update unclaimed businesses
CREATE POLICY "unclaimed_businesses_update_admin"
  ON unclaimed_businesses FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Allow admins to delete unclaimed businesses
CREATE POLICY "unclaimed_businesses_delete_admin"
  ON unclaimed_businesses FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- ============================================================================
-- CALL_LOG TABLE (Call Records)
-- ============================================================================
-- Only the caller who made the call can read/create their own logs

ALTER TABLE call_log ENABLE ROW LEVEL SECURITY;

-- Allow callers to read their own call logs
CREATE POLICY "call_log_select_own"
  ON call_log FOR SELECT
  USING (auth.uid() = caller_id);

-- Allow callers to create their own call logs
CREATE POLICY "call_log_insert_own"
  ON call_log FOR INSERT
  WITH CHECK (auth.uid() = caller_id);

-- Allow callers to update their own call logs
CREATE POLICY "call_log_update_own"
  ON call_log FOR UPDATE
  USING (auth.uid() = caller_id)
  WITH CHECK (auth.uid() = caller_id);

-- Allow callers to delete their own call logs
CREATE POLICY "call_log_delete_own"
  ON call_log FOR DELETE
  USING (auth.uid() = caller_id);

-- ============================================================================
-- NOTES FOR IMPLEMENTATION
-- ============================================================================
--
-- 1. ADMIN ROLE SETUP:
--    The industry_news, unclaimed_businesses policies reference an is_admin field
--    in the profiles table. Ensure this field exists:
--    ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
--
-- 2. CALLER ROLE:
--    The unclaimed_businesses and call_log policies reference a 'caller' role.
--    Ensure the profiles table has a role column:
--    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';
--
-- 3. FOREIGN KEY ASSUMPTIONS:
--    These policies assume the following foreign key relationships exist:
--    - workers.user_id -> auth.users.id
--    - jobs.posted_by -> auth.users.id
--    - worker_skills.worker_id -> workers.id
--    - job_responses.applicant_id -> auth.users.id
--    - job_responses.job_id -> jobs.id
--    - messages.sender_id -> auth.users.id
--    - messages.receiver_id -> auth.users.id
--    - reviews.reviewer_id -> auth.users.id
--    - saved_workers.business_id -> auth.users.id
--    - equipment_listings.posted_by -> auth.users.id
--    - work_photos.worker_id -> workers.id
--    - crew_availability.worker_id -> workers.id
--    - storm_board.posted_by -> auth.users.id
--    - call_log.caller_id -> auth.users.id
--
-- 4. TESTING:
--    After applying these policies, test them thoroughly:
--    - Log in as different users and verify access levels
--    - Test CRUD operations to ensure correct enforcement
--    - Check that data isolation is working correctly
--
-- 5. PRODUCTION DEPLOYMENT:
--    - Review these policies with your security team before production
--    - Test thoroughly in a staging environment
--    - Monitor Supabase logs for any policy violations or errors
--    - Consider backup and rollback procedures
