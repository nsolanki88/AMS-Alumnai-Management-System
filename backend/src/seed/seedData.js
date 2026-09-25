const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');

async function main() {
  console.log('🌱 Starting AMS+ database seeding...');

  // Clean existing tables
  await prisma.chatbotLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.facultyEndorsement.deleteMany();
  await prisma.doubtAnswer.deleteMany();
  await prisma.doubtQuestion.deleteMany();
  await prisma.workshopInvitation.deleteMany();
  await prisma.mentorshipProfile.deleteMany();
  await prisma.referralConnection.deleteMany();
  await prisma.postReaction.deleteMany();
  await prisma.postComment.deleteMany();
  await prisma.groupPost.deleteMany();
  await prisma.batchGroup.deleteMany();
  await prisma.outreachLog.deleteMany();
  await prisma.potentialMatch.deleteMany();
  await prisma.alumniRecord.deleteMany();
  await prisma.alumniProfile.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.otpVerification.deleteMany();
  await prisma.user.deleteMany();

  const commonPasswordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create 5 Primary Demo Accounts
  console.log('Creating demo users for 5 roles...');

  const studentUser = await prisma.user.create({
    data: {
      fullName: 'Aarav Sharma (Student)',
      email: 'student@example.com',
      passwordHash: commonPasswordHash,
      phoneNumber: '+91-9876543210',
      role: 'STUDENT',
      department: 'Computer Science & Engineering',
      isVerified: true
    }
  });

  const alumniUser = await prisma.user.create({
    data: {
      fullName: 'Rahul Sharma (Alumni)',
      email: 'alumni@example.com',
      passwordHash: commonPasswordHash,
      phoneNumber: '+91-9876543211',
      role: 'ALUMNI',
      department: 'Computer Science & Engineering',
      isVerified: true,
      alumniProfile: {
        create: {
          graduationYear: 2022,
          branch: 'Computer Science & Engineering',
          rollNumber: 'CSE-2018-042',
          currentCompany: 'Google',
          currentRole: 'Senior Software Engineer',
          cityCountry: 'Bengaluru, India',
          bio: 'Passionate about distributed systems, cloud architecture, and mentoring student developers.',
          linkedinUrl: 'https://linkedin.com/in/rahulsharma-google',
          githubUrl: 'https://github.com/rahulsharma-tech',
          visibility: 'PUBLIC',
          isMentor: true,
          workshopReady: true,
          skills: JSON.stringify(['React', 'Node.js', 'System Design', 'AWS', 'Kubernetes', 'Go']),
          experienceYears: 4
        }
      },
      mentorshipProfile: {
        create: {
          bio: 'Available for technical mock interviews and resume reviews.',
          currentCompany: 'Google',
          currentRole: 'Senior Software Engineer',
          yearsOfExperience: 4,
          skills: JSON.stringify(['React', 'Node.js', 'System Design', 'AWS']),
          expertiseAreas: JSON.stringify(['Distributed Systems', 'Cloud Architecture', 'Web Engineering']),
          workshopTopics: JSON.stringify(['Scalable Microservices with Docker', 'System Design Interview Decoded']),
          mentorshipAvailability: 'available',
          isActive: true
        }
      }
    }
  });

  const facultyUser = await prisma.user.create({
    data: {
      fullName: 'Dr. Ramesh Kulkarni (Faculty)',
      email: 'faculty@example.com',
      passwordHash: commonPasswordHash,
      phoneNumber: '+91-9876543212',
      role: 'FACULTY',
      department: 'Computer Science & Engineering',
      isVerified: true
    }
  });

  const councilUser = await prisma.user.create({
    data: {
      fullName: 'Meera Nambiar (Council)',
      email: 'council@example.com',
      passwordHash: commonPasswordHash,
      phoneNumber: '+91-9876543213',
      role: 'COUNCIL',
      department: 'Alumni Affairs Council',
      isVerified: true
    }
  });

  const adminUser = await prisma.user.create({
    data: {
      fullName: 'System Administrator (Admin)',
      email: 'admin@example.com',
      passwordHash: commonPasswordHash,
      phoneNumber: '+91-9876543214',
      role: 'ADMIN',
      department: 'Dean of Information Systems',
      isVerified: true
    }
  });

  // Additional alumni users
  const priyaUser = await prisma.user.create({
    data: {
      fullName: 'Priya Patel',
      email: 'priya.patel@example.com',
      passwordHash: commonPasswordHash,
      role: 'ALUMNI',
      department: 'Electronics & Communication',
      isVerified: true,
      alumniProfile: {
        create: {
          graduationYear: 2021,
          branch: 'Electronics & Communication',
          rollNumber: 'ECE-2017-089',
          currentCompany: 'Meta',
          currentRole: 'AI Research Engineer',
          cityCountry: 'London, UK',
          bio: 'Building foundational vision and language models at Meta AI.',
          linkedinUrl: 'https://linkedin.com/in/priya-patel-ai',
          visibility: 'PUBLIC',
          isMentor: true,
          workshopReady: true,
          skills: JSON.stringify(['Python', 'Machine Learning', 'PyTorch', 'Computer Vision']),
          experienceYears: 5
        }
      },
      mentorshipProfile: {
        create: {
          bio: 'Mentoring students aiming for research careers in machine learning.',
          currentCompany: 'Meta',
          currentRole: 'AI Research Engineer',
          yearsOfExperience: 5,
          skills: JSON.stringify(['Python', 'Machine Learning', 'PyTorch']),
          expertiseAreas: JSON.stringify(['Deep Learning', 'Computer Vision', 'Generative AI']),
          workshopTopics: JSON.stringify(['Hands-on PyTorch for Deep Learning']),
          mentorshipAvailability: 'available',
          isActive: true
        }
      }
    }
  });

  const vikramUser = await prisma.user.create({
    data: {
      fullName: 'Vikram Singh',
      email: 'vikram.singh@example.com',
      passwordHash: commonPasswordHash,
      role: 'ALUMNI',
      department: 'Mechanical Engineering',
      isVerified: true,
      alumniProfile: {
        create: {
          graduationYear: 2020,
          branch: 'Mechanical Engineering',
          rollNumber: 'ME-2016-015',
          currentCompany: 'Tesla',
          currentRole: 'Lead Robotics Engineer',
          cityCountry: 'Austin, USA',
          bio: 'Designing manufacturing automation robotics at Tesla Gigafactory.',
          visibility: 'BATCH_ONLY',
          isMentor: true,
          workshopReady: true,
          skills: JSON.stringify(['Robotics', 'CAD', 'Control Systems', 'Automation']),
          experienceYears: 6
        }
      }
    }
  });

  const snehaUser = await prisma.user.create({
    data: {
      fullName: 'Sneha Reddy',
      email: 'sneha.reddy@example.com',
      passwordHash: commonPasswordHash,
      role: 'ALUMNI',
      department: 'Computer Science & Engineering',
      isVerified: true,
      alumniProfile: {
        create: {
          graduationYear: 2023,
          branch: 'Computer Science & Engineering',
          rollNumber: 'CSE-2019-112',
          currentCompany: 'Microsoft',
          currentRole: 'Software Engineer',
          cityCountry: 'Hyderabad, India',
          bio: 'Working on Azure Core Infrastructure & Container services.',
          visibility: 'PUBLIC',
          isMentor: true,
          workshopReady: false,
          skills: JSON.stringify(['Java', 'C++', 'Azure', 'Microservices']),
          experienceYears: 2
        }
      }
    }
  });

  // 2. Historical Alumni Records (Imported)
  console.log('Seeding historical alumni records...');

  const record1 = await prisma.alumniRecord.create({
    data: {
      source: 'INSTITUTIONAL_ARCHIVE',
      fullName: 'Rahul Sharma',
      graduationYear: 2022,
      branch: 'Computer Science & Engineering',
      rollNumber: 'CSE-2018-042',
      contactEmail: 'alumni@example.com',
      cityCountry: 'Bengaluru, India',
      company: 'Google',
      jobRole: 'Senior Software Engineer',
      registrationStatus: 'verified'
    }
  });

  const record2 = await prisma.alumniRecord.create({
    data: {
      source: 'INSTITUTIONAL_ARCHIVE',
      fullName: 'Ananya Gupta',
      graduationYear: 2022,
      branch: 'Computer Science & Engineering',
      rollNumber: 'CSE-2018-011',
      contactEmail: 'ananya.gupta@example.com',
      cityCountry: 'Bengaluru, India',
      company: 'Amazon',
      jobRole: 'SDE II',
      registrationStatus: 'unregistered' // Unregistered alumnus candidate
    }
  });

  const record3 = await prisma.alumniRecord.create({
    data: {
      source: 'INSTITUTIONAL_ARCHIVE',
      fullName: 'Rohan Mehta',
      graduationYear: 2023,
      branch: 'Information Technology',
      rollNumber: 'IT-2019-077',
      contactEmail: 'rohan.mehta@example.com',
      cityCountry: 'Pune, India',
      company: 'Thoughtworks',
      jobRole: 'Consultant Developer',
      registrationStatus: 'unregistered'
    }
  });

  const record4 = await prisma.alumniRecord.create({
    data: {
      source: 'INSTITUTIONAL_ARCHIVE',
      fullName: 'Divya Nair',
      graduationYear: 2021,
      branch: 'Electronics & Communication',
      rollNumber: 'ECE-2017-034',
      contactEmail: 'divya.nair@example.com',
      cityCountry: 'Munich, Germany',
      company: 'Siemens',
      jobRole: 'Embedded Systems Engineer',
      registrationStatus: 'unregistered'
    }
  });

  const record5 = await prisma.alumniRecord.create({
    data: {
      source: 'INSTITUTIONAL_ARCHIVE',
      fullName: 'Karthik Iyer',
      graduationYear: 2020,
      branch: 'Mechanical Engineering',
      rollNumber: 'ME-2016-088',
      cityCountry: 'Chennai, India',
      company: 'L&T Technology',
      jobRole: 'Senior Design Engineer',
      registrationStatus: 'unregistered'
    }
  });

  // 3. Potential Matches (AI Discovered)
  console.log('Seeding AI discovered potential matches...');

  // Verified match for Rahul Sharma
  await prisma.potentialMatch.create({
    data: {
      recordId: record1.recordId,
      name: 'Rahul Sharma',
      platform: 'LinkedIn Public Profile',
      profileUrl: 'https://linkedin.com/in/rahulsharma-google',
      confidenceScore: 96,
      reasons: JSON.stringify([
        'Exact full name match (100%)',
        'Graduation year aligns with education record (2022)',
        'Branch aligns with verified degree (CSE)',
        'Verified organization: Google'
      ]),
      matchingAttributes: JSON.stringify({
        name: 'Rahul Sharma',
        college: 'State Engineering Institute',
        gradYear: '2022',
        company: 'Google'
      }),
      status: 'verified',
      reviewedBy: councilUser.fullName,
      reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  });

  // Pending match for Ananya Gupta (for Council demo workflow)
  await prisma.potentialMatch.create({
    data: {
      recordId: record2.recordId,
      name: 'Ananya Gupta',
      platform: 'LinkedIn Public Profile',
      profileUrl: 'https://linkedin.com/in/ananya-gupta-amazon',
      confidenceScore: 92,
      reasons: JSON.stringify([
        'Name similarity: Exact match (98%)',
        'Graduation year match: 2022',
        'Academic discipline match: CSE',
        'Company aligns with public profile: Amazon'
      ]),
      matchingAttributes: JSON.stringify({
        nameMatch: '98%',
        gradYear: '2022',
        branch: 'Computer Science',
        company: 'Amazon SDE II'
      }),
      status: 'pending' // Ready for Council verification in demo!
    }
  });

  // Pending match for Rohan Mehta
  await prisma.potentialMatch.create({
    data: {
      recordId: record3.recordId,
      name: 'Rohan Mehta',
      platform: 'GitHub / Public Tech Blog',
      profileUrl: 'https://github.com/rohanmehta-dev',
      confidenceScore: 78,
      reasons: JSON.stringify([
        'Strong name similarity with open source repositories',
        'College project repositories match IT syllabus',
        'Graduation year aligns with batch of 2023'
      ]),
      matchingAttributes: JSON.stringify({
        nameMatch: '90%',
        branch: 'Information Technology',
        platform: 'GitHub Public Profile'
      }),
      status: 'pending'
    }
  });

  // Uncertain match for Divya Nair
  await prisma.potentialMatch.create({
    data: {
      recordId: record4.recordId,
      name: 'Divya Nair',
      platform: 'ResearchGate Public Index',
      profileUrl: 'https://researchgate.net/profile/divya-nair-siemens',
      confidenceScore: 64,
      reasons: JSON.stringify([
        'Name matches published research in embedded systems',
        'Degree year approximate (+/- 1 year difference)',
        'Employer aligns with European semiconductor division'
      ]),
      matchingAttributes: JSON.stringify({
        nameMatch: '85%',
        yearDiscrepancy: '1 year offset'
      }),
      status: 'uncertain',
      reviewedBy: councilUser.fullName,
      reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  });

  // Rejected match for Karthik Iyer
  await prisma.potentialMatch.create({
    data: {
      recordId: record5.recordId,
      name: 'Karthik Iyer',
      platform: 'LinkedIn Public',
      profileUrl: 'https://linkedin.com/in/karthik-iyer-unrelated',
      confidenceScore: 42,
      reasons: JSON.stringify([
        'Name match only',
        'Graduated from National Institute of Technology (different college)'
      ]),
      matchingAttributes: JSON.stringify({
        collegeMismatch: 'Graduated from different college'
      }),
      status: 'rejected',
      rejectionReason: 'Different individual with identical name from another university',
      reviewedBy: councilUser.fullName,
      reviewedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    }
  });

  // 4. Batch Groups & Posts
  console.log('Seeding batch communities...');

  const batch2022 = await prisma.batchGroup.create({
    data: {
      graduationYear: 2022,
      name: 'Batch 2022',
      description: 'Official alumni network for the Class of 2022.'
    }
  });

  const batch2021 = await prisma.batchGroup.create({
    data: {
      graduationYear: 2021,
      name: 'Batch 2021',
      description: 'Official alumni network for the Class of 2021.'
    }
  });

  const batch2023 = await prisma.batchGroup.create({
    data: {
      graduationYear: 2023,
      name: 'Batch 2023',
      description: 'Official alumni network for the Class of 2023.'
    }
  });

  // Posts in Batch 2022
  const post1 = await prisma.groupPost.create({
    data: {
      groupId: batch2022.id,
      authorId: alumniUser.id,
      title: 'Google is hiring Software Engineers (L4/L5) - Referral Available',
      content: 'Hey Batch 2022! My team in Cloud Infrastructure is expanding. If anyone is looking for opportunities in distributed systems or backend engineering, drop me a message with your resume!',
      postType: 'job'
    }
  });

  await prisma.postComment.create({
    data: {
      postId: post1.id,
      authorId: snehaUser.id,
      content: 'Great opportunity Rahul! Sending across details of a fellow batchmate.'
    }
  });

  await prisma.postReaction.create({
    data: {
      postId: post1.id,
      userId: studentUser.id,
      reactionType: 'celebrate'
    }
  });

  await prisma.groupPost.create({
    data: {
      groupId: batch2022.id,
      authorId: councilUser.id,
      title: 'Annual Alumni Homecoming & Hackathon 2026',
      content: 'We invite all Class of 2022 alumni to the upcoming Annual Homecoming on campus this October. Let us know if you would like to judge the hackathon or mentor participating teams!',
      postType: 'announcement'
    }
  });

  // 5. Referral Chain
  console.log('Seeding referral network chain...');

  // Alumni A (Rahul) -> Alumni B (Aditya) -> Alumni C (Neha)
  const referral1 = await prisma.referralConnection.create({
    data: {
      referrerAlumniId: alumniUser.id,
      referredName: 'Aditya Deshmukh',
      referredEmail: 'aditya.deshmukh@example.com',
      graduationYear: 2022,
      branch: 'Computer Science & Engineering',
      company: 'Goldman Sachs',
      jobRole: 'Analyst Developer',
      linkedinUrl: 'https://linkedin.com/in/aditya-deshmukh-gs',
      notes: 'Batchmate from CSE 2022, worked together on the final year capstone.',
      status: 'verified',
      reviewedBy: councilUser.fullName
    }
  });

  await prisma.referralConnection.create({
    data: {
      referrerAlumniId: alumniUser.id,
      referredName: 'Neha Sen',
      referredEmail: 'neha.sen@example.com',
      graduationYear: 2022,
      branch: 'Electronics & Communication',
      company: 'Qualcomm',
      jobRole: 'Hardware Systems Engineer',
      linkedinUrl: 'https://linkedin.com/in/neha-sen-qualcomm',
      notes: 'Outstanding researcher during undergraduate studies.',
      status: 'pending'
    }
  });

  // 6. Workshop Invitations & Calendar Sessions
  console.log('Seeding workshop invitations...');

  await prisma.workshopInvitation.create({
    data: {
      requesterId: facultyUser.id,
      alumniId: alumniUser.id,
      topic: 'Scalable Microservices with Docker & Kubernetes',
      sessionType: 'workshop',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      time: '02:00 PM - 04:30 PM',
      status: 'accepted', // Appears in public calendar
      meetingLink: 'https://meet.google.com/ams-work-2026',
      notes: 'Hands-on laboratory session for 3rd and 4th year CSE students.'
    }
  });

  await prisma.workshopInvitation.create({
    data: {
      requesterId: facultyUser.id,
      alumniId: priyaUser.id,
      topic: 'Generative AI & Transformer Architectures in Industry',
      sessionType: 'guest_lecture',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      time: '11:00 AM - 12:30 PM',
      status: 'pending',
      notes: 'Keynote guest lecture for department colloquium.'
    }
  });

  // 7. Student Doubts
  console.log('Seeding student doubts...');

  const doubt1 = await prisma.doubtQuestion.create({
    data: {
      studentId: studentUser.id,
      title: 'How should I structure my preparation for System Design interviews at top product companies?',
      description: 'I am in my final year and targeting senior campus placements. What resources and design patterns are most critical when preparing for high-level and low-level design rounds?',
      category: 'Interview Preparation',
      aiClassifiedCategory: 'Interview Preparation',
      extractedSkills: JSON.stringify(['System Design', 'Algorithms', 'Microservices', 'Distributed Systems']),
      status: 'answered'
    }
  });

  await prisma.doubtAnswer.create({
    data: {
      doubtId: doubt1.id,
      alumniId: alumniUser.id,
      content: 'Start with fundamental trade-offs: CAP theorem, caching strategies (Redis), SQL vs NoSQL, and database sharding. I recommend reading Alex Xu\'s System Design book and building a simple URL shortener or rate limiter end-to-end!',
      isHelpful: true
    }
  });

  const doubt2 = await prisma.doubtQuestion.create({
    data: {
      studentId: studentUser.id,
      title: 'Applying for Master\'s in Computer Science abroad: Balancing GRE vs Research Publications?',
      description: 'I am planning for MS in the US/Europe for Fall 2027. Should I dedicate more time to securing GRE 325+ or working on an IEEE conference paper with faculty?',
      category: 'Higher Studies',
      aiClassifiedCategory: 'Higher Studies',
      extractedSkills: JSON.stringify(['GRE', 'Masters', 'Research', 'Higher Studies']),
      status: 'open'
    }
  });

  // 8. Faculty Endorsements
  console.log('Seeding faculty endorsements...');

  await prisma.facultyEndorsement.create({
    data: {
      facultyId: facultyUser.id,
      alumniId: alumniUser.id,
      skillName: 'System Design',
      comment: 'Demonstrated outstanding systems programming capabilities during his undergraduate capstone project under my guidance.'
    }
  });

  await prisma.facultyEndorsement.create({
    data: {
      facultyId: facultyUser.id,
      alumniId: priyaUser.id,
      skillName: 'Machine Learning',
      comment: 'Published top-tier departmental research in computer vision; exceptional theoretical and applied acumen.'
    }
  });

  // 9. Outreach Logs
  console.log('Seeding outreach logs...');

  await prisma.outreachLog.create({
    data: {
      recordId: record2.recordId,
      channel: 'email',
      status: 'contacted',
      notes: 'Dispatched institutional alumni verification invite via university records.',
      loggedBy: councilUser.id,
      followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    }
  });

  // 10. Audit Logs
  console.log('Seeding audit logs...');

  await prisma.auditLog.create({
    data: {
      userId: councilUser.id,
      actionType: 'ALUMNI_IMPORT',
      entityType: 'ALUMNI_RECORD',
      metadata: JSON.stringify({ batchCount: 5, source: 'INSTITUTIONAL_ARCHIVE' }),
      ipAddress: '127.0.0.1'
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: councilUser.id,
      actionType: 'MATCH_VERIFIED',
      entityType: 'POTENTIAL_MATCH',
      entityId: record1.recordId,
      metadata: JSON.stringify({ alumnus: 'Rahul Sharma', status: 'verified' }),
      ipAddress: '127.0.0.1'
    }
  });

  // 11. In-App Notifications
  console.log('Seeding user notifications...');

  await prisma.notification.create({
    data: {
      userId: studentUser.id,
      title: 'Answer Received on System Design Doubt',
      message: 'Rahul Sharma (Senior SWE at Google) answered your doubt on System Design preparation.',
      type: 'doubt'
    }
  });

  await prisma.notification.create({
    data: {
      userId: alumniUser.id,
      title: 'Workshop Invitation Accepted',
      message: 'Your workshop on "Scalable Microservices" has been confirmed on the University calendar.',
      type: 'mentorship'
    }
  });

  console.log('✅ AMS+ database seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
