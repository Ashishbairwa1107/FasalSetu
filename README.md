# FasalSetu (फसलसेतु) — Smart Agriculture Platform

> "आपके खेत का अपना साथी" • "बेहतर फैसले, बेहतर खेती, बेहतर कल"

FasalSetu is a complete, modern, responsive, and accessible agricultural platform designed for Indian farmers. It provides an all-in-one digital companion for farm management, AI crop health diagnosis, crop calendars, mandi price intelligence, expense tracking, government schemes, and community Q&A with voice-assisted support.

---

## 📊 Local Excel-Based Data Persistence Layer (Temporary Backend)

To enable persistent data storage during the prototype and testing phase without requiring an external database setup, FasalSetu includes a dedicated local **Express.js API** powered by **`exceljs`** that stores and synchronizes application data in a single structured workbook:

📁 **Workbook Location:** `data/FasalSetu_Data.xlsx`

### 1. Architecture Overview
```
┌─────────────────────────────────┐
│     React 19 + Vite Frontend    │
│  (UI Components & AppContext)   │
└────────────────┬────────────────┘
                 │ HTTP / REST via /api proxy
                 ▼
┌─────────────────────────────────┐
│       Local Express API         │
│     (server/index.js :5000)     │
└────────────────┬────────────────┘
                 │ FIFO Mutex (excelQueue)
                 ▼
┌─────────────────────────────────┐
│       ExcelJS Data Engine       │
│    (server/excelService.js)     │
└────────────────┬────────────────┘
                 │ Atomic File Writes
                 ▼
┌─────────────────────────────────┐
│    data/FasalSetu_Data.xlsx     │
│       (10 Structured Sheets)    │
└─────────────────────────────────┘
```

### 2. The 10 Structured Worksheets
The workbook is automatically generated on server startup if not present, styled with FasalSetu brand green headers (`#087A43`), freeze-panes, and thin grid borders:

1. **`Farmers`**: Farmer profile (`Farmer_ID`, `Full_Name`, `Mobile`, `Email`, `Village`, `District`, `State`, `Language`, `Landholding_Category`, `Total_Acres`, `Avatar_URL`, `Joined_Date`, `Is_Demo`, timestamps).
2. **`Lands`**: Farm plots and land records (`Land_ID`, `Land_Name`, `Area_Amount`, `Area_Unit`, `Area_In_Acres`, `Irrigation_Source`, `Previous_Crop`, `Village`, `District`, `State`, `Season`, `Year`, `Budget_INR`, `Health_Score`, `Crop_Progress_Pct`, `Current_Stage`, `Status`, `Is_Demo`, timestamps).
3. **`Soil_Reports`**: Soil test measurements (`Report_ID`, `Land_ID`, `Land_Name`, `Analysis_Completed`, `Nitrogen_kg_ha`, `Phosphorus_kg_ha`, `Potassium_kg_ha`, `Soil_pH`, `Organic_Carbon_Pct`, `Soil_Texture`, `Key_Findings`, `Is_Simulated_Demo`, timestamps).
4. **`Crop_Planning`**: Crop recommendations and plans (`Plan_ID`, `Land_ID`, `Selected_Crop_ID`, `Crop_Name_Hi`, `Crop_Name_En`, `Season`, `Duration_Days`, `Cost_Per_Acre_INR`, `Revenue_Per_Acre_INR`, `Estimated_Profit_INR`, `Water_Requirement`, `Soil_Suitability`, timestamps).
5. **`Tasks_Calendar`**: Agricultural task schedules (`Task_ID`, `Land_ID`, `Crop_Name`, `Task_Title`, `Task_Description`, `Category`, `Week_Number`, `Due_Date`, `Priority`, `Status`, `Weather_Dependent`, `Weather_Advice`, `Completed_At`, timestamps).
6. **`Expenses`**: Operational farming expenditures (`Expense_ID`, `Land_ID`, `Crop_Name`, `Category`, `Category_Label_Hi`, `Amount_INR`, `Expense_Date`, `Season`, `Notes`, timestamps).
7. **`Harvest_Profit`**: Yield and financial performance (`Record_ID`, `Land_ID`, `Crop_Name`, `Season`, `Harvest_Quantity_Quintals`, `Selling_Price_Per_Quintal_INR`, `Total_Revenue_INR`, `Total_Expenses_INR`, `Net_Profit_INR`, timestamps).
8. **`Schemes_Mills`**: Government programs and local rice/dal mills (`Item_ID`, `Item_Type`, `Name`, `Category_Or_Crops`, `Location`, `Benefit_Or_Rate`, `Status_Or_Rating`, `Is_Bookmarked_Or_Favorite`, `Application_Status`, timestamps).
9. **`App_Settings`**: User configuration key-value store (`Setting_Key`, `Setting_Value`, `Description`, `Updated_At`).
10. **`Activity_Log`**: Complete audit trail (`Log_ID`, `Timestamp`, `Entity_Sheet`, `Record_ID`, `Action_Performed`, `Changed_Fields`, `Status`, `Details`).

