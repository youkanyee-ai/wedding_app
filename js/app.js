/**
 * Wedding Gift & Expense Management - Frontend Logic (js/app.js)
 */

// Global Application State
const state = {
  apiUrl: localStorage.getItem('wedding_app_api_url') || 'https://script.google.com/macros/s/AKfycbwP4DvJEyBDOX3qMZsd-p-LSHDml65wwFMm5CS3yq4s6EwvdNjhaRp-t2mF7DgwNxmT/exec',
  user: JSON.parse(localStorage.getItem('wedding_user_session') || 'null'),
  gifts: [],
  expenses: [],
  locations: [],
  invitations: JSON.parse(localStorage.getItem('wedding_invitations') || '[]'),
  expenseCategories: [
    'ថ្លៃម្ហូបការ',
    'ថ្លៃរោងការ & តុ កៅអី',
    'ថ្លៃសំអាងការ & សម្លៀកបំពាក់',
    'ថ្លៃថតរូប & វីដេអូ',
    'ថ្លៃភ្លេងការ & ធុងបាស',
    'ថ្លៃភេសជ្ជៈ & ស្រាបៀរ',
    'ថ្លៃផ្លែឈើ & នំចំណី',
    'ថ្លៃផ្កាស្រស់ & ដេគ័រ',
    'ថ្លៃអាចារ្យ & ព្រះសង្ឃ',
    'ថ្លៃសំបុត្រការ',
    'ថ្លៃទីតាំង & សណ្ឋាគារ',
    'ចំណាយផ្សេងៗ'
  ],
  currentView: 'dashboard',
  editingGiftId: null,
  editingExpenseId: null,
  editingInvitationId: null,
  activeLocationTypeToAdd: 'Province'
};

// Seed Cambodian Administrative Data (Default fallback for seamless offline/initial cascading)
const SEED_LOCATIONS = [
  // Provinces
  { id: 'PROV_01', parent_id: '', name_kh: 'រាជធានីភ្នំពេញ', type: 'Province' },
  { id: 'PROV_02', parent_id: '', name_kh: 'ពោធិ៍សាត់', type: 'Province' },
  { id: 'PROV_03', parent_id: '', name_kh: 'បាត់ដំបង', type: 'Province' },
  { id: 'PROV_04', parent_id: '', name_kh: 'សៀមរាប', type: 'Province' },
  { id: 'PROV_05', parent_id: '', name_kh: 'កណ្តាល', type: 'Province' },
  { id: 'PROV_06', parent_id: '', name_kh: 'កំពង់ចាម', type: 'Province' },
  { id: 'PROV_07', parent_id: '', name_kh: 'កំពង់ធំ', type: 'Province' },
  { id: 'PROV_08', parent_id: '', name_kh: 'កំពង់ឆ្នាំង', type: 'Province' },
  { id: 'PROV_09', parent_id: '', name_kh: 'កំពង់ស្ពឺ', type: 'Province' },
  { id: 'PROV_10', parent_id: '', name_kh: 'តាកែវ', type: 'Province' },
  { id: 'PROV_11', parent_id: '', name_kh: 'កំពត', type: 'Province' },
  { id: 'PROV_12', parent_id: '', name_kh: 'កែប', type: 'Province' },
  { id: 'PROV_13', parent_id: '', name_kh: 'ព្រះសីហនុ', type: 'Province' },
  { id: 'PROV_14', parent_id: '', name_kh: 'កោះកុង', type: 'Province' },
  { id: 'PROV_15', parent_id: '', name_kh: 'ព្រៃវែង', type: 'Province' },
  { id: 'PROV_16', parent_id: '', name_kh: 'ស្វាយរៀង', type: 'Province' },
  { id: 'PROV_17', parent_id: '', name_kh: 'បន្ទាយមានជ័យ', type: 'Province' },
  { id: 'PROV_18', parent_id: '', name_kh: 'ឧត្តរមានជ័យ', type: 'Province' },
  { id: 'PROV_19', parent_id: '', name_kh: 'ព្រះវិហារ', type: 'Province' },
  { id: 'PROV_20', parent_id: '', name_kh: 'ស្ទឹងត្រែង', type: 'Province' },
  { id: 'PROV_21', parent_id: '', name_kh: 'ក្រចេះ', type: 'Province' },
  { id: 'PROV_22', parent_id: '', name_kh: 'រតនគិរី', type: 'Province' },
  { id: 'PROV_23', parent_id: '', name_kh: 'មណ្ឌលគិរី', type: 'Province' },
  { id: 'PROV_24', parent_id: '', name_kh: 'ប៉ៃលិន', type: 'Province' },
  { id: 'PROV_25', parent_id: '', name_kh: 'ត្បូងឃ្មុំ', type: 'Province' },

  // Districts for Pursat (ពោធិ៍សាត់)
  { id: 'DIST_02_01', parent_id: 'PROV_02', name_kh: 'ក្រុងពោធិ៍សាត់', type: 'District' },
  { id: 'DIST_02_02', parent_id: 'PROV_02', name_kh: 'បាកាន', type: 'District' },
  { id: 'DIST_02_03', parent_id: 'PROV_02', name_kh: 'ក្រគរ', type: 'District' },
  { id: 'DIST_02_04', parent_id: 'PROV_02', name_kh: 'ភ្នំក្រវាញ', type: 'District' },
  { id: 'DIST_02_05', parent_id: 'PROV_02', name_kh: 'វាលវែង', type: 'District' },
  { id: 'DIST_02_06', parent_id: 'PROV_02', name_kh: 'តាលោសែនជ័យ', type: 'District' },

  // Districts for Phnom Penh (រាជធានីភ្នំពេញ)
  { id: 'DIST_01_01', parent_id: 'PROV_01', name_kh: 'ដូនពេញ', type: 'District' },
  { id: 'DIST_01_02', parent_id: 'PROV_01', name_kh: 'ចំការមន', type: 'District' },
  { id: 'DIST_01_03', parent_id: 'PROV_01', name_kh: 'ទួលគោក', type: 'District' },
  { id: 'DIST_01_04', parent_id: 'PROV_01', name_kh: '៧មករា', type: 'District' },
  { id: 'DIST_01_05', parent_id: 'PROV_01', name_kh: 'សែនសុខ', type: 'District' },
  { id: 'DIST_01_06', parent_id: 'PROV_01', name_kh: 'មានជ័យ', type: 'District' },
  { id: 'DIST_01_07', parent_id: 'PROV_01', name_kh: 'ច្បារអំពៅ', type: 'District' },
  { id: 'DIST_01_08', parent_id: 'PROV_01', name_kh: 'ឫស្សីកែវ', type: 'District' },

  // Communes for Bakan (បាកាន - ពោធិ៍សាត់)
  { id: 'COM_02_02_01', parent_id: 'DIST_02_02', name_kh: 'ត្រពាំងជង', type: 'Commune' },
  { id: 'COM_02_02_02', parent_id: 'DIST_02_02', name_kh: 'បឹងបត់កណ្តោល', type: 'Commune' },
  { id: 'COM_02_02_03', parent_id: 'DIST_02_02', name_kh: 'រំលេច', type: 'Commune' },
  { id: 'COM_02_02_04', parent_id: 'DIST_02_02', name_kh: 'ស្វាយដូនកែវ', type: 'Commune' },

  // Villages for Trapeang Chong (ត្រពាំងជង)
  { id: 'VIL_01', parent_id: 'COM_02_02_01', name_kh: 'ភូមិត្រពាំងជង', type: 'Village' },
  { id: 'VIL_02', parent_id: 'COM_02_02_01', name_kh: 'ភូមិកោះវត្ត', type: 'Village' },
  { id: 'VIL_03', parent_id: 'COM_02_02_01', name_kh: 'ភូមិព្រៃក្តី', type: 'Village' }
];

// Document Ready Initialization
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  loadSavedCategories();
  initLocations();
  initEventListeners();
  loadSavedAvatar();
  checkAuth();
}

function initLocations() {
  const savedLocations = localStorage.getItem('wedding_custom_locations');
  if (savedLocations) {
    try {
      const parsed = JSON.parse(savedLocations);
      state.locations = [...SEED_LOCATIONS, ...parsed];
    } catch (e) {
      state.locations = [...SEED_LOCATIONS];
    }
  } else {
    state.locations = [...SEED_LOCATIONS];
  }
}

function loadSavedCategories() {
  const saved = localStorage.getItem('wedding_custom_categories');
  if (saved) {
    try {
      const list = JSON.parse(saved);
      state.expenseCategories = Array.from(new Set([...state.expenseCategories, ...list]));
    } catch (e) {}
  }
}

// ==========================================
// API & NETWORK HELPERS
// ==========================================

async function callBackend(action, method = 'GET', data = {}) {
  if (!state.apiUrl) {
    showToast('សូមកំណត់ Web App API URL នៅក្នុងការកំណត់ (Settings) ជាមុនសិន!', 'warning');
    openSettingsModal();
    return null;
  }

  showLoader(true);

  try {
    let url = state.apiUrl;
    let options = {
      method: method,
      mode: 'cors'
    };

    if (method === 'GET') {
      const queryParam = url.includes('?') ? `&action=${action}` : `?action=${action}`;
      url += queryParam;
    } else {
      // Use text/plain with JSON string to avoid CORS Preflight OPTIONS in Google Apps Script!
      options.headers = {
        'Content-Type': 'text/plain;charset=utf-8'
      };
      options.body = JSON.stringify({ action: action, ...data });
    }

    const response = await fetch(url, options);
    const result = await response.json();
    return result;
  } catch (err) {
    console.error('API Error:', err);
    showToast('កំហុសក្នុងការតភ្ជាប់ API: ' + (err.message || 'សូមពិនិត្យមើល URL និងសិទ្ធិ Access'), 'error');
    return null;
  } finally {
    showLoader(false);
  }
}

// ==========================================
// AUTHENTICATION
// ==========================================

function checkAuth() {
  const authContainer = document.getElementById('auth-container');
  const mainAppContainer = document.getElementById('main-app-container');
  const currentUserDisplay = document.getElementById('current-user-display');

  loadSavedAvatar();

  if (state.user && state.user.username) {
    if (authContainer) authContainer.classList.add('hidden');
    if (mainAppContainer) mainAppContainer.classList.remove('hidden');
    if (currentUserDisplay) currentUserDisplay.textContent = state.user.username;
    
    // Auto-fetch data if API URL is set
    if (state.apiUrl) {
      fetchAllData();
    } else {
      populateProvinces();
      populateExpenseCategories();
      renderDashboard();
    }
  } else {
    if (authContainer) authContainer.classList.remove('hidden');
    if (mainAppContainer) mainAppContainer.classList.add('hidden');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const usernameInput = document.getElementById('login-username').value.trim();
  const passwordInput = document.getElementById('login-password').value.trim();

  if (!usernameInput || !passwordInput) {
    showToast('សូមបញ្ចូល Username និង Password!', 'warning');
    return;
  }

  // If API URL is provided, call GAS backend
  if (state.apiUrl) {
    const res = await callBackend('login', 'POST', {
      username: usernameInput,
      password: passwordInput
    });

    if (res && res.success) {
      state.user = res.user;
      localStorage.setItem('wedding_user_session', JSON.stringify(res.user));
      showToast(res.message || 'ចូលប្រព័ន្ធបានជោគជ័យ!', 'success');
      checkAuth();
    } else {
      showToast(res ? res.message : 'ឈ្មោះគណនី ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ!', 'error');
    }
  } else {
    // Offline / Demo Fallback Mode
    if ((usernameInput === 'admin' || usernameInput === 'wife') && (passwordInput === '123' || passwordInput === 'admin')) {
      const demoUser = { id: 'DEMO_1', username: usernameInput, role: 'Admin' };
      state.user = demoUser;
      localStorage.setItem('wedding_user_session', JSON.stringify(demoUser));
      showToast('ចូលប្រព័ន្ធក្នុងទម្រង់ Offline Demo ជោគជ័យ!', 'success');
      checkAuth();
    } else {
      showToast('Username ឬ Password មិនត្រឹមត្រូវ! (គណនីសាកល្បង: admin / 123)', 'error');
    }
  }
}

// Custom Logout Confirmation Modal
function openLogoutModal() {
  const modal = document.getElementById('logout-confirm-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeLogoutModal() {
  const modal = document.getElementById('logout-confirm-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function confirmLogoutAction() {
  closeLogoutModal();
  state.user = null;
  localStorage.removeItem('wedding_user_session');
  checkAuth();
  showToast('បានចាកចេញពីប្រព័ន្ធដោយជោគជ័យ!', 'info');
}

function handleLogout() {
  openLogoutModal();
}

// ==========================================
// AVATAR & PHOTO UPLOAD
// ==========================================

function loadSavedAvatar() {
  const savedAvatar = localStorage.getItem('wedding_app_avatar');
  const imgEl = document.getElementById('login-avatar-img');
  const placeholderEl = document.getElementById('login-avatar-placeholder');
  const headerAvatarEl = document.getElementById('header-user-avatar');

  if (savedAvatar) {
    if (imgEl && placeholderEl) {
      imgEl.src = savedAvatar;
      imgEl.classList.remove('hidden');
      placeholderEl.classList.add('hidden');
    }
    if (headerAvatarEl) {
      headerAvatarEl.src = savedAvatar;
      headerAvatarEl.classList.remove('hidden');
    }
  } else {
    if (imgEl && placeholderEl) {
      imgEl.classList.add('hidden');
      placeholderEl.classList.remove('hidden');
    }
    if (headerAvatarEl) {
      headerAvatarEl.classList.add('hidden');
    }
  }
}

function handleAvatarUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('សូមជ្រើសរើសឯកសារជារូបភាព (JPG, PNG...)!', 'warning');
    return;
  }

  showLoader(true);
  const reader = new FileReader();
  reader.onload = function(e) {
    const rawDataUrl = e.target.result;
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const maxDim = 400;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      try {
        localStorage.setItem('wedding_app_avatar', optimizedDataUrl);
        loadSavedAvatar();
        showToast('បានដាក់រូបភាពជោគជ័យ!', 'success');
      } catch (storageErr) {
        showToast('ទំហំរូបភាពធំពេកសម្រាប់ផ្ទុកក្នុង Browser!', 'warning');
      } finally {
        showLoader(false);
      }
    };
    img.onerror = function() {
      showLoader(false);
      showToast('បរាជ័យក្នុងការផ្ទុករូបភាព!', 'error');
    };
    img.src = rawDataUrl;
  };
  reader.onerror = function() {
    showLoader(false);
    showToast('បរាជ័យក្នុងការអានឯកសារ!', 'error');
  };
  reader.readAsDataURL(file);
}

