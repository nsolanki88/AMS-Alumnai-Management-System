# AMS+ API Reference

All protected endpoints require the header:
`Authorization: Bearer <JWT_ACCESS_TOKEN>`

Standard API Response Format:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

## Authentication & Security
- `POST /api/auth/register` — Register user, sends 6-digit email OTP.
- `POST /api/auth/verify-otp` — Verifies OTP, marks user verified, returns tokens.
- `POST /api/auth/login` — Authenticates email/password. Locks account after 5 failed attempts.
- `POST /api/auth/refresh` — Rotates and renews JWT access token.
- `POST /api/auth/forgot-password` — Dispatches 30-minute password reset link.
- `POST /api/auth/reset-password` — Consumes reset token and sets new password.
- `GET  /api/auth/me` — Returns currently authenticated user and profile.

## Alumni Records & Bulk Import (Council / Admin)
- `POST /api/alumni-records/upload` — Uploads CSV/Excel and detects headers for preview.
- `POST /api/alumni-records/import` — Validates rows, checks duplicate roll numbers, imports valid records, logs audit event.
- `GET  /api/alumni-records/unregistered` — Returns paginated list of unregistered alumni.

## AI Discovery & Verification (Council / Admin)
- `POST /api/discovery/run` — Triggers AI public discovery for record, creates candidate matches with score & reasons.
- `GET  /api/discovery/matches/:recordId` — Returns discovered profile matches for a record.
- `GET  /api/verification/dashboard` — Returns verification candidates filtered by pending, verified, rejected, uncertain.
- `PATCH /api/matches/:id/verify` — Human verification action: links profile, activates alumnus, adds to batch community.
- `PATCH /api/matches/:id/reject` — Rejects match with reason, preserves audit trail.
- `PATCH /api/matches/:id/uncertain` — Flags match as uncertain for future investigation.

## Outreach Management (Council / Admin)
- `POST /api/outreach` — Logs communication (email, phone, message).
- `GET  /api/outreach` — Lists outreach logs or flags records uncontacted for >90 days.

## Verified Directory & Privacy
- `GET  /api/directory` — Returns verified alumni matching filters. Redacts private contact details for Students/Faculty based on visibility setting (PUBLIC, BATCH_ONLY, PRIVATE).
- `GET  /api/directory/:id` — Detail view respecting privacy boundaries.

## Batch Communities
- `GET  /api/batch-groups` — Lists active batch groups.
- `GET  /api/batch-groups/:year` — Returns batch feed, announcements, and posts.
- `POST /api/batch-groups/:year/posts` — Creates post (discussion, job, event, announcement).
- `POST /api/batch-groups/posts/:id/comments` — Comments on a post.
- `POST /api/batch-groups/posts/:id/reactions` — Toggles post reaction.
- `DELETE /api/batch-groups/posts/:id` — Moderates/deletes post (Council / Admin).

## Peer Referrals
- `POST /api/referrals` — Verified alumni submit referral.
- `GET  /api/referrals` — Lists referrals and tracks referral chains.
- `PATCH /api/referrals/:id/verify` — Council verifies or rejects referral.

## Mentorship & Workshops
- `POST /api/mentorship/profile` — Alumni updates mentorship availability & topics.
- `GET  /api/mentorship/mentors` — Returns active mentors.
- `POST /api/mentorship/invitations` — Invites alumnus for workshop/talk/mentorship.
- `PATCH /api/mentorship/invitations/:id` — Alumnus accepts, declines, or reschedules.
- `GET  /api/mentorship/calendar` — Shared calendar of accepted sessions.

## Student Doubts & Q&A
- `POST /api/doubts` — Posts student doubt, triggers AI classification and recommendation.
- `GET  /api/doubts` — Lists doubts with category and status filters.
- `POST /api/doubts/:id/answers` — Alumni answers doubt.
- `PATCH /api/doubts/:id/answers/:answerId/helpful` — Student marks answer as helpful.

## AI Chatbot
- `POST /api/chatbot/query` — Natural language NLP assistant query respecting RBAC.

## Analytics & Reports
- `GET  /api/analytics/summary` — Returns KPI cards, batch breakdown, and discovery funnel.
- `GET  /api/analytics/export-pdf` — Downloads official PDF report.

## Admin Governance
- `GET  /api/admin/users` — User management list.
- `PATCH /api/admin/users/:id/role` — Updates user RBAC role.
- `PATCH /api/admin/users/:id/lock` — Locks/unlocks user account.
- `GET  /api/admin/audit-log` — Full audit trail inspection.
