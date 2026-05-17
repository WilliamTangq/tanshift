# TanShift — Smart Staff Scheduling SaaS

TanShift is a web-based staff scheduling system designed for small businesses in hospitality, retail, and service environments. The project focuses on replacing manual rostering through spreadsheets, messaging apps, and informal communication with a structured digital workflow for managers and staff.

The goal of TanShift is to improve schedule visibility, reduce manual coordination, and support clearer communication between managers and employees.

---

## Project Overview

Many small businesses still manage staff schedules using Excel files, screenshots, WhatsApp messages, or verbal updates. This creates common operational problems:

- Schedule changes are difficult to track
- Staff may work from outdated roster versions
- Leave requests and shift swaps are handled manually
- Managers spend unnecessary time coordinating availability
- Communication errors can lead to missed shifts or confusion

TanShift was built as a practical solution to these problems. It provides a centralised scheduling system where managers can create, edit, publish, and manage staff rosters while employees can view shifts and interact with scheduling workflows.

---

## My Role

I worked on TanShift as a business-focused system development project, combining business analysis, workflow design, database thinking, and web application development.

My contributions included:

- Analysing real scheduling pain points in small business environments
- Translating business problems into functional requirements
- Designing scheduling workflows for managers and staff
- Planning core system logic including draft and published roster states
- Designing database-backed features for shifts, staff, leave requests, and shift swaps
- Building application functionality using modern web technologies
- Applying user-focused design thinking to make scheduling easier to manage

This project demonstrates my ability to connect business needs with technical implementation.

---

## Key Features

### Manager Scheduling Workflow

Managers can create and manage staff schedules through a structured digital interface.

Core capabilities include:

- Create draft schedules before releasing them to staff
- Edit roster details before publishing
- Publish final schedules when ready
- Manage staff assignments by shift
- Reduce confusion caused by multiple schedule versions

### Draft and Published Schedule States

TanShift uses a draft and publish model to reflect real business scheduling behaviour.

This allows managers to:

- Prepare schedules without immediately notifying staff
- Review and adjust shifts before final release
- Publish only confirmed rosters
- Maintain better control over schedule communication

### Staff Shift Visibility

Employees can view their assigned shifts in a centralised system rather than relying on screenshots, messages, or manual updates.

This improves:

- Schedule clarity
- Staff accountability
- Access to current roster information
- Communication between managers and staff

### Leave Request Workflow

TanShift includes a leave request concept to reduce informal back-and-forth communication.

This supports:

- Structured leave submissions
- Clear visibility for managers
- Better planning around staff availability
- Reduced reliance on separate messaging apps

### Shift Swap Workflow

The shift swapping feature is designed to support common scheduling changes while keeping managers informed.

This helps reduce:

- Manual coordination
- Confusion over who is responsible for a shift
- Last-minute communication problems
- Untracked schedule changes

---

## Business Analysis Perspective

TanShift is not just a coding project. It was designed around a business operations problem.

### Problem

Small businesses often rely on manual and fragmented scheduling methods. These methods are flexible but create operational risk when schedules change frequently.

### Users

The main users are:

- Business owners
- Store managers
- Shift supervisors
- Casual and part-time employees

### Business Needs

The system needed to support:

- Simple schedule creation
- Clear communication of published shifts
- Reduced manual coordination
- Staff availability management
- Flexibility for shift changes
- Better record keeping

### Solution Approach

TanShift addresses these needs through a structured scheduling workflow, role-based usage, and database-backed roster management.

---

## Example User Stories

### Manager

- As a manager, I want to create a draft roster so that I can adjust shifts before staff can view them.
- As a manager, I want to publish a final schedule so that employees know which shifts they are working.
- As a manager, I want to review leave requests so that I can plan staffing levels more effectively.
- As a manager, I want to track shift swaps so that schedule changes remain visible and controlled.

### Employee

- As an employee, I want to view my upcoming shifts so that I know when I am working.
- As an employee, I want to request leave so that my manager can review my availability.
- As an employee, I want to request or participate in a shift swap so that schedule changes can be handled clearly.

---

## Tech Stack