// ==========================================
// DATA SYNC & FETCHING
// ==========================================

async function fetchAllData() {
  if (!state.apiUrl) return;

  try {
    const [giftsRes, expRes, locRes, invRes] = await Promise.all([
      callBackend('getGifts', 'GET'),
      callBackend('getExpenses', 'GET'),
      callBackend('getLocations', 'GET'),
      callBackend('getInvitations', 'GET')
    ]);

    if (giftsRes && giftsRes.success) {
      state.gifts = giftsRes.data || [];
    }
    if (invRes && invRes.success && Array.isArray(invRes.data)) {
      state.invitations = invRes.data || [];
      localStorage.setItem('wedding_invitations', JSON.stringify(state.invitations));
    }
    if (expRes && expRes.success) {
      state.expenses = expRes.data || [];
      // Synchronize all categories from existing expenses
      state.expenses.forEach(e => {
        if (e.expense_name && typeof e.expense_name === 'string') {
          const trimmed = e.expense_name.trim();
          if (trimmed && !state.expenseCategories.includes(trimmed)) {
            state.expenseCategories.push(trimmed);
          }
        }
      });
    }
    if (locRes && locRes.success && Array.isArray(locRes.data) && locRes.data.length > 0) {
      // Merge with seed locations to avoid duplicates
      const fetchedLocations = locRes.data;
      const map = new Map();
      SEED_LOCATIONS.forEach(l => map.set(l.id, l));
      fetchedLocations.forEach(l => map.set(l.id, l));
      state.locations = Array.from(map.values());
    }

    populateProvinces();
    populateExpenseCategories();
    renderDashboard();
    renderInvitationsTable();
    renderGiftsTable();
    renderExpensesTable();
    showToast('ទាញយកទិន្នន័យពី Google Sheets ជោគជ័យ!', 'success');
  } catch (e) {
    console.error('Fetch all error:', e);
  }
}

// ==========================================
// CASCADING DROPDOWNS LOGIC (CRITICAL)
// ==========================================

function populateProvinces(selectedProvinceId = '') {
  const select = document.getElementById('gift-province');
  if (!select) return;

  const provinces = state.locations.filter(l => l.type === 'Province');
  select.innerHTML = '<option value="">-- ជ្រើសរើសខេត្ត/ក្រុង --</option>';

  provinces.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.dataset.name = p.name_kh;
    opt.textContent = p.name_kh;
    if (p.id === selectedProvinceId || p.name_kh === selectedProvinceId) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });

  // Reset children
  populateDistricts('');
}

function onProvinceChange() {
  const provinceSelect = document.getElementById('gift-province');
  const selectedProvinceId = provinceSelect ? provinceSelect.value : '';
  populateDistricts(selectedProvinceId);
}

function populateDistricts(provinceId, selectedDistrictId = '') {
  const select = document.getElementById('gift-district');
  if (!select) return;

  select.innerHTML = '<option value="">-- ជ្រើសរើសស្រុក/ខណ្ឌ --</option>';

  if (!provinceId) {
    populateCommunes('');
    return;
  }

  const districts = state.locations.filter(l => l.type === 'District' && l.parent_id === provinceId);
  districts.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d.id;
    opt.dataset.name = d.name_kh;
    opt.textContent = d.name_kh;
    if (d.id === selectedDistrictId || d.name_kh === selectedDistrictId) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });

  populateCommunes('');
}

function onDistrictChange() {
  const districtSelect = document.getElementById('gift-district');
  const selectedDistrictId = districtSelect ? districtSelect.value : '';
  populateCommunes(selectedDistrictId);
}

function populateCommunes(districtId, selectedCommuneId = '') {
  const select = document.getElementById('gift-commune');
  if (!select) return;

  select.innerHTML = '<option value="">-- ជ្រើសរើសឃុំ/សង្កាត់ --</option>';

  if (!districtId) {
    populateVillages('');
    return;
  }

  const communes = state.locations.filter(l => l.type === 'Commune' && l.parent_id === districtId);
  communes.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.dataset.name = c.name_kh;
    opt.textContent = c.name_kh;
    if (c.id === selectedCommuneId || c.name_kh === selectedCommuneId) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });

  populateVillages('');
}

function onCommuneChange() {
  const communeSelect = document.getElementById('gift-commune');
  const selectedCommuneId = communeSelect ? communeSelect.value : '';
  populateVillages(selectedCommuneId);
}

function populateVillages(communeId, selectedVillageId = '') {
  const select = document.getElementById('gift-village');
  if (!select) return;

  select.innerHTML = '<option value="">-- ជ្រើសរើសភូមិ --</option>';

  if (!communeId) return;

  const villages = state.locations.filter(l => l.type === 'Village' && l.parent_id === communeId);
  villages.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.id;
    opt.dataset.name = v.name_kh;
    opt.textContent = v.name_kh;
    if (v.id === selectedVillageId || v.name_kh === selectedVillageId) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });
}

// ==========================================
// [+] ADD LOCATION MODAL DYNAMICS
// ==========================================

