# TanShift — Staff Scheduling System

TanShift is a business-focused staff scheduling prototype for small hospitality, retail and service teams. It replaces fragmented rostering across spreadsheets, screenshots and messages with structured manager/staff workflows.

**Portfolio case study:** https://williamtangq.github.io/case-tanshift.html

## Business problem

Manual roster coordination creates common operational risks:

- multiple schedule versions
- unclear staff availability
- leave and shift-change requests handled outside the roster
- unnecessary manager coordination
- limited visibility for staff

TanShift turns those problems into a database-backed workflow.

## Implemented capabilities

### Manager
- create and load weekly schedule records
- add shifts by date, department and staff member
- validate that a shift sits inside the selected week
- validate submitted staff availability before assigning a shift
- move schedule weeks between **draft** and **published**
- review leave / swap requests
- filter requests by status
- approve or reject requests with review timestamps

### Staff
- view published shifts only
- see day-by-day assignments and total weekly hours
- submit leave requests
- submit shift-swap requests
- view request history and status

## Verified stack

| Area | Technology |
|---|---|
| Framework | Next.js 16.2.2 |
| UI | React 19.2.4 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Data client | Supabase JS 2 |
| Database | PostgreSQL / Supabase |
| Version control | Git / GitHub |

## System evidence

The repository contains separate manager and staff routes:

- `app/manager/schedule`
- `app/manager/availability`
- `app/manager/requests`
- `app/manager/staff`
- `app/staff/schedule`
- `app/staff/availability`
- `app/staff/requests`

Examples of business rules implemented in code include:

- schedule weeks have `draft` / `published` status
- shift dates must fall inside the selected week
- staff assignments are checked against submitted availability
- published schedules are separated from draft schedules in the staff experience
- leave / swap requests use `pending`, `approved` and `rejected` states

## Important prototype boundary

TanShift currently uses a local browser session model to switch between manager and staff experiences. Supabase is used for application data, but the current repository does **not** implement production-grade authentication or role-based access control.

This is intentional to keep the portfolio accurate. Production hardening would include authenticated users, server-enforced roles / RLS policies, stronger validation and a formal test suite.

## Why this project matters

TanShift demonstrates more than front-end development. It shows how I work across:

- business problem framing
- requirements and user stories
- workflow design
- relational data thinking
- implementation
- validation of business rules

That combination is directly relevant to Business Analyst, Systems Analyst, IT Analyst and graduate technology roles.

## Run locally

```bash
git clone https://github.com/WilliamTangq/tanshift.git
cd tanshift
npm install
cp .env.example .env.local
npm run dev
```

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Next improvements

- production authentication and role-based access
- row-level security review
- automated unit / end-to-end tests
- notification workflow for roster changes
- reporting and labour-coverage analytics
- mobile-first schedule interactions

---

**Guang Quan Tan (William)**  
Monash University · Bachelor of Information Technology (Business Information Systems)  
Melbourne, Australia  
Portfolio: https://williamtangq.github.io  
LinkedIn: https://www.linkedin.com/in/williamtangq
