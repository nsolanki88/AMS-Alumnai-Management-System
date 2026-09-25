const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../src/config');
const { authorizeRoles } = require('../src/middleware/rbac');
const AiGatewayService = require('../src/services/aiGatewayService');
const OtpService = require('../src/services/otpService');
const { AlumniRecordController } = require('../src/controllers/alumniRecordController');

test('Security: Password Hashing & Verification', async () => {
  const plain = 'Password123!';
  const hash = await bcrypt.hash(plain, 10);
  assert.notEqual(plain, hash);
  const isValid = await bcrypt.compare(plain, hash);
  assert.equal(isValid, true);
  const isInvalid = await bcrypt.compare('WrongPassword', hash);
  assert.equal(isInvalid, false);
});

test('Security: JWT Token Generation & Verification', () => {
  const payload = { userId: 'test-user-123', email: 'test@example.com', role: 'STUDENT' };
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '8h' });
  const decoded = jwt.verify(token, config.jwtSecret);
  assert.equal(decoded.userId, payload.userId);
  assert.equal(decoded.role, payload.role);
});

test('RBAC Middleware: Role Enforcement & Admin Access', () => {
  const mockRes = () => {
    const res = {};
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data) => {
      res.body = data;
      return res;
    };
    return res;
  };

  // 1. Student accessing Council endpoint -> Must be rejected (403 Forbidden)
  const studentReq = { user: { id: 's1', role: 'STUDENT' } };
  const res1 = mockRes();
  let nextCalled1 = false;
  authorizeRoles('COUNCIL')(studentReq, res1, () => { nextCalled1 = true; });
  assert.equal(nextCalled1, false);
  assert.equal(res1.statusCode, 403);
  assert.match(res1.body.message, /Access denied/);

  // 2. Alumni attempting to verify matches (Council only) -> Must be rejected (403)
  const alumniReq = { user: { id: 'a1', role: 'ALUMNI' } };
  const res2 = mockRes();
  let nextCalled2 = false;
  authorizeRoles('COUNCIL')(alumniReq, res2, () => { nextCalled2 = true; });
  assert.equal(nextCalled2, false);
  assert.equal(res2.statusCode, 403);

  // 3. Faculty accessing Admin functions -> Must be rejected (403)
  const facultyReq = { user: { id: 'f1', role: 'FACULTY' } };
  const res3 = mockRes();
  let nextCalled3 = false;
  authorizeRoles('ADMIN')(facultyReq, res3, () => { nextCalled3 = true; });
  assert.equal(nextCalled3, false);
  assert.equal(res3.statusCode, 403);

  // 4. Council accessing Council endpoint -> Allowed
  const councilReq = { user: { id: 'c1', role: 'COUNCIL' } };
  const res4 = mockRes();
  let nextCalled4 = false;
  authorizeRoles('COUNCIL')(councilReq, res4, () => { nextCalled4 = true; });
  assert.equal(nextCalled4, true);

  // 5. Admin accessing Council endpoint -> Allowed (Admin has master access)
  const adminReq = { user: { id: 'adm1', role: 'ADMIN' } };
  const res5 = mockRes();
  let nextCalled5 = false;
  authorizeRoles('COUNCIL')(adminReq, res5, () => { nextCalled5 = true; });
  assert.equal(nextCalled5, true);
});

test('OTP Service: Code Generation & 6-Digit Format', () => {
  const code = OtpService.generateOtp();
  assert.equal(typeof code, 'string');
  assert.equal(code.length, 6);
  assert.equal(/^\d{6}$/.test(code), true);
});

test('CSV Import: Column Mapping & Parsing', () => {
  const csvContent = `Name,Batch,Branch,Roll Number,Company\nVikram Singh,2020,ME,ME-2016-015,Tesla\nSneha Reddy,2023,CSE,CSE-2019-112,Microsoft`;
  const { headers, rows } = AlumniRecordController.parseCSVText(csvContent);
  assert.equal(headers.length, 5);
  assert.equal(rows.length, 2);
  assert.equal(rows[0]['Name'], 'Vikram Singh');
  assert.equal(rows[0]['Roll Number'], 'ME-2016-015');
  assert.equal(rows[1]['Company'], 'Microsoft');
});

test('AI Gateway: Question Classification & Topic Extraction', async () => {
  const title = 'Preparation for Amazon SDE 2 System Design and coding rounds';
  const desc = 'What topics in caching, sharding, and React should I focus on?';
  const res = await AiGatewayService.classifyQuestion(title, desc);
  assert.equal(res.category, 'Interview Preparation');
  assert.ok(res.extractedSkills.length > 0);
  assert.ok(res.confidence > 0.7);
});

test('AI Gateway: Alumni Recommendations Ranking', async () => {
  const doubt = {
    category: 'Interview Preparation',
    extractedSkills: ['React', 'System Design']
  };
  const candidates = [
    {
      id: 'alumni-1',
      fullName: 'Rahul Sharma',
      currentRole: 'Senior Software Engineer',
      currentCompany: 'Google',
      skills: ['React', 'System Design', 'Node.js'],
      isMentor: true
    },
    {
      id: 'alumni-2',
      fullName: 'Junior Dev',
      currentRole: 'Associate',
      currentCompany: 'ABC',
      skills: ['Python'],
      isMentor: false
    }
  ];

  const res = await AiGatewayService.recommendAlumni(doubt, candidates);
  assert.ok(res.recommendations.length > 0);
  assert.equal(res.recommendations[0].alumniId, 'alumni-1');
  assert.ok(res.recommendations[0].recommendationScore > res.recommendations[1].recommendationScore);
});

test('Chatbot NLP: RBAC Policy Enforcement', async () => {
  // Student asking for Council-only potential match discovery
  const studentResult = await AiGatewayService.extractChatIntent(
    'Find potential matches for unregistered alumni',
    'STUDENT'
  );
  assert.equal(studentResult.intent, 'restricted_council_intent');

  // Council member asking same query
  const councilResult = await AiGatewayService.extractChatIntent(
    'Find potential matches for unregistered alumni',
    'COUNCIL'
  );
  assert.equal(councilResult.intent, 'council_discover_profiles');

  // General company search by student
  const compResult = await AiGatewayService.extractChatIntent(
    'Find alumni working in Google',
    'STUDENT'
  );
  assert.equal(compResult.intent, 'find_alumni_by_company');
  assert.equal(compResult.entities.company, 'Google');
});
