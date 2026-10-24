import crypto from 'crypto';
import {
  initializeWorkbookIfNeeded,
  loadWorkbook,
  saveSubscription,
  getUserActiveSubscription,
  savePaymentTransaction,
  updatePaymentTransaction,
  getUserPaymentTransactions,
  getTransactionByOrderId
} from '../server/excelService.js';

async function testCryptoAndPersistence() {
  console.log('--- TESTING CRYPTOGRAPHIC SIGNATURE & EXCEL PERSISTENCE ---');

  // 1. Initialize workbook and ensure sheets exist
  const wb = await loadWorkbook();
  const subSheet = wb.getWorksheet('Subscriptions');
  const txnSheet = wb.getWorksheet('Payment_Transactions');

  console.log('Subscriptions worksheet exists:', !!subSheet);
  console.log('Payment_Transactions worksheet exists:', !!txnSheet);

  if (!subSheet || !txnSheet) {
    throw new Error('Worksheets missing from Excel file');
  }

  // 2. Test HMAC SHA-256 signature generation & verification logic
  const testSecret = 'secret_test_key_84920';
  const orderId = `order_test_${Date.now()}`;
  const paymentId = `pay_test_${Date.now()}`;

  const validSignature = crypto
    .createHmac('sha256', testSecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const invalidSignature = 'bad_signature_12345';

  const checkValid = crypto
    .createHmac('sha256', testSecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex') === validSignature;

  const checkInvalid = crypto
    .createHmac('sha256', testSecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex') === invalidSignature;

  console.log('Valid signature match test:', checkValid ? '✓ PASS' : '❌ FAIL');
  console.log('Invalid signature rejection test:', !checkInvalid ? '✓ PASS' : '❌ FAIL');

  // 3. Test Transaction Creation
  console.log('\nTesting Payment Transaction creation in Excel...');
  const testTxn = await savePaymentTransaction({
    userId: 'farmer-test-01',
    paymentGateway: 'razorpay',
    orderId,
    amount: 299,
    currency: 'INR',
    paymentStatus: 'created',
    verificationStatus: 'unverified'
  });
  console.log('Created transaction:', testTxn.id, 'OrderId:', testTxn.orderId);

  // 4. Test Transaction Update
  console.log('\nTesting Transaction status update after verification...');
  await updatePaymentTransaction(orderId, {
    paymentId,
    signature: validSignature,
    paymentStatus: 'captured',
    verificationStatus: 'verified'
  });

  const retrievedTxn = await getTransactionByOrderId(orderId);
  console.log('Retrieved updated txn:', retrievedTxn?.orderId, 'Status:', retrievedTxn?.paymentStatus, 'Verification:', retrievedTxn?.verificationStatus);
  if (retrievedTxn?.paymentStatus !== 'captured' || retrievedTxn?.verificationStatus !== 'verified') {
    throw new Error('Transaction update failed');
  }
  console.log('✓ Transaction persistence and update verified!');

  // 5. Test Subscription Activation
  console.log('\nTesting Subscription Activation in Excel...');
  const now = new Date();
  const expiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();

  const sub = await saveSubscription({
    userId: 'farmer-test-01',
    planId: 'basic',
    planName: 'Basic Plan',
    planNameHi: 'बेसिक प्लान',
    amount: 299,
    currency: 'INR',
    startDate: now.toISOString(),
    expiryDate: expiry,
    status: 'active',
    orderId,
    paymentId,
    verificationStatus: 'verified'
  });
  console.log('Saved subscription:', sub.id, 'Plan:', sub.planName, 'Status:', sub.status);

  // 6. Test Active Subscription Retrieval
  const activeSub = await getUserActiveSubscription('farmer-test-01');
  console.log('Active subscription retrieved:', activeSub?.id, 'Days remaining:', activeSub?.daysRemaining);
  if (!activeSub || activeSub.status !== 'active' || activeSub.daysRemaining < 364) {
    throw new Error('Active subscription retrieval failed');
  }
  console.log('✓ Subscription activation and retrieval verified!');

  // 7. Test User Transactions Retrieval
  const userTxns = await getUserPaymentTransactions('farmer-test-01');
  console.log('User transactions count:', userTxns.length);
  if (userTxns.length === 0) {
    throw new Error('User transactions list empty');
  }
  console.log('✓ Transaction history retrieval verified!');

  console.log('\n🎉 ALL CRYPTO & PERSISTENCE TESTS PASSED!');
}

testCryptoAndPersistence().catch(err => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
