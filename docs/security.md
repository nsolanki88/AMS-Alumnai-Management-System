# AMS+ Security & Privacy Architecture

## Security Standards Implemented

### 1. Authentication & Session Lifecycles
- **Password Hashing**: Industry standard bcrypt with work factor 10. Plaintext passwords are never persisted.
- **JWT Access Tokens**: Cryptographically signed access tokens expiring after 8 hours.
- **Refresh Tokens**: Rotating cryptographically secure refresh tokens expiring in 30 days stored in the database with revocation tracking.
- **Account Lockout**: Automatic lockout after 5 consecutive failed login attempts for 15 minutes to defeat brute-force dictionary attacks.
- **Email OTP Verification**: 6-digit OTP codes expiring in 10 minutes required for newly registered accounts.
- **Password Reset**: Secure 32-byte cryptographic hex tokens valid for 30 minutes.

### 2. Role-Based Access Control (RBAC)
- Exact 5 roles: `STUDENT`, `ALUMNI`, `FACULTY`, `COUNCIL`, `ADMIN`.
- Evaluated on **both** frontend route guards and backend API middleware (`authorizeRoles`).
- `ADMIN` possesses master permissions and can execute `COUNCIL` workflows.
- API layer strictly enforces:
  - Students cannot access Council endpoints.
  - Alumni cannot verify matches.
  - Faculty cannot access Admin functions.
  - Unverified AI matches are hidden from Student and Alumni directory searches.

### 3. Data Privacy & Contact Protection
- Alumni profiles support three visibility tiers: `PUBLIC`, `BATCH_ONLY`, `PRIVATE`.
- Public directory endpoints redact private email addresses and telephone numbers for students and faculty unless the alumnus has marked their profile as public.
- AI discovered profiles remain visible exclusively to Council and Admin until verified.

### 4. HTTP & Application Protection
- **Helmet**: Secures HTTP response headers against cross-site scripting, clickjacking, and MIME sniffing.
- **Rate Limiting**: Express-rate-limit throttling authentication and AI discovery endpoints.
- **Audit Logging**: Immutable logging for all critical operations: imports, discovery runs, verifications, rejections, role changes, and lockouts.
- **Error Sanitization**: Server stack traces are suppressed in production environments.