### 3. Concurrency & Reliability
- **Write Serialization Queue (`WriteQueue`)**: File system mutations are wrapped in a Promise-based FIFO mutex. All concurrent requests wait in turn to acquire the file handle, eliminating Windows EBUSY file-lock errors.
- **Fail-Safe Offline Mode**: If the Express API is not running, the frontend gracefully falls back to `localStorage` state without crashing or freezing.
- **Audit Logging**: Every create, update, or delete action automatically writes an entry to the `Activity_Log` worksheet with the changed columns, timestamp, and result status.

### 4. REST API Endpoints
| Endpoint | Method | Description |
|---|---|---|
| `/api/status` | `GET` | Health check, file existence, size, and last modified date |
| `/api/data` | `GET` | Hydrates profile, lands, tasks, expenses, and settings on startup |
| `/api/profile` | `POST` | Updates farmer profile row in `Farmers` |
| `/api/settings` | `POST` | Sets or updates keys in `App_Settings` |
| `/api/lands` | `POST` | Creates or updates land record, plus related soil & crop sheets |
| `/api/lands/:id` | `PUT` | Updates specific land properties |
| `/api/lands/:id` | `DELETE` | Removes land record from `Lands` |
| `/api/tasks` | `POST` | Adds new farming calendar task |
| `/api/tasks/:id/toggle` | `PUT` | Toggles task pending/completed status |
| `/api/tasks/:id` | `DELETE` | Deletes a task from `Tasks_Calendar` |
| `/api/expenses` | `POST` | Records a new expense in `Expenses` |
| `/api/expenses/:id` | `DELETE` | Removes an expense from `Expenses` |
| `/api/export/excel` | `GET` | Streams the active `FasalSetu_Data.xlsx` file for user download |
| `/api/ai/chat` | `POST` | Dynamic conversational AI engine with context memory & multi-turn support |

---

## 🤖 AI Kisan Mitra (Conversational Agricultural Intelligence)

AI Kisan Mitra is an intelligent, context-aware agricultural assistant specifically engineered for Indian farmers. It operates with a strict agriculture-only focus, ICAR/KVK advisory principles, and multi-turn conversational coreference resolution.

### 1. Key Capabilities
- **Universal Agricultural Understanding:** Answers dynamic questions regarding crops, soil health, seeds, NPK/fertilizers, pest & disease IPM, micro-irrigation, weather precautions, farm machinery, and government schemes.
- **Multilingual Support:** Understands Hindi (Devanagari), English, and natural Hinglish (Roman script Hindi) including spelling variations and vernacular terms.
- **Multi-Turn Contextual Memory:** Remembers previous conversation topics (e.g., following up with *"Iska solution kya hai?"* correctly references the crop and symptom discussed in prior turns).
- **Strict Agricultural Boundary:** Courteously redirects off-topic questions (e.g., movies, coding, cricket, politics) back to farming topics.
- **Formatted Typography:** Renders bold section headings, bulleted lists (`•`), and numbered instructions for high readability on mobile and desktop.

