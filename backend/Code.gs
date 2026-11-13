/**
 * Wedding Gift & Expense Management - Google Apps Script Backend (Code.gs)
 * Database: Google Sheets
 */

// Target Spreadsheet ID configured specifically for the project
const SPREADSHEET_ID = '1hYuqL3CCHMCpjiV_x2UTIFzjOoC66GZsxW03NpafrU0';

// Helper to get active spreadsheet or open by ID
function getSpreadsheet() {
  // 1. Try opening via explicit SPREADSHEET_ID
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== '') {
    try {
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID.trim());
      if (ss) return ss;
    } catch (err) {
      Logger.log("openById error: " + err.message);
      // If bound to sheet, fallback to getActiveSpreadsheet
      try {
        const active = SpreadsheetApp.getActiveSpreadsheet();
        if (active) return active;
      } catch (e) {}
      throw new Error("មិនអាចបើក Google Sheet បានទេ (" + err.message + ")។ សូមពិនិត្យមើលថាគណនីរបស់អ្នកមានសិទ្ធិបើកមើល ឬកែប្រែ Google Sheet នេះ (ID: " + SPREADSHEET_ID + ")");
    }
  }

  // 2. Try active spreadsheet
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (err) {}

  throw new Error("Spreadsheet not found! សូមពិនិត្យមើល SPREADSHEET_ID ឬភ្ជាប់ Script នេះជាមួយ Google Sheet ដោយផ្ទាល់។");
}

// Name of sheets/tabs
const SHEETS = {
  USERS: 'Users',
  GIFTS: 'Gifts',
  EXPENSES: 'Expenses',
  LOCATIONS: 'Locations'
};

/**
 * Initialization function: Run this once inside Apps Script Editor to auto-create
 * sheets and necessary table headers.
 */
function setupDatabase() {
  const ss = getSpreadsheet();
  if (!ss) {
    throw new Error("Spreadsheet not found! Please attach this script to a Google Sheet (Extensions > Apps Script).");
  }

  // 1. Users Sheet
  let userSheet = ss.getSheetByName(SHEETS.USERS);
  if (!userSheet) {
    userSheet = ss.insertSheet(SHEETS.USERS);
    userSheet.appendRow(['id', 'username', 'password_hash', 'role']);
    // Default initial users (Husband & Wife) - default password: "123" (SHA-256 hashed)
    const defaultPasswordHash = hashPassword("123");
    userSheet.appendRow([Utilities.getUuid(), 'admin', defaultPasswordHash, 'Admin']);
    userSheet.appendRow([Utilities.getUuid(), 'wife', defaultPasswordHash, 'Admin']);
  }

  // 2. Gifts Sheet
  let giftSheet = ss.getSheetByName(SHEETS.GIFTS);
  if (!giftSheet) {
    giftSheet = ss.insertSheet(SHEETS.GIFTS);
    giftSheet.appendRow([
      'id', 'guest_name', 'gender', 'guest_side', 'relation', 'invite_method', 'amount', 'currency', 
      'status', 'province', 'district', 'commune', 'village', 'note', 'created_at'
    ]);
  } else {
    ensureGiftHeaders(giftSheet);
  }

  // 3. Expenses Sheet
  let expenseSheet = ss.getSheetByName(SHEETS.EXPENSES);
  if (!expenseSheet) {
    expenseSheet = ss.insertSheet(SHEETS.EXPENSES);
    expenseSheet.appendRow([
      'id', 'expense_name', 'total_amount', 'deposit', 'balance', 
      'currency', 'date', 'payment_method', 'note', 'created_at'
    ]);
  }

  // 4. Locations Sheet (with sample Cambodian provinces)
  let locSheet = ss.getSheetByName(SHEETS.LOCATIONS);
  if (!locSheet) {
    locSheet = ss.insertSheet(SHEETS.LOCATIONS);
    locSheet.appendRow(['id', 'parent_id', 'name_kh', 'type']);
    
    // Seed sample location data (Provinces)
    const sampleLocations = [
      ['LOC_P1', '', 'ភ្នំពេញ', 'Province'],
      ['LOC_P2', '', 'ពោធិ៍សាត់', 'Province'],
      ['LOC_P3', '', 'បាត់ដំបង', 'Province'],
      ['LOC_P4', '', 'សៀមរាប', 'Province'],
      ['LOC_P5', '', 'កណ្តាល', 'Province'],
      ['LOC_P6', '', 'កំពង់ចាម', 'Province'],
      // Sample Districts for Pursat
      ['LOC_D2_1', 'LOC_P2', 'ក្រុងពោធិ៍សាត់', 'District'],
      ['LOC_D2_2', 'LOC_P2', 'បាកាន', 'District'],
      ['LOC_D2_3', 'LOC_P2', 'ក្រគរ', 'District'],
      // Sample Districts for Phnom Penh
      ['LOC_D1_1', 'LOC_P1', 'ដូនពេញ', 'District'],
      ['LOC_D1_2', 'LOC_P1', 'ចំការមន', 'District'],
      ['LOC_D1_3', 'LOC_P1', 'ទួលគោក', 'District']
    ];
    sampleLocations.forEach(row => locSheet.appendRow(row));
  }

  return { success: true, message: "Database initialized successfully with default tables and users." };
}

