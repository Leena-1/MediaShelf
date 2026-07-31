const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { sendEmail, getPasswordResetTemplate } = require('./utils/sendEmail');

async function test() {
  console.log('Testing Email Dispatch...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***** (Set)' : 'MISSING');

  try {
    const res = await sendEmail({
      to: process.env.EMAIL_USER || 'co21leenasonawane@gmail.com',
      subject: 'MediaShelf - SMTP Test Email',
      html: getPasswordResetTemplate('http://localhost:5173/reset-password/test-token-123')
    });
    console.log('✅ Result:', res);
  } catch (err) {
    console.error('❌ Error sending email:', err);
  }
}

test();
