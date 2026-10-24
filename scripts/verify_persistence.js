import http from 'http';
import fs from 'fs';
import ExcelJS from 'exceljs';
import { EXCEL_PATH } from '../server/excelService.js';

// Helper for making HTTP requests
function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        const contentType = res.headers['content-type'] || '';
        if (contentType.includes('application/json')) {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(buffer.toString('utf8')), headers: res.headers });
          } catch (e) {
            resolve({ status: res.statusCode, raw: buffer.toString('utf8'), headers: res.headers });
          }
        } else {
          resolve({ status: res.statusCode, buffer, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting FasalSetu Excel Persistence Verification ---');

  // Test 1: Health check
  console.log('\n[1/7] Testing GET /api/status...');
  const statusRes = await request('GET', '/api/status');
  console.log('Status code:', statusRes.status);
  console.log('Response:', statusRes.data);
  if (statusRes.status !== 200 || statusRes.data.status !== 'ok') {
    throw new Error('Status check failed');
  }

  // Test 2: Get initial data
  console.log('\n[2/7] Testing GET /api/data...');
  const dataRes = await request('GET', '/api/data');
  console.log('Status code:', dataRes.status);
  console.log(`Loaded: Profile name: ${dataRes.data.profile?.name}, Lands count: ${dataRes.data.lands?.length}, Tasks: ${dataRes.data.tasks?.length}, Expenses: ${dataRes.data.expenses?.length}`);
  if (dataRes.status !== 200) {
    throw new Error('Data fetch failed');
  }

  // Test 3: Update Profile
  console.log('\n[3/7] Testing POST /api/profile...');
  const profilePayload = {
    ...dataRes.data.profile,
    name: 'राम कुमार वर्मा (सत्यापित)',
    totalLand: '14.5 एकड़'
  };
  const profileRes = await request('POST', '/api/profile', profilePayload);
  console.log('Profile update response:', profileRes.data);
  if (!profileRes.data.success) throw new Error('Profile update failed');

  // Test 4: Add new Land record
  console.log('\n[4/7] Testing POST /api/lands...');
  const testLandId = `land-test-${Date.now()}`;
  const newLandPayload = {
    id: testLandId,
    name: 'नया परीक्षण खेत (North Plot)',
    khasraNo: '999/1',
    area: 3.2,
    areaUnit: 'acre',
    village: 'आरंग (Arang)',
    district: 'रायपुर (Raipur)',
    state: 'छत्तीसगढ़',
    soilType: 'black',
    irrigationSource: ['नलकूप (Tube well)', 'नहर (Canal)'],
    previousCrop: 'धान (Paddy)',
    healthScore: 92,
    selectedCrop: {
      id: 'paddy-hybrid',
      nameHi: 'धान (हाइब्रिड)',
      nameEn: 'Paddy (Hybrid)'
    }
  };
  const addLandRes = await request('POST', '/api/lands', newLandPayload);
  console.log('Add land response:', addLandRes.data);
  if (!addLandRes.data.success) throw new Error('Add land failed');

  // Test 5: Update that land
  console.log('\n[5/7] Testing PUT /api/lands/:id...');
  const updatedLandPayload = {
    ...newLandPayload,
    healthScore: 95,
    area: 3.5
  };
  const updateLandRes = await request('PUT', `/api/lands/${testLandId}`, updatedLandPayload);
  console.log('Update land response:', updateLandRes.data);
  if (!updateLandRes.data.success) throw new Error('Update land failed');

  // Test 6: Add Expense & Delete Expense
  console.log('\n[6/7] Testing POST & DELETE /api/expenses...');
  const testExpId = `exp-test-${Date.now()}`;
  const expPayload = {
    id: testExpId,
    crop: 'धान',
    category: 'उर्वरक',
    description: 'परीक्षण यूरिया एवं डीएपी खरीद',
    amount: 2400,
    date: '2026-10-20'
  };
  const addExpRes = await request('POST', '/api/expenses', expPayload);
  console.log('Add expense response:', addExpRes.data);
  if (!addExpRes.data.success) throw new Error('Add expense failed');

  const delExpRes = await request('DELETE', `/api/expenses/${testExpId}`);
  console.log('Delete expense response:', delExpRes.data);
  if (!delExpRes.data.success) throw new Error('Delete expense failed');

  // Test 7: Export Excel file
  console.log('\n[7/7] Testing GET /api/export/excel...');
  const exportRes = await request('GET', '/api/export/excel');
  console.log('Export status:', exportRes.status);
  console.log('Export content-type:', exportRes.headers['content-type']);
  console.log('Export buffer size:', exportRes.buffer?.length, 'bytes');
  if (exportRes.status !== 200 || !exportRes.buffer || exportRes.buffer.length < 1000) {
    throw new Error('Export Excel failed');
  }

  // Test 8: Deep inspection of the actual Excel workbook on disk
  console.log('\n--- Direct Workbook Inspection via ExcelJS ---');
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(EXCEL_PATH);
  console.log(`Workbook read successfully from: ${EXCEL_PATH}`);
  
  const expectedSheets = [
    'Farmers',
    'Lands',
    'Soil_Reports',
    'Crop_Planning',
    'Tasks_Calendar',
    'Expenses',
    'Harvest_Profit',
    'Schemes_Mills',
    'App_Settings',
    'Activity_Log'
  ];

  for (const sheetName of expectedSheets) {
    const ws = wb.getWorksheet(sheetName);
    console.log(`✓ Worksheet [${sheetName}]: ${ws.rowCount} rows (Header + data)`);
  }

  const sActivity = wb.getWorksheet('Activity_Log');
  console.log(`\nLast 5 Activity Log entries in Excel:`);
  const lastRows = [];
  sActivity.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      lastRows.push(row.values);
    }
  });
  lastRows.slice(-5).forEach(r => {
    console.log(`  - [${r[7] || ''}] Action: ${r[4]}, Sheet: ${r[2]}, Record: ${r[3]}, Details: ${r[6]}`);
  });

  console.log('\n=========================================');
  console.log('🎉 ALL PERSISTENCE TESTS PASSED SUCCESSFULLY!');
  console.log('=========================================');
}

runTests().catch(err => {
  console.error('\n❌ Verification failed:', err);
  process.exit(1);
});
