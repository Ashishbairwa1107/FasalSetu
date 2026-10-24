import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ExcelJS from 'exceljs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File location: data/FasalSetu_Data.xlsx
export const DATA_DIR = path.resolve(__dirname, '../data');
export const EXCEL_PATH = path.resolve(DATA_DIR, 'FasalSetu_Data.xlsx');

// Styling constants
const BRAND_GREEN = 'FF087A43';
const BRAND_LIGHT_GREEN = 'FFEAF6E9';
const WHITE = 'FFFFFFFF';
const GRAY_BORDER = 'FFD1D5DB';

// Header style helper
const applyHeaderStyle = (sheet) => {
  const headerRow = sheet.getRow(1);
  headerRow.font = { name: 'Arial', size: 11, bold: true, color: { argb: WHITE } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: BRAND_GREEN }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false };
  headerRow.height = 26;

  sheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: GRAY_BORDER } },
        left: { style: 'thin', color: { argb: GRAY_BORDER } },
        bottom: { style: 'thin', color: { argb: GRAY_BORDER } },
        right: { style: 'thin', color: { argb: GRAY_BORDER } }
      };
    });
  });
};

// Concurrency write queue to prevent simultaneous file corruptions
class WriteQueue {
  constructor() {
    this.queue = Promise.resolve();
  }

  enqueue(operation) {
    this.queue = this.queue.then(async () => {
      try {
        return await operation();
      } catch (err) {
        console.error('Error executing queued Excel operation:', err);
        throw err;
      }
    });
    return this.queue;
  }
}

export const excelQueue = new WriteQueue();

/**
 * Standard column schemas for all 10 worksheets.
 * These are also re-applied during loadWorkbook() to ensure key-based mappings work.
 */