### 2. Dual-Engine Architecture
- **Cloud LLM Support:** Easily connect Google Gemini (`gemini-1.5-flash` / `gemini-2.0-flash`) or OpenAI models (`gpt-4o-mini`) simply by adding your key to `.env`:
  ```env
  GEMINI_API_KEY=your_gemini_api_key_here
  # OR
  OPENAI_API_KEY=your_openai_api_key_here
  ```
- **Built-in Agronomic AI Engine:** If no cloud API key is configured, the system automatically uses its local agronomic knowledge engine to provide dynamic, relevant, and scientifically grounded answers without failing or needing external connectivity.

---

> [!NOTE]
> **Single-User Prototype Notice**: This Excel-based backend is intended as a temporary local persistence mechanism for demonstrations, testing, and offline-capable single-user workflows. For multi-user concurrent production deployments, migrate the Express layer to a relational or document database (PostgreSQL / SQLite / MongoDB).

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Backend API (Terminal 1)
```bash
npm run server
```
*The Express API will run on `http://localhost:5000` and initialize `data/FasalSetu_Data.xlsx`.*

### 3. Start the Frontend Development Server (Terminal 2)
```bash
npm run dev
```
*Vite will start the client on `http://localhost:5173` and proxy `/api` requests to port 5000.*

### 4. Build for Production
```bash
npm run build
```

---

1. **Onboarding & Setup (6-Step Interactive Journey)**
   - **Step 1:** Splash screen with leaf logo, Indian farming artwork, and brand taglines.
   - **Step 2:** Language selection supporting 8 Indian languages (Hindi, English, Chhattisgarhi, Marathi, Tamil, Telugu, Bengali, Odia) with real bilingual Hindi & English UI.
   - **Step 3:** Authentication screen with Mobile Number and Email tabs, +91 selector, and Google login mock option.
   - **Step 4:** 6-digit OTP verification with auto-advance, backspace handling, 30s countdown, and visible demo code (`123456`).
   - **Step 5:** Farmer profile creation with photo avatar picker, location, village, district, and landholding.
   - **Step 6:** Farming scale selection (Small 0–5 acres, Mid 5–25 acres, Large >25 acres).

2. **Main Dashboard (Home)**
   - Top Header with leaf logo, district/location switcher, language toggle pill (हिं / ENG), and notification badge.
   - Real-time simulated Weather Card with temperature, humidity, wind, 5-day daily forecast, and agronomic advice.
   - Workspace Hero Banner ("अपनी जमीन, फसल और योजना यहाँ प्रबंधित करें") linking directly to farm management.
   - 8 Quick Action Cards for all agricultural services.
   - Agriculture News & Video Guides with category filters (Schemes, Advisory, Videos), search, bookmarking, and interactive article detail modal.

3. **My Farm Workspace (`/farm`)**
   - Overview KPI cards: Total acreage, active crops, pending tasks, and seasonal expenses.
   - Field parcels with soil type (Black, Alluvial, Red, etc.), irrigation source (Tube well, Canal, Drip), and crop variety.
   - Visual growth stage progress tracker (Sowing → Vegetative → Flowering → Grain Filling → Harvest Ready).
   - Add & Edit Farm modal and delete with confirmation dialog.

4. **AI Farming Mitra (`/ai-mitra`)**
   - Interactive chat assistant with user and AI speech bubbles.
   - Text input, photo upload preview for crop issues, and simulated voice input with speech-to-text.
   - Speech synthesis button to listen to advice aloud in Hindi/English.
   - Suggested quick prompt chips for instant answers.
   - Clear chat history and prominent AI Demo disclaimers.

