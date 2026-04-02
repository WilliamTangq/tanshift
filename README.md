# 🧠 TanShift – Smart Staff Scheduling SaaS

TanShift is a web-based staff scheduling system designed to help small businesses (e.g. restaurants, retail stores) manage employee shifts efficiently.

It replaces manual scheduling (Excel, WhatsApp, paper rosters) with a structured, role-based system that improves visibility, communication, and operational efficiency.

---

## 🚀 Features

### 👨‍💼 Manager Side
- Create and manage weekly schedules  
- Publish / Unpublish schedules  
- Edit schedules in draft mode  
- View total working hours per staff (hours & minutes format)  
- Control visibility (only published schedules are visible to staff)  

### 👩‍💻 Staff Side
- View assigned shifts (published only)  
- Submit leave requests  
- Request shift swaps  
- Track personal working hours  

---

## 💡 Problem Statement

In many SMEs, staff scheduling is:
- Manual (Excel / paper)
- Unstructured
- Prone to miscommunication

This leads to:
- Scheduling conflicts  
- Confusion over latest updates  
- Time wasted on coordination  

**TanShift solves this by introducing a structured scheduling workflow with clear state control (Draft vs Published).**

---

## 🧩 Key System Logic

### 🔁 Publish / Unpublish Workflow
- `Draft` → editable by manager  
- `Published` → visible to staff  
- Unpublish resets schedule to draft mode  

This ensures:
- No accidental updates shown to staff  
- Clear separation between planning and execution  

---

### ⏱ Time Calculation
- All shift durations are calculated automatically  
- Display format: `X hours Y mins`  

---

### 🔐 Role-Based Access Control
- Manager: full control  
- Staff: read-only (published schedules only)  

---

## 🛠️ Tech Stack

- Frontend: Next.js / Angular  
- Backend: Node.js / Supabase  
- Database: PostgreSQL  
- Authentication: Supabase Auth  
- Hosting: Coming soon...  

---

## 🧪 Getting Started

This is a Next.js project bootstrapped with `create-next-app`.

### Install dependencies

```bash
npm install