function openAddLocationModal(type) {
  state.activeLocationTypeToAdd = type;
  const modal = document.getElementById('location-modal');
  const title = document.getElementById('location-modal-title');
  const typeSelect = document.getElementById('modal-loc-type');
  const parentContainer = document.getElementById('modal-loc-parent-container');
  const parentSelect = document.getElementById('modal-loc-parent');
  const nameInput = document.getElementById('modal-loc-name');

  if (nameInput) nameInput.value = '';
  if (typeSelect) typeSelect.value = type;

  // Title translation
  const typeNames = {
    'Province': 'ខេត្ត/ក្រុង',
    'District': 'ស្រុក/ខណ្ឌ',
    'Commune': 'ឃុំ/សង្កាត់',
    'Village': 'ភូមិ'
  };
  if (title) title.textContent = `[+] បន្ថែម ${typeNames[type] || type} ថ្មី`;

  // Handle Parent Selection
  if (type === 'Province') {
    parentContainer.classList.add('hidden');
  } else {
    parentContainer.classList.remove('hidden');
    parentSelect.innerHTML = '';

    let parentType = '';
    let currentSelectedParentId = '';

    if (type === 'District') {
      parentType = 'Province';
      currentSelectedParentId = document.getElementById('gift-province').value;
    } else if (type === 'Commune') {
      parentType = 'District';
      currentSelectedParentId = document.getElementById('gift-district').value;
    } else if (type === 'Village') {
      parentType = 'Commune';
      currentSelectedParentId = document.getElementById('gift-commune').value;
    }

    const availableParents = state.locations.filter(l => l.type === parentType);
    availableParents.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name_kh} (${p.type})`;
      if (p.id === currentSelectedParentId) opt.selected = true;
      parentSelect.appendChild(opt);
    });
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeLocationModal() {
  const modal = document.getElementById('location-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

async function handleSaveNewLocation(e) {
  e.preventDefault();
  const type = document.getElementById('modal-loc-type').value;
  const parentId = type === 'Province' ? '' : document.getElementById('modal-loc-parent').value;
  const nameKh = document.getElementById('modal-loc-name').value.trim();

  if (!nameKh) {
    showToast('សូមបញ្ចូលឈ្មោះទីតាំង!', 'warning');
    return;
  }

  if (type !== 'Province' && !parentId) {
    showToast('សូមជ្រើសរើសទីតាំងមេ (Parent Location)!', 'warning');
    return;
  }

  const newLocId = 'LOC_' + Date.now().toString().slice(-6);
  const newLocationObj = {
    id: newLocId,
    parent_id: parentId,
    name_kh: nameKh,
    type: type
  };

  // 1. Send to Backend if API connected
  if (state.apiUrl) {
    const res = await callBackend('addLocation', 'POST', newLocationObj);
    if (res && res.success) {
      if (res.data && res.data.id) newLocationObj.id = res.data.id;
    }
  }

  // 2. Add to active memory & LocalStorage
  state.locations.push(newLocationObj);
  const savedCustom = JSON.parse(localStorage.getItem('wedding_custom_locations') || '[]');
  savedCustom.push(newLocationObj);
  localStorage.setItem('wedding_custom_locations', JSON.stringify(savedCustom));

  showToast(`បានបន្ថែម ${nameKh} ជោគជ័យ!`, 'success');
  closeLocationModal();

  // 3. Refresh dropdowns and pre-select the newly added item
  if (type === 'Province') {
    populateProvinces(newLocationObj.id);
  } else if (type === 'District') {
    populateDistricts(parentId, newLocationObj.id);
  } else if (type === 'Commune') {
    populateCommunes(parentId, newLocationObj.id);
  } else if (type === 'Village') {
    populateVillages(parentId, newLocationObj.id);
  }
}

// ==========================================
// EXPENSE & AUTO-CALCULATION LOGIC
// ==========================================

function populateExpenseCategories(selectedCategory = '') {
  const select = document.getElementById('expense-name');
  if (!select) return;

  const trimmedSelected = (selectedCategory || '').trim();
  select.innerHTML = '<option value="">-- ជ្រើសរើសឈ្មោះចំណាយ --</option>';

  state.expenseCategories.forEach(cat => {
    const trimmedCat = (cat || '').trim();
    if (!trimmedCat) return;
    const opt = document.createElement('option');
    opt.value = trimmedCat;
    opt.textContent = trimmedCat;
    if (trimmedSelected && trimmedCat.toLowerCase() === trimmedSelected.toLowerCase()) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });

  // If selectedCategory is provided but was not in state.expenseCategories, add it dynamically
  if (trimmedSelected && !Array.from(select.options).some(o => o.value.toLowerCase() === trimmedSelected.toLowerCase())) {
    const customOpt = document.createElement('option');
    customOpt.value = trimmedSelected;
    customOpt.textContent = trimmedSelected;
    customOpt.selected = true;
    select.appendChild(customOpt);
  }
}

function openAddCategoryModal() {
  const modal = document.getElementById('category-modal');
  const input = document.getElementById('modal-category-name');
  if (input) input.value = '';
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => {
      if (input) input.focus();
    }, 50);
  }
}

function closeAddCategoryModal() {
  const modal = document.getElementById('category-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function handleSaveNewCategory(e) {
  e.preventDefault();
  const input = document.getElementById('modal-category-name');
  const newCat = input ? input.value.trim() : '';

  if (!newCat) {
    showToast('សូមបញ្ចូលឈ្មោះចំណាយ!', 'warning');
    return;
  }

  if (!state.expenseCategories.includes(newCat)) {
    state.expenseCategories.push(newCat);
    const saved = JSON.parse(localStorage.getItem('wedding_custom_categories') || '[]');
    saved.push(newCat);
    localStorage.setItem('wedding_custom_categories', JSON.stringify(saved));
    populateExpenseCategories(newCat);
    showToast(`បានបន្ថែមឈ្មោះចំណាយ "${newCat}" ជោគជ័យ!`, 'success');
  } else {
    populateExpenseCategories(newCat);
    showToast(`ឈ្មោះចំណាយ "${newCat}" មានរួចហើយ!`, 'info');
  }

  closeAddCategoryModal();
}

function updateExpenseBalanceCalculation() {
  const totalInput = document.getElementById('expense-total');
  const depositInput = document.getElementById('expense-deposit');
  const balanceInput = document.getElementById('expense-balance');

  const total = parseFloat(totalInput ? totalInput.value : 0) || 0;
  const deposit = parseFloat(depositInput ? depositInput.value : 0) || 0;
  const balance = total - deposit;

  if (balanceInput) {
    balanceInput.value = balance >= 0 ? balance : 0;
  }
}

function setExpensePaidInFull() {
  const totalInput = document.getElementById('expense-total');
  const depositInput = document.getElementById('expense-deposit');
  if (!totalInput || !depositInput) return;
  const total = parseFloat(totalInput.value) || 0;
  if (total <= 0) {
    showToast('សូមបញ្ចូលថ្លៃសរុប (Total Amount) ជាមុនសិន!', 'warning');
    totalInput.focus();
    return;
  }
  depositInput.value = total;
  updateExpenseBalanceCalculation();
  showToast('បានកំណត់បង់គ្រប់រួចរាល់! ប្រាក់នៅសល់ = 0', 'success');
}

// ==========================================
// FORM SUBMISSIONS (GIFTS & EXPENSES)
// ==========================================

async function handleGiftSubmit(e) {
  e.preventDefault();

  const guestName = document.getElementById('gift-guest-name').value.trim();
  const gender = document.getElementById('gift-gender').value;
  const guestSide = document.getElementById('gift-side').value;
  const relation = document.getElementById('gift-relation').value;
  const inviteMethod = document.getElementById('gift-invite-method').value;
  const amount = parseFloat(document.getElementById('gift-amount').value) || 0;
  const currency = document.getElementById('gift-currency').value;
  const status = document.getElementById('gift-status').value;

  const provSelect = document.getElementById('gift-province');
  const distSelect = document.getElementById('gift-district');
  const comSelect = document.getElementById('gift-commune');
  const vilSelect = document.getElementById('gift-village');

  const province = provSelect.selectedIndex > 0 ? provSelect.options[provSelect.selectedIndex].text : '';
  const district = distSelect.selectedIndex > 0 ? distSelect.options[distSelect.selectedIndex].text : '';
  const commune = comSelect.selectedIndex > 0 ? comSelect.options[comSelect.selectedIndex].text : '';
  const village = vilSelect.selectedIndex > 0 ? vilSelect.options[vilSelect.selectedIndex].text : '';
  const note = document.getElementById('gift-note').value.trim();

  if (!guestName) {
    showToast('សូមបញ្ចូលឈ្មោះភ្ញៀវ!', 'warning');
    return;
  }
  if (amount <= 0) {
    showToast('សូមបញ្ចូលចំនួនទឹកប្រាក់ដែលត្រឹមត្រូវ!', 'warning');
    return;
  }

  const giftData = {
    guest_name: guestName,
    gender: gender,
    guest_side: guestSide,
    relation: relation,
    invite_method: inviteMethod,
    amount: amount,
    currency: currency,
    status: status,
    province: province,
    district: district,
    commune: commune,
    village: village,
    note: note
  };

  if (state.editingGiftId) {
    // UPDATE OPERATION
    giftData.id = state.editingGiftId;
    if (state.apiUrl) {
      const res = await callBackend('updateGift', 'POST', giftData);
      if (res && res.success) {
        showToast(res.message || 'កែប្រែចំណងដៃជោគជ័យ!', 'success');
      }
    }
    // Update local state
    const index = state.gifts.findIndex(g => String(g.id) === String(state.editingGiftId));
    if (index !== -1) {
      state.gifts[index] = { ...state.gifts[index], ...giftData };
    }
    state.editingGiftId = null;
    const submitBtn = document.getElementById('gift-form-submit-btn');
    if (submitBtn) submitBtn.textContent = 'រក្សាទុកចំណងដៃ';
    const heading = document.getElementById('gift-form-heading');
    if (heading) heading.textContent = 'កត់ត្រាចំណងដៃ (Gift Entry Form)';
    const cancelBtn = document.getElementById('gift-cancel-edit-btn');
    if (cancelBtn) cancelBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> <span>ត្រឡប់ក្រោយ (Back)</span>';
  } else {
    // ADD NEW OPERATION
    if (state.apiUrl) {
      const res = await callBackend('addGift', 'POST', giftData);
      if (res && res.success) {
        giftData.id = res.id;
        showToast(res.message || 'រក្សាទុកចំណងដៃជោគជ័យ!', 'success');
      }
    } else {
      giftData.id = 'GIFT_' + Date.now();
      showToast('រក្សាទុកចំណងដៃក្នុងទម្រង់ Offline ជោគជ័យ!', 'success');
    }
    giftData.created_at = new Date().toLocaleString('km-KH');
    state.gifts.unshift(giftData);
  }

  resetGiftForm();
  renderDashboard();
  renderGiftsTable();
  switchView('gifts-table-view');
}

function resetGiftForm() {
  const form = document.getElementById('gift-form');
  if (form) form.reset();
  state.editingGiftId = null;
  const submitBtn = document.getElementById('gift-form-submit-btn');
  if (submitBtn) submitBtn.textContent = 'រក្សាទុកចំណងដៃ';
  const heading = document.getElementById('gift-form-heading');
  if (heading) heading.textContent = 'កត់ត្រាចំណងដៃ (Gift Entry Form)';
  const cancelBtn = document.getElementById('gift-cancel-edit-btn');
  if (cancelBtn) cancelBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> <span>ត្រឡប់ក្រោយ (Back)</span>';
  const sideEl = document.getElementById('gift-side');
  if (sideEl) sideEl.value = 'ខាងប្រុស';
  const relEl = document.getElementById('gift-relation');
  if (relEl) relEl.value = 'មិត្តភក្តិ';
  const invEl = document.getElementById('gift-invite-method');
  if (invEl) invEl.value = 'ផ្ទាល់';
  populateProvinces();
}

function cancelGiftEditAndBack() {
  resetGiftForm();
  switchView('gifts-table-view');
}

function editGift(id) {
  const gift = state.gifts.find(g => String(g.id) === String(id));
  if (!gift) return;

  state.editingGiftId = id;
  switchView('gift-entry-view');

  document.getElementById('gift-guest-name').value = gift.guest_name || '';
  document.getElementById('gift-gender').value = gift.gender || 'ប្រុស';
  const sideEl = document.getElementById('gift-side');
  if (sideEl) sideEl.value = gift.guest_side || 'ខាងប្រុស';
  const relEl = document.getElementById('gift-relation');
  if (relEl) relEl.value = gift.relation || 'មិត្តភក្តិ';
  const invEl = document.getElementById('gift-invite-method');
  if (invEl) invEl.value = gift.invite_method || 'ផ្ទាល់';
  document.getElementById('gift-amount').value = gift.amount || 0;
  document.getElementById('gift-currency').value = gift.currency || 'USD';
  document.getElementById('gift-status').value = gift.status || 'ជំពាក់ដៃយើង';
  document.getElementById('gift-note').value = gift.note || '';

  // Match locations
  const provObj = state.locations.find(l => l.type === 'Province' && l.name_kh === gift.province);
  if (provObj) {
    populateProvinces(provObj.id);
    const distObj = state.locations.find(l => l.type === 'District' && l.parent_id === provObj.id && l.name_kh === gift.district);
    if (distObj) {
      populateDistricts(provObj.id, distObj.id);
      const comObj = state.locations.find(l => l.type === 'Commune' && l.parent_id === distObj.id && l.name_kh === gift.commune);
      if (comObj) {
        populateCommunes(distObj.id, comObj.id);
        const vilObj = state.locations.find(l => l.type === 'Village' && l.parent_id === comObj.id && l.name_kh === gift.village);
        if (vilObj) {
          populateVillages(comObj.id, vilObj.id);
        }
      }
    }
  }

  const submitBtn = document.getElementById('gift-form-submit-btn');
  if (submitBtn) submitBtn.textContent = 'កែប្រែចំណងដៃ (Update)';
  const heading = document.getElementById('gift-form-heading');
  if (heading) heading.textContent = 'កែប្រែចំណងដៃ (Edit Gift)';
  const cancelBtn = document.getElementById('gift-cancel-edit-btn');
  if (cancelBtn) {
    cancelBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> <span>បោះបង់ការកែប្រែ (Cancel)</span>';
    cancelBtn.classList.remove('hidden');
  }
}

async function deleteGift(id) {
  if (!confirm('តើបងពិតជាចង់លុបទិន្នន័យចំណងដៃនេះមែនទេ?')) return;

  if (state.apiUrl) {
    const res = await callBackend('deleteGift', 'POST', { id: id });
    if (res && res.success) {
      showToast('លុបទិន្នន័យចំណងដៃជោគជ័យ!', 'success');
    }
  } else {
    showToast('លុបក្នុងទម្រង់ Offline ជោគជ័យ!', 'info');
  }

  state.gifts = state.gifts.filter(g => String(g.id) !== String(id));
  renderDashboard();
  renderGiftsTable();
}

async function handleExpenseSubmit(e) {
  e.preventDefault();

  const expenseName = document.getElementById('expense-name').value;
  const totalAmount = parseFloat(document.getElementById('expense-total').value) || 0;
  const deposit = parseFloat(document.getElementById('expense-deposit').value) || 0;
  const balance = totalAmount - deposit;
  const currency = document.getElementById('expense-currency').value;
  const date = document.getElementById('expense-date').value;
  const paymentMethod = document.getElementById('expense-payment-method').value;
  const note = document.getElementById('expense-note').value.trim();

  if (!expenseName) {
    showToast('សូមជ្រើសរើស ឬបញ្ចូលឈ្មោះចំណាយ!', 'warning');
    return;
  }
  if (totalAmount <= 0) {
    showToast('សូមបញ្ចូលថ្លៃសរុបឱ្យបានត្រឹមត្រូវ!', 'warning');
    return;
  }

  const expenseData = {
    expense_name: expenseName,
    total_amount: totalAmount,
    deposit: deposit,
    balance: balance,
    currency: currency,
    date: date,
    payment_method: paymentMethod,
    note: note
  };

  if (state.editingExpenseId) {
    expenseData.id = state.editingExpenseId;
    if (state.apiUrl) {
      const res = await callBackend('updateExpense', 'POST', expenseData);
      if (res && res.success) {
        showToast(res.message || 'កែប្រែការចំណាយជោគជ័យ!', 'success');
      }
    }
    const idx = state.expenses.findIndex(e => String(e.id) === String(state.editingExpenseId));
    if (idx !== -1) {
      state.expenses[idx] = { ...state.expenses[idx], ...expenseData };
    }
    state.editingExpenseId = null;
    const submitBtn = document.getElementById('expense-form-submit-btn');
    if (submitBtn) submitBtn.textContent = 'រក្សាទុកការចំណាយ';
    const heading = document.getElementById('expense-form-heading');
    if (heading) heading.textContent = 'កត់ត្រាការចំណាយ (Expense Entry Form)';
    const cancelBtn = document.getElementById('expense-cancel-edit-btn');
    if (cancelBtn) cancelBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> <span>ត្រឡប់ក្រោយ (Back)</span>';
  } else {
    if (state.apiUrl) {
      const res = await callBackend('addExpense', 'POST', expenseData);
      if (res && res.success) {
        expenseData.id = res.id;
        showToast(res.message || 'រក្សាទុកការចំណាយជោគជ័យ!', 'success');
      }
    } else {
      expenseData.id = 'EXP_' + Date.now();
      showToast('រក្សាទុកការចំណាយក្នុងទម្រង់ Offline ជោគជ័យ!', 'success');
    }
    expenseData.created_at = new Date().toLocaleString('km-KH');
    state.expenses.unshift(expenseData);
  }

  resetExpenseForm();
  renderDashboard();
  renderExpensesTable();
  switchView('expenses-table-view');
}

function resetExpenseForm() {
  const form = document.getElementById('expense-form');
  if (form) form.reset();
  state.editingExpenseId = null;
  const submitBtn = document.getElementById('expense-form-submit-btn');
  if (submitBtn) submitBtn.textContent = 'រក្សាទុកការចំណាយ';
  const heading = document.getElementById('expense-form-heading');
  if (heading) heading.textContent = 'កត់ត្រាការចំណាយ (Expense Entry Form)';
  const cancelBtn = document.getElementById('expense-cancel-edit-btn');
  if (cancelBtn) cancelBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> <span>ត្រឡប់ក្រោយ (Back)</span>';
  const dateInput = document.getElementById('expense-date');
  if (dateInput) dateInput.valueAsDate = new Date();
  populateExpenseCategories();
  updateExpenseBalanceCalculation();
}

function cancelExpenseEditAndBack() {
  resetExpenseForm();
  switchView('expenses-table-view');
}

function editExpense(id) {
  const expense = state.expenses.find(e => String(e.id) === String(id));
  if (!expense) return;

  state.editingExpenseId = id;
  switchView('expense-entry-view');

  const expName = expense.expense_name ? String(expense.expense_name).trim() : '';
  if (expName && !state.expenseCategories.includes(expName)) {
    state.expenseCategories.push(expName);
  }
  populateExpenseCategories(expName);

  const nameSelect = document.getElementById('expense-name');
  if (nameSelect) {
    nameSelect.value = expName;
    if (expName && nameSelect.value !== expName) {
      const opt = document.createElement('option');
      opt.value = expName;
      opt.textContent = expName;
      opt.selected = true;
      nameSelect.appendChild(opt);
      nameSelect.value = expName;
    }
  }

  document.getElementById('expense-total').value = expense.total_amount != null ? expense.total_amount : 0;
  document.getElementById('expense-deposit').value = expense.deposit != null ? expense.deposit : 0;
  document.getElementById('expense-balance').value = expense.balance != null ? expense.balance : 0;
  document.getElementById('expense-currency').value = expense.currency || 'USD';
  document.getElementById('expense-date').value = expense.date ? expense.date.substring(0, 10) : '';
  document.getElementById('expense-payment-method').value = expense.payment_method || 'សាច់ប្រាក់';
  document.getElementById('expense-note').value = expense.note || '';

  const submitBtn = document.getElementById('expense-form-submit-btn');
  if (submitBtn) submitBtn.textContent = 'កែប្រែការចំណាយ (Update)';

  const heading = document.getElementById('expense-form-heading');
  if (heading) heading.textContent = 'កែប្រែការចំណាយ (Edit Expense)';

  const cancelBtn = document.getElementById('expense-cancel-edit-btn');
  if (cancelBtn) {
    cancelBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> <span>បោះបង់ការកែប្រែ (Cancel)</span>';
    cancelBtn.classList.remove('hidden');
  }
}

async function deleteExpense(id) {
  if (!confirm('តើបងពិតជាចង់លុបទិន្នន័យចំណាយនេះមែនទេ?')) return;

  if (state.apiUrl) {
    const res = await callBackend('deleteExpense', 'POST', { id: id });
    if (res && res.success) {
      showToast('លុបទិន្នន័យចំណាយជោគជ័យ!', 'success');
    }
  } else {
    showToast('លុបក្នុងទម្រង់ Offline ជោគជ័យ!', 'info');
  }

  state.expenses = state.expenses.filter(e => String(e.id) !== String(id));
  renderDashboard();
  renderExpensesTable();
}

// ==========================================
// DASHBOARD & SUMMARY CALCULATIONS
// ==========================================

function renderDashboard() {
  let giftUSD = 0, giftKHR = 0;
  let expUSD = 0, expKHR = 0;
  let depositUSD = 0, depositKHR = 0;
  let dueUSD = 0, dueKHR = 0;

  state.gifts.forEach(g => {
    const val = parseFloat(g.amount) || 0;
    if (String(g.currency).toUpperCase() === 'USD' || String(g.currency) === '$') {
      giftUSD += val;
    } else {
      giftKHR += val;
    }
  });

  state.expenses.forEach(e => {
    const total = parseFloat(e.total_amount) || 0;
    const dep = parseFloat(e.deposit) || 0;
    const bal = parseFloat(e.balance != null ? e.balance : (total - dep)) || 0;

    if (String(e.currency).toUpperCase() === 'USD' || String(e.currency) === '$') {
      expUSD += total;
      depositUSD += dep;
      dueUSD += bal;
    } else {
      expKHR += total;
      depositKHR += dep;
      dueKHR += bal;
    }
  });

  const netUSD = giftUSD - expUSD;
  const netKHR = giftKHR - expKHR;

  // Format Display: Gifts Total
  const giftUsdEl = document.getElementById('dash-gift-usd');
  const giftKhrEl = document.getElementById('dash-gift-khr');
  const giftCountEl = document.getElementById('dash-gift-count');
  if (giftUsdEl) giftUsdEl.textContent = '$' + giftUSD.toLocaleString();
  if (giftKhrEl) giftKhrEl.textContent = giftKHR.toLocaleString() + ' ៛';
  if (giftCountEl) giftCountEl.textContent = state.gifts.length;

  // Expenses Total
  const expUsdEl = document.getElementById('dash-exp-usd');
  const expKhrEl = document.getElementById('dash-exp-khr');
  const expCountEl = document.getElementById('dash-exp-count');
  if (expUsdEl) expUsdEl.textContent = '$' + expUSD.toLocaleString();
  if (expKhrEl) expKhrEl.textContent = expKHR.toLocaleString() + ' ៛';
  if (expCountEl) expCountEl.textContent = state.expenses.length;

  // Total Paid (បានទូទាត់រួច - កក់ & បង់គ្រប់)
  const depUsdEl = document.getElementById('dash-deposit-usd');
  const depKhrEl = document.getElementById('dash-deposit-khr');
  if (depUsdEl) depUsdEl.textContent = '$' + depositUSD.toLocaleString();
  if (depKhrEl) depKhrEl.textContent = depositKHR.toLocaleString() + ' ៛';

  // Remaining Due to Vendors (នៅសល់ត្រូវសងគេ / នៅខ្វះ)
  const dueUsdEl = document.getElementById('dash-due-usd');
  const dueKhrEl = document.getElementById('dash-due-khr');
  if (dueUsdEl) dueUsdEl.textContent = '$' + dueUSD.toLocaleString();
  if (dueKhrEl) dueKhrEl.textContent = dueKHR.toLocaleString() + ' ៛';

  // Net Profit/Loss (តុល្យភាពសុទ្ធ: ចំណូលដកចំណាយ)
  const netUsdEl = document.getElementById('dash-net-usd');
  const netKhrEl = document.getElementById('dash-net-khr');

  if (netUsdEl) {
    netUsdEl.textContent = (netUSD >= 0 ? '+$' : '-$') + Math.abs(netUSD).toLocaleString();
    netUsdEl.className = netUSD >= 0 ? 'text-lg sm:text-2xl font-extrabold text-emerald-600' : 'text-lg sm:text-2xl font-extrabold text-rose-600';
  }

  if (netKhrEl) {
    netKhrEl.textContent = (netKHR >= 0 ? '+' : '-') + Math.abs(netKHR).toLocaleString() + ' ៛';
    netKhrEl.className = netKHR >= 0 ? 'text-xs sm:text-sm font-semibold text-emerald-600' : 'text-xs sm:text-sm font-semibold text-rose-600';
  }

  // Recent Gifts Preview (Desktop Table)
  const recentGiftsList = document.getElementById('dash-recent-gifts');
  if (recentGiftsList) {
    if (state.gifts.length === 0) {
      recentGiftsList.innerHTML = '<tr><td colspan="4" class="px-4 py-4 text-center text-gray-400">មិនទាន់មានទិន្នន័យចំណងដៃនៅឡើយទេ</td></tr>';
    } else {
      const recents = state.gifts.slice(0, 5);
      recentGiftsList.innerHTML = recents.map(g => `
        <tr class="border-b hover:bg-pink-50/50">
          <td class="px-4 py-3 font-medium text-gray-800">${escapeHtml(g.guest_name)}</td>
          <td class="px-4 py-3 text-sm text-gray-500">${escapeHtml(g.province || '—')}</td>
          <td class="px-4 py-3 font-semibold ${g.currency === 'USD' ? 'text-emerald-700' : 'text-amber-700'}">
            ${g.currency === 'USD' ? '$' : ''}${Number(g.amount).toLocaleString()}${g.currency === 'USD' ? '' : ' ៛'}
          </td>
          <td class="px-4 py-3">
            <span class="px-2 py-0.5 text-xs rounded-full ${getStatusBadgeClass(g.status)}">${escapeHtml(g.status || 'ជំពាក់ដៃយើង')}</span>
          </td>
        </tr>
      `).join('');
    }
  }

  // Recent Gifts Preview (Mobile List)
  const recentMobile = document.getElementById('dash-recent-gifts-mobile');
  if (recentMobile) {
    if (state.gifts.length === 0) {
      recentMobile.innerHTML = '<div class="py-4 text-center text-gray-400 text-xs">មិនទាន់មានទិន្នន័យចំណងដៃនៅឡើយទេ</div>';
    } else {
      const recents = state.gifts.slice(0, 5);
      recentMobile.innerHTML = recents.map(g => `
        <div class="py-2.5 px-1 flex items-center justify-between border-b border-gray-100 last:border-b-0 hover:bg-pink-50/30 transition">
          <div class="flex items-center gap-2.5 min-w-0 pr-2">
            <div class="w-8 h-8 rounded-full ${g.guest_side === 'ខាងស្រី' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'} flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
              ${escapeHtml((g.guest_name || 'ភ្').substring(0, 1))}
            </div>
            <div class="min-w-0">
              <div class="font-bold text-gray-900 text-xs sm:text-sm truncate">${escapeHtml(g.guest_name)}</div>
              <div class="text-[10px] text-gray-500 flex items-center gap-1 truncate mt-0.5">
                <i class="fa-solid fa-location-dot text-pink-500 text-[9px]"></i>
                <span class="truncate">${escapeHtml(g.province || '—')}</span>
                ${g.guest_side ? `<span class="text-gray-300">•</span><span class="${g.guest_side === 'ខាងស្រី' ? 'text-pink-600' : 'text-blue-600'} font-semibold">${escapeHtml(g.guest_side)}</span>` : ''}
              </div>
            </div>
          </div>
          <div class="text-right shrink-0">
            <div class="font-bold text-xs sm:text-sm ${g.currency === 'USD' ? 'text-emerald-600' : 'text-amber-600'} whitespace-nowrap">
              ${g.currency === 'USD' ? '+$' : '+'}${Number(g.amount).toLocaleString()}${g.currency === 'USD' ? '' : ' ៛'}
            </div>
            <span class="inline-block px-2 py-0.5 text-[9px] rounded-full font-medium ${getStatusBadgeClass(g.status)} mt-0.5 whitespace-nowrap">
              ${escapeHtml(g.status || 'ជំពាក់ដៃយើង')}
            </span>
          </div>
        </div>
      `).join('');
    }
  }
}

// ==========================================
// DATA TABLES RENDERING & FILTERS
// ==========================================

function renderGiftsTable() {
  const tbody = document.getElementById('gifts-table-body');
  if (!tbody) return;

  const searchQuery = (document.getElementById('gift-search-input')?.value || '').toLowerCase();
  const statusFilter = document.getElementById('gift-status-filter')?.value || 'all';
  const currencyFilter = document.getElementById('gift-currency-filter')?.value || 'all';
  const sideFilter = document.getElementById('gift-side-filter')?.value || 'all';

  const filtered = state.gifts.filter(g => {
    const matchName = String(g.guest_name || '').toLowerCase().includes(searchQuery) ||
                      String(g.province || '').toLowerCase().includes(searchQuery) ||
                      String(g.relation || '').toLowerCase().includes(searchQuery) ||
                      String(g.invite_method || '').toLowerCase().includes(searchQuery) ||
                      String(g.guest_side || '').toLowerCase().includes(searchQuery);
    const matchStatus = statusFilter === 'all' || g.status === statusFilter;
    const matchCurrency = currencyFilter === 'all' || g.currency === currencyFilter;
    const matchSide = sideFilter === 'all' || g.guest_side === sideFilter;
    return matchName && matchStatus && matchCurrency && matchSide;
  });

  document.getElementById('gift-filter-count').textContent = `បង្ហាញ ${filtered.length} នៃចំណងដៃសរុប ${state.gifts.length}`;

  const mobileList = document.getElementById('gifts-mobile-list');

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="px-4 py-8 text-center text-gray-400">មិនមានទិន្នន័យត្រូវនឹងការស្វែងរកទេ</td></tr>';
    if (mobileList) mobileList.innerHTML = '<div class="p-6 text-center text-gray-400 text-sm">មិនមានទិន្នន័យត្រូវនឹងការស្វែងរកទេ</div>';
    return;
  }

  // 1. Render Desktop Table Rows
  tbody.innerHTML = filtered.map((g, idx) => `
    <tr class="border-b hover:bg-pink-50/40 transition">
      <td class="px-4 py-3 text-sm text-gray-400">${idx + 1}</td>
      <td class="px-4 py-3">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="font-semibold text-gray-800">${escapeHtml(g.guest_name)}</span>
          <span class="px-2 py-0.5 text-[10px] rounded-full font-bold ${g.guest_side === 'ខាងស្រី' ? 'bg-pink-100 text-pink-700 border border-pink-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}">
            ${escapeHtml(g.guest_side || 'ខាងប្រុស')}
          </span>
        </div>
        <div class="text-xs text-gray-500 mt-0.5">
          ${escapeHtml(g.gender || '')} • ${escapeHtml(g.relation || 'ភ្ញៀវ')} • <span class="text-gray-400">តាម:</span> ${escapeHtml(g.invite_method || 'ផ្ទាល់')}
        </div>
      </td>
      <td class="px-4 py-3 font-bold ${g.currency === 'USD' ? 'text-emerald-700' : 'text-amber-700'}">
        ${g.currency === 'USD' ? '$' : ''}${Number(g.amount).toLocaleString()}${g.currency === 'USD' ? '' : ' ៛'}
      </td>
      <td class="px-4 py-3">
        <span class="px-2.5 py-1 text-xs rounded-full font-medium ${getStatusBadgeClass(g.status)}">
          ${escapeHtml(g.status || 'ជំពាក់ដៃយើង')}
        </span>
      </td>
      <td class="px-4 py-3 text-xs text-gray-600">
        ${[g.village, g.commune, g.district, g.province].filter(Boolean).join(', ') || '—'}
      </td>
      <td class="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">${escapeHtml(g.note || '—')}</td>
      <td class="px-4 py-3 text-xs text-gray-400">${g.created_at ? g.created_at.substring(0, 16) : '—'}</td>
      <td class="px-4 py-3 text-right space-x-1 whitespace-nowrap">
        <button onclick="editGift('${g.id}')" class="px-2.5 py-1 text-xs font-medium text-pink-700 bg-pink-100 hover:bg-pink-200 rounded-md transition" title="កែប្រែ">
          <i class="fa-solid fa-pen-to-square"></i> កែ
        </button>
        <button onclick="deleteGift('${g.id}')" class="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-md transition" title="លុប">
          <i class="fa-solid fa-trash-can"></i> លុប
        </button>
      </td>
    </tr>
  `).join('');

  // 2. Render Mobile Responsive Cards
  if (mobileList) {
    mobileList.innerHTML = filtered.map(g => `
      <div class="p-4 hover:bg-pink-50/30 transition border-b border-gray-100 last:border-b-0 space-y-2.5">
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-bold text-gray-900 text-base leading-tight">${escapeHtml(g.guest_name)}</span>
              <span class="px-2 py-0.5 text-[10px] rounded-full font-bold whitespace-nowrap ${g.guest_side === 'ខាងស្រី' ? 'bg-pink-100 text-pink-700 border border-pink-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}">
                ${escapeHtml(g.guest_side || 'ខាងប្រុស')}
              </span>
            </div>
            <div class="text-xs text-gray-500 mt-0.5">
              ${escapeHtml(g.gender || '')} • ${escapeHtml(g.relation || 'ភ្ញៀវ')} • <span class="text-gray-400">អញ្ជើញ:</span> ${escapeHtml(g.invite_method || 'ផ្ទាល់')}
            </div>
          </div>
          
          <div class="text-right whitespace-nowrap">
            <div class="text-lg font-extrabold ${g.currency === 'USD' ? 'text-emerald-700' : 'text-amber-700'}">
              ${g.currency === 'USD' ? '$' : ''}${Number(g.amount).toLocaleString()}${g.currency === 'USD' ? '' : ' ៛'}
            </div>
            <span class="inline-block px-2 py-0.5 text-[11px] rounded-full font-medium ${getStatusBadgeClass(g.status)} mt-0.5">
              ${escapeHtml(g.status || 'ជំពាក់ដៃយើង')}
            </span>
          </div>
        </div>

        ${(g.province || g.district || g.commune || g.village || g.note) ? `
          <div class="text-xs text-gray-600 bg-pink-50/40 p-2.5 rounded-xl border border-pink-100/50 space-y-1">
            ${(g.province || g.district || g.commune || g.village) ? `
              <div class="flex items-center gap-1.5 text-gray-700">
                <i class="fa-solid fa-location-dot text-pink-500 text-[11px]"></i>
                <span>${[g.village, g.commune, g.district, g.province].filter(Boolean).join(', ')}</span>
              </div>
            ` : ''}
            ${g.note ? `
              <div class="flex items-start gap-1.5 text-gray-500">
                <i class="fa-regular fa-comment-dots text-gray-400 text-[11px] mt-0.5"></i>
                <span class="italic">${escapeHtml(g.note)}</span>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <div class="flex items-center justify-between pt-1 text-xs text-gray-400">
          <span class="text-[11px]">${g.created_at ? g.created_at.substring(0, 16) : ''}</span>
          <div class="flex items-center gap-2">
            <button onclick="editGift('${g.id}')" class="px-3 py-1.5 text-xs font-semibold text-pink-700 bg-pink-50 hover:bg-pink-100 rounded-lg transition flex items-center gap-1">
              <i class="fa-solid fa-pen-to-square"></i> កែប្រែ
            </button>
            <button onclick="deleteGift('${g.id}')" class="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition flex items-center gap-1">
              <i class="fa-solid fa-trash-can"></i> លុប
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }
}

