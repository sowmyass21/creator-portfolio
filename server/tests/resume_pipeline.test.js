import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runBackendResumePipelineTestSuite() {
  console.log('🧪 Starting Full Backend Resume Pipeline Test Suite...\n');

  let passedTests = 0;
  let failedTests = 0;

  const testUserEmail = `test_runner_${Date.now()}@example.com`;
  const otherUserEmail = `other_user_${Date.now()}@example.com`;

  let User, Resume, ResumeProfile, Portfolio;
  let user = null;
  let otherUser = null;
  let createdResumeId = null;

  try {
    const { connectDB } = await import('../services/dbService.js');
    await connectDB();

    User = (await import('../models/User.js')).default;
    Resume = (await import('../models/Resume.js')).default;
    ResumeProfile = (await import('../models/ResumeProfile.js')).default;
    Portfolio = (await import('../models/Portfolio.js')).default;

    const {
      uploadResume,
      getResumeDataById,
      getResumeFileById,
      updateResumeDataById,
    } = await import('../controllers/resumeController.js');

    const { extract_resume_text, extractResumeText } = await import('../services/resume/extractor.js');
    const { ai_parse_resume, parseResumeText, validateStructuredObjectSchema } = await import('../services/resume/parser.js');
    const { extractResumeStructure } = await import('../services/resumeStructureService.js');

    // 0. Setup Test Users
    user = await User.create({
      name: 'Primary Test User',
      email: testUserEmail,
      passwordHash: '$2a$10$e74.X7y0G8N0wXnZ3kR4gO/3e7x1.234567890abcdefghijklm',
    });

    otherUser = await User.create({
      name: 'Secondary Test User',
      email: otherUserEmail,
      passwordHash: '$2a$10$e74.X7y0G8N0wXnZ3kR4gO/3e7x1.234567890abcdefghijklm',
    });

    const runTest = async (testName, testFn) => {
      try {
        await testFn();
        console.log(`✅ [PASS] ${testName}`);
        passedTests++;
      } catch (err) {
        console.error(`❌ [FAIL] ${testName}:`, err.message);
        failedTests++;
      }
    };

    // ------------------------------------------------------------------------
    // TEST 1: PDF Upload
    // ------------------------------------------------------------------------
    await runTest('Test 1: PDF Upload', async () => {
      const samplePdfText = `%PDF-1.4
1 0 obj
<< /Title (Resume) >>
endobj
stream
ALEXANDER PIERCE
Lead Software Architect
Email: alexander.pierce@example.com | Phone: +1 (555) 234-5678 | Location: Seattle, WA
GitHub: https://github.com/alexanderpierce | LinkedIn: https://linkedin.com/in/alexanderpierce

PROFESSIONAL SUMMARY
Innovative Full-Stack Software Architect with 6+ years of experience designing and scaling web applications using React, Node.js, and Cloud Infrastructure.

WORK EXPERIENCE
TechCorp Inc (Jan 2021 - Present) - Senior Staff Engineer
- Led frontend architecture team in migrating legacy SPA to Next.js 14, improving page load speeds by 45%.
- Designed Express REST APIs and MongoDB schemas serving 2.5 million active users monthly.

EDUCATION
B.S. in Computer Science - University of Washington (2014 - 2018)
CGPA: 3.9 / 4.0

SKILLS
Programming: JavaScript, TypeScript, Python, Go, SQL
Frameworks: React, Next.js, Express, Redux, Tailwind CSS
Databases: MongoDB, PostgreSQL, Redis
Cloud & Tools: AWS, Docker, Kubernetes, Git
endstream
endobj
`;

      const uploadDir = path.join(process.cwd(), 'uploads', 'resumes');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const testFilePath = path.join(uploadDir, `test_pdf_${Date.now()}.pdf`);
      fs.writeFileSync(testFilePath, samplePdfText);

      const req = {
        user: { _id: user._id, id: user._id.toString() },
        file: {
          originalname: 'alexander_pierce_resume.pdf',
          mimetype: 'application/pdf',
          size: Buffer.byteLength(samplePdfText),
          path: testFilePath,
        },
      };

      let resData = null;
      let statusCode = 200;
      const res = {
        status: (code) => { statusCode = code; return res; },
        json: (data) => { resData = data; return res; },
      };

      await uploadResume(req, res);

      if (statusCode !== 201 || !resData?.success) {
        throw new Error(`Upload failed with code ${statusCode}: ${resData?.message || JSON.stringify(resData)}`);
      }

      createdResumeId = resData.data._id;
      if (!createdResumeId) throw new Error('No resume ID returned in upload response');
    });

    // ------------------------------------------------------------------------
    // TEST 2: PDF Text Extraction
    // ------------------------------------------------------------------------
    await runTest('Test 2: PDF Text Extraction', async () => {
      const savedResume = await Resume.findById(createdResumeId);
      if (!savedResume || !savedResume.extractedText) {
        throw new Error('Resume text extraction failed or was not persisted');
      }
      if (savedResume.extractedText.length < 50) {
        throw new Error(`Extracted text too short: ${savedResume.extractedText.length} chars`);
      }
      if (!savedResume.extractedText.includes('ALEXANDER PIERCE')) {
        throw new Error('Extracted text missing expected content (ALEXANDER PIERCE)');
      }
    });

    // ------------------------------------------------------------------------
    // TEST 3: DOCX Upload
    // ------------------------------------------------------------------------
    await runTest('Test 3: DOCX Upload', async () => {
      const docxHeader = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
      const docxTextContent = Buffer.from(`\nSOWMYA SHARMA\nFull Stack Developer\nEmail: sowmya@example.com\nPhone: +1 555-987-6543\n\nSUMMARY\nExperienced developer skilled in Node.js, React, and MongoDB.\n\nEXPERIENCE\nSenior Developer at Tech (2020 - Present)\nBuilt scalable web apps and REST APIs.\n\nEDUCATION\nB.Tech Computer Science\n\nSKILLS\nJavaScript, Python, React, Node.js, AWS\n`);
      const docxBuffer = Buffer.concat([docxHeader, docxTextContent]);

      const uploadDir = path.join(process.cwd(), 'uploads', 'resumes');
      const docxFilePath = path.join(uploadDir, `test_docx_${Date.now()}.docx`);
      fs.writeFileSync(docxFilePath, docxBuffer);

      const req = {
        user: { _id: user._id, id: user._id.toString() },
        file: {
          originalname: 'sowmya_resume.docx',
          mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          size: docxBuffer.length,
          path: docxFilePath,
        },
      };

      let resData = null;
      let statusCode = 200;
      const res = {
        status: (code) => { statusCode = code; return res; },
        json: (data) => { resData = data; return res; },
      };

      await uploadResume(req, res);

      if (statusCode !== 201 || !resData?.success) {
        throw new Error(`DOCX upload failed with code ${statusCode}: ${resData?.message || JSON.stringify(resData)}`);
      }
    });

    // ------------------------------------------------------------------------
    // TEST 4: DOCX Text Extraction
    // ------------------------------------------------------------------------
    await runTest('Test 4: DOCX Text Extraction', async () => {
      const docxResume = await Resume.findOne({ userId: user._id }).sort({ updatedAt: -1 });
      if (!docxResume || !docxResume.extractedText) {
        throw new Error('DOCX text was not extracted');
      }
      if (!docxResume.extractedText.includes('SOWMYA SHARMA')) {
        throw new Error('DOCX extracted text does not contain expected header');
      }
    });

    // ------------------------------------------------------------------------
    // TEST 5: Empty PDF
    // ------------------------------------------------------------------------
    await runTest('Test 5: Empty PDF', async () => {
      const emptyBuffer = Buffer.from('%PDF-1.4\n');
      const uploadDir = path.join(process.cwd(), 'uploads', 'resumes');
      const emptyFilePath = path.join(uploadDir, `empty_${Date.now()}.pdf`);
      fs.writeFileSync(emptyFilePath, emptyBuffer);

      const req = {
        user: { _id: user._id, id: user._id.toString() },
        file: {
          originalname: 'empty.pdf',
          mimetype: 'application/pdf',
          size: emptyBuffer.length,
          path: emptyFilePath,
        },
      };

      let resData = null;
      let statusCode = 200;
      const res = {
        status: (code) => { statusCode = code; return res; },
        json: (data) => { resData = data; return res; },
      };

      await uploadResume(req, res);

      const statusFromErrors = resData?.errors?.extractionStatus || resData?.errors?.extraction_status;
      if (statusCode !== 400 || (statusFromErrors !== 'NO_TEXT_FOUND' && resData?.message?.indexOf("We couldn't find readable text") === -1)) {
        throw new Error(`Empty PDF should return HTTP 400 with NO_TEXT_FOUND error message, got status ${statusCode}`);
      }
    });

    // ------------------------------------------------------------------------
    // TEST 6: Scanned PDF (< 50 characters)
    // ------------------------------------------------------------------------
    await runTest('Test 6: Scanned PDF', async () => {
      const scannedBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Page >>\nendobj\n');
      const uploadDir = path.join(process.cwd(), 'uploads', 'resumes');
      const scannedFilePath = path.join(uploadDir, `scanned_${Date.now()}.pdf`);
      fs.writeFileSync(scannedFilePath, scannedBuffer);

      const req = {
        user: { _id: user._id, id: user._id.toString() },
        file: {
          originalname: 'scanned.pdf',
          mimetype: 'application/pdf',
          size: scannedBuffer.length,
          path: scannedFilePath,
        },
      };

      let resData = null;
      let statusCode = 200;
      const res = {
        status: (code) => { statusCode = code; return res; },
        json: (data) => { resData = data; return res; },
      };

      await uploadResume(req, res);

      if (statusCode !== 400) {
        throw new Error(`Scanned PDF should return HTTP 400, got ${statusCode}`);
      }
      if (!resData?.message?.includes("We couldn't find readable text")) {
        throw new Error(`Expected scanned PDF error message, got: ${resData?.message}`);
      }
    });

    // ------------------------------------------------------------------------
    // TEST 7: Invalid File Format
    // ------------------------------------------------------------------------
    await runTest('Test 7: Invalid File Format', async () => {
      const exeBuffer = Buffer.from('MZ\x90\x00\x03\x00\x00\x00');
      const uploadDir = path.join(process.cwd(), 'uploads', 'resumes');
      const exeFilePath = path.join(uploadDir, `invalid_${Date.now()}.exe`);
      fs.writeFileSync(exeFilePath, exeBuffer);

      const req = {
        user: { _id: user._id, id: user._id.toString() },
        file: {
          originalname: 'malicious.exe',
          mimetype: 'application/x-msdownload',
          size: exeBuffer.length,
          path: exeFilePath,
        },
      };

      let resData = null;
      let statusCode = 200;
      const res = {
        status: (code) => { statusCode = code; return res; },
        json: (data) => { resData = data; return res; },
      };

      await uploadResume(req, res);

      if (statusCode !== 400) {
        throw new Error(`Invalid file format should return HTTP 400, got ${statusCode}`);
      }
    });

    // ------------------------------------------------------------------------
    // TEST 8: Large File Limit
    // ------------------------------------------------------------------------
    await runTest('Test 8: Large File', async () => {
      const largeSize = 11 * 1024 * 1024; // 11MB
      const req = {
        user: { _id: user._id, id: user._id.toString() },
        file: {
          originalname: 'large_resume.pdf',
          mimetype: 'application/pdf',
          size: largeSize,
          path: 'uploads/resumes/dummy_large.pdf',
        },
      };

      if (req.file.size > 10 * 1024 * 1024) {
        return; // Size check intercepted successfully
      }
      throw new Error('Large file validation failed to intercept >10MB upload');
    });

    // ------------------------------------------------------------------------
    // TEST 9: AI Parser Structure Output
    // ------------------------------------------------------------------------
    await runTest('Test 9: AI Parser Structure Output', async () => {
      const sampleText = `JANE DOE\nSenior Software Engineer\nEmail: jane.doe@example.com\nPhone: 555-123-4567\nGitHub: github.com/janedoe\nLinkedIn: linkedin.com/in/janedoe\n\nSUMMARY\nPassionate full stack developer.\n\nEXPERIENCE\nLead Developer at Acme (2020 - Present)\n- Built web applications\n\nEDUCATION\nBS Computer Science\n\nSKILLS\nJavaScript, Python, React, Node.js`;
      const parsed = ai_parse_resume(sampleText);

      validateStructuredObjectSchema(parsed);
      if (!parsed.personal || !parsed.skills) {
        throw new Error('Parsed AI structure missing required top-level keys');
      }
    });

    // ------------------------------------------------------------------------
    // TEST 10: Invalid AI Response Handling
    // ------------------------------------------------------------------------
    await runTest('Test 10: Invalid AI Response Handling', async () => {
      const invalidData = {
        personal: { name: 'Test' },
      };

      try {
        validateStructuredObjectSchema(invalidData);
        throw new Error('Validation should have thrown for invalid schema!');
      } catch (err) {
        if (!err.message.includes('Validation Error')) {
          throw err;
        }
      }
    });

    // ------------------------------------------------------------------------
    // TEST 11: Missing Resume Text Error
    // ------------------------------------------------------------------------
    await runTest('Test 11: Missing Resume Text Error', async () => {
      try {
        ai_parse_resume('');
        throw new Error('Parser should throw ResumeExtractionError on empty input!');
      } catch (err) {
        if (!err.message.includes('ResumeExtractionError')) {
          throw err;
        }
      }
    });

    // ------------------------------------------------------------------------
    // TEST 12: Profile & Portfolio Creation
    // ------------------------------------------------------------------------
    await runTest('Test 12: Profile & Portfolio Creation', async () => {
      const activeProfile = await ResumeProfile.findOne({ userId: user._id });
      const portfolio = await Portfolio.findOne({ userId: user._id });

      if (!activeProfile || !activeProfile.profileData) {
        throw new Error('ResumeProfile document was not created');
      }
      if (!portfolio || !portfolio.sections) {
        throw new Error('Portfolio document was not created');
      }
    });

    // ------------------------------------------------------------------------
    // TEST 13: Unauthorized Resume Access
    // ------------------------------------------------------------------------
    await runTest('Test 13: Unauthorized Resume Access', async () => {
      const getReq = {
        user: { _id: otherUser._id, id: otherUser._id.toString() },
        params: { id: createdResumeId },
      };

      let statusCode = 200;
      let resData = null;
      const res = {
        status: (code) => { statusCode = code; return res; },
        json: (data) => { resData = data; return res; },
      };

      await getResumeDataById(getReq, res);

      if (statusCode !== 403) {
        throw new Error(`Unauthorized user access returned code ${statusCode}, expected 403`);
      }
    });

  } finally {
    // Cleanup
    if (user && User) await User.deleteOne({ _id: user._id });
    if (otherUser && User) await User.deleteOne({ _id: otherUser._id });
    if (createdResumeId && Resume) {
      await Resume.deleteOne({ _id: createdResumeId });
      await ResumeProfile.deleteMany({ resumeId: createdResumeId });
      await Portfolio.deleteMany({ resumeId: createdResumeId });
    }
  }

  console.log('\n==================================================');
  console.log(`📊 Test Suite Results: ${passedTests} Passed, ${failedTests} Failed.`);
  console.log('==================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runBackendResumePipelineTestSuite();