export const SHEET_COLUMNS = {
  Farmers: [
    { header: 'Farmer_ID', key: 'id', width: 18 },
    { header: 'Full_Name', key: 'name', width: 22 },
    { header: 'Mobile', key: 'mobile', width: 18 },
    { header: 'Email', key: 'email', width: 26 },
    { header: 'Village', key: 'village', width: 20 },
    { header: 'District', key: 'district', width: 22 },
    { header: 'State', key: 'state', width: 24 },
    { header: 'Language', key: 'language', width: 12 },
    { header: 'Landholding_Category', key: 'landholdingCategory', width: 22 },
    { header: 'Total_Acres', key: 'totalAcres', width: 14 },
    { header: 'Avatar_URL', key: 'avatarUrl', width: 40 },
    { header: 'Joined_Date', key: 'joinedDate', width: 18 },
    { header: 'Is_Demo', key: 'isDemo', width: 12 },
    { header: 'Created_At', key: 'createdAt', width: 24 },
    { header: 'Updated_At', key: 'updatedAt', width: 24 }
  ],
  Lands: [
    { header: 'Land_ID', key: 'id', width: 18 },
    { header: 'Land_Name', key: 'name', width: 26 },
    { header: 'Area_Amount', key: 'area', width: 14 },
    { header: 'Area_Unit', key: 'areaUnit', width: 14 },
    { header: 'Area_In_Acres', key: 'areaInAcres', width: 16 },
    { header: 'Irrigation_Source', key: 'irrigationSource', width: 22 },
    { header: 'Previous_Crop', key: 'previousCrop', width: 18 },
    { header: 'Village', key: 'village', width: 20 },
    { header: 'District', key: 'district', width: 20 },
    { header: 'State', key: 'state', width: 22 },
    { header: 'Season', key: 'season', width: 14 },
    { header: 'Year', key: 'year', width: 12 },
    { header: 'Budget_INR', key: 'budget', width: 16 },
    { header: 'Health_Score', key: 'healthScore', width: 14 },
    { header: 'Crop_Progress_Pct', key: 'cropProgress', width: 18 },
    { header: 'Current_Stage', key: 'currentStage', width: 18 },
    { header: 'Status', key: 'status', width: 20 },
    { header: 'Is_Demo', key: 'isDemo', width: 12 },
    { header: 'Created_At', key: 'createdAt', width: 24 },
    { header: 'Updated_At', key: 'updatedAt', width: 24 }
  ],
  Soil_Reports: [
    { header: 'Report_ID', key: 'id', width: 20 },
    { header: 'Land_ID', key: 'landId', width: 18 },
    { header: 'Land_Name', key: 'landName', width: 26 },
    { header: 'Analysis_Completed', key: 'analysisCompleted', width: 20 },
    { header: 'Nitrogen_kg_ha', key: 'nitrogen', width: 16 },
    { header: 'Phosphorus_kg_ha', key: 'phosphorus', width: 18 },
    { header: 'Potassium_kg_ha', key: 'potassium', width: 18 },
    { header: 'Soil_pH', key: 'ph', width: 12 },
    { header: 'Organic_Carbon_Pct', key: 'organicCarbon', width: 20 },
    { header: 'Soil_Texture', key: 'soilTexture', width: 26 },
    { header: 'Key_Findings', key: 'findings', width: 36 },
    { header: 'Is_Simulated_Demo', key: 'isSimulated', width: 20 },
    { header: 'Created_At', key: 'createdAt', width: 24 },
    { header: 'Updated_At', key: 'updatedAt', width: 24 }
  ],
  Crop_Planning: [
    { header: 'Plan_ID', key: 'id', width: 18 },
    { header: 'Land_ID', key: 'landId', width: 18 },
    { header: 'Selected_Crop_ID', key: 'cropId', width: 20 },
    { header: 'Crop_Name_Hi', key: 'nameHi', width: 20 },
    { header: 'Crop_Name_En', key: 'nameEn', width: 20 },
    { header: 'Season', key: 'season', width: 14 },
    { header: 'Duration_Days', key: 'durationDays', width: 16 },
    { header: 'Cost_Per_Acre_INR', key: 'costPerAcre', width: 20 },
    { header: 'Revenue_Per_Acre_INR', key: 'revenuePerAcre', width: 22 },
    { header: 'Estimated_Profit_INR', key: 'profitPerAcre', width: 22 },
    { header: 'Water_Requirement', key: 'waterReq', width: 20 },
    { header: 'Soil_Suitability', key: 'soilSuit', width: 18 },
    { header: 'Created_At', key: 'createdAt', width: 24 },
    { header: 'Updated_At', key: 'updatedAt', width: 24 }
  ],
  Tasks_Calendar: [
    { header: 'Task_ID', key: 'id', width: 18 },
    { header: 'Land_ID', key: 'landId', width: 18 },
    { header: 'Crop_Name', key: 'cropName', width: 18 },
    { header: 'Task_Title', key: 'title', width: 28 },
    { header: 'Task_Description', key: 'description', width: 36 },
    { header: 'Category', key: 'category', width: 16 },
    { header: 'Week_Number', key: 'weekNumber', width: 14 },
    { header: 'Due_Date', key: 'dueDate', width: 16 },
    { header: 'Priority', key: 'priority', width: 14 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Weather_Dependent', key: 'weatherDependent', width: 18 },
    { header: 'Weather_Advice', key: 'weatherAdvice', width: 30 },
    { header: 'Completed_At', key: 'completedAt', width: 22 },
    { header: 'Created_At', key: 'createdAt', width: 24 },
    { header: 'Updated_At', key: 'updatedAt', width: 24 }
  ],
  Expenses: [
    { header: 'Expense_ID', key: 'id', width: 18 },
    { header: 'Land_ID', key: 'landId', width: 18 },
    { header: 'Crop_Name', key: 'cropName', width: 18 },
    { header: 'Category', key: 'category', width: 16 },
    { header: 'Category_Label_Hi', key: 'categoryHi', width: 20 },
    { header: 'Amount_INR', key: 'amount', width: 16 },
    { header: 'Expense_Date', key: 'date', width: 16 },
    { header: 'Season', key: 'season', width: 14 },
    { header: 'Notes', key: 'notes', width: 28 },
    { header: 'Created_At', key: 'createdAt', width: 24 },
    { header: 'Updated_At', key: 'updatedAt', width: 24 }
  ],
  Harvest_Profit: [
    { header: 'Record_ID', key: 'id', width: 18 },
    { header: 'Land_ID', key: 'landId', width: 18 },
    { header: 'Crop_Name', key: 'cropName', width: 18 },
    { header: 'Season', key: 'season', width: 14 },
    { header: 'Harvest_Quantity_Quintals', key: 'quantity', width: 26 },
    { header: 'Selling_Price_Per_Quintal_INR', key: 'pricePerQ', width: 28 },
    { header: 'Total_Revenue_INR', key: 'revenue', width: 20 },
    { header: 'Total_Expenses_INR', key: 'expenses', width: 20 },
    { header: 'Net_Profit_INR', key: 'netProfit', width: 18 },
    { header: 'Calculated_At', key: 'calculatedAt', width: 24 },
    { header: 'Updated_At', key: 'updatedAt', width: 24 }
  ],
  Schemes_Mills: [
    { header: 'Item_ID', key: 'id', width: 18 },
    { header: 'Item_Type', key: 'type', width: 18 },
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Category_Or_Crops', key: 'category', width: 22 },
    { header: 'Location', key: 'location', width: 24 },
    { header: 'Benefit_Or_Rate', key: 'benefitOrRate', width: 26 },
    { header: 'Status_Or_Rating', key: 'statusOrRating', width: 18 },
    { header: 'Is_Bookmarked_Or_Favorite', key: 'isFavorite', width: 26 },
    { header: 'Application_Status', key: 'appStatus', width: 20 },
    { header: 'Created_At', key: 'createdAt', width: 24 },
    { header: 'Updated_At', key: 'updatedAt', width: 24 }
  ],
  App_Settings: [
    { header: 'Setting_Key', key: 'key', width: 24 },
    { header: 'Setting_Value', key: 'value', width: 36 },
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Updated_At', key: 'updatedAt', width: 24 }
  ],
  Subscriptions: [
    { header: 'Subscription_ID', key: 'id', width: 24 },
    { header: 'Farmer_ID', key: 'userId', width: 18 },
    { header: 'Plan_ID', key: 'planId', width: 16 },
    { header: 'Plan_Name', key: 'planName', width: 22 },
    { header: 'Plan_Name_Hi', key: 'planNameHi', width: 24 },
    { header: 'Amount_INR', key: 'amount', width: 16 },
    { header: 'Currency', key: 'currency', width: 12 },
    { header: 'Season', key: 'season', width: 14 },
    { header: 'Season_Name_Hi', key: 'seasonNameHi', width: 20 },
    { header: 'Agricultural_Year', key: 'agriYear', width: 18 },
    { header: 'Crop_Cycle', key: 'cropCycle', width: 20 },
    { header: 'State', key: 'state', width: 20 },
    { header: 'Start_Date', key: 'startDate', width: 24 },
    { header: 'Expiry_Date', key: 'expiryDate', width: 24 },
    { header: 'Status', key: 'status', width: 16 },
    { header: 'Order_ID', key: 'orderId', width: 26 },
    { header: 'Payment_ID', key: 'paymentId', width: 26 },
    { header: 'Verification_Status', key: 'verificationStatus', width: 20 },
    { header: 'Created_At', key: 'createdAt', width: 24 },
    { header: 'Updated_At', key: 'updatedAt', width: 24 }
  ],
  Payment_Transactions: [
    { header: 'Transaction_ID', key: 'id', width: 24 },
    { header: 'Farmer_ID', key: 'userId', width: 18 },
    { header: 'Subscription_ID', key: 'subscriptionId', width: 24 },
    { header: 'Payment_Gateway', key: 'paymentGateway', width: 18 },
    { header: 'Order_ID', key: 'orderId', width: 26 },
    { header: 'Payment_ID', key: 'paymentId', width: 26 },
    { header: 'Signature', key: 'signature', width: 36 },
    { header: 'Amount_INR', key: 'amount', width: 16 },
    { header: 'Currency', key: 'currency', width: 12 },
    { header: 'Season', key: 'season', width: 14 },
    { header: 'Agricultural_Year', key: 'agriYear', width: 18 },
    { header: 'Payment_Status', key: 'paymentStatus', width: 18 },
    { header: 'Verification_Status', key: 'verificationStatus', width: 20 },
    { header: 'Error_Reason', key: 'errorReason', width: 36 },
    { header: 'Created_At', key: 'createdAt', width: 24 },
    { header: 'Updated_At', key: 'updatedAt', width: 24 }
  ],
  Activity_Log: [
    { header: 'Log_ID', key: 'id', width: 22 },
    { header: 'Timestamp', key: 'timestamp', width: 24 },
    { header: 'Entity_Sheet', key: 'sheet', width: 18 },
    { header: 'Record_ID', key: 'recordId', width: 20 },
    { header: 'Action_Performed', key: 'action', width: 18 },
    { header: 'Changed_Fields', key: 'fields', width: 30 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Details', key: 'details', width: 44 }
  ]
};

/**
 * Initializes the Excel workbook if it doesn't exist,
 * creating all 10 worksheets with styled headers and initial data.
 */
export async function initializeWorkbookIfNeeded() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(EXCEL_PATH)) {
    return;
  }

  console.log(`[ExcelService] Creating new structured workbook at: ${EXCEL_PATH}`);
  const wb = new ExcelJS.Workbook();
  wb.creator = 'FasalSetu AgriTech System';
  wb.lastModifiedBy = 'FasalSetu Local Server';
  wb.created = new Date();
  wb.modified = new Date();

  // 1. Farmers
  const sFarmers = wb.addWorksheet('Farmers');
  sFarmers.columns = [
    { header: 'Farmer_ID', key: 'id', width: 18 },
    { header: 'Full_Name', key: 'name', width: 22 },
    { header: 'Mobile', key: 'mobile', width: 18 },
    { header: 'Email', key: 'email', width: 26 },
    { header: 'Village', key: 'village', width: 20 },
    { header: 'District', key: 'district', width: 22 },
    { header: 'State', key: 'state', width: 24 },
    { header: 'Language', key: 'language', width: 12 },
    { header: 'Landholding_Category', key: 'landholdingCategory', width: 22 },
    { header: 'Total_Acres', key: 'totalAcres', width: 14 },
    { header: 'Avatar_URL', key: 'avatarUrl', width: 40 },
    { header: 'Joined_Date', key: 'joinedDate', width: 18 },
    { header: 'Is_Demo', key: 'isDemo', width: 12 },
    { header: 'Created_At', key: 'createdAt', width: 24 },
    { header: 'Updated_At', key: 'updatedAt', width: 24 }
  ];
  applyHeaderStyle(sFarmers);

  // Seed default farmer
  sFarmers.addRow({
    id: 'farmer-001',
    name: 'राम कुमार वर्मा',
    mobile: '+91 98765 43210',
    email: 'ramkumar.verma@fasalsetu.in',
    village: 'आरंग (Arang)',
    district: 'रायपुर (Raipur)',
    state: 'छत्तीसगढ़ (Chhattisgarh)',
    language: 'hi',
    landholdingCategory: 'small',
    totalAcres: 4.5,
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=256',
    joinedDate: '15 जून 2024',
    isDemo: 'Yes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // 2. Lands
  const sLands = wb.addWorksheet('Lands');
  sLands.columns = [
    { header: 'Land_ID', key: 'id', width: 18 },
    { header: 'Land_Name', key: 'name', width: 26 },
    { header: 'Area_Amount', key: 'area', width: 14 },
    { header: 'Area_Unit', key: 'areaUnit', width: 14 },
    { header: 'Area_In_Acres', key: 'areaInAcres', width: 16 },
    { header: 'Irrigation_Source', key: 'irrigationSource', width: 22 },
    { header: 'Previous_Crop', key: 'previousCrop', width: 18 },
    { header: 'Village', key: 'village', width: 20 },
    { header: 'District', key: 'district', width: 20 },
    { header: 'State', key: 'state', width: 22 },
    { header: 'Season', key: 'season', width: 14 },
    { header: 'Year', key: 'year', width: 12 },
    { header: 'Budget_INR', key: 'budget', width: 16 },
    { header: 'Health_Score', key: 'healthScore', width: 14 },
    { header: 'Crop_Progress_Pct', key: 'cropProgress', width: 18 },
    { header: 'Current_Stage', key: 'currentStage', width: 18 },
    { header: 'Status', key: 'status', width: 20 },
    { header: 'Is_Demo', key: 'isDemo', width: 12 },
    { header: 'Created_At', key: 'createdAt', width: 24 },
    { header: 'Updated_At', key: 'updatedAt', width: 24 }
  ];
  applyHeaderStyle(sLands);

  // Seed default lands
  sLands.addRow({
    id: 'land-01',
    name: 'बड़ा खेत (North Paddy Field)',
    area: 2.5,
    areaUnit: 'acre',
    areaInAcres: 2.5,
    irrigationSource: 'नलकूप / बोरवेल',
    previousCrop: 'धान (Paddy - IR 64)',
    village: 'आरंग',
    district: 'रायपुर',
    state: 'छत्तीसगढ़',
    season: 'kharif',
    year: '2024',
    budget: 45000,
    healthScore: 92,
    cropProgress: 65,
    currentStage: 'flowering',
    status: 'सक्रिय (Active)',
    isDemo: 'Yes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  sLands.addRow({
    id: 'land-02',
    name: 'नहर वाला खेत (Canal Plot)',
    area: 2.0,
    areaUnit: 'acre',
    areaInAcres: 2.0,
    irrigationSource: 'नहर (Canal)',
    previousCrop: 'सोयाबीन (Soybean)',
    village: 'आरंग',
    district: 'रायपुर',
    state: 'छत्तीसगढ़',
    season: 'kharif',
    year: '2024',
    budget: 35000,
    healthScore: 86,
    cropProgress: 50,
    currentStage: 'grain_filling',
    status: 'सक्रिय (Active)',
    isDemo: 'Yes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // 3. Soil_Reports
  const sSoil = wb.addWorksheet('Soil_Reports');
  sSoil.columns = [
    { header: 'Report_ID', key: 'id', width: 20 },
    { header: 'Land_ID', key: 'landId', width: 18 },
    { header: 'Land_Name', key: 'landName', width: 26 },
    { header: 'Analysis_Completed', key: 'analysisCompleted', width: 20 },
    { header: 'Nitrogen_kg_ha', key: 'nitrogen', width: 16 },
    { header: 'Phosphorus_kg_ha', key: 'phosphorus', width: 18 },
    { header: 'Potassium_kg_ha', key: 'potassium', width: 18 },
    { header: 'Soil_pH', key: 'ph', width: 12 },
    { header: 'Organic_Carbon_Pct', key: 'organicCarbon', width: 20 },
    { header: 'Soil_Texture', key: 'soilTexture', width: 26 },
    { header: 'Key_Findings', key: 'findings', width: 36 },
    { header: 'Is_Simulated_Demo', key: 'isSimulated', width: 20 },
    { header: 'Created_At', key: 'createdAt', width: 24 },
    { header: 'Updated_At', key: 'updatedAt', width: 24 }
  ];
  applyHeaderStyle(sSoil);

  sSoil.addRow({
    id: 'soil-land-01',
    landId: 'land-01',
    landName: 'बड़ा खेत (North Paddy Field)',
    analysisCompleted: 'Yes',
    nitrogen: '240 kg/ha',
    phosphorus: '22 kg/ha',
    potassium: '280 kg/ha',
    ph: 6.8,
    organicCarbon: 0.65,
    soilTexture: 'काली चिकनी दोमट (Clay Loam)',
    findings: 'पोटाश प्रचुर मात्रा में उपलब्ध; जैविक खाद का प्रयोग बढ़ाएं',
    isSimulated: 'Yes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // 4. Crop_Planning
  const sCrop = wb.addWorksheet('Crop_Planning');
  sCrop.columns = [
    { header: 'Plan_ID', key: 'id', width: 18 },
    { header: 'Land_ID', key: 'landId', width: 18 },
    { header: 'Selected_Crop_ID', key: 'cropId', width: 20 },
    { header: 'Crop_Name_Hi', key: 'nameHi', width: 20 },
    { header: 'Crop_Name_En', key: 'nameEn', width: 20 },
    { header: 'Season', key: 'season', width: 14 },
    { header: 'Duration_Days', key: 'durationDays', width: 16 },
    { header: 'Cost_Per_Acre_INR', key: 'costPerAcre', width: 20 },
    { header: 'Revenue_Per_Acre_INR', key: 'revenuePerAcre', width: 22 },
    { header: 'Estimated_Profit_INR', key: 'profitPerAcre', width: 22 },
    { header: 'Water_Requirement', key: 'waterReq', width: 20 },
    { header: 'Soil_Suitability', key: 'soilSuit', width: 18 },
    { header: 'Created_At', key: 'createdAt', width: 24 },
    { header: 'Updated_At', key: 'updatedAt', width: 24 }
  ];
  applyHeaderStyle(sCrop);

  sCrop.addRow({
    id: 'plan-land-01',
    landId: 'land-01',
    cropId: 'crop-paddy-01',
    nameHi: 'धान (IR-64 Sugandh)',
    nameEn: 'Paddy (IR-64)',
    season: 'kharif',
    durationDays: '120-130 दिन',
    costPerAcre: 18500,
    revenuePerAcre: 48000,
    profitPerAcre: 29500,
    waterReq: 'उच्च',
    soilSuit: 'उच्च',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // 5. Tasks_Calendar
  const sTasks = wb.addWorksheet('Tasks_Calendar');
  sTasks.columns = [
    { header: 'Task_ID', key: 'id', width: 18 },
    { header: 'Land_ID', key: 'landId', width: 18 },
    { header: 'Crop_Name', key: 'cropName', width: 18 },
    { header: 'Task_Title', key: 'title', width: 28 },
    { header: 'Task_Description', key: 'description', width: 36 },
    { header: 'Category', key: 'category', width: 16 },
    { header: 'Week_Number', key: 'weekNumber', width: 14 },
    { header: 'Due_Date', key: 'dueDate', width: 16 },
    { header: 'Priority', key: 'priority', width: 14 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Weather_Dependent', key: 'weatherDependent', width: 18 },
    { header: 'Weather_Advice', key: 'weatherAdvice', width: 30 },
    { header: 'Completed_At', key: 'completedAt', width: 22 },
    { header: 'Created_At', key: 'createdAt', width: 24 },
    { header: 'Updated_At', key: 'updatedAt', width: 24 }
  ];
  applyHeaderStyle(sTasks);

  sTasks.addRow({
    id: 'task-101',
    landId: 'land-01',
    cropName: 'धान (Paddy)',
    title: 'पोटाश व यूरिया का दूसरा छिड़काव',
    description: 'बालियां निकलने के समय प्रति एकड़ 15 किग्रा पोटाश और 20 किग्रा यूरिया डालें।',
    category: 'fertilizer',
    weekNumber: 14,
    dueDate: '2024-10-21',
    priority: 'high',
    status: 'pending',
    weatherDependent: 'Yes',
    weatherAdvice: 'तेज हवा या बारिश की संभावना न हो तभी छिड़काव करें।',
    completedAt: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  sTasks.addRow({
    id: 'task-102',
    landId: 'land-01',
    cropName: 'धान (Paddy)',
    title: 'तना छेदक (Stem Borer) कीट निगरानी',
    description: 'खेत में फेरोमोन ट्रैप की जांच करें और तितलियों की संख्या दर्ज करें।',
    category: 'pest_control',
    weekNumber: 14,
    dueDate: '2024-10-22',
    priority: 'medium',
    status: 'pending',
    weatherDependent: 'No',
    weatherAdvice: '',
    completedAt: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // 6. Expenses
  const sExpenses = wb.addWorksheet('Expenses');
  sExpenses.columns = [
    { header: 'Expense_ID', key: 'id', width: 18 },
    { header: 'Land_ID', key: 'landId', width: 18 },
    { header: 'Crop_Name', key: 'cropName', width: 18 },
    { header: 'Category', key: 'category', width: 16 },
    { header: 'Category_Label_Hi', key: 'categoryHi', width: 20 },
    { header: 'Amount_INR', key: 'amount', width: 16 },
    { header: 'Expense_Date', key: 'date', width: 16 },
    { header: 'Season', key: 'season', width: 14 },
    { header: 'Notes', key: 'notes', width: 28 },
    { header: 'Created_At', key: 'createdAt', width: 24 },
    { header: 'Updated_At', key: 'updatedAt', width: 24 }
  ];
  applyHeaderStyle(sExpenses);

  sExpenses.addRow({
    id: 'exp-101',
    landId: 'land-01',
    cropName: 'धान (Paddy)',
    category: 'seeds',
    categoryHi: 'बीज खरीद',
    amount: 3200,
    date: '2024-06-15',
    season: 'kharif',
    notes: 'प्रमाणित IR-64 बीज (2 बैग)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  sExpenses.addRow({
    id: 'exp-102',
    landId: 'land-01',
    cropName: 'धान (Paddy)',
    category: 'machinery',
    categoryHi: 'ट्रैक्टर जुताई',
    amount: 5500,
    date: '2024-06-20',
    season: 'kharif',
    notes: 'रोटावेटर व कल्टीवेटर जुताई 2.5 एकड़',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // 7. Harvest_Profit
  const sHarvest = wb.addWorksheet('Harvest_Profit');
  sHarvest.columns = [
    { header: 'Record_ID', key: 'id', width: 18 },
    { header: 'Land_ID', key: 'landId', width: 18 },
    { header: 'Crop_Name', key: 'cropName', width: 18 },
    { header: 'Season', key: 'season', width: 14 },
    { header: 'Harvest_Quantity_Quintals', key: 'quantity', width: 26 },
    { header: 'Selling_Price_Per_Quintal_INR', key: 'pricePerQ', width: 28 },
    { header: 'Total_Revenue_INR', key: 'revenue', width: 20 },
    { header: 'Total_Expenses_INR', key: 'expenses', width: 20 },
    { header: 'Net_Profit_INR', key: 'netProfit', width: 18 },
    { header: 'Calculated_At', key: 'calculatedAt', width: 24 },
    { header: 'Updated_At', key: 'updatedAt', width: 24 }
  ];
  applyHeaderStyle(sHarvest);

  sHarvest.addRow({
    id: 'harvest-01',
    landId: 'land-01',
    cropName: 'धान (Paddy)',
    season: 'kharif',
    quantity: 38,
    pricePerQ: 3100,
    revenue: 117800,
    expenses: 28500,
    netProfit: 89300,
    calculatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // 8. Schemes_Mills
  const sSchemes = wb.addWorksheet('Schemes_Mills');
  sSchemes.columns = [
    { header: 'Item_ID', key: 'id', width: 18 },
    { header: 'Item_Type', key: 'type', width: 18 },
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Category_Or_Crops', key: 'category', width: 22 },
    { header: 'Location', key: 'location', width: 24 },
    { header: 'Benefit_Or_Rate', key: 'benefitOrRate', width: 26 },
    { header: 'Status_Or_Rating', key: 'statusOrRating', width: 18 },
    { header: 'Is_Bookmarked_Or_Favorite', key: 'isFavorite', width: 26 },
    { header: 'Application_Status', key: 'appStatus', width: 20 },
    { header: 'Created_At', key: 'createdAt', width: 24 },
    { header: 'Updated_At', key: 'updatedAt', width: 24 }
  ];
  applyHeaderStyle(sSchemes);

  sSchemes.addRow({
    id: 'scheme-01',
    type: 'Govt_Scheme',
    name: 'प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)',
    category: 'financial',
    location: 'राष्ट्रीय (All India)',
    benefitOrRate: '₹6,000 प्रति वर्ष (3 किस्त)',
    statusOrRating: 'सक्रिय',
    isFavorite: 'Yes',
    appStatus: 'approved',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  sSchemes.addRow({
    id: 'mill-01',
    type: 'Nearby_Mill',
    name: 'श्री राम एग्रो राइस मिल',
    category: 'धान, सुगंधित चावल',
    location: 'आरंग रोड, रायपुर (4.2 किमी)',
    benefitOrRate: '₹3,150 / क्विंटल',
    statusOrRating: '4.8 ★',
    isFavorite: 'Yes',
    appStatus: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // 9. App_Settings
  const sSettings = wb.addWorksheet('App_Settings');
  sSettings.columns = [
    { header: 'Setting_Key', key: 'key', width: 24 },
    { header: 'Setting_Value', key: 'value', width: 36 },
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Updated_At', key: 'updatedAt', width: 24 }
  ];
  applyHeaderStyle(sSettings);

  sSettings.addRow({
    key: 'current_language',
    value: 'hi',
    description: 'Active application interface language',
    updatedAt: new Date().toISOString()
  });
  sSettings.addRow({
    key: 'default_district',
    value: 'रायपुर (Raipur)',
    description: 'Default user district for market and weather',
    updatedAt: new Date().toISOString()
  });
  sSettings.addRow({
    key: 'default_state',
    value: 'छत्तीसगढ़ (Chhattisgarh)',
    description: 'Default state of residence',
    updatedAt: new Date().toISOString()
  });
  sSettings.addRow({
    key: 'storage_backend',
    value: 'Excel (FasalSetu_Data.xlsx)',
    description: 'Temporary prototype local data persistence layer',
    updatedAt: new Date().toISOString()
  });

  // 10. Activity_Log
  const sLog = wb.addWorksheet('Activity_Log');
  sLog.columns = [
    { header: 'Log_ID', key: 'id', width: 22 },
    { header: 'Timestamp', key: 'timestamp', width: 24 },
    { header: 'Entity_Sheet', key: 'sheet', width: 18 },
    { header: 'Record_ID', key: 'recordId', width: 20 },
    { header: 'Action_Performed', key: 'action', width: 18 },
    { header: 'Changed_Fields', key: 'fields', width: 30 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Details', key: 'details', width: 44 }
  ];
  applyHeaderStyle(sLog);

  sLog.addRow({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    sheet: 'System',
    recordId: 'init',
    action: 'INIT_WORKBOOK',
    fields: 'All 12 worksheets',
    status: 'SUCCESS',
    details: 'Workbook initialized with structured schema & demo baseline'
  });

  // 11. Subscriptions
  const sSubs = wb.addWorksheet('Subscriptions');
  sSubs.columns = SHEET_COLUMNS.Subscriptions;
  applyHeaderStyle(sSubs);

  // 12. Payment_Transactions
  const sTxns = wb.addWorksheet('Payment_Transactions');
  sTxns.columns = SHEET_COLUMNS.Payment_Transactions;
  applyHeaderStyle(sTxns);

  await wb.xlsx.writeFile(EXCEL_PATH);
  console.log(`[ExcelService] Initialized Excel workbook at: ${EXCEL_PATH}`);
}

/**
 * Loads the current workbook instance from disk
 */
export async function loadWorkbook() {
  await initializeWorkbookIfNeeded();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(EXCEL_PATH);

  // Auto-migration: Ensure Subscriptions & Payment_Transactions exist
  let migrated = false;
  if (!wb.getWorksheet('Subscriptions')) {
    const s = wb.addWorksheet('Subscriptions');
    s.columns = SHEET_COLUMNS.Subscriptions;
    applyHeaderStyle(s);
    migrated = true;
    console.log('[ExcelService] Migrated workbook: added Subscriptions sheet');
  }
  if (!wb.getWorksheet('Payment_Transactions')) {
    const t = wb.addWorksheet('Payment_Transactions');
    t.columns = SHEET_COLUMNS.Payment_Transactions;
    applyHeaderStyle(t);
    migrated = true;
    console.log('[ExcelService] Migrated workbook: added Payment_Transactions sheet');
  }
  if (migrated) {
    await wb.xlsx.writeFile(EXCEL_PATH);
  }

  // Restore column key mappings so addRow({ key: val }) and sheetToObjects operate accurately
  for (const [sheetName, columns] of Object.entries(SHEET_COLUMNS)) {
    const ws = wb.getWorksheet(sheetName);
    if (ws) {
      ws.columns = columns;
    }
  }

  return wb;
}

/**
 * Appends an activity log entry safely to the Activity_Log worksheet
 */
export function appendActivityLog(sheet, { sheetName, recordId, action, fields, status = 'SUCCESS', details = '' }) {
  if (!sheet) return;
  sheet.addRow({
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    sheet: sheetName,
    recordId: String(recordId || ''),
    action: action,
    fields: Array.isArray(fields) ? fields.join(', ') : String(fields || ''),
    status: status,
    details: details
  });
}

/**
 * Helper to convert worksheet rows to plain JavaScript objects
 */
export function sheetToObjects(sheet) {
  if (!sheet) return [];
  const results = [];
  const columns = sheet.columns || [];
  const keys = columns.map(c => c.key);

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header
    const obj = {};
    keys.forEach((key, colIndex) => {
      let val = row.getCell(colIndex + 1).value;
      // Handle exceljs rich text or formula objects
      if (val && typeof val === 'object') {
        if ('result' in val) val = val.result;
        else if ('text' in val) val = val.text;
      }
      obj[key] = val !== undefined && val !== null ? val : '';
    });
    results.push(obj);
  });
  return results;
}

// ==========================================
// SUBSCRIPTION & PAYMENT WORKFLOW HELPERS
// ==========================================

/**
 * Returns active subscription for a specific user if not expired
 */
export async function getUserActiveSubscription(userId, targetSeason, targetAgriYear) {
  const wb = await loadWorkbook();
  const subs = sheetToObjects(wb.getWorksheet('Subscriptions'));
  const now = new Date();

  // Find all subscriptions for this user
  const userSubs = subs.filter(s => s.userId === userId);

  // Check for expired ones and update them in database
  for (const s of userSubs) {
    if (s.status === 'active' && s.expiryDate && new Date(s.expiryDate) < now) {
      await updateSubscription(s.id, { status: 'expired' });
      s.status = 'expired';
    }
  }

  // If specific season requested (e.g. checking if user has active rabi 2026-27 plan)
  if (targetSeason) {
    const matching = userSubs.find(s =>
      s.status === 'active' &&
      s.season === targetSeason &&
      (!targetAgriYear || s.agriYear === targetAgriYear)
    );
    if (matching) {
      const diffTime = new Date(matching.expiryDate).getTime() - now.getTime();
      return {
        ...matching,
        amount: parseFloat(matching.amount) || 0,
        daysRemaining: Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
      };
    }
    return null;
  }

  // Otherwise return currently active subscription (most recent)
  const activeSubs = userSubs
    .filter(s => s.status === 'active')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (activeSubs.length === 0) {
    // Return latest expired subscription if any, so user can see what expired and renew
    const latestExpired = userSubs
      .filter(s => s.status === 'expired')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    if (latestExpired) {
      return {
        ...latestExpired,
        amount: parseFloat(latestExpired.amount) || 0,
        daysRemaining: 0
      };
    }
    return null;
  }

  const current = activeSubs[0];
  const diffTime = new Date(current.expiryDate).getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return {
    ...current,
    amount: parseFloat(current.amount) || 0,
    daysRemaining
  };
}

/**
 * Returns all subscriptions for a specific user
 */
export async function getUserSubscriptions(userId) {
  const wb = await loadWorkbook();
  const subs = sheetToObjects(wb.getWorksheet('Subscriptions'));
  return subs
    .filter(s => !userId || s.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(s => {
      const expiry = new Date(s.expiryDate);
      const now = new Date();
      const diffTime = expiry.getTime() - now.getTime();
      const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      return {
        ...s,
        amount: parseFloat(s.amount) || 0,
        daysRemaining
      };
    });
}

/**
 * Creates a new subscription record
 */
export async function saveSubscription(subData) {
  return excelQueue.enqueue(async () => {
    const wb = await loadWorkbook();
    const sheet = wb.getWorksheet('Subscriptions');
    const logSheet = wb.getWorksheet('Activity_Log');

    const nowIso = new Date().toISOString();
    const newRecord = {
      id: subData.id || `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: subData.userId,
      planId: subData.planId,
      planName: subData.planName,
      planNameHi: subData.planNameHi || subData.planName,
      amount: Number(subData.amount) || 0,
      currency: subData.currency || 'INR',
      season: subData.season || 'rabi',
      seasonNameHi: subData.seasonNameHi || (subData.season === 'kharif' ? 'खरीफ' : subData.season === 'zaid' ? 'जायद' : 'रबी'),
      agriYear: subData.agriYear || '2026-27',
      cropCycle: subData.cropCycle || '',
      state: subData.state || 'छत्तीसगढ़',
      startDate: subData.startDate || nowIso,
      expiryDate: subData.expiryDate,
      status: subData.status || 'active',
      orderId: subData.orderId || '',
      paymentId: subData.paymentId || '',
      verificationStatus: subData.verificationStatus || 'verified',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    sheet.addRow(newRecord);

    appendActivityLog(logSheet, {
      sheetName: 'Subscriptions',
      recordId: newRecord.id,
      action: 'ACTIVATE_SUBSCRIPTION',
      fields: ['status', 'planId', 'amount', 'season', 'agriYear', 'orderId'],
      status: 'SUCCESS',
      details: `Plan ${newRecord.planName} (${newRecord.season} ${newRecord.agriYear}) activated for user ${newRecord.userId} (Expiry: ${newRecord.expiryDate})`
    });

    await wb.xlsx.writeFile(EXCEL_PATH);
    return newRecord;
  });
}

/**
 * Updates an existing subscription record
 */
export async function updateSubscription(subId, updates) {
  return excelQueue.enqueue(async () => {
    const wb = await loadWorkbook();
    const sheet = wb.getWorksheet('Subscriptions');
    const logSheet = wb.getWorksheet('Activity_Log');

    let foundRow = null;
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      if (row.getCell(1).value === subId) {
        foundRow = row;
      }
    });

    if (!foundRow) return null;

    const columns = sheet.columns || [];
    const keys = columns.map(c => c.key);

    for (const [key, val] of Object.entries(updates)) {
      const colIndex = keys.indexOf(key);
      if (colIndex !== -1) {
        foundRow.getCell(colIndex + 1).value = val;
      }
    }

    const updatedColIndex = keys.indexOf('updatedAt');
    if (updatedColIndex !== -1) {
      foundRow.getCell(updatedColIndex + 1).value = new Date().toISOString();
    }

    appendActivityLog(logSheet, {
      sheetName: 'Subscriptions',
      recordId: subId,
      action: 'UPDATE_SUBSCRIPTION',
      fields: Object.keys(updates),
      status: 'SUCCESS',
      details: `Subscription ${subId} updated with fields: ${Object.keys(updates).join(', ')}`
    });

    await wb.xlsx.writeFile(EXCEL_PATH);
    return true;
  });
}

/**
 * Records a new payment transaction
 */
export async function savePaymentTransaction(txnData) {
  return excelQueue.enqueue(async () => {
    const wb = await loadWorkbook();
    const sheet = wb.getWorksheet('Payment_Transactions');
    const logSheet = wb.getWorksheet('Activity_Log');

    const nowIso = new Date().toISOString();
    const newTxn = {
      id: txnData.id || `txn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: txnData.userId,
      subscriptionId: txnData.subscriptionId || '',
      paymentGateway: txnData.paymentGateway || 'razorpay',
      orderId: txnData.orderId,
      paymentId: txnData.paymentId || '',
      signature: txnData.signature || '',
      amount: Number(txnData.amount) || 0,
      currency: txnData.currency || 'INR',
      season: txnData.season || '',
      agriYear: txnData.agriYear || '',
      paymentStatus: txnData.paymentStatus || 'created',
      verificationStatus: txnData.verificationStatus || 'unverified',
      errorReason: txnData.errorReason || '',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    sheet.addRow(newTxn);

    appendActivityLog(logSheet, {
      sheetName: 'Payment_Transactions',
      recordId: newTxn.id,
      action: 'CREATE_PAYMENT_TXN',
      fields: ['orderId', 'amount', 'paymentStatus'],
      status: 'SUCCESS',
      details: `Payment transaction initiated: Order ${newTxn.orderId}, ₹${newTxn.amount}`
    });

    await wb.xlsx.writeFile(EXCEL_PATH);
    return newTxn;
  });
}

/**
 * Updates a payment transaction by orderId
 */
export async function updatePaymentTransaction(orderId, updates) {
  return excelQueue.enqueue(async () => {
    const wb = await loadWorkbook();
    const sheet = wb.getWorksheet('Payment_Transactions');
    const logSheet = wb.getWorksheet('Activity_Log');

    let foundRow = null;
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      // column 5 is Order_ID
      const colIndex = (sheet.columns || []).findIndex(c => c.key === 'orderId');
      const val = row.getCell(colIndex !== -1 ? colIndex + 1 : 5).value;
      if (val === orderId) {
        foundRow = row;
      }
    });

    if (!foundRow) return null;

    const columns = sheet.columns || [];
    const keys = columns.map(c => c.key);

    for (const [key, val] of Object.entries(updates)) {
      const colIdx = keys.indexOf(key);
      if (colIdx !== -1) {
        foundRow.getCell(colIdx + 1).value = val;
      }
    }

    const updatedColIndex = keys.indexOf('updatedAt');
    if (updatedColIndex !== -1) {
      foundRow.getCell(updatedColIndex + 1).value = new Date().toISOString();
    }

    appendActivityLog(logSheet, {
      sheetName: 'Payment_Transactions',
      recordId: orderId,
      action: 'UPDATE_PAYMENT_TXN',
      fields: Object.keys(updates),
      status: 'SUCCESS',
      details: `Payment transaction ${orderId} updated: ${Object.keys(updates).join(', ')}`
    });

    await wb.xlsx.writeFile(EXCEL_PATH);
    return true;
  });
}

/**
 * Returns all transactions for a user
 */
export async function getUserPaymentTransactions(userId) {
  const wb = await loadWorkbook();
  const txns = sheetToObjects(wb.getWorksheet('Payment_Transactions'));
  return txns
    .filter(t => !userId || t.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(t => ({
      ...t,
      amount: parseFloat(t.amount) || 0
    }));
}

/**
 * Returns transaction by orderId
 */
export async function getTransactionByOrderId(orderId) {
  const wb = await loadWorkbook();
  const txns = sheetToObjects(wb.getWorksheet('Payment_Transactions'));
  return txns.find(t => t.orderId === orderId) || null;
}