/**
 * Handle HTTP GET Requests
 */
function doGet(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const action = e && e.parameter ? e.parameter.action : '';
    let result = {};

    switch (action) {
      case 'getGifts':
        result = { success: true, data: getAllRows(SHEETS.GIFTS) };
        break;

      case 'getExpenses':
        result = { success: true, data: getAllRows(SHEETS.EXPENSES) };
        break;

      case 'getLocations':
        result = { success: true, data: getAllRows(SHEETS.LOCATIONS) };
        break;

      case 'getSummary':
        result = { success: true, data: getDashboardSummary() };
        break;

      case 'setup':
        result = setupDatabase();
        break;

      default:
        result = { 
          success: true, 
          message: "Wedding App Backend API is active.", 
          endpoints: ["getGifts", "getExpenses", "getLocations", "getSummary"] 
        };
        break;
    }

    return createJsonResponse(result);
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Handle HTTP POST Requests
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action || (e && e.parameter ? e.parameter.action : '');
    let result = {};

    switch (action) {
      // 1. Authentication
      case 'login':
        result = handleLogin(payload.username, payload.password);
        break;

      // 2. Gifts Management
      case 'addGift':
        result = handleAddGift(payload);
        break;

      case 'updateGift':
        result = handleUpdateGift(payload);
        break;

      case 'deleteGift':
        result = handleDeleteGift(payload.id);
        break;

      // 3. Expenses Management
      case 'addExpense':
        result = handleAddExpense(payload);
        break;

      case 'updateExpense':
        result = handleUpdateExpense(payload);
        break;

      case 'deleteExpense':
        result = handleDeleteExpense(payload.id);
        break;

      // 4. Locations Management (from [+] modal)
      case 'addLocation':
        result = handleAddLocation(payload);
        break;

      // 5. User Security
      case 'changePassword':
        result = handleChangePassword(payload);
        break;

      default:
        result = { success: false, error: 'Invalid or missing action parameter: ' + action };
        break;
    }

    return createJsonResponse(result);
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

// ==========================================
// BUSINESS LOGIC & HANDLERS
// ==========================================

function handleLogin(username, password) {
  if (!username || !password) {
    return { success: false, message: "សូមបញ្ចូល Username និង Password!" };
  }

  const users = getAllRows(SHEETS.USERS);
  const hash = hashPassword(password);

  const matchedUser = users.find(u => 
    String(u.username).trim().toLowerCase() === String(username).trim().toLowerCase() && 
    (u.password_hash === hash || u.password_hash === password)
  );

  if (matchedUser) {
    return {
      success: true,
      message: "ចូលប្រព័ន្ធជោគជ័យ!",
      user: {
        id: matchedUser.id,
        username: matchedUser.username,
        role: matchedUser.role
      },
      token: Utilities.base64Encode(matchedUser.id + ':' + new Date().getTime())
    };
  }

  return { success: false, message: "Username ឬ Password មិនត្រឹមត្រូវទេ!" };
}

function handleChangePassword(payload) {
  const username = payload.username;
  const oldPassword = payload.old_password;
  const newPassword = payload.new_password;

  if (!username || !oldPassword || !newPassword) {
    return { success: false, message: "សូមបំពេញព័ត៌មានឱ្យបានគ្រប់ជ្រុងជ្រោយ!" };
  }

  if (String(newPassword).length < 3) {
    return { success: false, message: "លេខសម្ងាត់ថ្មីត្រូវមានយ៉ាងហោចណាស់ ៣ តួ!" };
  }

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.USERS);
  if (!sheet) {
    return { success: false, message: "រកមិនឃើញតារាង Users ក្នុង Google Sheets ទេ!" };
  }

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return { success: false, message: "មិនទាន់មានទិន្នន័យ User នៅឡើយទេ!" };
  }

  const headers = data[0];
  const userColIdx = headers.indexOf('username');
  const passColIdx = headers.indexOf('password_hash');

  if (userColIdx === -1 || passColIdx === -1) {
    return { success: false, message: "រចនាសម្ព័ន្ធតារាង Users មិនត្រឹមត្រូវ!" };
  }

  const oldHash = hashPassword(oldPassword);
  let matchedRowIndex = -1;

  for (let i = 1; i < data.length; i++) {
    const rowUser = String(data[i][userColIdx]).trim().toLowerCase();
    const rowPass = String(data[i][passColIdx]);
    if (rowUser === String(username).trim().toLowerCase()) {
      if (rowPass === oldHash || rowPass === oldPassword) {
        matchedRowIndex = i + 1; // 1-based index in sheet
        break;
      } else {
        return { success: false, message: "លេខសម្ងាត់ចាស់មិនត្រឹមត្រូវទេ!" };
      }
    }
  }

  if (matchedRowIndex === -1) {
    return { success: false, message: "រកមិនឃើញឈ្មោះគណនី " + username + " ទេ!" };
  }

  const newHash = hashPassword(newPassword);
  sheet.getRange(matchedRowIndex, passColIdx + 1).setValue(newHash);

  return { success: true, message: "ផ្លាស់ប្តូរលេខសម្ងាត់បានជោគជ័យ!" };
}

