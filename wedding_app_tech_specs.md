# Technical Specification Document
**Project Name:** Wedding Gift & Expense Management WebApp
**Target Tool:** Antigravity (For Code Generation)
**Tech Stack Required:** Frontend (HTML/CSS/JS or React/Tailwind), Backend (Google Apps Script / Google Sheets API).

## 1. Project Overview
A web-based application to manage wedding gifts (ចំណងដៃ) and expenses (ចំណាយ). The app is private, requiring login access for only two users (Husband and Wife). It uses Google Sheets as the database via Google Apps Script (REST API).

## 2. Database Schema (Google Sheets Tabs)

### Sheet 1: `Users`
- `id` (String/UUID)
- `username` (String)
- `password_hash` (String)
- `role` (String - Admin)

### Sheet 2: `Gifts`
- `id` (Auto-increment/UUID)
- `guest_name` (String - ឈ្មោះភ្ញៀវ)
- `gender` (String - ភេទ: ប្រុស/ស្រី)
- `relation` (String - ទំនាក់ទំនង: ជីដូន/បង្កើត/មិត្ត...)
- `amount` (Number - ចំនួនទឹកប្រាក់)
- `currency` (String - Riel / USD)
- `status` (String - ស្ថានភាព: ជំពាក់ដៃយើង / ជំពាក់គេ / សងដៃរួច)
- `province` (String - ខេត្ត)
- `district` (String - ស្រុក)
- `commune` (String - ឃុំ)
- `village` (String - ភូមិ)
- `note` (String - ចំណាំ)
- `created_at` (Timestamp)

### Sheet 3: `Expenses`
- `id` (Auto-increment/UUID)
- `expense_name` (String - ឈ្មោះចំណាយ)
- `total_amount` (Number - ថ្លៃសរុប)
- `deposit` (Number - ប្រាក់កក់)
- `balance` (Number - ប្រាក់នៅសល់)
- `currency` (String - Riel / USD)
- `date` (String/Date - ខែឆ្នាំ)
- `payment_method` (String - វិធីទូទាត់)
- `note` (String - កំណត់សម្គាល់)
- `created_at` (Timestamp)

### Sheet 4: `Locations` (For Cascading Dropdowns)
- `id` (String)
- `parent_id` (String - For linking District to Province, etc.)
- `name_kh` (String)
- `type` (String - Province, District, Commune, Village)

---

## 3. Core Functionalities & UI Logic

### A. Authentication (Login)
- Simple Login form: Username & Password.
- **Sequence:** Frontend sends POST request -> Apps Script checks `Users` sheet -> Returns Success/Token or Error -> Frontend stores session and redirects to Dashboard.

### B. Gift Entry Form (ចំណងដៃ)
- Input fields for all `Gifts` columns.
- **Cascading Dropdown Logic (Critical):**
  - When a user selects a "Province" (e.g., Pursat), the "District" dropdown automatically populates with districts belonging ONLY to that province.
  - Same cascading logic for District -> Commune -> Village.
- **[+] Add New Location Button:** Next to the dropdowns for Province/District/Commune/Village, there is a `[+]` button. It opens a small Modal to insert a new location dynamically without reloading the page.

### C. Expense Entry Form (ចំណាយ)
- Input fields for all `Expenses` columns.
- **Dynamic Dropdown:** `Expense Name` is a dropdown with a `[+]` button to add new expense categories dynamically.
- **Auto-Calculation Logic:** `balance` (ប្រាក់នៅសល់) = `total_amount` (ថ្លៃសរុប) - `deposit` (ប្រាក់កក់). The balance field should be read-only and update automatically on `keyup` or `change` events.

### D. Dashboard & Data Tables
- **Summary Cards:** Total Gifts (Riel & USD), Total Expenses (Riel & USD).
- **Data Tables (View/Edit/Delete):** 
  - Two main tables: Gifts Table & Expenses Table.
  - Search functionality by Name.
  - Filter by Status (e.g., Pending, Received).
  - Action column: View Details, Edit (populate form), Delete (with confirmation modal).

---

## 4. API Endpoints (Google Apps Script)
*Note to Antigravity: Generate the GAS code using `doGet(e)` and `doPost(e)` to handle these actions.*

- **POST `?action=login`**: Validate credentials.
- **GET `?action=getGifts`**: Return all gift records.
- **POST `?action=addGift`**: Append a new row to `Gifts` sheet.
- **POST `?action=updateGift`**: Update a specific row by ID.
- **POST `?action=deleteGift`**: Delete a row by ID.
- **GET `?action=getExpenses`**: Return all expense records.
- **POST `?action=addExpense`**: Append new expense.
- **GET `?action=getLocations`**: Return all location lists for the cascading dropdowns.
- **POST `?action=addLocation`**: Add a new custom location from the `[+]` button.