5. **Crop Disease Detection AI (`/disease-detection`)**
   - Upload leaf photos or select pre-loaded diseased crop samples (Paddy BLB, Wheat Rust, Tomato Blight).
   - Simulated scanning radar animation.
   - Confidence score %, severity meter (Mild, Moderate, Severe), safe remedies, preventive measures, and KVK helpline info.
   - Analysis history saved to localStorage.

6. **Personalized Crop Calendar (`/calendar`)**
   - Weekly stage-wise farming tasks (Sowing, Irrigation, Fertilizer, Pest Control, Weeding, Harvest).
   - Priority badges (High, Medium, Low), status toggles (Pending / Completed), due dates, and weather-dependent tips.
   - Add and edit custom tasks.

7. **Mandi Price Intelligence (`/mandi`)**
   - Minimum, maximum, and modal (average) prices per quintal for Rice, Wheat, Soybean, Tomato, Maize, and Mustard.
   - 7-day price trend chart powered by **Recharts**.
   - Compare up to 3 mandis side-by-side.
   - Price threshold alert configuration.
   - Estimated Net Return & Transport Calculator (Yield × Price - Distance × Rate).

8. **Crop Expense & Profit Tracker (`/expenses`)**
   - Category-wise expense tracking (Seeds, Fertilizers, Labour, Irrigation, Machinery, Pesticides, Transport).
   - Interactive category breakdown Pie Chart with Recharts.
   - Harvest yield & market sale simulator for estimated net profit calculation.
   - Full expense history table with edit and delete capabilities.
   - **Export to CSV**: Generates and downloads a real CSV file of your expense records!

9. **Government Scheme Finder (`/schemes`)**
   - Central & state schemes (PM-KISAN, PMFBY Crop Insurance, PMKSY Micro Irrigation, PM KUSUM Solar Pump, Rajiv Gandhi Kisan Nyay).
   - Eligibility checklists, required documents checklist, application steps, and official portal links.
   - Bookmark schemes & Personal Application Status Tracker (Applied, Under Review, Approved, Disbursed).

10. **Farmer Community & Expert Help (`/community`)**
    - Q&A discussion feed with crop tags, likes, and comment threads.
    - Verified KVK Expert profiles with distinctive badges and authoritative answers.
    - "Ask a Question" modal with topic tag and image attachment.

11. **Weather & Krishi Alerts (`/alerts`)**
    - Severe weather warnings, pest outbreak alerts, and market advisories.
    - Read / unread status toggles and Clear Read Alerts.
    - Actionable "What to do immediately" advisory boxes.

12. **Khet Health Report (`/health-report`)**
    - Composite farm health score (89/100) with transparent calculation explanation.
    - Soil Health Card entry: Nitrogen (N), Phosphorus (P), Potash (K), pH, and Organic Carbon.
    - Historical crop yield comparison chart with Recharts (Farm vs District average).

13. **Profile, Settings, Help & Search**
    - **Profile (`/profile`):** View and edit farmer photo avatar, contact, village, district, and land area.
    - **Settings (`/settings`):** Language switcher, large text mode, voice guidance toggle, privacy policy, terms of service, logout, and "Reset All Demo Data".
    - **Help Center (`/help`):** FAQ accordion and national Kisan Call Center toll-free helpline (1800-180-1551).
    - **Global Search (`/search`):** Search crops, prices, schemes, and news in one place.

---

## 🛠️ Technology Stack

- **React 19** with **TypeScript**
- **Vite 8**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **React Router v7**
- **Lucide React** (Farmer & Agricultural Icons)
- **Recharts** (Interactive Trend Lines, Category Pie Charts, Yield Bar Charts)
- **HTML5 Web Speech API** (Voice input simulation & text-to-speech audio guidance)
- **LocalStorage API** (Persistent client-side state across browser refreshes)

---

## 🚀 How to Run Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

Open `http://localhost:5173` in your browser. All demo data is seeded automatically. You can explore or reset it anytime via Settings → Reset Demo Data.
