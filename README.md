# 🧠 TanShift – Smart Staff Scheduling SaaS

TanShift is a web-based staff scheduling system designed to help small businesses (e.g. restaurants, retail stores) manage employee shifts efficiently.

It replaces manual scheduling methods (Excel, WhatsApp, paper rosters) with a structured, role-based system that improves visibility, communication, and operational efficiency.

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
- Display format:  
  `X hours Y mins` (instead of decimal hours)

---

### 🔐 Role-Based Access Control
- Manager: full control  
- Staff: read-only (published schedules only)  

---

## 🛠️ Tech Stack

- **Frontend:** Next.js / Angular  
- **Backend:** Node.js, Supabase  
- **Database:** PostgreSQL  
- **Authentication:** Supabase Auth  
- **Hosting:** Coming soon...  

---

## 🧪 Example Workflow

1. Manager creates weekly schedule  
2. Schedule remains in **Draft mode**  
3. Manager edits until final  
4. Click **Publish**  
5. Staff can now view shifts  
6. Staff submits leave / swap requests  
7. Manager can unpublish to make changes  

---

## 📸 Screenshots

> will be adding ...
- Manager Dashboard  
- Staff Schedule View  
- Leave Request UI  
- Shift Swap UI  

---

## 📈 Future Improvements

- Notification system (email / push)  
- Mobile-first UI  
- Payroll integration  
- AI-assisted scheduling  
- Multi-store support  

---

## 🧑‍💻 Author

**William Tan (Guang Quan Tan)**  
Bachelor of Information Technology (Business Information Systems)  
Monash University  

---

## ⭐ Project Motivation

This project was inspired by real-world experience working in retail and hospitality, where scheduling inefficiencies are common.

The goal is to transform a real operational problem into a scalable SaaS product.

---

## ⚙️ Getting Started

This is a Next.js project bootstrapped with `create-next-app`.

### Install dependencies

```bash
npm install
```

### Run the development server

```
npm run dev  
# or  
yarn dev  
# or  
pnpm dev  
# or  
bun dev
``` 

---

Open http://localhost:3000 with your browser to see the result.  

You can start editing the page by modifying:  

app/page.tsx  

The page auto-updates as you edit the file.  

---

## 🎨 Font Optimization

This project uses `next/font` to automatically optimize and load **Geist**, a font family developed by Vercel.  

---

## 📚 Learn More

Next.js Documentation – https://nextjs.org/docs  
Learn Next.js – https://nextjs.org/learn  
Next.js GitHub – https://github.com/vercel/next.js  

---

## 🚀 Deployment

The easiest way to deploy this app is via **Vercel**.  

See deployment docs:  
https://nextjs.org/docs/app/building-your-application/deploying  

---

## 🌐 Live Demo

Coming soon...  

---