function renderExpensesTable() {
  const tbody = document.getElementById('expenses-table-body');
  if (!tbody) return;

  const searchQuery = (document.getElementById('expense-search-input')?.value || '').toLowerCase();
  const paymentFilter = document.getElementById('expense-payment-filter')?.value || 'all';
  const statusFilter = document.getElementById('expense-status-filter')?.value || 'all';

  const filtered = state.expenses.filter(e => {
    const matchName = String(e.expense_name || '').toLowerCase().includes(searchQuery) ||
                      String(e.note || '').toLowerCase().includes(searchQuery);
    const matchPayment = paymentFilter === 'all' || e.payment_method === paymentFilter;

    const total = parseFloat(e.total_amount) || 0;
    const deposit = parseFloat(e.deposit) || 0;
    const balance = parseFloat(e.balance != null ? e.balance : (total - deposit)) || 0;

    let matchStatus = true;
    if (statusFilter === 'paid') {
      matchStatus = balance <= 0 && total > 0;
    } else if (statusFilter === 'partial') {
      matchStatus = deposit > 0 && balance > 0;
    } else if (statusFilter === 'unpaid') {
      matchStatus = deposit <= 0 && total > 0;
    }

    return matchName && matchPayment && matchStatus;
  });

  document.getElementById('expense-filter-count').textContent = `បង្ហាញ ${filtered.length} នៃចំណាយសរុប ${state.expenses.length}`;

  const expMobileList = document.getElementById('expenses-mobile-list');

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="px-4 py-8 text-center text-gray-400">មិនមានទិន្នន័យចំណាយត្រូវនឹងការស្វែងរកទេ</td></tr>';
    if (expMobileList) expMobileList.innerHTML = '<div class="p-6 text-center text-gray-400 text-sm">មិនមានទិន្នន័យចំណាយត្រូវនឹងការស្វែងរកទេ</div>';
    return;
  }

  // 1. Desktop Table Rows
  tbody.innerHTML = filtered.map((e, idx) => {
    const total = parseFloat(e.total_amount) || 0;
    const deposit = parseFloat(e.deposit) || 0;
    const balance = parseFloat(e.balance != null ? e.balance : (total - deposit)) || 0;
    const currSym = e.currency === 'USD' ? '$' : '';
    const currPost = e.currency === 'USD' ? '' : ' ៛';

    let statusHtml = '';
    if (balance <= 0 && total > 0) {
      statusHtml = '<span class="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1"><i class="fa-solid fa-check text-[10px]"></i> បង់គ្រប់</span>';
    } else if (deposit > 0 && balance > 0) {
      statusHtml = '<span class="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1"><i class="fa-solid fa-clock text-[10px]"></i> កក់ខ្លះ</span>';
    } else {
      statusHtml = '<span class="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1"><i class="fa-solid fa-circle-exclamation text-[10px]"></i> មិនទាន់បង់</span>';
    }

    return `
    <tr class="border-b hover:bg-amber-50/40 transition">
      <td class="px-4 py-3 text-sm text-gray-400">${idx + 1}</td>
      <td class="px-4 py-3 font-semibold text-gray-800">${escapeHtml(e.expense_name)}</td>
      <td class="px-4 py-3 font-bold text-gray-900">
        ${currSym}${Number(total).toLocaleString()}${currPost}
      </td>
      <td class="px-4 py-3 text-blue-700 font-semibold">
        ${currSym}${Number(deposit).toLocaleString()}${currPost}
      </td>
      <td class="px-4 py-3 font-bold ${balance > 0 ? 'text-rose-600' : 'text-emerald-600'}">
        ${currSym}${Number(balance).toLocaleString()}${currPost}
      </td>
      <td class="px-4 py-3 text-center whitespace-nowrap">
        ${statusHtml}
      </td>
      <td class="px-4 py-3 text-xs">
        <span class="px-2 py-0.5 rounded bg-gray-100 text-gray-700">${escapeHtml(e.payment_method || 'សាច់ប្រាក់')}</span>
      </td>
      <td class="px-4 py-3 text-xs text-gray-500">${e.date ? e.date.substring(0, 10) : '—'}</td>
      <td class="px-4 py-3 text-right space-x-1 whitespace-nowrap">
        <button onclick="editExpense('${e.id}')" class="px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-md transition cursor-pointer" title="កែប្រែ">
          <i class="fa-solid fa-pen-to-square"></i> កែ
        </button>
        <button onclick="deleteExpense('${e.id}')" class="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-md transition cursor-pointer" title="លុប">
          <i class="fa-solid fa-trash-can"></i> លុប
        </button>
      </td>
    </tr>
    `;
  }).join('');

  // 2. Mobile Responsive Cards
  if (expMobileList) {
    expMobileList.innerHTML = filtered.map(e => {
      const total = parseFloat(e.total_amount) || 0;
      const deposit = parseFloat(e.deposit) || 0;
      const balance = parseFloat(e.balance != null ? e.balance : (total - deposit)) || 0;
      const currSym = e.currency === 'USD' ? '$' : '';
      const currPost = e.currency === 'USD' ? '' : ' ៛';

      let statusBadge = '';
      if (balance <= 0 && total > 0) {
        statusBadge = '<span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1"><i class="fa-solid fa-check text-[9px]"></i> បង់គ្រប់</span>';
      } else if (deposit > 0 && balance > 0) {
        statusBadge = '<span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1"><i class="fa-solid fa-clock text-[9px]"></i> កក់ខ្លះ</span>';
      } else {
        statusBadge = '<span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1"><i class="fa-solid fa-circle-exclamation text-[9px]"></i> មិនទាន់បង់</span>';
      }

      return `
      <div class="p-4 hover:bg-amber-50/30 transition border-b border-gray-100 last:border-b-0 space-y-2.5">
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-bold text-gray-900 text-base leading-tight">${escapeHtml(e.expense_name)}</span>
              ${statusBadge}
            </div>
            <div class="text-xs text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
              <span class="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">${escapeHtml(e.payment_method || 'សាច់ប្រាក់')}</span>
              ${e.date ? `<span class="text-gray-400">📅 ${e.date.substring(0, 10)}</span>` : ''}
            </div>
          </div>
          <div class="text-right whitespace-nowrap">
            <div class="text-lg font-extrabold text-gray-900">
              ${currSym}${Number(total).toLocaleString()}${currPost}
            </div>
            <div class="text-xs font-semibold text-blue-700 mt-0.5">
              បានបង់: ${currSym}${Number(deposit).toLocaleString()}${currPost}
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between text-xs p-2.5 rounded-xl border ${balance <= 0 ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800' : 'bg-amber-50/70 border-amber-200 text-amber-900'}">
          <span class="font-medium">ប្រាក់នៅសល់ត្រូវទូទាត់:</span>
          <span class="font-bold text-sm ${balance > 0 ? 'text-rose-600' : 'text-emerald-700'}">
            ${currSym}${Number(balance).toLocaleString()}${currPost} ${balance <= 0 ? '(រួចរាល់)' : ''}
          </span>
        </div>

        ${e.note ? `
          <div class="text-xs text-gray-500 italic px-1">
            ចំណាំ: ${escapeHtml(e.note)}
          </div>
        ` : ''}

        <div class="flex items-center justify-end gap-2 pt-1">
          <button onclick="editExpense('${e.id}')" class="px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition flex items-center gap-1 cursor-pointer">
            <i class="fa-solid fa-pen-to-square"></i> កែប្រែ
          </button>
          <button onclick="deleteExpense('${e.id}')" class="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition flex items-center gap-1 cursor-pointer">
            <i class="fa-solid fa-trash-can"></i> លុប
          </button>
        </div>
      </div>
      `;
    }).join('');
  }
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'ជំពាក់ដៃយើង':
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    case 'ជំពាក់គេ':
      return 'bg-amber-100 text-amber-800 border border-amber-200';
    case 'សងដៃរួច':
      return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// ==========================================
