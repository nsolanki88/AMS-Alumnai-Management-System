# AMS+ End-to-End Demo Scenario Walkthrough

Follow this step-by-step walkthrough to verify every major capability of AMS+:

## Demo Credentials
Common Password for all accounts: `Password123!`
- **Student**: `student@example.com`
- **Alumni**: `alumni@example.com`
- **Faculty**: `faculty@example.com`
- **Council**: `council@example.com`
- **Admin**: `admin@example.com`

---

## Step-by-Step Walkthrough

### Part 1: Council Import, AI Discovery & Verification
1. Navigate to `/login` and click **Council** to auto-fill `council@example.com` (`Password123!`).
2. Click **Sign In** -> Lands on `/council/dashboard`.
3. In the sidebar, click **Bulk Data Import** (`/council/upload`).
4. Click **Parse & Preview Rows** with `backend/src/seed/sample_alumni_data.csv` or drag your CSV.
5. Review the detected column mappings and table preview.
6. Test duplicate detection: Upload `backend/src/seed/duplicate_test_alumni.csv` and notice the **Duplicate Detection Report** highlighting existing roll number conflicts (`CSE-2018-042`).
7. Click **Unregistered Alumni** (`/council/unregistered`) in sidebar. Notice the unmatched records.
8. Find **Ananya Gupta** (Class of 2022) and click **Run AI Discovery**.
9. The AI microservice matches her record against public profiles, calculating a 92% confidence score with transparent matching reasons.
10. Navigate to **AI Verification** (`/council/verification`). Under the **Pending Review** tab, inspect Ananya Gupta's candidate match card:
    - Official Registry Record vs Discovered Public Profile
    - AI Confidence Score (92%)
    - Transparent Matching Rationale
11. Click **Verify Alumni Identity**.
12. Notice the record transitions to verified, the user account is activated, and **Batch 2022** group is updated!

### Part 2: Alumni Engagement & Peer Referrals
13. Log out and log in as **Alumni** (`alumni@example.com`).
14. Navigate to **My Profile & Visibility** (`/alumni/profile`).
15. Inspect the Visibility tiers (`PUBLIC`, `BATCH_ONLY`, `PRIVATE`). Add skills or workshop topics and click **Save Profile Changes**.
16. Go to **Referral Network** (`/alumni/referrals`).
17. Click **Refer an Alumnus**, enter a peer's details (e.g. `Neha Sen`), and submit. Notice the visualized referral chain (`Rahul Sharma -> Neha Sen`) pending Council review.
18. Go to **Mentorship & Invites** (`/alumni/mentorship`). Review incoming requests from faculty/students and click **Accept**. Notice it immediately confirms on your **Session Calendar** (`/alumni/calendar`).

### Part 3: Student Doubt Q&A & Mentor Routing
19. Log out and log in as **Student** (`student@example.com`).
20. Navigate to **Alumni Directory** (`/student/directory`).
    - Search for "Google" or filter by "Class of 2022".
    - Notice that private contact numbers and personal emails are concealed.
21. Navigate to **Doubts & Q&A** (`/student/doubts`).
22. Click **Ask a Doubt**:
    - Title: "How to prepare for System Design interviews?"
    - Description: "Targeting backend roles. What distributed systems patterns are most important?"
    - Category: "Interview Preparation"
23. Click **Post Question**: Notice the AI engine categorizes the query, extracts skills (`System Design`), ranks verified alumni, and notifies recommended mentors!
24. Log in as **Alumni** (`alumni@example.com`), open **Student Doubts** (`/alumni/doubts`), and post an answer.
25. Log back in as **Student**, open the question, and click **Mark as Helpful**!

### Part 4: Faculty Collaboration & Institutional Governance
26. Log in as **Faculty** (`faculty@example.com`).
27. Go to **Alumni & Expertise** (`/faculty/directory`). Click **Endorse Expertise** for an alumnus (e.g. Rahul Sharma for `System Design`) and submit commendation.
28. Go to **Session Invitations** (`/faculty/invitations`) and send a formal guest lecture invite.
29. Log in as **Admin** (`admin@example.com`).
30. Go to **User Management** (`/admin/users`) to toggle roles or lock accounts.
31. Go to **Audit Logs** (`/admin/audit-logs`) to review the immutable audit trail of imports, AI discoveries, verifications, and endorsements.
32. Go to **Master Analytics** (`/council/analytics`) and click **Download Official PDF Report** to verify the PDF generation!
