# TanShift – Smart Staff Scheduling SaaS

TanShift is a web-based staff scheduling system designed to streamline workforce management for small and medium-sized businesses, particularly in hospitality and retail environments.

Traditional scheduling methods such as spreadsheets, messaging platforms, or paper rosters are often inefficient, error-prone, and difficult to manage at scale. TanShift addresses these challenges by introducing a structured, role-based system that improves transparency, reduces miscommunication, and enhances overall operational efficiency.

---

## Overview

TanShift provides a centralised platform where managers can plan, control, and publish schedules, while staff can access only the relevant and confirmed information. The system is designed with a clear separation between planning and execution, ensuring that incomplete or draft schedules are never exposed to employees.

From a user perspective, managers are able to create and modify weekly schedules in a controlled environment before publishing them. Once published, schedules become visible to staff, who can then view their assigned shifts, submit leave requests, or request shift swaps when necessary.

---

## Problem Context

In many small businesses, staff scheduling is still handled manually. This often leads to inconsistent communication, scheduling conflicts, and unnecessary time spent coordinating changes.

TanShift was built to transform this fragmented process into a structured digital workflow. By introducing clear system states and controlled access, it reduces ambiguity and ensures that all stakeholders are aligned on the latest schedule.

---

## System Design

A key design decision in TanShift is the implementation of a publish/unpublish workflow. Schedules are first created in a draft state, allowing managers to iterate and make adjustments freely. Only when the schedule is finalised is it published, at which point it becomes visible to staff.

This separation prevents accidental updates and ensures that employees only interact with confirmed information. The system also incorporates role-based access control, where managers have full editing capabilities while staff are limited to viewing published schedules and submitting requests.

Time tracking is handled automatically within the system. Shift durations are calculated and displayed in a user-friendly format (hours and minutes), improving clarity and usability for both managers and staff.

---

## Technology Stack

TanShift is built using a modern full-stack architecture. The frontend is developed with Next.js and Angular, providing a responsive and interactive user interface. The backend is powered by Node.js and Supabase, with PostgreSQL used as the primary database for reliable data management.

Authentication and user management are handled through Supabase Auth, enabling secure access control and role-based permissions. Deployment is planned using modern hosting platforms, with scalability in mind as the system evolves.

---

## Workflow

The core workflow of TanShift reflects real-world scheduling processes. Managers begin by creating a weekly schedule, which remains in draft mode during the planning phase. After reviewing and finalising the schedule, it is published, making it accessible to staff.

Once published, staff can review their assigned shifts and interact with the system by submitting leave requests or initiating shift swaps. If further adjustments are required, managers can revert the schedule back to draft mode, make updates, and republish it.

---

## Screenshots

Screenshots of the system interface, including the manager dashboard, staff schedule view, and request management features, will be added in future updates.

---

## Future Development

Future improvements will focus on enhancing usability and expanding system capabilities. Planned features include notification systems (email or push), mobile-first interface optimisation, payroll integration, and AI-assisted scheduling.

The long-term vision is to evolve TanShift into a scalable SaaS platform capable of supporting multiple businesses and locations.

---

## Author

**William Tan (Guang Quan Tan)**  
Bachelor of Information Technology (Business Information Systems)  
Monash University  

---

## Motivation

This project was inspired by real-world experience working in retail and hospitality, where scheduling inefficiencies are common. The goal of TanShift is to transform these everyday operational challenges into a structured, scalable, and practical digital solution.

---

## Getting Started

This project was bootstrapped using `create-next-app`.

To run the project locally, install dependencies using:

npm install

Then start the development server:

```
npm run dev  
# or  
yarn dev  
# or  
pnpm dev  
# or  
bun dev
```

Open http://localhost:3000 in your browser to view the application.

You can begin editing the project by modifying:

app/page.tsx  

The application will automatically update as changes are made.

---

## Font Optimisation

This project uses `next/font` to optimise and load the Geist font family, developed by Vercel, ensuring improved performance and visual consistency.

---

## Resources

For more information about Next.js:

Next.js Documentation – https://nextjs.org/docs  
Learn Next.js – https://nextjs.org/learn  
Next.js GitHub – https://github.com/vercel/next.js  

---

## Deployment

The application is intended to be deployed using Vercel, which provides seamless integration with Next.js projects.

More details can be found here:  
https://nextjs.org/docs/app/building-your-application/deploying  

---

## Live Demo

A live demo will be available in future updates.

---