// INVITATIONS (ភ្ញៀវត្រៀមហៅ & RSVP) LOGIC
// ==========================================

function renderInvitationsTable() {
  const tbody = document.getElementById('invitations-table-body');
  if (!tbody) return;

  const searchQuery = (document.getElementById('inv-search-input')?.value || '').toLowerCase();
  const statusFilter = document.getElementById('inv-status-filter')?.value || 'all';
  const viaFilter = document.getElementById('inv-via-filter')?.value || 'all';
  const debtFilter = document.getElementById('inv-debt-filter')?.value || 'all';

  // Calculate summary metrics
  const totalCount = state.invitations.length;
  const oweMeCount = state.invitations.filter(i => (i.debt_status || '') === 'ជំពាក់ដៃខ្ញុំ').length;
  const seenCount = state.invitations.filter(i => (i.response_status || '') === 'ចូលមើល').length;
  const seenNoReplyCount = state.invitations.filter(i => (i.response_status || '') === 'ចូលមើលហើយមិនតប').length;
  const unseenCount = state.invitations.filter(i => (i.response_status || '') === 'មិនចូលមើល').length;

  const totalEl = document.getElementById('inv-count-total');
  const oweMeEl = document.getElementById('inv-count-owe-me');
  const seenEl = document.getElementById('inv-count-seen');
  const seenNoReplyEl = document.getElementById('inv-count-seen-no-reply');
  const unseenEl = document.getElementById('inv-count-unseen');

  if (totalEl) totalEl.textContent = totalCount;
  if (oweMeEl) oweMeEl.textContent = oweMeCount;
  if (seenEl) seenEl.textContent = seenCount;
  if (seenNoReplyEl) seenNoReplyEl.textContent = seenNoReplyCount;
  if (unseenEl) unseenEl.textContent = unseenCount;

  // Filter list
  const filtered = state.invitations.filter(i => {
    const matchSearch = String(i.guest_name || '').toLowerCase().includes(searchQuery) ||
                        String(i.address || '').toLowerCase().includes(searchQuery) ||
                        String(i.note || '').toLowerCase().includes(searchQuery);
    const matchStatus = statusFilter === 'all' || (i.response_status || '') === statusFilter;
    const matchVia = viaFilter === 'all' || (i.invite_via || '') === viaFilter;
    const matchDebt = debtFilter === 'all' || (i.debt_status || '') === debtFilter;

    return matchSearch && matchStatus && matchVia && matchDebt;
  });

  const countEl = document.getElementById('inv-filter-count');
  if (countEl) countEl.textContent = `បង្ហាញ ${filtered.length} នៃភ្ញៀវសរុប ${totalCount}`;

  const mobileList = document.getElementById('invitations-mobile-list');

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="px-4 py-8 text-center text-gray-400">មិនទាន់មានទិន្នន័យភ្ញៀវត្រៀមហៅនៅឡើយទេ</td></tr>';
    if (mobileList) mobileList.innerHTML = '<div class="p-6 text-center text-gray-400 text-sm">មិនទាន់មានទិន្នន័យភ្ញៀវត្រៀមហៅនៅឡើយទេ</div>';
    return;
  }

  // 1. Desktop Rows
  tbody.innerHTML = filtered.map((inv, idx) => `
    <tr class="border-b hover:bg-pink-50/30 transition">
      <td class="px-4 py-3 text-sm text-gray-400">${idx + 1}</td>
      <td class="px-4 py-3 font-bold text-gray-900">${escapeHtml(inv.guest_name)}</td>
      <td class="px-4 py-3 text-xs text-gray-600">${escapeHtml(inv.address || '—')}</td>
      <td class="px-4 py-3 text-center whitespace-nowrap">
        ${getInvDebtBadge(inv.debt_status)}
      </td>
      <td class="px-4 py-3 text-center whitespace-nowrap">
        ${getInvViaBadge(inv.invite_via)}
      </td>
      <td class="px-4 py-3 text-center whitespace-nowrap">
        ${getInvResponseDropdown(inv.id, inv.response_status)}
      </td>
      <td class="px-4 py-3 text-xs text-gray-500 max-w-xs truncate" title="${escapeHtml(inv.note || '')}">${escapeHtml(inv.note || '—')}</td>
      <td class="px-4 py-3 text-right space-x-1 whitespace-nowrap">
        <button onclick="convertInvitationToGift('${inv.id}')" class="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-md transition cursor-pointer" title="កត់ចំណងដៃ">
          <i class="fa-solid fa-gift"></i> ចងដៃ
        </button>
        <button onclick="editInvitation('${inv.id}')" class="px-2.5 py-1 text-xs font-medium text-pink-700 bg-pink-100 hover:bg-pink-200 rounded-md transition cursor-pointer" title="កែប្រែ">
          <i class="fa-solid fa-pen-to-square"></i> កែ
        </button>
        <button onclick="deleteInvitation('${inv.id}')" class="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-md transition cursor-pointer" title="លុប">
          <i class="fa-solid fa-trash-can"></i> លុប
        </button>
      </td>
    </tr>
  `).join('');

  // 2. Mobile Cards
  if (mobileList) {
    mobileList.innerHTML = filtered.map(inv => `
      <div class="p-4 hover:bg-pink-50/20 transition border-b border-gray-100 last:border-b-0 space-y-2.5">
        <div class="flex items-start justify-between gap-2">
          <div>
            <div class="font-bold text-gray-900 text-base leading-tight">${escapeHtml(inv.guest_name)}</div>
            <div class="text-xs text-gray-500 mt-1 flex items-center gap-1.5 flex-wrap">
              <span>📍 ${escapeHtml(inv.address || 'មិនកំណត់ទីតាំង')}</span>
            </div>
          </div>
          <div>
            ${getInvDebtBadge(inv.debt_status)}
          </div>
        </div>

        <div class="flex items-center justify-between gap-2 pt-1 border-t border-gray-50 text-xs">
          <div>
            ${getInvViaBadge(inv.invite_via)}
          </div>
          <div>
            ${getInvResponseDropdown(inv.id, inv.response_status)}
          </div>
        </div>

        ${inv.note ? `
          <div class="text-xs text-gray-500 italic bg-gray-50 p-2 rounded-lg">
            ចំណាំ: ${escapeHtml(inv.note)}
          </div>
        ` : ''}

        <div class="flex items-center justify-end gap-2 pt-1">
          <button onclick="convertInvitationToGift('${inv.id}')" class="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition flex items-center gap-1 cursor-pointer">
            <i class="fa-solid fa-gift"></i> ចងដៃ
          </button>
          <button onclick="editInvitation('${inv.id}')" class="px-3 py-1.5 text-xs font-semibold text-pink-700 bg-pink-50 hover:bg-pink-100 rounded-lg transition flex items-center gap-1 cursor-pointer">
            <i class="fa-solid fa-pen-to-square"></i> កែប្រែ
          </button>
          <button onclick="deleteInvitation('${inv.id}')" class="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition flex items-center gap-1 cursor-pointer">
            <i class="fa-solid fa-trash-can"></i> លុប
          </button>
        </div>
      </div>
    `).join('');
  }
}