| Area | Technology |
|---|---|
| Frontend | Next.js |
| Backend | Node.js |
| Database | Supabase / PostgreSQL |
| Styling | CSS / Tailwind CSS if applicable |
| Authentication | Supabase Auth if applicable |
| Version Control | Git / GitHub |

---

## System Design Thinking

TanShift was designed around core business entities and relationships.

Key entities include:

- Users
- Employees
- Managers
- Shifts
- Schedules
- Leave requests
- Shift swap requests
- Business locations or teams

The system structure supports real scheduling workflows where shifts belong to schedules, employees are assigned to shifts, and managers control schedule publication.

---

## Database Design Concepts

The project applies relational database thinking to support scheduling logic.

Important database considerations include:

- Each employee can have multiple shifts
- Each schedule can contain multiple shift records
- Leave requests need status tracking
- Shift swap requests require relationships between employees and shifts
- Published schedules should be separated logically from draft schedules
- Data integrity is important because scheduling errors can affect business operations

---

## Skills Demonstrated

This project demonstrates skills relevant to Business Analyst, Systems Analyst, IT Analyst, and Digital Operations roles.

### Business Analysis

- Requirements gathering
- Workflow analysis
- User story development
- Process improvement
- Business problem framing
- Stakeholder-focused thinking

### Systems Analysis

- System logic design
- Database-backed workflow planning
- Role-based functionality
- User interaction flow design
- Operational process modelling

### Technical Skills

- Next.js
- Node.js
- Supabase
- PostgreSQL
- SQL concepts
- Frontend development
- Git version control

### Professional Skills

- Problem solving
- Documentation
- Structured thinking
- Communication of technical concepts
- User-focused design

---

## How to Run the Project Locally

```bash
# Clone the repository
git clone https://github.com/WilliamTangq/tanshift.git

# Navigate into the project folder
cd tanshift

# Install dependencies
npm install

# Create environment variables
cp .env.example .env.local

# Start the development server
npm run dev
```

Open the application in your browser:

```bash
http://localhost:3000
```

> Note: Environment variables are required for Supabase connection and authentication features.

---

## Environment Variables

Create a `.env.local` file and include the required Supabase keys.

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Do not commit private keys or sensitive credentials to GitHub.

---

## Future Improvements

Planned improvements include:

- Calendar view for weekly and monthly rosters
- Manager approval workflow for shift swaps
- Notification system for schedule updates
- Staff availability preferences
- Role-based access control improvements
- Reporting dashboard for labour coverage and staffing patterns
- Mobile-first interface improvements
- Export schedules to PDF or CSV

---

## What I Learned

Through this project, I strengthened my ability to think beyond code and focus on business value. The most important learning was that a useful system must match real operational behaviour.

TanShift helped me develop stronger skills in:

- Turning operational problems into system requirements
- Designing workflows that reflect how users actually work
- Structuring data around business processes
- Building features that support real decision-making
- Communicating technical solutions in business terms

---

## Relevance to Target Roles

TanShift is highly relevant to the roles I am targeting because it demonstrates practical experience across business and technology.

| Target Role | Relevant Evidence |
|---|---|
| Business Analyst | Requirements, user stories, workflows, process improvement |
| Systems Analyst | System logic, database structure, role-based workflows |
| IT Analyst | Digital workflow improvement and practical technical implementation |
| Data Analyst | Structured data, database thinking, reporting potential |
| Digital Operations Analyst | Scheduling, process control, operational efficiency |

---

## Contact

**William (Guang Quan) Tan**  
Bachelor of Information Technology, Business Information Systems  
Monash University  
Melbourne, Australia

- LinkedIn: [linkedin.com/in/williamtangq](https://www.linkedin.com/in/williamtangq)
- GitHub: [github.com/WilliamTangq](https://github.com/WilliamTangq)
- Email: [tanstrifelife@gmail.com](mailto:tanstrifelife@gmail.com)

---

## Repository

If you are viewing this README from outside GitHub, the repository is available here:

[github.com/WilliamTangq/tanshift](https://github.com/WilliamTangq/tanshift)
