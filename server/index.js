import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { calculateSeasonDates } from './seasonCalendar.js';
import {
  EXCEL_PATH,
  initializeWorkbookIfNeeded,
  loadWorkbook,
  excelQueue,
  appendActivityLog,
  sheetToObjects,
  getUserActiveSubscription,
  getUserSubscriptions,
  saveSubscription,
  updateSubscription,
  savePaymentTransaction,
  updatePaymentTransaction,
  getUserPaymentTransactions,
  getTransactionByOrderId
} from './excelService.js';
import { getAiResponse } from './aiService.js';

// Load server-side environment variables from .env if present
if (fs.existsSync('.env')) {
  try {
    process.loadEnvFile('.env');
    console.log('[Server] Loaded environment configuration from .env');
  } catch (err) {
    console.warn('[Server] Could not load .env file:', err.message);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
// Parse JSON body while preserving raw buffer for webhook signature validation
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Initialize workbook on server startup
initializeWorkbookIfNeeded().catch(err => {
  console.error('[Server] Failed to initialize Excel workbook:', err);
});

// ==========================================
// 1. HEALTH & SYSTEM STATUS
// ==========================================
app.get('/api/status', async (req, res) => {
  try {
    const exists = fs.existsSync(EXCEL_PATH);
    const stats = exists ? fs.statSync(EXCEL_PATH) : null;
    const aiConfigured = !!(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
    res.json({
      status: 'ok',
      service: 'FasalSetu Local Express & AI API',
      aiMitra: {
        activeProvider: process.env.GEMINI_API_KEY ? 'gemini' : process.env.OPENAI_API_KEY ? 'openai' : 'agronomy-engine',
        cloudConfigured: aiConfigured
      },
      workbook: {
        path: EXCEL_PATH,
        exists,
        sizeBytes: stats ? stats.size : 0,
        lastModified: stats ? stats.mtime.toISOString() : null
      },
      storageNotice: 'Local prototype storage layer using Excel workbook (single-user)'
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ==========================================
// 1b. AI KISAN MITRA CONVERSATIONAL ENDPOINT
// ==========================================
app.post('/api/ai/chat', async (req, res) => {
  const { message, conversationHistory, farmerName, location, imageUrl } = req.body || {};

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'सवाल दर्ज करना आवश्यक है (Message is required).'
    });
  }

  try {
    const aiResult = await getAiResponse({
      message,
      conversationHistory: Array.isArray(conversationHistory) ? conversationHistory : [],
      farmerName: farmerName || 'राम कुमार वर्मा',
      location: location || 'छत्तीसगढ़',
      imageUrl
    });

    res.json({
      success: true,
      replyText: aiResult.text,
      provider: aiResult.provider,
      suggestions: aiResult.suggestions
    });
  } catch (err) {
    console.error('[Server] AI chat handler error:', err.message);
    res.status(502).json({
      success: false,
      error: err.message || 'AI सेवा से उत्तर प्राप्त नहीं हो सका। कृपया पुनः प्रयास करें।'
    });
  }
});

// ==========================================
// 2. EXPORT / DOWNLOAD WORKBOOK (.xlsx)
// ==========================================
app.get('/api/export/excel', async (req, res) => {
  try {
    await initializeWorkbookIfNeeded();
    if (!fs.existsSync(EXCEL_PATH)) {
      return res.status(404).json({ error: 'Excel workbook file not found' });
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="FasalSetu_Data.xlsx"'
    );

    const fileStream = fs.createReadStream(EXCEL_PATH);
    fileStream.pipe(res);
  } catch (err) {
    console.error('[Server] Export error:', err);
    res.status(500).json({ error: 'Failed to export Excel workbook: ' + err.message });
  }
});

// ==========================================
// 3. LOAD ALL PERSISTED DATA (FOR STARTUP)
// ==========================================
app.get('/api/data', async (req, res) => {
  try {
    const wb = await loadWorkbook();

    const farmers = sheetToObjects(wb.getWorksheet('Farmers'));
    const landsRaw = sheetToObjects(wb.getWorksheet('Lands'));
    const soilRaw = sheetToObjects(wb.getWorksheet('Soil_Reports'));
    const cropPlanning = sheetToObjects(wb.getWorksheet('Crop_Planning'));
    const tasksRaw = sheetToObjects(wb.getWorksheet('Tasks_Calendar'));
    const expensesRaw = sheetToObjects(wb.getWorksheet('Expenses'));
    const harvestRaw = sheetToObjects(wb.getWorksheet('Harvest_Profit'));
    const schemesMills = sheetToObjects(wb.getWorksheet('Schemes_Mills'));
    const settingsRaw = sheetToObjects(wb.getWorksheet('App_Settings'));
    const activityLogs = sheetToObjects(wb.getWorksheet('Activity_Log')).slice(-25).reverse();

    // Map profile
    const profile = farmers.length > 0 ? {
      id: farmers[0].id || 'farmer-001',
      name: farmers[0].name || 'राम कुमार वर्मा',
      mobile: farmers[0].mobile || '+91 98765 43210',
      email: farmers[0].email || 'ramkumar.verma@fasalsetu.in',
      village: farmers[0].village || 'आरंग (Arang)',
      district: farmers[0].district || 'रायपुर (Raipur)',
      state: farmers[0].state || 'छत्तीसगढ़ (Chhattisgarh)',
      language: farmers[0].language || 'hi',
      landholdingCategory: farmers[0].landholdingCategory || 'small',
      totalAcres: parseFloat(farmers[0].totalAcres) || 4.5,
      avatarUrl: farmers[0].avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=256',
      joinedDate: farmers[0].joinedDate || '15 जून 2024'
    } : null;

    // Map lands with nested tasks, expenses, and soil details
    const lands = landsRaw.map(l => {
      const landSoil = soilRaw.find(s => s.landId === l.id);
      const landCrop = cropPlanning.find(c => c.landId === l.id);
      const landTasks = tasksRaw.filter(t => t.landId === l.id).map(t => ({
        id: t.id,
        farmId: t.landId,
        cropName: t.cropName,
        title: t.title,
        titleHi: t.title,
        description: t.description,
        descriptionHi: t.description,
        category: t.category,
        weekNumber: parseInt(t.weekNumber, 10) || 1,
        dueDate: t.dueDate,
        priority: t.priority || 'medium',
        status: t.status || 'pending',
        weatherDependent: t.weatherDependent === 'Yes',
        weatherAdvice: t.weatherAdvice
      }));

      const landExpenses = expensesRaw.filter(e => e.landId === l.id).map(e => ({
        id: e.id,
        farmId: e.landId,
        cropName: e.cropName,
        category: e.category,
        categoryHi: e.categoryHi,
        amount: parseFloat(e.amount) || 0,
        date: e.date,
        season: e.season,
        notes: e.notes
      }));

      return {
        id: l.id,
        name: l.name,
        area: parseFloat(l.area) || 0,
        areaUnit: l.areaUnit || 'acre',
        irrigationSource: l.irrigationSource || 'नलकूप / बोरवेल',
        previousCrop: l.previousCrop || 'धान',
        village: l.village || '',
        district: l.district || '',
        state: l.state || '',
        season: l.season || 'kharif',
        year: l.year || '2024',
        budget: parseFloat(l.budget) || 0,
        healthScore: parseInt(l.healthScore, 10) || 90,
        cropProgress: parseInt(l.cropProgress, 10) || 50,
        currentStage: l.currentStage || 'vegetative',
        status: l.status || 'सक्रिय (Active)',
        tasks: landTasks,
        expenses: landExpenses,
        soilDetails: landSoil ? {
          uploaded: true,
          analysisCompleted: landSoil.analysisCompleted === 'Yes',
          nitrogen: landSoil.nitrogen,
          phosphorus: landSoil.phosphorus,
          potassium: landSoil.potassium,
          ph: parseFloat(landSoil.ph) || 6.8,
          organicCarbon: parseFloat(landSoil.organicCarbon) || 0.6,
          soilTexture: landSoil.soilTexture,
          findings: landSoil.findings ? String(landSoil.findings).split(';') : []
        } : undefined,
        selectedCrop: landCrop ? {
          id: landCrop.cropId,
          name: landCrop.nameEn,
          nameHi: landCrop.nameHi,
          season: landCrop.season,
          durationDays: landCrop.durationDays,
          costPerAcre: parseFloat(landCrop.costPerAcre) || 0,
          revenuePerAcre: parseFloat(landCrop.revenuePerAcre) || 0,
          profitPerAcre: parseFloat(landCrop.profitPerAcre) || 0,
          waterRequirement: landCrop.waterReq,
          soilSuitability: landCrop.soilSuit
        } : undefined
      };
    });

    // Global tasks
    const tasks = tasksRaw.map(t => ({
      id: t.id,
      farmId: t.landId,
      cropName: t.cropName,
      title: t.title,
      titleHi: t.title,
      description: t.description,
      descriptionHi: t.description,
      category: t.category,
      weekNumber: parseInt(t.weekNumber, 10) || 1,
      dueDate: t.dueDate,
      priority: t.priority || 'medium',
      status: t.status || 'pending',
      weatherDependent: t.weatherDependent === 'Yes',
      weatherAdvice: t.weatherAdvice
    }));

    // Global expenses
    const expenses = expensesRaw.map(e => ({
      id: e.id,
      farmId: e.landId,
      cropName: e.cropName,
      category: e.category,
      categoryHi: e.categoryHi,
      amount: parseFloat(e.amount) || 0,
      date: e.date,
      season: e.season,
      notes: e.notes
    }));

    // Settings
    const settings = {};
    settingsRaw.forEach(s => {
      settings[s.key] = s.value;
    });

    res.json({
      success: true,
      profile,
      lands,
      tasks,
      expenses,
      schemesMills,
      harvestRaw,
      settings,
      activityLogs
    });
  } catch (err) {
    console.error('[Server] Error fetching data:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. FARMER PROFILE ENDPOINTS
// ==========================================
app.post('/api/profile', async (req, res) => {
  const updates = req.body;
  if (!updates) {
    return res.status(400).json({ error: 'Missing profile payload' });
  }

  try {
    const result = await excelQueue.enqueue(async () => {
      const wb = await loadWorkbook();
      const sheet = wb.getWorksheet('Farmers');
      let targetRow = null;

      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        if (row.getCell(1).value === (updates.id || 'farmer-001') || !targetRow) {
          targetRow = row;
        }
      });

      const now = new Date().toISOString();
      const changedFields = [];

      if (!targetRow) {
        // Add new farmer
        sheet.addRow({
          id: updates.id || 'farmer-001',
          name: updates.name || '',
          mobile: updates.mobile || '',
          email: updates.email || '',
          village: updates.village || '',
          district: updates.district || '',
          state: updates.state || '',
          language: updates.language || 'hi',
          landholdingCategory: updates.landholdingCategory || 'small',
          totalAcres: updates.totalAcres || 0,
          avatarUrl: updates.avatarUrl || '',
          joinedDate: updates.joinedDate || '2024-06-15',
          isDemo: updates.isDemo ? 'Yes' : 'No',
          createdAt: now,
          updatedAt: now
        });
        changedFields.push('Created farmer profile');
      } else {
        // Update existing row
        const updateMapping = {
          name: 2,
          mobile: 3,
          email: 4,
          village: 5,
          district: 6,
          state: 7,
          language: 8,
          landholdingCategory: 9,
          totalAcres: 10,
          avatarUrl: 11
        };

        for (const [key, colIdx] of Object.entries(updateMapping)) {
          if (updates[key] !== undefined) {
            targetRow.getCell(colIdx).value = updates[key];
            changedFields.push(key);
          }
        }
        targetRow.getCell(15).value = now; // updatedAt
      }

      // Also sync language to App_Settings if present
      if (updates.language) {
        const sSettings = wb.getWorksheet('App_Settings');
        if (sSettings) {
          sSettings.eachRow((r, rNum) => {
            if (rNum === 1) return;
            if (r.getCell(1).value === 'current_language') {
              r.getCell(2).value = updates.language;
              r.getCell(4).value = now;
            }
          });
        }
      }

      appendActivityLog(wb.getWorksheet('Activity_Log'), {
        sheetName: 'Farmers',
        recordId: updates.id || 'farmer-001',
        action: targetRow ? 'UPDATE' : 'CREATE',
        fields: changedFields,
        status: 'SUCCESS',
        details: `Updated farmer profile: ${updates.name || ''}`
      });

      await wb.xlsx.writeFile(EXCEL_PATH);
      return { success: true, updatedAt: now };
    });

    res.json(result);
  } catch (err) {
    console.error('[Server] Error saving profile:', err);
    res.status(500).json({ error: 'Failed to persist farmer profile to Excel: ' + err.message });
  }
});

// ==========================================
// 5. LAND MANAGEMENT ENDPOINTS (CREATE / UPDATE / DELETE)
// ==========================================
app.post('/api/lands', async (req, res) => {
  const landData = req.body;
  if (!landData || !landData.name) {
    return res.status(400).json({ error: 'Land name is required' });
  }

  try {
    const result = await excelQueue.enqueue(async () => {
      const wb = await loadWorkbook();
      const sLands = wb.getWorksheet('Lands');
      const now = new Date().toISOString();
      const landId = landData.id || `land-${Date.now()}`;

      let existingRow = null;
      sLands.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        if (row.getCell(1).value === landId) {
          existingRow = row;
        }
      });

      const areaInAcres = landData.areaUnit === 'bigha'
        ? landData.area * 0.62
        : landData.areaUnit === 'hectare'
        ? landData.area * 2.47
        : landData.area;

      const isCreate = !existingRow;

      if (isCreate) {
        sLands.addRow({
          id: landId,
          name: landData.name,
          area: landData.area || 0,
          areaUnit: landData.areaUnit || 'acre',
          areaInAcres: Math.round(areaInAcres * 100) / 100,
          irrigationSource: Array.isArray(landData.irrigationSource) ? landData.irrigationSource.join(', ') : (landData.irrigationSource || 'नलकूप / बोरवेल'),
          previousCrop: landData.previousCrop || 'धान',
          village: landData.village || '',
          district: landData.district || '',
          state: landData.state || '',
          season: landData.season || 'kharif',
          year: landData.year || '2024',
          budget: landData.budget || 40000,
          healthScore: landData.healthScore || 90,
          cropProgress: landData.cropProgress || 0,
          currentStage: landData.currentStage || 'sowing',
          status: landData.status || 'सक्रिय (Active)',
          isDemo: landData.isDemo ? 'Yes' : 'No',
          createdAt: now,
          updatedAt: now
        });
      } else {
        existingRow.getCell(2).value = landData.name;
        existingRow.getCell(3).value = landData.area;
        existingRow.getCell(4).value = landData.areaUnit;
        existingRow.getCell(5).value = Math.round(areaInAcres * 100) / 100;
        if (landData.irrigationSource) existingRow.getCell(6).value = Array.isArray(landData.irrigationSource) ? landData.irrigationSource.join(', ') : landData.irrigationSource;
        if (landData.previousCrop) existingRow.getCell(7).value = landData.previousCrop;
        if (landData.village) existingRow.getCell(8).value = landData.village;
        if (landData.district) existingRow.getCell(9).value = landData.district;
        if (landData.state) existingRow.getCell(10).value = landData.state;
        if (landData.budget) existingRow.getCell(13).value = landData.budget;
        if (landData.healthScore) existingRow.getCell(14).value = landData.healthScore;
        existingRow.getCell(20).value = now;
      }

      // 5b. Persist Soil Report if present
      if (landData.soilDetails) {
        const sSoil = wb.getWorksheet('Soil_Reports');
        let existingSoil = null;
        sSoil.eachRow((r, rNum) => {
          if (rNum === 1) return;
          if (r.getCell(2).value === landId) existingSoil = r;
        });

        const findingsStr = Array.isArray(landData.soilDetails.findings)
          ? landData.soilDetails.findings.join('; ')
          : String(landData.soilDetails.findings || '');

        if (!existingSoil) {
          sSoil.addRow({
            id: `soil-${landId}`,
            landId: landId,
            landName: landData.name,
            analysisCompleted: landData.soilDetails.analysisCompleted ? 'Yes' : 'No',
            nitrogen: landData.soilDetails.nitrogen || '240 kg/ha',
            phosphorus: landData.soilDetails.phosphorus || '22 kg/ha',
            potassium: landData.soilDetails.potassium || '280 kg/ha',
            ph: landData.soilDetails.ph || 6.8,
            organicCarbon: landData.soilDetails.organicCarbon || 0.65,
            soilTexture: landData.soilDetails.soilTexture || 'काली चिकनी दोमट',
            findings: findingsStr,
            isSimulated: 'Yes',
            createdAt: now,
            updatedAt: now
          });
        } else {
          existingSoil.getCell(5).value = landData.soilDetails.nitrogen;
          existingSoil.getCell(6).value = landData.soilDetails.phosphorus;
          existingSoil.getCell(7).value = landData.soilDetails.potassium;
          existingSoil.getCell(8).value = landData.soilDetails.ph;
          existingSoil.getCell(9).value = landData.soilDetails.organicCarbon;
          existingSoil.getCell(10).value = landData.soilDetails.soilTexture;
          existingSoil.getCell(11).value = findingsStr;
          existingSoil.getCell(13).value = now;
        }
      }

      // 5c. Persist Crop Planning if present
      if (landData.selectedCrop) {
        const sCrop = wb.getWorksheet('Crop_Planning');
        let existingCrop = null;
        sCrop.eachRow((r, rNum) => {
          if (rNum === 1) return;
          if (r.getCell(2).value === landId) existingCrop = r;
        });

        if (!existingCrop) {
          sCrop.addRow({
            id: `plan-${landId}`,
            landId: landId,
            cropId: landData.selectedCrop.id,
            nameHi: landData.selectedCrop.nameHi || landData.selectedCrop.name,
            nameEn: landData.selectedCrop.name,
            season: landData.selectedCrop.season || landData.season || 'kharif',
            durationDays: landData.selectedCrop.durationDays || '120 दिन',
            costPerAcre: landData.selectedCrop.costPerAcre || 0,
            revenuePerAcre: landData.selectedCrop.revenuePerAcre || 0,
            profitPerAcre: landData.selectedCrop.profitPerAcre || 0,
            waterReq: landData.selectedCrop.waterRequirement || 'मध्यम',
            soilSuit: landData.selectedCrop.soilSuitability || 'उच्च',
            createdAt: now,
            updatedAt: now
          });
        }
      }

      // 5d. Persist Tasks if present
      if (Array.isArray(landData.tasks) && landData.tasks.length > 0) {
        const sTasks = wb.getWorksheet('Tasks_Calendar');
        for (const t of landData.tasks) {
          const tId = t.id || `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          let existingTask = null;
          sTasks.eachRow((r, rNum) => {
            if (rNum === 1) return;
            if (r.getCell(1).value === tId) existingTask = r;
          });

          if (!existingTask) {
            sTasks.addRow({
              id: tId,
              landId: landId,
              cropName: t.cropName || landData.selectedCrop?.nameHi || 'धान',
              title: t.titleHi || t.title,
              description: t.descriptionHi || t.description,
              category: t.category || 'irrigation',
              weekNumber: t.weekNumber || 1,
              dueDate: t.dueDate || '2024-11-01',
              priority: t.priority || 'medium',
              status: t.status || 'pending',
              weatherDependent: t.weatherDependent ? 'Yes' : 'No',
              weatherAdvice: t.weatherAdviceHi || t.weatherAdvice || '',
              completedAt: t.status === 'completed' ? now : '',
              createdAt: now,
              updatedAt: now
            });
          }
        }
      }

      // 5e. Persist Expenses if present
      if (Array.isArray(landData.expenses) && landData.expenses.length > 0) {
        const sExp = wb.getWorksheet('Expenses');
        for (const e of landData.expenses) {
          const eId = e.id || `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          let existingExp = null;
          sExp.eachRow((r, rNum) => {
            if (rNum === 1) return;
            if (r.getCell(1).value === eId) existingExp = r;
          });

          if (!existingExp) {
            sExp.addRow({
              id: eId,
              landId: landId,
              cropName: e.cropName || 'धान',
              category: e.category || 'other',
              categoryHi: e.categoryHi || 'अन्य खर्च',
              amount: e.amount || 0,
              date: e.date || now.split('T')[0],
              season: e.season || 'kharif',
              notes: e.notes || '',
              createdAt: now,
              updatedAt: now
            });
          }
        }
      }

      appendActivityLog(wb.getWorksheet('Activity_Log'), {
        sheetName: 'Lands',
        recordId: landId,
        action: isCreate ? 'CREATE' : 'UPDATE',
        fields: ['name', 'area', 'village', 'district', 'season', 'budget'],
        status: 'SUCCESS',
        details: `${isCreate ? 'Created' : 'Updated'} land: ${landData.name}`
      });

      await wb.xlsx.writeFile(EXCEL_PATH);
      return { success: true, id: landId, updatedAt: now };
    });

    res.json(result);
  } catch (err) {
    console.error('[Server] Error saving land:', err);
    res.status(500).json({ error: 'Failed to persist land to Excel: ' + err.message });
  }
});

// Update single land
app.put('/api/lands/:id', async (req, res) => {
  const landId = req.params.id;
  const updates = req.body;

  try {
    const result = await excelQueue.enqueue(async () => {
      const wb = await loadWorkbook();
      const sLands = wb.getWorksheet('Lands');
      let targetRow = null;

      sLands.eachRow((r, rNum) => {
        if (rNum === 1) return;
        if (r.getCell(1).value === landId) targetRow = r;
      });

      if (!targetRow) {
        throw new Error(`Land record with ID ${landId} not found`);
      }

      const now = new Date().toISOString();
      if (updates.name) targetRow.getCell(2).value = updates.name;
      if (updates.area) targetRow.getCell(3).value = updates.area;
      if (updates.currentCrop) targetRow.getCell(7).value = updates.currentCrop;
      if (updates.healthScore) targetRow.getCell(14).value = updates.healthScore;
      if (updates.cropProgress !== undefined) targetRow.getCell(15).value = updates.cropProgress;
      if (updates.currentStage) targetRow.getCell(16).value = updates.currentStage;
      targetRow.getCell(20).value = now;

      appendActivityLog(wb.getWorksheet('Activity_Log'), {
        sheetName: 'Lands',
        recordId: landId,
        action: 'UPDATE',
        fields: Object.keys(updates),
        status: 'SUCCESS',
        details: `Updated land properties for ${landId}`
      });

      await wb.xlsx.writeFile(EXCEL_PATH);
      return { success: true, id: landId, updatedAt: now };
    });

    res.json(result);
  } catch (err) {
    console.error('[Server] Error updating land:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete land
app.delete('/api/lands/:id', async (req, res) => {
  const landId = req.params.id;

  try {
    const result = await excelQueue.enqueue(async () => {
      const wb = await loadWorkbook();
      const sLands = wb.getWorksheet('Lands');
      let rowIndexToDelete = null;

      sLands.eachRow((r, rNum) => {
        if (rNum === 1) return;
        if (r.getCell(1).value === landId) rowIndexToDelete = rNum;
      });

      if (!rowIndexToDelete) {
        throw new Error(`Land with ID ${landId} not found`);
      }

      sLands.spliceRows(rowIndexToDelete, 1);

      appendActivityLog(wb.getWorksheet('Activity_Log'), {
        sheetName: 'Lands',
        recordId: landId,
        action: 'DELETE',
        fields: ['Entire record'],
        status: 'SUCCESS',
        details: `Deleted land record ${landId}`
      });

      await wb.xlsx.writeFile(EXCEL_PATH);
      return { success: true, message: `Land ${landId} deleted successfully` };
    });

    res.json(result);
  } catch (err) {
    console.error('[Server] Error deleting land:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. TASKS ENDPOINTS (CREATE / TOGGLE / DELETE)
// ==========================================
app.post('/api/tasks', async (req, res) => {
  const task = req.body;
  if (!task || !task.title) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  try {
    const result = await excelQueue.enqueue(async () => {
      const wb = await loadWorkbook();
      const sTasks = wb.getWorksheet('Tasks_Calendar');
      const now = new Date().toISOString();
      const taskId = task.id || `task-${Date.now()}`;

      let existing = null;
      sTasks.eachRow((r, rNum) => {
        if (rNum === 1) return;
        if (r.getCell(1).value === taskId) existing = r;
      });

      if (!existing) {
        sTasks.addRow({
          id: taskId,
          landId: task.farmId || task.landId || '',
          cropName: task.cropName || 'धान',
          title: task.titleHi || task.title,
          description: task.descriptionHi || task.description || '',
          category: task.category || 'irrigation',
          weekNumber: task.weekNumber || 1,
          dueDate: task.dueDate || now.split('T')[0],
          priority: task.priority || 'medium',
          status: task.status || 'pending',
          weatherDependent: task.weatherDependent ? 'Yes' : 'No',
          weatherAdvice: task.weatherAdvice || '',
          completedAt: task.status === 'completed' ? now : '',
          createdAt: now,
          updatedAt: now
        });
      } else {
        existing.getCell(4).value = task.titleHi || task.title;
        existing.getCell(5).value = task.descriptionHi || task.description || '';
        existing.getCell(6).value = task.category;
        existing.getCell(8).value = task.dueDate;
        existing.getCell(9).value = task.priority;
        existing.getCell(10).value = task.status;
        existing.getCell(15).value = now;
      }

      appendActivityLog(wb.getWorksheet('Activity_Log'), {
        sheetName: 'Tasks_Calendar',
        recordId: taskId,
        action: existing ? 'UPDATE' : 'CREATE',
        fields: ['title', 'category', 'status', 'dueDate'],
        status: 'SUCCESS',
        details: `${existing ? 'Updated' : 'Added'} task: ${task.title}`
      });

      await wb.xlsx.writeFile(EXCEL_PATH);
      return { success: true, id: taskId, updatedAt: now };
    });

    res.json(result);
  } catch (err) {
    console.error('[Server] Error saving task:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tasks/:id/toggle', async (req, res) => {
  const taskId = req.params.id;

  try {
    const result = await excelQueue.enqueue(async () => {
      const wb = await loadWorkbook();
      const sTasks = wb.getWorksheet('Tasks_Calendar');
      let targetRow = null;

      sTasks.eachRow((r, rNum) => {
        if (rNum === 1) return;
        if (r.getCell(1).value === taskId) targetRow = r;
      });

      if (!targetRow) {
        throw new Error(`Task ${taskId} not found`);
      }

      const currentStatus = targetRow.getCell(10).value;
      const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      const now = new Date().toISOString();

      targetRow.getCell(10).value = nextStatus;
      targetRow.getCell(13).value = nextStatus === 'completed' ? now : '';
      targetRow.getCell(15).value = now;

      appendActivityLog(wb.getWorksheet('Activity_Log'), {
        sheetName: 'Tasks_Calendar',
        recordId: taskId,
        action: 'UPDATE',
        fields: ['status', 'completedAt'],
        status: 'SUCCESS',
        details: `Task status changed to ${nextStatus}`
      });

      await wb.xlsx.writeFile(EXCEL_PATH);
      return { success: true, id: taskId, status: nextStatus, updatedAt: now };
    });

    res.json(result);
  } catch (err) {
    console.error('[Server] Error toggling task:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  const taskId = req.params.id;

  try {
    const result = await excelQueue.enqueue(async () => {
      const wb = await loadWorkbook();
      const sTasks = wb.getWorksheet('Tasks_Calendar');
      let targetRowIdx = null;

      sTasks.eachRow((r, rNum) => {
        if (rNum === 1) return;
        if (r.getCell(1).value === taskId) targetRowIdx = rNum;
      });

      if (!targetRowIdx) {
        throw new Error(`Task ${taskId} not found`);
      }

      sTasks.spliceRows(targetRowIdx, 1);

      appendActivityLog(wb.getWorksheet('Activity_Log'), {
        sheetName: 'Tasks_Calendar',
        recordId: taskId,
        action: 'DELETE',
        fields: ['Entire task'],
        status: 'SUCCESS',
        details: `Deleted task ${taskId}`
      });

      await wb.xlsx.writeFile(EXCEL_PATH);
      return { success: true, message: `Task ${taskId} deleted successfully` };
    });

    res.json(result);
  } catch (err) {
    console.error('[Server] Error deleting task:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. EXPENSES ENDPOINTS (CREATE / DELETE)
// ==========================================
app.post('/api/expenses', async (req, res) => {
  const exp = req.body;
  if (!exp || exp.amount === undefined) {
    return res.status(400).json({ error: 'Expense amount is required' });
  }

  try {
    const result = await excelQueue.enqueue(async () => {
      const wb = await loadWorkbook();
      const sExp = wb.getWorksheet('Expenses');
      const now = new Date().toISOString();
      const expId = exp.id || `exp-${Date.now()}`;

      let existing = null;
      sExp.eachRow((r, rNum) => {
        if (rNum === 1) return;
        if (r.getCell(1).value === expId) existing = r;
      });

      if (!existing) {
        sExp.addRow({
          id: expId,
          landId: exp.farmId || exp.landId || '',
          cropName: exp.cropName || 'धान',
          category: exp.category || 'other',
          categoryHi: exp.categoryHi || 'अन्य खर्च',
          amount: parseFloat(exp.amount) || 0,
          date: exp.date || now.split('T')[0],
          season: exp.season || 'kharif',
          notes: exp.notes || '',
          createdAt: now,
          updatedAt: now
        });
      } else {
        existing.getCell(4).value = exp.category;
        existing.getCell(5).value = exp.categoryHi || '';
        existing.getCell(6).value = parseFloat(exp.amount) || 0;
        existing.getCell(7).value = exp.date;
        existing.getCell(9).value = exp.notes || '';
        existing.getCell(11).value = now;
      }

      appendActivityLog(wb.getWorksheet('Activity_Log'), {
        sheetName: 'Expenses',
        recordId: expId,
        action: existing ? 'UPDATE' : 'CREATE',
        fields: ['category', 'amount', 'date', 'notes'],
        status: 'SUCCESS',
        details: `Recorded expense of ₹${exp.amount} for ${exp.category}`
      });

      await wb.xlsx.writeFile(EXCEL_PATH);
      return { success: true, id: expId, updatedAt: now };
    });

    res.json(result);
  } catch (err) {
    console.error('[Server] Error saving expense:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  const expId = req.params.id;

  try {
    const result = await excelQueue.enqueue(async () => {
      const wb = await loadWorkbook();
      const sExp = wb.getWorksheet('Expenses');
      let targetRowIdx = null;

      sExp.eachRow((r, rNum) => {
        if (rNum === 1) return;
        if (r.getCell(1).value === expId) targetRowIdx = rNum;
      });

      if (!targetRowIdx) {
        throw new Error(`Expense ${expId} not found`);
      }

      sExp.spliceRows(targetRowIdx, 1);

      appendActivityLog(wb.getWorksheet('Activity_Log'), {
        sheetName: 'Expenses',
        recordId: expId,
        action: 'DELETE',
        fields: ['Entire expense'],
        status: 'SUCCESS',
        details: `Deleted expense record ${expId}`
      });

      await wb.xlsx.writeFile(EXCEL_PATH);
      return { success: true, message: `Expense ${expId} deleted successfully` };
    });

    res.json(result);
  } catch (err) {
    console.error('[Server] Error deleting expense:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. SETTINGS ENDPOINT
// ==========================================
app.post('/api/settings', async (req, res) => {
  const { key, value } = req.body;
  if (!key) {
    return res.status(400).json({ error: 'Setting key is required' });
  }

  try {
    const result = await excelQueue.enqueue(async () => {
      const wb = await loadWorkbook();
      const sSettings = wb.getWorksheet('App_Settings');
      const now = new Date().toISOString();
      let found = false;

      sSettings.eachRow((r, rNum) => {
        if (rNum === 1) return;
        if (r.getCell(1).value === key) {
          r.getCell(2).value = String(value);
          r.getCell(4).value = now;
          found = true;
        }
      });

      if (!found) {
        sSettings.addRow({
          key,
          value: String(value),
          description: 'Dynamic user setting',
          updatedAt: now
        });
      }

      appendActivityLog(wb.getWorksheet('Activity_Log'), {
        sheetName: 'App_Settings',
        recordId: key,
        action: 'UPDATE',
        fields: [key],
        status: 'SUCCESS',
        details: `Setting ${key} changed to ${value}`
      });

      await wb.xlsx.writeFile(EXCEL_PATH);
      return { success: true, key, value, updatedAt: now };
    });

    res.json(result);
  } catch (err) {
    console.error('[Server] Error saving setting:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10. SUBSCRIPTION & PAYMENT WORKFLOW
// ==========================================

const SUBSCRIPTION_PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic Plan',
    nameHi: 'बेसिक प्लान',
    price: 299,
    amountInPaise: 29900,
    currency: 'INR',
    billingDuration: '1 Farming Season',
    billingDurationHi: '1 कृषि मौसम',
    durationLabel: 'Per Farming Season',
    durationLabelHi: 'प्रति कृषि मौसम',
    description: 'Essential farm guidance, crop recommendations and alerts for one farming season (Kharif, Rabi, or Zaid).',
    descriptionHi: 'एक कृषि मौसम (जैसे खरीफ, रबी या जायद) के लिए आवश्यक कृषि मार्गदर्शन, फसल सिफारिशें और अलर्ट।',
    features: [
      'AI-Based Crop Recommendations',
      'Government Schemes and Eligibility Guidance',
      'Weather Updates and Farming Alerts',
      'Crop Calendar and Expense Tracking'
    ],
    featuresHi: [
      'एआई-आधारित फसल सिफारिशें (AI Crop Recommendations)',
      'सरकारी योजनाएं एवं पात्रता मार्गदर्शन (Govt Schemes Guidance)',
      'मौसम अपडेट एवं कृषि अलर्ट (Weather Updates & Alerts)',
      'फसल कैलेंडर एवं व्यय ट्रैकिंग (Crop Calendar & Expense Tracking)'
    ],
    buttonText: 'Purchase Basic Plan — ₹299 per farming season',
    buttonTextHi: 'बेसिक प्लान खरीदें — ₹299 प्रति कृषि मौसम'
  },
  premium: {
    id: 'premium',
    name: 'Premium Plan',
    nameHi: 'प्रीमियम प्लान',
    price: 499,
    amountInPaise: 49900,
    currency: 'INR',
    billingDuration: '1 Farming Season',
    billingDurationHi: '1 कृषि मौसम',
    durationLabel: 'Per Farming Season',
    durationLabelHi: 'प्रति कृषि मौसम',
    popular: true,
    tag: 'Most Popular',
    tagHi: 'सर्वश्रेष्ठ मूल्य',
    description: 'Comprehensive farm intelligence with expert consultation, soil diagnostics and insurance support for one farming season.',
    descriptionHi: 'एक कृषि मौसम के लिए विशेषज्ञ परामर्श, मिट्टी परीक्षण और फसल बीमा सहायता के साथ संपूर्ण डिजिटल कृषि साथी।',
    features: [
      'All Basic Plan Features',
      'Expert Consultation and On-Field Guidance',
      'Crop, Soil and Farm Parameter Analysis',
      'Insurance Guidance and Claim Assistance',
      'Personalized Farming Recommendations'
    ],
    featuresHi: [
      'सभी बेसिक प्लान सुविधाएं शामिल (All Basic Features)',
      'विशेषज्ञ परामर्श एवं ऑन-फील्ड मार्गदर्शन (Expert & Field Guidance)',
      'फसल, मिट्टी एवं खेत पैरामीटर विश्लेषण (Soil & Farm Analysis)',
      'बीमा मार्गदर्शन एवं दावा सहायता (Insurance Guidance & Claim Assistance)',
      'व्यक्तिगत कृषि सिफारिशें (Personalized Recommendations)'
    ],
    buttonText: 'Purchase Premium Plan — ₹499 per farming season',
    buttonTextHi: 'प्रीमियम प्लान खरीदें — ₹499 प्रति कृषि मौसम'
  }
};

const isRazorpayConfigured = () => {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
};

const getRazorpayInstance = () => {
  if (!isRazorpayConfigured()) return null;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

/**
 * 10a. Get Available Plans and Gateway Status
 */
app.get('/api/subscription/plans', (req, res) => {
  const configured = isRazorpayConfigured();
  res.json({
    success: true,
    plans: Object.values(SUBSCRIPTION_PLANS),
    gateway: {
      provider: 'Razorpay',
      configured,
      keyId: configured ? process.env.RAZORPAY_KEY_ID : null,
      currency: 'INR'
    }
  });
});

/**
 * 10b. Get Gateway Configuration Info
 */
app.get('/api/subscription/gateway-config', (req, res) => {
  const configured = isRazorpayConfigured();
  res.json({
    configured,
    keyId: configured ? process.env.RAZORPAY_KEY_ID : null,
    currency: 'INR',
    requiredEnv: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'],
    hasWebhookSecret: !!process.env.RAZORPAY_WEBHOOK_SECRET,
    mode: process.env.RAZORPAY_KEY_ID?.startsWith('rzp_live') ? 'live' : 'test'
  });
});

/**
 * 10c. Get Current User Active Subscription
 */
app.get('/api/subscription/current', async (req, res) => {
  try {
    const userId = req.query.userId || 'farmer-001';
    const sub = await getUserActiveSubscription(userId, req.query.season, req.query.agriYear);

    const isPremium = sub && sub.status === 'active' && sub.planId === 'premium';
    const isBasic = sub && sub.status === 'active' && sub.planId === 'basic';

    res.json({
      success: true,
      subscription: sub,
      isPremium: Boolean(isPremium),
      isBasic: Boolean(isBasic),
      hasActiveSubscription: Boolean(sub && sub.status === 'active'),
      entitlements: {
        cropRecommendations: Boolean(sub && sub.status === 'active'),
        govtSchemes: Boolean(sub && sub.status === 'active'),
        weatherAlerts: Boolean(sub && sub.status === 'active'),
        cropCalendar: Boolean(sub && sub.status === 'active'),
        expenseTracking: Boolean(sub && sub.status === 'active'),
        expertConsultation: Boolean(isPremium),
        soilFarmAnalysis: Boolean(isPremium),
        insuranceClaimAssistance: Boolean(isPremium),
        personalizedRecommendations: Boolean(isPremium)
      }
    });
  } catch (err) {
    console.error('[Server] Error fetching current subscription:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 10d. Get User Payment Transactions
 */
app.get('/api/subscription/transactions', async (req, res) => {
  try {
    const userId = req.query.userId || 'farmer-001';
    const transactions = await getUserPaymentTransactions(userId);
    res.json({ success: true, transactions });
  } catch (err) {
    console.error('[Server] Error fetching transactions:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 10e. Create Subscription Order (Backend Order Generation)
 * Validates plan & season, calculates server-side amount, enforces regional calendar validity
 */
app.post('/api/subscription/create-order', async (req, res) => {
  const { planId, userId, farmerName, email, mobile, season, agriYear, cropCycle, state } = req.body || {};

  const effectiveUserId = userId || 'farmer-001';
  const plan = SUBSCRIPTION_PLANS[planId];

  if (!plan) {
    return res.status(400).json({
      success: false,
      error: `अमान्य योजना (Invalid plan). Must be one of: basic, premium.`
    });
  }

  const selectedSeason = season || 'rabi';
  const selectedAgriYear = agriYear || '2026-27';
  const selectedState = state || 'Chhattisgarh';

  // Calculate season-specific dates based on the farmer's state/region
  const seasonSchedule = calculateSeasonDates(selectedSeason, selectedState, selectedAgriYear);

  try {
    // 1. Check existing subscription status for this specific season
    const currentSeasonSub = await getUserActiveSubscription(effectiveUserId, selectedSeason, selectedAgriYear);
    let finalAmountPaise = plan.amountInPaise;
    let isUpgrade = false;

    if (currentSeasonSub && currentSeasonSub.status === 'active') {
      if (currentSeasonSub.planId === 'premium') {
        return res.status(400).json({
          success: false,
          code: 'ALREADY_ACTIVE_PREMIUM',
          message: `आपके पास ${selectedSeason.toUpperCase()} (${selectedAgriYear}) मौसम के लिए पहले से सक्रिय प्रीमियम सदस्यता है जो ${currentSeasonSub.expiryDate} तक वैध है। (${currentSeasonSub.daysRemaining} दिन शेष)`
        });
      } else if (currentSeasonSub.planId === 'basic') {
        if (planId === 'basic') {
          return res.status(400).json({
            success: false,
            code: 'ALREADY_ACTIVE_BASIC',
            message: `आपके पास ${selectedSeason.toUpperCase()} (${selectedAgriYear}) के लिए पहले से बेसिक प्लान सक्रिय है। आप केवल ₹200 का अंतर देकर प्रीमियम में अपग्रेड कर सकते हैं।`
          });
        } else if (planId === 'premium') {
          // Upgrading from Basic to Premium for this season: charge the ₹200 difference
          isUpgrade = true;
          finalAmountPaise = 20000; // ₹200 in paise
        }
      }
    }

    // 2. Check Gateway Configuration
    if (!isRazorpayConfigured()) {
      return res.status(503).json({
        success: false,
        code: 'PAYMENT_GATEWAY_NOT_CONFIGURED',
        message: 'Razorpay API credentials (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET) are not configured in backend environment variables.',
        instructions: 'Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file to enable live/test checkout.',
        requiredEnv: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'],
        details: {
          planId: plan.id,
          planName: plan.name,
          amountINR: finalAmountPaise / 100,
          season: selectedSeason,
          agriYear: selectedAgriYear,
          startDate: seasonSchedule.startDate,
          expiryDate: seasonSchedule.expiryDate,
          daysRemaining: seasonSchedule.daysRemaining,
          isUpgrade
        }
      });
    }

    // 3. Create Order via official Razorpay SDK
    const rzp = getRazorpayInstance();
    const receiptId = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const rzpOrder = await rzp.orders.create({
      amount: finalAmountPaise,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        userId: effectiveUserId,
        planId: plan.id,
        season: selectedSeason,
        agriYear: selectedAgriYear,
        cropCycle: cropCycle || '',
        state: selectedState,
        isUpgrade: isUpgrade ? 'true' : 'false',
        farmerName: farmerName || 'राम कुमार वर्मा'
      }
    });

    // 4. Save pending payment transaction in Excel
    await savePaymentTransaction({
      userId: effectiveUserId,
      paymentGateway: 'razorpay',
      orderId: rzpOrder.id,
      amount: finalAmountPaise / 100,
      currency: 'INR',
      season: selectedSeason,
      agriYear: selectedAgriYear,
      paymentStatus: 'created',
      verificationStatus: 'unverified'
    });

    res.json({
      success: true,
      orderId: rzpOrder.id,
      amount: rzpOrder.amount, // in paise
      currency: rzpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      planId: plan.id,
      planName: plan.name,
      planNameHi: plan.nameHi,
      season: selectedSeason,
      agriYear: selectedAgriYear,
      startDate: seasonSchedule.startDate,
      expiryDate: seasonSchedule.expiryDate,
      daysRemaining: seasonSchedule.daysRemaining,
      isUpgrade,
      amountINR: finalAmountPaise / 100
    });
  } catch (err) {
    console.error('[Server] Razorpay order creation failed:', err);
    res.status(500).json({
      success: false,
      error: 'भुगतान ऑर्डर बनाने में त्रुटि: ' + (err.error?.description || err.message)
    });
  }
});

/**
 * 10f. Verify Payment & Activate Seasonal Subscription
 * Server-side signature verification: HMAC SHA256(order_id + "|" + payment_id)
 * Subscription validity is configured strictly based on the agricultural season!
 */
app.post('/api/subscription/verify', async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    planId,
    userId,
    season,
    agriYear,
    cropCycle,
    state
  } = req.body || {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      error: 'आवश्यक भुगतान सत्यापन पैरामीटर अनुपलब्ध हैं (Missing verification parameters: order_id, payment_id, or signature).'
    });
  }

  const effectiveUserId = userId || 'farmer-001';
  const plan = SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.basic;
  const selectedSeason = season || 'rabi';
  const selectedAgriYear = agriYear || '2026-27';
  const selectedState = state || 'Chhattisgarh';

  if (!isRazorpayConfigured()) {
    return res.status(503).json({
      success: false,
      error: 'Razorpay credentials not configured on backend.'
    });
  }

  try {
    // 1. Verify HMAC SHA256 Signature using key secret exclusively on server
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      console.warn(`[Server] Payment signature verification failed for Order: ${razorpay_order_id}`);
      await updatePaymentTransaction(razorpay_order_id, {
        paymentStatus: 'failed',
        verificationStatus: 'failed',
        errorReason: 'Signature mismatch'
      });

      return res.status(400).json({
        success: false,
        error: 'भुगतान हस्ताक्षर सत्यापन विफल (Payment signature verification failed). Subscription cannot be activated.'
      });
    }

    // 2. Prevent Duplicate Activation (Idempotency)
    const existingTxn = await getTransactionByOrderId(razorpay_order_id);
    if (existingTxn && existingTxn.verificationStatus === 'verified' && existingTxn.subscriptionId) {
      const activeSub = await getUserActiveSubscription(effectiveUserId, selectedSeason, selectedAgriYear);
      return res.json({
        success: true,
        alreadyProcessed: true,
        message: 'यह भुगतान पहले ही सत्यापित किया जा चुका है (Payment already processed).',
        subscription: activeSub
      });
    }

    // 3. Handle Plan Upgrades for the same season
    const currentSeasonSub = await getUserActiveSubscription(effectiveUserId, selectedSeason, selectedAgriYear);
    if (currentSeasonSub && currentSeasonSub.status === 'active' && currentSeasonSub.planId === 'basic' && plan.id === 'premium') {
      await updateSubscription(currentSeasonSub.id, { status: 'upgraded' });
    }

    // 4. Calculate accurate seasonal validity dates based on the regional agro-climatic calendar
    const seasonSchedule = calculateSeasonDates(selectedSeason, selectedState, selectedAgriYear);

    // 5. Create and Save Subscription Record
    const seasonLabelsHi = { kharif: 'खरीफ', rabi: 'रबी', zaid: 'जायद' };
    const newSubscription = await saveSubscription({
      userId: effectiveUserId,
      planId: plan.id,
      planName: plan.name,
      planNameHi: plan.nameHi,
      amount: plan.price,
      currency: 'INR',
      season: selectedSeason,
      seasonNameHi: seasonLabelsHi[selectedSeason] || 'रबी',
      agriYear: selectedAgriYear,
      cropCycle: cropCycle || '',
      state: selectedState,
      startDate: seasonSchedule.startDate,
      expiryDate: seasonSchedule.expiryDate,
      status: 'active',
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      verificationStatus: 'verified'
    });

    // 6. Update Payment Transaction Record
    await updatePaymentTransaction(razorpay_order_id, {
      subscriptionId: newSubscription.id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      season: selectedSeason,
      agriYear: selectedAgriYear,
      paymentStatus: 'captured',
      verificationStatus: 'verified'
    });

    console.log(`[Server] Seasonal subscription activated successfully: ${newSubscription.id} (${selectedSeason} ${selectedAgriYear}) for user ${effectiveUserId}`);

    res.json({
      success: true,
      message: 'भुगतान सत्यापित हुआ एवं कृषि मौसम सदस्यता सक्रिय की गई (Payment verified and season subscription activated).',
      subscription: {
        ...newSubscription,
        daysRemaining: seasonSchedule.daysRemaining
      }
    });
  } catch (err) {
    console.error('[Server] Payment verification exception:', err);
    res.status(500).json({
      success: false,
      error: 'भुगतान सत्यापन के दौरान आंतरिक त्रुटि: ' + err.message
    });
  }
});

/**
 * 10g. Razorpay Webhook Handler
 * Verifies webhook signature with RAZORPAY_WEBHOOK_SECRET and processes events
 */
app.post('/api/subscription/webhook', async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  if (!webhookSecret) {
    console.warn('[Server] Received webhook but RAZORPAY_WEBHOOK_SECRET is not set.');
    return res.status(200).json({ received: true, note: 'Webhook secret not configured on server' });
  }

  if (!signature || !req.rawBody) {
    return res.status(400).json({ error: 'Missing webhook signature or raw body' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(req.rawBody)
    .digest('hex');

  if (expectedSignature !== signature) {
    console.warn('[Server] Webhook signature verification failed');
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  const event = req.body;
  console.log(`[Server] Webhook verified: ${event.event}`);

  try {
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentEntity = event.payload?.payment?.entity || event.payload?.order?.entity;
      const orderId = paymentEntity?.order_id || paymentEntity?.id;
      const paymentId = paymentEntity?.id;

      if (orderId) {
        await updatePaymentTransaction(orderId, {
          paymentStatus: 'captured',
          verificationStatus: 'verified',
          paymentId: paymentId || ''
        });
      }
    } else if (event.event === 'payment.failed') {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      if (orderId) {
        await updatePaymentTransaction(orderId, {
          paymentStatus: 'failed',
          verificationStatus: 'failed',
          errorReason: paymentEntity?.error_description || 'Payment failed'
        });
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('[Server] Error processing webhook:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 10h. Premium Feature: Agronomist Expert Consultation Request
 * Enforces Premium entitlement on the backend
 */
app.post('/api/subscription/expert-consultation-request', async (req, res) => {
  const { userId, cropName, queryTopic, contactNumber, preferredTime } = req.body || {};
  const effectiveUserId = userId || 'farmer-001';

  try {
    const sub = await getUserActiveSubscription(effectiveUserId);
    if (!sub || sub.status !== 'active' || sub.planId !== 'premium') {
      return res.status(403).json({
        success: false,
        code: 'PREMIUM_REQUIRED',
        error: 'विशेषज्ञ परामर्श केवल फसलसेतु प्रीमियम सदस्यों के लिए उपलब्ध है। (Expert consultation requires active Premium subscription).'
      });
    }

    const wb = await loadWorkbook();
    const logSheet = wb.getWorksheet('Activity_Log');
    const reqId = `exp_req_${Date.now()}`;

    appendActivityLog(logSheet, {
      sheetName: 'Expert_Requests',
      recordId: reqId,
      action: 'CONSULTATION_REQUESTED',
      fields: ['cropName', 'queryTopic', 'preferredTime'],
      status: 'PENDING',
      details: `Farmer ${effectiveUserId} requested agronomist consultation on ${cropName}: ${queryTopic}`
    });

    await wb.xlsx.writeFile(EXCEL_PATH);

    res.json({
      success: true,
      requestId: reqId,
      message: 'विशेषज्ञ परामर्श अनुरोध दर्ज किया गया। 24-48 घंटों में कृषि विशेषज्ञ आपसे संपर्क करेंगे।',
      messageEn: 'Expert consultation request submitted. An agronomist will contact you within 24-48 hours.',
      status: 'pending_kvk_assignment'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Express server
app.listen(PORT, () => {
  console.log(`[FasalSetu API] Express backend running on http://localhost:${PORT}`);
  console.log(`[FasalSetu API] Excel workbook target: ${EXCEL_PATH}`);
});