function getInvDebtBadge(status) {
  switch (status) {
    case 'ជំពាក់ដៃខ្ញុំ':
      return '<span class="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 inline-block">ជំពាក់ដៃខ្ញុំ</span>';
    case 'ជំពាក់គេ':
      return '<span class="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200 inline-block">ជំពាក់គេ</span>';
    default:
      return '<span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 inline-block">ភ្ញៀវទូទៅ</span>';
  }
}

function getInvViaBadge(via) {
  switch (via) {
    case 'Facebook':
      return '<span class="px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1"><i class="fa-brands fa-facebook"></i> Facebook</span>';
    case 'Telegram':
      return '<span class="px-2 py-0.5 text-xs font-semibold rounded-md bg-sky-50 text-sky-700 border border-sky-200 inline-flex items-center gap-1"><i class="fa-brands fa-telegram"></i> Telegram</span>';
    case 'LINE':
      return '<span class="px-2 py-0.5 text-xs font-semibold rounded-md bg-green-50 text-green-700 border border-green-200 inline-flex items-center gap-1"><i class="fa-brands fa-line"></i> LINE</span>';
    case 'ទូរស័ព្ទ':
      return '<span class="px-2 py-0.5 text-xs font-semibold rounded-md bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1"><i class="fa-solid fa-phone"></i> ទូរស័ព្ទ</span>';
    case 'ផ្ទាល់':
      return '<span class="px-2 py-0.5 text-xs font-semibold rounded-md bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1"><i class="fa-solid fa-envelope"></i> ផ្ទាល់</span>';
    default:
      return `<span class="px-2 py-0.5 text-xs font-semibold rounded-md bg-gray-100 text-gray-700 border border-gray-200">${escapeHtml(via || 'ផ្សេងៗ')}</span>`;
  }
}

function getInvResponseDropdown(id, currentStatus) {
  const status = currentStatus || 'មិនទាន់ផ្ញើ';
  let colorClass = 'bg-gray-50 border-gray-200 text-gray-700';

  if (status === 'ចូលមើល') {
    colorClass = 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold';
  } else if (status === 'មិនចូលមើល') {
    colorClass = 'bg-rose-50 border-rose-300 text-rose-800 font-bold';
  } else if (status === 'ចូលមើលហើយមិនតប') {
    colorClass = 'bg-amber-50 border-amber-300 text-amber-800 font-bold';
  } else if (status === 'បានតប/មក') {
    colorClass = 'bg-teal-50 border-teal-300 text-teal-800 font-bold';
  } else if (status === 'បានតប/មិនមក') {
    colorClass = 'bg-gray-100 border-gray-300 text-gray-600';
  }

  return `
    <select onchange="updateInvitationStatus('${id}', this.value)" class="text-xs font-bold rounded-xl border px-2.5 py-1 transition focus:outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer ${colorClass}">
      <option value="មិនទាន់ផ្ញើ" ${status === 'មិនទាន់ផ្ញើ' ? 'selected' : ''}>⏳ មិនទាន់ផ្ញើ</option>
      <option value="ចូលមើល" ${status === 'ចូលមើល' ? 'selected' : ''}>👁️ ចូលមើល</option>
      <option value="មិនចូលមើល" ${status === 'មិនចូលមើល' ? 'selected' : ''}>🙈 មិនចូលមើល</option>
      <option value="ចូលមើលហើយមិនតប" ${status === 'ចូលមើលហើយមិនតប' ? 'selected' : ''}>🤐 ចូលមើលហើយមិនតប</option>
      <option value="បានតប/មក" ${status === 'បានតប/មក' ? 'selected' : ''}>🎉 បានតប/មក</option>
      <option value="បានតប/មិនមក" ${status === 'បានតប/មិនមក' ? 'selected' : ''}>❌ បានតប/មិនមក</option>
    </select>
  `;
}

function openAddInvitationModal() {
  const form = document.getElementById('invitation-form');
  if (form) form.reset();
  state.editingInvitationId = null;
  const title = document.getElementById('inv-modal-title');
  if (title) title.textContent = 'បន្ថែមភ្ញៀវត្រៀមហៅ';
  const submitBtn = document.getElementById('inv-modal-submit-btn');
  if (submitBtn) submitBtn.textContent = 'រក្សាទុក';
  const editIdInput = document.getElementById('inv-edit-id');
  if (editIdInput) editIdInput.value = '';

  const modal = document.getElementById('invitation-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => {
      document.getElementById('inv-guest-name')?.focus();
    }, 50);
  }
}

