# AMS+ Relational Database Documentation

## Prisma Schema Models

### Core Identity & Authentication
- `User`: Primary user account. Stores `email`, `passwordHash` (bcrypt), `phoneNumber`, `role` (STUDENT, ALUMNI, FACULTY, COUNCIL, ADMIN), `isVerified`, `failedLoginAttempts`, `lockedUntil`.
- `OtpVerification`: 6-digit email OTPs with expiration timestamp and usage tracking.
- `PasswordReset`: Secure 32-byte cryptographic tokens with 30-minute expiration.
- `RefreshToken`: Cryptographic refresh tokens for JWT session rotation.

### Official Alumni Records & AI Discovery
- `AlumniRecord`: Official institutional alumni registry entries with `source`, `fullName`, `graduationYear`, `branch`, `rollNumber` (unique), `contactEmail`, `company`, `jobRole`, `registrationStatus` (unregistered, registered, verified).
- `PotentialMatch`: Public profile matches discovered by AI. Stores `platform`, `profileUrl`, `confidenceScore` (0-100), `reasons` (JSON array of explanations), `matchingAttributes` (JSON object), `status` (pending, verified, rejected, uncertain), `rejectionReason`, `reviewedBy`, `reviewedAt`.
- `OutreachLog`: Communication logs with `channel` (email, phone, message), `status` (contacted, no_response, responded, opted_out), `followUpDate`.

### Communities & Engagements
- `BatchGroup`: Batch community groups keyed by `graduationYear`. Automatically created when the first alumnus of a batch is verified.
- `GroupPost`: Announcements, discussions, jobs, events with moderation flags and attachments.
- `PostComment`: Threaded comments on posts.
- `PostReaction`: Reactions (like, celebrate, insightful, love).

### Professional Mentorship & Peer Referrals
- `AlumniProfile`: Extended professional information for verified alumni. Stores `visibility` (PUBLIC, BATCH_ONLY, PRIVATE), `isMentor`, `workshopReady`, `skills` (JSON array), `experienceYears`.
- `MentorshipProfile`: Detailed mentorship availability, bio, expertise areas, workshop topics.
- `WorkshopInvitation`: Session invitations with `sessionType` (workshop, guest_lecture, technical_talk, curriculum_feedback), `status` (pending, accepted, declined, rescheduled), `meetingLink`.
- `ReferralConnection`: Alumni peer referrals tracking referral chains (Alumni A -> Alumni B -> Alumni C) with Council verification status.
- `FacultyEndorsement`: Institutional faculty endorsements of alumni technical skills with comments.

### Doubts Q&A & Audit Trails
- `DoubtQuestion`: Student doubts with `category`, `aiClassifiedCategory`, `extractedSkills`.
- `DoubtAnswer`: Alumni answers with `isHelpful` status.
- `AuditLog`: Immutable audit trail recording user, action type, entity type, entity id, metadata payload, IP address.
- `Notification`: In-app alerts for verifications, doubts, and workshops.
- `ChatbotLog`: NLP query records, extracted intent, confidence, and RBAC compliance flags.