function ensureGiftHeaders(sheet) {
  try {
    const range = sheet.getDataRange();
    if (range.getNumRows() < 1) return;
    const headers = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
    const required = ['guest_side', 'invite_method'];
    let lastCol = sheet.getLastColumn();

    required.forEach(col => {
      if (headers.indexOf(col) === -1) {
        lastCol++;
        sheet.getRange(1, lastCol).setValue(col);
      }
    });
  } catch (e) {
    Logger.log("ensureGiftHeaders warning: " + e.message);
  }
}

function handleAddGift(data) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.GIFTS);
  if (!sheet) throw new Error("Gifts sheet not found.");

  ensureGiftHeaders(sheet);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const newId = 'GIFT_' + Utilities.getUuid().substring(0, 8);
  const createdAt = Utilities.formatDate(new Date(), "Asia/Phnom_Penh", "yyyy-MM-dd HH:mm:ss");

  const rowMap = {
    id: newId,
    guest_name: data.guest_name || '',
    gender: data.gender || 'ប្រុស',
    guest_side: data.guest_side || 'ខាងប្រុស',
    relation: data.relation || 'មិត្តភក្តិ',
    invite_method: data.invite_method || 'ផ្ទាល់',
    amount: Number(data.amount) || 0,
    currency: data.currency || 'USD',
    status: data.status || 'ជំពាក់ដៃយើង',
    province: data.province || '',
    district: data.district || '',
    commune: data.commune || '',
    village: data.village || '',
    note: data.note || '',
    created_at: createdAt
  };

  const newRow = headers.map(h => rowMap[h] !== undefined ? rowMap[h] : '');
  sheet.appendRow(newRow);
  return { success: true, message: "រក្សាទុកចំណងដៃបានជោគជ័យ!", id: newId, record: newRow };
}