function closeInvitationModal() {
  const modal = document.getElementById('invitation-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function editInvitation(id) {
  const inv = state.invitations.find(i => String(i.id) === String(id));
  if (!inv) return;

  state.editingInvitationId = id;
  const editIdInput = document.getElementById('inv-edit-id');
  if (editIdInput) editIdInput.value = id;

  document.getElementById('inv-guest-name').value = inv.guest_name || '';
  document.getElementById('inv-address').value = inv.address || '';
  document.getElementById('inv-debt-status').value = inv.debt_status || 'ជំពាក់ដៃខ្ញុំ';
  document.getElementById('inv-invite-via').value = inv.invite_via || 'Facebook';
  document.getElementById('inv-response-status').value = inv.response_status || 'ចូលមើល';
  document.getElementById('inv-note').value = inv.note || '';

  const title = document.getElementById('inv-modal-title');
  if (title) title.textContent = 'កែប្រែព័ត៌មានភ្ញៀវត្រៀមហៅ';
  const submitBtn = document.getElementById('inv-modal-submit-btn');
  if (submitBtn) submitBtn.textContent = 'កែប្រែទិន្នន័យ';

  const modal = document.getElementById('invitation-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

async function handleInvitationSubmit(e) {
  e.preventDefault();

  const guestName = document.getElementById('inv-guest-name').value.trim();
  const address = document.getElementById('inv-address').value.trim();
  const debtStatus = document.getElementById('inv-debt-status').value;
  const inviteVia = document.getElementById('inv-invite-via').value;
  const responseStatus = document.getElementById('inv-response-status').value;
  const note = document.getElementById('inv-note').value.trim();

  if (!guestName) {
    showToast('សូមបញ្ចូលឈ្មោះភ្ញៀវ!', 'warning');
    return;
  }

  const invData = {
    guest_name: guestName,
    address: address,
    debt_status: debtStatus,
    invite_via: inviteVia,
    response_status: responseStatus,
    note: note
  };

  if (state.editingInvitationId) {
    invData.id = state.editingInvitationId;
    if (state.apiUrl) {
      const res = await callBackend('updateInvitation', 'POST', invData);
      if (res && res.success) {
        showToast(res.message || 'កែប្រែព័ត៌មានភ្ញៀវជោគជ័យ!', 'success');
      }
    }
    const idx = state.invitations.findIndex(i => String(i.id) === String(state.editingInvitationId));
    if (idx !== -1) {
      state.invitations[idx] = { ...state.invitations[idx], ...invData };
    }
    state.editingInvitationId = null;
  } else {
    if (state.apiUrl) {
      const res = await callBackend('addInvitation', 'POST', invData);
      if (res && res.success) {
        invData.id = res.id;
        showToast(res.message || 'រក្សាទុកភ្ញៀវត្រៀមហៅជោគជ័យ!', 'success');
      }
    } else {
      invData.id = 'INV_' + Date.now();
      showToast('រក្សាទុកក្នុងទម្រង់ Offline ជោគជ័យ!', 'success');
    }
    invData.created_at = new Date().toLocaleString('km-KH');
    state.invitations.unshift(invData);
  }

  localStorage.setItem('wedding_invitations', JSON.stringify(state.invitations));
  closeInvitationModal();
  renderInvitationsTable();
}

async function deleteInvitation(id) {
  if (!confirm('តើបងពិតជាចង់លុបភ្ញៀវនេះចេញពីបញ្ជីត្រៀមហៅមែនទេ?')) return;

  if (state.apiUrl) {
    const res = await callBackend('deleteInvitation', 'POST', { id: id });
    if (res && res.success) {
      showToast('លុបភ្ញៀវជោគជ័យ!', 'success');
    }
  } else {
    showToast('លុបក្នុងទម្រង់ Offline ជោគជ័យ!', 'info');
  }

  state.invitations = state.invitations.filter(i => String(i.id) !== String(id));
  localStorage.setItem('wedding_invitations', JSON.stringify(state.invitations));
  renderInvitationsTable();
}

async function updateInvitationStatus(id, newStatus) {
  const inv = state.invitations.find(i => String(i.id) === String(id));
  if (!inv) return;

  inv.response_status = newStatus;
  localStorage.setItem('wedding_invitations', JSON.stringify(state.invitations));

  if (state.apiUrl) {
    callBackend('updateInvitation', 'POST', { id: id, response_status: newStatus });
  }

  renderInvitationsTable();
  showToast(`បានប្តូរស្ថានភាព "${inv.guest_name}" ទៅ "${newStatus}"`, 'success');
}

function convertInvitationToGift(id) {
  const inv = state.invitations.find(i => String(i.id) === String(id));
  if (!inv) return;

  switchView('gift-entry-view');
  document.getElementById('gift-guest-name').value = inv.guest_name || '';

  const statusEl = document.getElementById('gift-status');
  if (statusEl) {
    statusEl.value = (inv.debt_status === 'ជំពាក់ដៃខ្ញុំ') ? 'ជំពាក់ដៃយើង' : 'សងដៃរួច';
  }

  const noteEl = document.getElementById('gift-note');
  if (noteEl) {
    noteEl.value = (inv.address ? `អាស័យដ្ឋាន: ${inv.address} | ` : '') + (inv.note ? inv.note : '');
  }

  const amountInput = document.getElementById('gift-amount');
  if (amountInput) {
    amountInput.focus();
  }

  showToast(`បានផ្ទេរព័ត៌មាន "${inv.guest_name}" មកកាន់ទម្រង់កត់ចំណងដៃ!`, 'info');
}

function exportInvitationsToCSV() {
  if (state.invitations.length === 0) {
    showToast('មិនមានទិន្នន័យភ្ញៀវសម្រាប់ Export ទេ!', 'warning');
    return;
  }

  let csv = '\uFEFF'; // UTF-8 BOM
  csv += 'ល.រ,ឈ្មោះភ្ញៀវ,អាស័យដ្ឋាន,ស្ថានភាពជំពាក់ដៃ,ហៅតាមរយៈ,ស្ថានភាពឆ្លើយតប,កំណត់សម្គាល់,កាលបរិច្ឆេទ\r\n';

  state.invitations.forEach((inv, idx) => {
    const row = [
      idx + 1,
      `"${(inv.guest_name || '').replace(/"/g, '""')}"`,
      `"${(inv.address || '').replace(/"/g, '""')}"`,
      `"${(inv.debt_status || 'ជំពាក់ដៃខ្ញុំ').replace(/"/g, '""')}"`,
      `"${(inv.invite_via || 'Facebook').replace(/"/g, '""')}"`,
      `"${(inv.response_status || 'មិនទាន់ផ្ញើ').replace(/"/g, '""')}"`,
      `"${(inv.note || '').replace(/"/g, '""')}"`,
      `"${(inv.created_at || '').replace(/"/g, '""')}"`
    ];
    csv += row.join(',') + '\r\n';
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  link.setAttribute('href', url);
  link.setAttribute('download', `បញ្ជីភ្ញៀវត្រៀមហៅ_PEUNG_VIREAK_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast('បានទាញយកបញ្ជីភ្ញៀវត្រៀមហៅជា Excel ជោគជ័យ!', 'success');
}

// ==========================================
// VIEW NAVIGATION
// ==========================================

function switchView(viewId) {
  state.currentView = viewId;
  const views = [
    'dashboard-view',
    'invitations-view',
    'gift-entry-view',
    'gifts-table-view',
    'expense-entry-view',
    'expenses-table-view'
  ];

  views.forEach(v => {
    const el = document.getElementById(v);
    if (el) {
      if (v === viewId) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });

  // Update navigation button active state
  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.dataset.view === viewId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update mobile bottom navigation button active state
  document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
    if (btn.dataset.view === viewId) {
      btn.classList.add('text-pink-600', 'font-bold');
      btn.classList.remove('text-gray-400');
    } else {
      btn.classList.remove('text-pink-600', 'font-bold');
      btn.classList.add('text-gray-400');
    }
  });

  // Re-render when switching views
  if (viewId === 'dashboard-view') renderDashboard();
  if (viewId === 'invitations-view') renderInvitationsTable();
  if (viewId === 'gifts-table-view') renderGiftsTable();
  if (viewId === 'expenses-table-view') renderExpensesTable();
}

// ==========================================
// SETTINGS & DATABASE SETUP MODAL
// ==========================================

function openSettingsModal() {
  const modal = document.getElementById('settings-modal');
  const input = document.getElementById('settings-api-url');
  if (input) input.value = state.apiUrl;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeSettingsModal() {
  const modal = document.getElementById('settings-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function saveSettings(e) {
  e.preventDefault();
  const input = document.getElementById('settings-api-url');
  const newUrl = input.value.trim();

  state.apiUrl = newUrl;
  localStorage.setItem('wedding_app_api_url', newUrl);
  showToast('បានរក្សាទុក Web App API URL ជោគជ័យ!', 'success');
  closeSettingsModal();

  if (newUrl) {
    fetchAllData();
  }
}

async function triggerDatabaseSetup() {
  if (!state.apiUrl) {
    showToast('សូមបញ្ចូល និងរក្សាទុក Web App URL ជាមុនសិន!', 'warning');
    return;
  }
  if (!confirm('តើបងចង់រៀបចំ Sheets ទាំង ៤ និង Users ដោយស្វ័យប្រវត្តិមែនទេ?')) return;

  const res = await callBackend('setup', 'GET');
  if (res && res.success) {
    showToast(res.message || 'បានរៀបចំ Database ក្នុង Google Sheets ជោគជ័យ!', 'success');
    fetchAllData();
  } else {
    showToast('បរាជ័យក្នុងការ setup: ' + (res ? res.error : 'សូមពិនិត្យ URL'), 'error');
  }
}

// ==========================================
// CHANGE PASSWORD MODAL & LOGIC
// ==========================================

function openChangePasswordModal() {
  const modal = document.getElementById('change-password-modal');
  const userField = document.getElementById('cp-username');
  const oldPass = document.getElementById('cp-old-password');
  const newPass = document.getElementById('cp-new-password');
  const confPass = document.getElementById('cp-confirm-password');

  if (state.user && state.user.username) {
    userField.value = state.user.username;
    userField.readOnly = true;
  } else {
    userField.value = 'admin';
    userField.readOnly = false;
  }

  if (oldPass) oldPass.value = '';
  if (newPass) newPass.value = '';
  if (confPass) confPass.value = '';

  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeChangePasswordModal() {
  const modal = document.getElementById('change-password-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function togglePasswordVisibility(inputId, eyeId) {
  const input = document.getElementById(inputId);
  const eye = document.getElementById(eyeId);
  if (!input || !eye) return;

  if (input.type === 'password') {
    input.type = 'text';
    eye.classList.remove('fa-eye');
    eye.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    eye.classList.remove('fa-eye-slash');
    eye.classList.add('fa-eye');
  }
}

async function handleChangePasswordSubmit(e) {
  e.preventDefault();

  const username = document.getElementById('cp-username').value.trim();
  const oldPassword = document.getElementById('cp-old-password').value.trim();
  const newPassword = document.getElementById('cp-new-password').value.trim();
  const confirmPassword = document.getElementById('cp-confirm-password').value.trim();

  if (!username || !oldPassword || !newPassword || !confirmPassword) {
    showToast('សូមបំពេញព័ត៌មានឱ្យបានគ្រប់ជ្រុងជ្រោយ!', 'warning');
    return;
  }

  if (newPassword !== confirmPassword) {
    showToast('លេខសម្ងាត់ថ្មី និងផ្ទៀងផ្ទាត់មិនដូចគ្នាទេ!', 'warning');
    return;
  }

  if (newPassword.length < 3) {
    showToast('លេខសម្ងាត់ថ្មីត្រូវមានយ៉ាងហោចណាស់ ៣ តួ!', 'warning');
    return;
  }

  showLoader(true);
  try {
    if (state.apiUrl) {
      const res = await callBackend('changePassword', 'POST', {
        username: username,
        old_password: oldPassword,
        new_password: newPassword
      });

      if (res && res.success) {
        showToast(res.message || 'ផ្លាស់ប្តូរលេខសម្ងាត់បានជោគជ័យ!', 'success');
        closeChangePasswordModal();
      } else {
        showToast(res ? res.message : 'បរាជ័យក្នុងការផ្លាស់ប្តូរលេខសម្ងាត់!', 'error');
      }
    } else {
      // Offline / Demo fallback
      if (oldPassword === '123' || oldPassword === 'admin') {
        showToast('ប្តូរលេខសម្ងាត់ក្នុងទម្រង់ Offline ជោគជ័យ!', 'success');
        closeChangePasswordModal();
      } else {
        showToast('លេខសម្ងាត់ចាស់មិនត្រឹមត្រូវទេ! (គណនីសាកល្បង: 123)', 'error');
      }
    }
  } catch (err) {
    showToast('កំហុសក្នុងការតភ្ជាប់ API!', 'error');
  } finally {
    showLoader(false);
  }
}

// ==========================================
// EXPORT WEDDING SOUVENIR BOOK & EXCEL
// ==========================================

function openExportBookModal() {
  const modal = document.getElementById('export-book-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    renderBookPreview();
  }
}

function closeExportBookModal() {
  const modal = document.getElementById('export-book-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function printWeddingBook() {
  window.print();
}

function renderBookPreview() {
  const container = document.getElementById('printable-book-area');
  if (!container) return;

  const sideFilter = document.getElementById('book-side-filter')?.value || 'all';
  const sortFilter = document.getElementById('book-sort-filter')?.value || 'time-asc';

  let list = [...state.gifts];

  if (sideFilter !== 'all') {
    list = list.filter(g => g.guest_side === sideFilter);
  }

  if (sortFilter === 'time-desc') {
    list.reverse();
  } else if (sortFilter === 'name') {
    list.sort((a, b) => String(a.guest_name || '').localeCompare(String(b.guest_name || ''), 'km'));
  } else if (sortFilter === 'amount-desc') {
    list.sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0));
  }

  // Calculate summary metrics for the book
  let totalUSD = 0;
  let totalKHR = 0;
  let groomCount = 0;
  let brideCount = 0;

  list.forEach(g => {
    if (g.currency === 'USD') totalUSD += Number(g.amount || 0);
    else totalKHR += Number(g.amount || 0);

    if (g.guest_side === 'ខាងស្រី') brideCount++;
    else groomCount++;
  });

  const todayStr = new Date().toLocaleDateString('km-KH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  container.innerHTML = `
    <!-- Book Cover Header Banner -->
    <div class="print-header-banner text-center border-2 border-pink-500 rounded-2xl p-5 mb-6 bg-gradient-to-r from-pink-50/70 via-rose-50/40 to-amber-50/70">
      <div class="text-xs uppercase tracking-widest text-pink-700 font-bold mb-1">
        សិរីសួស្តី ជ័យមង្គល វិបុលសុខ មហាប្រសើរ
      </div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 font-serif-title mb-1">
        សៀវភៅកត់ត្រាចំណងដៃអាពាហ៍ពិពាហ៍
      </h1>
      <p class="text-base font-bold text-pink-700 mb-2">
        ម្ចាស់ដើមការ៖ <span class="text-gray-900 font-extrabold">PEUNG VIREAK</span>
      </p>
      <div class="inline-block px-4 py-1 rounded-full bg-white border border-pink-200 text-xs text-gray-600 font-medium">
        កាលបរិច្ឆេទបោះពុម្ព៖ ${todayStr}
      </div>

      <!-- Quick Stats in Header -->
      <div class="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-pink-200/60 text-center">
        <div class="bg-white/90 p-2 rounded-xl border border-pink-100 shadow-sm">
          <div class="text-[11px] text-gray-500 font-medium">ភ្ញៀវសរុប</div>
          <div class="text-base font-bold text-gray-800">${list.length} នាក់</div>
          <div class="text-[10px] text-gray-400">ប្រុស: ${groomCount} | ស្រី: ${brideCount}</div>
        </div>
        <div class="bg-white/90 p-2 rounded-xl border border-pink-100 shadow-sm">
          <div class="text-[11px] text-gray-500 font-medium">ចំណងដៃដុល្លារ ($)</div>
          <div class="text-base font-extrabold text-emerald-700">$${totalUSD.toLocaleString()}</div>
        </div>
        <div class="bg-white/90 p-2 rounded-xl border border-pink-100 shadow-sm">
          <div class="text-[11px] text-gray-500 font-medium">ចំណងដៃរៀល (៛)</div>
          <div class="text-base font-extrabold text-amber-700">${totalKHR.toLocaleString()} ៛</div>
        </div>
      </div>
    </div>

    <!-- Book Records Table -->
    ${list.length === 0 ? `
      <div class="text-center py-12 text-gray-400 text-sm">មិនទាន់មានទិន្នន័យចំណងដៃត្រូវនឹងលក្ខខណ្ឌជ្រើសរើសទេ</div>
    ` : `
      <table class="print-table w-full text-left text-xs border border-gray-300">
        <thead class="bg-pink-100/70 text-gray-800 font-bold uppercase">
          <tr>
            <th class="border border-gray-300 px-2.5 py-2 text-center w-10">ល.រ</th>
            <th class="border border-gray-300 px-3 py-2">ឈ្មោះភ្ញៀវកិត្តិយស</th>
            <th class="border border-gray-300 px-2 py-2 text-center w-14">ភ្ញៀវ</th>
            <th class="border border-gray-300 px-2 py-2 text-center w-20">ត្រូវជា</th>
            <th class="border border-gray-300 px-3 py-2 text-right">ចំនួនទឹកប្រាក់</th>
            <th class="border border-gray-300 px-2 py-2 text-center w-20">ស្ថានភាព</th>
            <th class="border border-gray-300 px-3 py-2">ទីតាំង / អាសយដ្ឋាន</th>
            <th class="border border-gray-300 px-2 py-2 w-24">ចំណាំ</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          ${list.map((g, idx) => `
            <tr class="${idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'} hover:bg-pink-50/30">
              <td class="border border-gray-300 px-2 py-2 text-center text-gray-500 font-semibold">${idx + 1}</td>
              <td class="border border-gray-300 px-3 py-2 font-bold text-gray-900">
                ${escapeHtml(g.guest_name)}
                ${g.gender ? `<span class="text-[10px] text-gray-400 font-normal"> (${escapeHtml(g.gender)})</span>` : ''}
              </td>
              <td class="border border-gray-300 px-2 py-2 text-center font-medium ${g.guest_side === 'ខាងស្រី' ? 'text-pink-700' : 'text-blue-700'}">
                ${escapeHtml(g.guest_side || 'ខាងប្រុស')}
              </td>
              <td class="border border-gray-300 px-2 py-2 text-center text-gray-600">
                ${escapeHtml(g.relation || 'ភ្ញៀវ')}
              </td>
              <td class="border border-gray-300 px-3 py-2 text-right font-extrabold ${g.currency === 'USD' ? 'text-emerald-700' : 'text-amber-700'}">
                ${g.currency === 'USD' ? '$' : ''}${Number(g.amount).toLocaleString()}${g.currency === 'USD' ? '' : ' ៛'}
              </td>
              <td class="border border-gray-300 px-2 py-2 text-center">
                <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${getStatusBadgeClass(g.status)}">
                  ${escapeHtml(g.status || 'ជំពាក់ដៃយើង')}
                </span>
              </td>
              <td class="border border-gray-300 px-3 py-2 text-gray-600 text-[11px]">
                ${[g.village, g.commune, g.district, g.province].filter(Boolean).join(', ') || '—'}
              </td>
              <td class="border border-gray-300 px-2 py-2 text-gray-400 text-[10px] italic">
                ${escapeHtml(g.note || '—')}
              </td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot class="bg-gray-100 font-bold text-gray-800">
          <tr>
            <td colspan="4" class="border border-gray-300 px-3 py-2.5 text-right font-bold">
              សរុបរួម (${list.length} នាក់)៖
            </td>
            <td class="border border-gray-300 px-3 py-2.5 text-right font-extrabold text-sm text-pink-700">
              <div>$${totalUSD.toLocaleString()}</div>
              <div>${totalKHR.toLocaleString()} ៛</div>
            </td>
            <td colspan="3" class="border border-gray-300 px-3 py-2.5 text-gray-500 text-[11px]">
              ខាងប្រុស: ${groomCount} នាក់ | ខាងស្រី: ${brideCount} នាក់
            </td>
          </tr>
        </tfoot>
      </table>

      <!-- Formal Souvenir Book Blessing & Signatures Footer -->
      <div class="mt-8 pt-6 border-t border-gray-200 text-xs text-gray-600 flex justify-between items-end px-4">
        <div class="text-center w-48">
          <p class="font-medium mb-16">ហត្ថលេខាខាងកូនកំលោះ</p>
          <div class="border-t border-gray-400 pt-1">
            <strong>PEUNG VIREAK</strong>
          </div>
        </div>
        <div class="text-center w-60 text-[11px] text-gray-500 italic pb-2">
          សូមថ្លែងអំណរគុណយ៉ាងជ្រាលជ្រៅបំផុត ចំពោះវត្តមានដ៏ឧត្តុង្គឧត្តមរបស់ភ្ញៀវកិត្តិយសទាំងអស់!
        </div>
        <div class="text-center w-48">
          <p class="font-medium mb-16">ហត្ថលេខាខាងកូនក្រមុំ</p>
          <div class="border-t border-gray-400 pt-1">
            <strong>ភរិយា</strong>
          </div>
        </div>
      </div>
    `}
  `;
}

function exportGiftsToExcel() {
  if (!state.gifts || state.gifts.length === 0) {
    showToast('មិនមានទិន្នន័យចំណងដៃសម្រាប់ Export ទេ!', 'warning');
    return;
  }

  const sideFilter = document.getElementById('book-side-filter')?.value || 'all';
  let giftsToExport = [...state.gifts];

  if (sideFilter !== 'all') {
    giftsToExport = giftsToExport.filter(g => g.guest_side === sideFilter);
  }

  // Build CSV Header with UTF-8 BOM
  let csvContent = '\uFEFF';
  csvContent += 'ល.រ,ឈ្មោះភ្ញៀវ,ភេទ,ភ្ញៀវ,ត្រូវជា,អញ្ជើញតាម,ចំនួនទឹកប្រាក់,រូបិយប័ណ្ណ,ស្ថានភាព,ខេត្ត/ក្រុង,ស្រុក/ខណ្ឌ,ឃុំ/សង្កាត់,ភូមិ,ចំណាំ,កាលបរិច្ឆេទ\r\n';

  giftsToExport.forEach((g, idx) => {
    const row = [
      idx + 1,
      `"${(g.guest_name || '').replace(/"/g, '""')}"`,
      `"${(g.gender || '').replace(/"/g, '""')}"`,
      `"${(g.guest_side || 'ខាងប្រុស').replace(/"/g, '""')}"`,
      `"${(g.relation || 'ភ្ញៀវ').replace(/"/g, '""')}"`,
      `"${(g.invite_method || 'ផ្ទាល់').replace(/"/g, '""')}"`,
      Number(g.amount || 0),
      `"${(g.currency || 'USD').replace(/"/g, '""')}"`,
      `"${(g.status || 'ជំពាក់ដៃយើង').replace(/"/g, '""')}"`,
      `"${(g.province || '').replace(/"/g, '""')}"`,
      `"${(g.district || '').replace(/"/g, '""')}"`,
      `"${(g.commune || '').replace(/"/g, '""')}"`,
      `"${(g.village || '').replace(/"/g, '""')}"`,
      `"${(g.note || '').replace(/"/g, '""')}"`,
      `"${(g.created_at || '').replace(/"/g, '""')}"`
    ];
    csvContent += row.join(',') + '\r\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  link.setAttribute('href', url);
  link.setAttribute('download', `សៀវភៅចំណងដៃ_PEUNG_VIREAK_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast('បានទាញយកសៀវភៅចំណងដៃជា Excel ជោគជ័យ!', 'success');
}

// ==========================================
// EVENT LISTENERS & UI WIRING
// ==========================================

function initEventListeners() {
  // Login Form
  const loginForm = document.getElementById('login-form');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);

  // Logout Buttons
  document.querySelectorAll('.btn-logout').forEach(b => b.addEventListener('click', handleLogout));

  // Navigation Buttons (Desktop Tabs & Mobile Bottom Bar)
  document.querySelectorAll('.nav-btn, .bottom-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      if (view) switchView(view);
    });
  });

  // Gift Form & Cascading Events
  const giftForm = document.getElementById('gift-form');
  if (giftForm) giftForm.addEventListener('submit', handleGiftSubmit);

  const provSelect = document.getElementById('gift-province');
  if (provSelect) provSelect.addEventListener('change', onProvinceChange);

  const distSelect = document.getElementById('gift-district');
  if (distSelect) distSelect.addEventListener('change', onDistrictChange);

  const comSelect = document.getElementById('gift-commune');
  if (comSelect) comSelect.addEventListener('change', onCommuneChange);

  const cancelGiftBtn = document.getElementById('gift-cancel-edit-btn');
  if (cancelGiftBtn) cancelGiftBtn.addEventListener('click', cancelGiftEditAndBack);

  // Expense Form & Calculation Events
  const expenseForm = document.getElementById('expense-form');
  if (expenseForm) expenseForm.addEventListener('submit', handleExpenseSubmit);

  const totalInput = document.getElementById('expense-total');
  const depositInput = document.getElementById('expense-deposit');
  if (totalInput) {
    totalInput.addEventListener('input', updateExpenseBalanceCalculation);
    totalInput.addEventListener('keyup', updateExpenseBalanceCalculation);
  }
  if (depositInput) {
    depositInput.addEventListener('input', updateExpenseBalanceCalculation);
    depositInput.addEventListener('keyup', updateExpenseBalanceCalculation);
  }

  const cancelExpBtn = document.getElementById('expense-cancel-edit-btn');
  if (cancelExpBtn) cancelExpBtn.addEventListener('click', cancelExpenseEditAndBack);

  // Default Today Date for Expense
  const expDate = document.getElementById('expense-date');
  if (expDate && !expDate.value) expDate.valueAsDate = new Date();

  // Search & Filter Events
  const giftSearch = document.getElementById('gift-search-input');
  if (giftSearch) giftSearch.addEventListener('input', renderGiftsTable);
  const giftStatusFilter = document.getElementById('gift-status-filter');
  if (giftStatusFilter) giftStatusFilter.addEventListener('change', renderGiftsTable);
  const giftCurrFilter = document.getElementById('gift-currency-filter');
  if (giftCurrFilter) giftCurrFilter.addEventListener('change', renderGiftsTable);
  const giftSideFilter = document.getElementById('gift-side-filter');
  if (giftSideFilter) giftSideFilter.addEventListener('change', renderGiftsTable);

  const expSearch = document.getElementById('expense-search-input');
  if (expSearch) expSearch.addEventListener('input', renderExpensesTable);
  const expPayFilter = document.getElementById('expense-payment-filter');
  if (expPayFilter) expPayFilter.addEventListener('change', renderExpensesTable);
  const expStatusFilter = document.getElementById('expense-status-filter');
  if (expStatusFilter) expStatusFilter.addEventListener('change', renderExpensesTable);

  // Invitation Form & Search / Filters
  const invForm = document.getElementById('invitation-form');
  if (invForm) invForm.addEventListener('submit', handleInvitationSubmit);

  const invSearch = document.getElementById('inv-search-input');
  if (invSearch) invSearch.addEventListener('input', renderInvitationsTable);
  const invStatusFilter = document.getElementById('inv-status-filter');
  if (invStatusFilter) invStatusFilter.addEventListener('change', renderInvitationsTable);
  const invViaFilter = document.getElementById('inv-via-filter');
  if (invViaFilter) invViaFilter.addEventListener('change', renderInvitationsTable);
  const invDebtFilter = document.getElementById('inv-debt-filter');
  if (invDebtFilter) invDebtFilter.addEventListener('change', renderInvitationsTable);

  // Modal Form for Adding Location
  const locForm = document.getElementById('location-form');
  if (locForm) locForm.addEventListener('submit', handleSaveNewLocation);

  // Modal Form for Adding Expense Category
  const categoryForm = document.getElementById('category-form');
  if (categoryForm) categoryForm.addEventListener('submit', handleSaveNewCategory);

  // Settings Form
  const settingsForm = document.getElementById('settings-form');
  if (settingsForm) settingsForm.addEventListener('submit', saveSettings);

  // Change Password Form
  const changePassForm = document.getElementById('change-password-form');
  if (changePassForm) changePassForm.addEventListener('submit', handleChangePasswordSubmit);

  // Close modals when clicking backdrop
  ['location-modal', 'category-modal', 'settings-modal', 'logout-confirm-modal', 'change-password-modal', 'export-book-modal', 'invitation-modal'].forEach(modalId => {
    const modalEl = document.getElementById(modalId);
    if (modalEl) {
      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) {
          modalEl.classList.add('hidden');
          modalEl.classList.remove('flex');
        }
      });
    }
  });

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      ['location-modal', 'category-modal', 'settings-modal', 'logout-confirm-modal', 'change-password-modal', 'export-book-modal', 'invitation-modal'].forEach(modalId => {
        const modalEl = document.getElementById(modalId);
        if (modalEl && !modalEl.classList.contains('hidden')) {
          modalEl.classList.add('hidden');
          modalEl.classList.remove('flex');
        }
      });
    }
  });
}

// ==========================================
// TOAST & UI NOTIFICATIONS
// ==========================================

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const colors = {
    success: 'bg-emerald-600 text-white shadow-emerald-200',
    error: 'bg-rose-600 text-white shadow-rose-200',
    warning: 'bg-amber-500 text-white shadow-amber-200',
    info: 'bg-indigo-600 text-white shadow-indigo-200'
  };

  const icons = {
    success: 'fa-check-circle',
    error: 'fa-circle-xmark',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info'
  };

  const toast = document.createElement('div');
  toast.className = `flex items-center space-x-3 px-4 py-3 rounded-xl shadow-lg transition-all duration-300 transform translate-y-2 opacity-0 ${colors[type] || colors.info}`;
  toast.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.info} text-lg"></i>
    <span class="text-sm font-medium">${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  // Animate out & remove
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-x-full');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function showLoader(show) {
  const loader = document.getElementById('global-loader');
  if (loader) {
    if (show) loader.classList.remove('hidden');
    else loader.classList.add('hidden');
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