function handleUpdateGift(data) {
  if (!data.id) return { success: false, message: "ID is required to update gift." };

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.GIFTS);
  ensureGiftHeaders(sheet);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const idIndex = headers.indexOf('id');

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][idIndex]) === String(data.id)) {
      const rowIndex = i + 1; // 1-based indexing for sheets

      // Mapping according to schema
      if (data.guest_name !== undefined && headers.indexOf('guest_name') !== -1) sheet.getRange(rowIndex, headers.indexOf('guest_name') + 1).setValue(data.guest_name);
      if (data.gender !== undefined && headers.indexOf('gender') !== -1) sheet.getRange(rowIndex, headers.indexOf('gender') + 1).setValue(data.gender);
      if (data.guest_side !== undefined && headers.indexOf('guest_side') !== -1) sheet.getRange(rowIndex, headers.indexOf('guest_side') + 1).setValue(data.guest_side);
      if (data.relation !== undefined && headers.indexOf('relation') !== -1) sheet.getRange(rowIndex, headers.indexOf('relation') + 1).setValue(data.relation);
      if (data.invite_method !== undefined && headers.indexOf('invite_method') !== -1) sheet.getRange(rowIndex, headers.indexOf('invite_method') + 1).setValue(data.invite_method);
      if (data.amount !== undefined && headers.indexOf('amount') !== -1) sheet.getRange(rowIndex, headers.indexOf('amount') + 1).setValue(Number(data.amount) || 0);
      if (data.currency !== undefined && headers.indexOf('currency') !== -1) sheet.getRange(rowIndex, headers.indexOf('currency') + 1).setValue(data.currency);
      if (data.status !== undefined && headers.indexOf('status') !== -1) sheet.getRange(rowIndex, headers.indexOf('status') + 1).setValue(data.status);
      if (data.province !== undefined && headers.indexOf('province') !== -1) sheet.getRange(rowIndex, headers.indexOf('province') + 1).setValue(data.province);
      if (data.district !== undefined && headers.indexOf('district') !== -1) sheet.getRange(rowIndex, headers.indexOf('district') + 1).setValue(data.district);
      if (data.commune !== undefined && headers.indexOf('commune') !== -1) sheet.getRange(rowIndex, headers.indexOf('commune') + 1).setValue(data.commune);
      if (data.village !== undefined && headers.indexOf('village') !== -1) sheet.getRange(rowIndex, headers.indexOf('village') + 1).setValue(data.village);
      if (data.note !== undefined && headers.indexOf('note') !== -1) sheet.getRange(rowIndex, headers.indexOf('note') + 1).setValue(data.note);

      return { success: true, message: "បានកែប្រែទិន្នន័យចំណងដៃជោគជ័យ!" };
    }
  }

  return { success: false, message: "រកមិនឃើញទិន្នន័យចំណងដៃដែលត្រូវកែប្រែទេ!" };
}

function handleDeleteGift(id) {
  if (!id) return { success: false, message: "Gift ID is required." };
  return deleteRowById(SHEETS.GIFTS, id);
}

function handleAddExpense(data) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.EXPENSES);
  if (!sheet) throw new Error("Expenses sheet not found.");

  const newId = 'EXP_' + Utilities.getUuid().substring(0, 8);
  const createdAt = Utilities.formatDate(new Date(), "Asia/Phnom_Penh", "yyyy-MM-dd HH:mm:ss");
  
  const totalAmount = Number(data.total_amount) || 0;
  const deposit = Number(data.deposit) || 0;
  const balance = totalAmount - deposit;

  const newRow = [
    newId,
    data.expense_name || '',
    totalAmount,
    deposit,
    balance,
    data.currency || 'USD',
    data.date || Utilities.formatDate(new Date(), "Asia/Phnom_Penh", "yyyy-MM-dd"),
    data.payment_method || 'សាច់ប្រាក់',
    data.note || '',
    createdAt
  ];

  sheet.appendRow(newRow);
  return { success: true, message: "រក្សាទុកការចំណាយបានជោគជ័យ!", id: newId, record: newRow };
}

function handleUpdateExpense(data) {
  if (!data.id) return { success: false, message: "Expense ID is required to update." };

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.EXPENSES);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const idIndex = headers.indexOf('id');

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][idIndex]) === String(data.id)) {
      const rowIndex = i + 1;

      let totalAmount = data.total_amount !== undefined ? Number(data.total_amount) : rows[i][headers.indexOf('total_amount')];
      let deposit = data.deposit !== undefined ? Number(data.deposit) : rows[i][headers.indexOf('deposit')];
      let balance = Number(totalAmount) - Number(deposit);

      if (data.expense_name !== undefined) sheet.getRange(rowIndex, headers.indexOf('expense_name') + 1).setValue(data.expense_name);
      sheet.getRange(rowIndex, headers.indexOf('total_amount') + 1).setValue(totalAmount);
      sheet.getRange(rowIndex, headers.indexOf('deposit') + 1).setValue(deposit);
      sheet.getRange(rowIndex, headers.indexOf('balance') + 1).setValue(balance);
      if (data.currency !== undefined) sheet.getRange(rowIndex, headers.indexOf('currency') + 1).setValue(data.currency);
      if (data.date !== undefined) sheet.getRange(rowIndex, headers.indexOf('date') + 1).setValue(data.date);
      if (data.payment_method !== undefined) sheet.getRange(rowIndex, headers.indexOf('payment_method') + 1).setValue(data.payment_method);
      if (data.note !== undefined) sheet.getRange(rowIndex, headers.indexOf('note') + 1).setValue(data.note);

      return { success: true, message: "បានកែប្រែទិន្នន័យចំណាយជោគជ័យ!" };
    }
  }

  return { success: false, message: "រកមិនឃើញទិន្នន័យចំណាយដែលត្រូវកែប្រែទេ!" };
}

function handleDeleteExpense(id) {
  if (!id) return { success: false, message: "Expense ID is required." };
  return deleteRowById(SHEETS.EXPENSES, id);
}

function handleAddLocation(data) {
  if (!data.name_kh || !data.type) {
    return { success: false, message: "ឈ្មោះទីតាំង និងប្រភេទទីតាំងជាទិន្នន័យចាំបាច់!" };
  }

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.LOCATIONS);
  if (!sheet) throw new Error("Locations sheet not found.");

  const newId = 'LOC_' + Utilities.getUuid().substring(0, 8);
  const newRow = [
    newId,
    data.parent_id || '',
    data.name_kh.trim(),
    data.type.trim()
  ];

  sheet.appendRow(newRow);
  return { 
    success: true, 
    message: "បន្ថែមទីតាំងថ្មីជោគជ័យ!", 
    data: { id: newId, parent_id: data.parent_id || '', name_kh: data.name_kh.trim(), type: data.type.trim() } 
  };
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function getAllRows(sheetName) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const headers = values[0];
  const results = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const rowObj = {};
    for (let j = 0; j < headers.length; j++) {
      rowObj[headers[j]] = row[j];
    }
    results.push(rowObj);
  }

  return results;
}

function deleteRowById(sheetName, id) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, message: "Sheet not found: " + sheetName };

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return { success: false, message: "No data to delete." };

  const headers = values[0];
  const idIndex = headers.indexOf('id');

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIndex]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { success: true, message: "លុបទិន្នន័យបានជោគជ័យ!" };
    }
  }

  return { success: false, message: "រកមិនឃើញទិន្នន័យដែលមាន ID នេះទេ!" };
}

function getDashboardSummary() {
  const gifts = getAllRows(SHEETS.GIFTS);
  const expenses = getAllRows(SHEETS.EXPENSES);

  let totalGiftsUSD = 0;
  let totalGiftsKHR = 0;
  let totalExpensesUSD = 0;
  let totalExpensesKHR = 0;
  let totalDepositUSD = 0;
  let totalDepositKHR = 0;

  gifts.forEach(g => {
    const amount = Number(g.amount) || 0;
    if (String(g.currency).toUpperCase() === 'USD' || String(g.currency) === '$') {
      totalGiftsUSD += amount;
    } else {
      totalGiftsKHR += amount;
    }
  });

  expenses.forEach(e => {
    const total = Number(e.total_amount) || 0;
    const dep = Number(e.deposit) || 0;
    if (String(e.currency).toUpperCase() === 'USD' || String(e.currency) === '$') {
      totalExpensesUSD += total;
      totalDepositUSD += dep;
    } else {
      totalExpensesKHR += total;
      totalDepositKHR += dep;
    }
  });

  return {
    gifts: {
      count: gifts.length,
      totalUSD: totalGiftsUSD,
      totalKHR: totalGiftsKHR
    },
    expenses: {
      count: expenses.length,
      totalUSD: totalExpensesUSD,
      totalKHR: totalExpensesKHR,
      depositUSD: totalDepositUSD,
      depositKHR: totalDepositKHR
    }
  };
}

function hashPassword(password) {
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(password), Utilities.Charset.UTF_8);
  let hashStr = '';
  for (let i = 0; i < rawHash.length; i++) {
    let byteVal = rawHash[i];
    if (byteVal < 0) byteVal += 256;
    let byteHex = byteVal.toString(16);
    if (byteHex.length === 1) byteHex = '0' + byteHex;
    hashStr += byteHex;
  }
  return hashStr;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

