# Software Requirements Specification
## NewsGuard AI - Advanced Fact-Checking Platform

**Version:** 2.0
**Updated Date:** June 20, 2025

---

## Table of Contents

1.  [Introduction](#1-introduction)
    1.1. [Purpose](#11-purpose)
    1.2. [Document Conventions](#12-document-conventions)
    1.3. [Intended Audience and Reading Suggestions](#13-intended-audience-and-reading-suggestions)
    1.4. [Project Scope](#14-project-scope)
    1.5. [References](#15-references)
2.  [Overall Description](#2-overall-description)
    2.1. [Product Perspective](#21-product-perspective)
    2.2. [Product Features](#22-product-features)
    2.3. [User Classes and Characteristics](#23-user-classes-and-characteristics)
    2.4. [Operating Environment](#24-operating-environment)
    2.5. [Design and Implementation Constraints](#25-design-and-implementation-constraints)
    2.6. [Assumptions and Dependencies](#26-assumptions-and-dependencies)
3.  [System Features (Functional Requirements)](#3-system-features-functional-requirements)
    3.1. [Landing Page](#31-landing-page)
    3.2. [User Authentication](#32-user-authentication)
    3.3. [Dashboard](#33-dashboard)
    3.4. [Text Analysis](#34-text-analysis)
    3.5. [Image Analysis](#35-image-analysis)
    3.6. [Activity Logging](#36-activity-logging)
    3.7. [Admin Functionality](#37-admin-functionality)
4.  [External Interface Requirements](#4-external-interface-requirements)
    4.1. [User Interfaces](#41-user-interfaces)
    4.2. [Hardware Interfaces](#42-hardware-interfaces)
    4.3. [Software Interfaces](#43-software-interfaces)
    4.4. [Communications Interfaces](#44-communications-interfaces)
5.  [Non-Functional Requirements](#5-non-functional-requirements)
    5.1. [Performance Requirements](#51-performance-requirements)
    5.2. [Safety Requirements](#52-safety-requirements)
    5.3. [Security Requirements](#53-security-requirements)
    5.4. [Software Quality Attributes](#54-software-quality-attributes)
    5.5. [Usability](#55-usability)
    5.6. [Scalability](#56-scalability)
6.  [Other Requirements](#6-other-requirements)
    6.1. [Database](#61-database)
7.  [Appendix A: Tech Stack Summary](#appendix-a-tech-stack-summary)
    7.1. [Frontend](#71-frontend)
    7.2. [Backend/API](#72-backendapi)
    7.3. [AI / Generative AI](#73-ai--generative-ai)
    7.4. [Database](#74-database)

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) document describes the functional and non-functional requirements for the NewsGuard AI application, Version 2.0. NewsGuard AI is an advanced web-based platform that leverages cutting-edge AI to verify the authenticity of text and image content, providing users with reliable fact-checking capabilities.

### 1.2 Document Conventions
This document uses standard formatting conventions. "Shall" is used to denote mandatory requirements. "Should" indicates a recommendation. "May" indicates an optional feature or behavior.

### 1.3 Intended Audience and Reading Suggestions
This document is intended for project stakeholders, including developers, testers, project managers, and designers. Readers should familiarize themselves with the overall description before diving into specific feature requirements.

### 1.4 Project Scope
The scope of NewsGuard AI v2.0 is to provide a user-friendly interface for:
*   Public-facing landing page detailing the application's capabilities.
*   User registration and login with secure authentication.
*   AI-powered analysis of user-submitted text to classify it as "FAKE" or "REAL".
*   AI-powered analysis of user-submitted images, including OCR for text extraction, followed by classification of the extracted text.
*   Display of analysis results, including confidence scores and reasoning.
*   Persistent storage and retrieval of user activity logs.
*   Basic admin functionality to view registered users.

The project aims to provide a robust and scalable fact-checking platform, leveraging OpenAI models and Supabase PostgreSQL for data storage.

### 1.5 References
*   Next.js Documentation
*   React Documentation
*   ShadCN UI Documentation
*   Tailwind CSS Documentation
*   OpenAI Documentation
*   Supabase Documentation
*   Serper API Documentation

---

## 2. Overall Description

### 2.1 Product Perspective
NewsGuard AI is a standalone web application. It will be accessible via modern web browsers. It utilizes server-side logic for AI processing via OpenRouter API and API routes for data handling.

### 2.2 Product Features
The major features of NewsGuard AI include:
*   Informative Landing Page
*   Secure User Authentication (Signup, Login, Logout)
*   Dashboard for authenticated users
*   AI-driven Text Analysis for fake news detection
*   AI-driven Image Analysis (OCR + Text Analysis) for fake news detection
*   Display of detailed analysis results including confidence and reasoning
*   Activity Log for users to review past analyses
*   Admin panel to view registered users
*   Responsive design for desktop and mobile devices

### 2.3 User Classes and Characteristics
1.  **Regular User**:
    *   Can register, login, and logout.
    *   Can submit text and images for analysis.
    *   Can view analysis results.
    *   Can view their own activity log.
    *   Interested in verifying the authenticity of news and online content.
2.  **Administrator User**:
    *   Has all capabilities of a Regular User.
    *   Can access a special admin section to view a list of all registered users.
    *   The current admin identification is via a hardcoded email (`admin@newsguard.ai`).

### 2.4 Operating Environment
*   **Client-Side**: Modern web browsers (Chrome, Firefox, Safari, Edge) with JavaScript enabled
*   **Frontend Framework**: Next.js 15 with React 18 and TypeScript
*   **Server-Side**: Node.js 18+ runtime environment
*   **Database**: Supabase PostgreSQL with Row-Level Security (RLS)
*   **Hosting**: Vercel (Frontend + Serverless Functions)
*   **Authentication**: Supabase Auth with JWT
*   **AI Services**: OpenAI models via OpenRouter API
*   **Search**: Serper API for web search integration

### 2.5 Design and Implementation Constraints
*   The application is built using Next.js 15 with App Router and React 18 with TypeScript
*   UI components are built with ShadCN UI and styled with Tailwind CSS
*   State management is handled through React Context and Hooks
*   Authentication is implemented using Supabase Auth with JWT
*   Data persistence is handled by Supabase PostgreSQL with Row-Level Security
*   AI functionalities leverage OpenAI models through the OpenRouter API
*   Web search capabilities are provided by Serper API
*   The application follows a serverless architecture with Vercel deployment
*   All API routes are protected with authentication middleware
*   The codebase follows TypeScript strict mode and ESLint rules

### 2.6 Assumptions and Dependencies
*   Users have a stable internet connection.
*   The OpenAI models are accessible and operational.
*   The Supabase PostgreSQL database is properly configured and accessible.

---

## 3. System Features (Functional Requirements)

### 3.1 Landing Page
The application shall provide a public-facing landing page with information about NewsGuard AI.

#### 3.1.1 Navigation Bar
*   **FR-LP-NAV-1**: The navigation bar shall display the "NewsGuard AI" logo/brand name on the left.
*   **FR-LP-NAV-2**: The navigation bar shall contain links that scroll to major sections of the landing page: Home, Features, How It Works, Roadmap, FAQ.
*   **FR-LP-NAV-3**: The navigation bar shall contain an external link to "Documentation".
*   **FR-LP-NAV-4**: The navigation bar shall display "Sign In" and "Sign Up" buttons on the right.
*   **FR-LP-NAV-5**: On mobile devices, navigation links shall collapse into a hamburger menu.

#### 3.1.2 Hero Section
*   **FR-LP-HERO-1**: The hero section shall display a large, attention-grabbing headline (e.g., “Detect Fake News Instantly—From Text or Images”).
*   **FR-LP-HERO-2**: The hero section shall display a subheading summarizing the service.
*   **FR-LP-HERO-3**: The hero section shall contain primary call-to-action buttons: “Get Started (Free)” (links to signup) and “See Demo” (scrolls to "How It Works").
*   **FR-LP-HERO-4**: The hero section shall display a prominent visual (placeholder image used).

#### 3.1.3 Core Features Section
*   **FR-LP-FEAT-1**: This section shall have a title "Core Features".
*   **FR-LP-FEAT-2**: It shall display a grid of feature cards. Each card includes an icon, title, and short description.
    *   Text Analysis
    *   Image OCR & Verify
    *   Real-Time Results
    *   Evidence-Based Reasoning
*   **FR-LP-FEAT-3**: On mobile, feature cards shall stack vertically.

#### 3.1.4 How It Works Section
*   **FR-LP-HOW-1**: This section shall have a title "How NewsGuard AI Works".
*   **FR-LP-HOW-2**: It shall present a step-by-step overview of the process using a timeline or numbered list format. Steps include: Submit Content, AI-Powered Analysis, Receive Instant Classification, Review & Share (Coming Soon).

#### 3.1.5 Live Demo Section (Placeholder)
*   **FR-LP-DEMO-1**: This section shall have a title "Try NewsGuard AI (Coming Soon!)".
*   **FR-LP-DEMO-2**: It shall contain placeholder content indicating an interactive demo is planned, showing a mock JSON response.

#### 3.1.6 Open-Source & Community Section (Placeholder)
*   **FR-LP-OS-1**: This section shall have a title "Built for Transparency".
*   **FR-LP-OS-2**: It shall include text about commitment to open principles and a (placeholder) link to a GitHub repository.

#### 3.1.7 Testimonials Section (Placeholder)
*   **FR-LP-TEST-1**: This section shall have a title "What Early Adopters Are Saying".
*   **FR-LP-TEST-2**: It shall display placeholder testimonial blocks.

#### 3.1.8 Roadmap Section (Placeholder)
*   **FR-LP-ROAD-1**: This section shall have a title "Future of NewsGuard AI".
*   **FR-LP-ROAD-2**: It shall list planned enhancements with icons: User Dashboard & History, Browser Extension, API for Developers, Multi-Lingual Support.

#### 3.1.9 FAQ Section
*   **FR-LP-FAQ-1**: This section shall have a title "Frequently Asked Questions".
*   **FR-LP-FAQ-2**: It shall display a list of common questions and answers in an accordion format.

#### 3.1.10 Footer
*   **FR-LP-FOOT-1**: The footer shall be divided into columns for Brand & Copyright, Quick Links, and Social & Contact information.
*   **FR-LP-FOOT-2**: It shall display the current year in the copyright notice.
*   **FR-LP-FOOT-3**: It shall include links to social media (placeholder GitHub, Twitter, LinkedIn) and a contact email.

### 3.2 User Authentication
The application shall provide secure user authentication functionalities.

#### 3.2.1 User Signup
*   **FR-AUTH-SIGNUP-1**: The system shall provide a signup page (`/signup`).
*   **FR-AUTH-SIGNUP-2**: Users shall be able to input an email and password.
*   **FR-AUTH-SIGNUP-3**: Upon submission, the system shall register the user.
    *   An API call to `/api/auth/register` is made to store the user's email in the Supabase PostgreSQL database.
*   **FR-AUTH-SIGNUP-4**: A JWT token shall be generated and stored in `localStorage`.
*   **FR-AUTH-SIGNUP-5**: The user shall be redirected to the dashboard upon successful signup.

#### 3.2.2 User Login
*   **FR-AUTH-LOGIN-1**: The system shall provide a login page (`/login`).
*   **FR-AUTH-LOGIN-2**: Users shall be able to input their email and password.
*   **FR-AUTH-LOGIN-3**: Upon submission, the system shall authenticate the user.
*   **FR-AUTH-LOGIN-4**: A JWT token shall be generated and stored in `localStorage`.
*   **FR-AUTH-LOGIN-5**: The user shall be redirected to the dashboard upon successful login.
*   **FR-AUTH-LOGIN-6**: The system shall identify if the logged-in user is an admin based on a hardcoded email (`admin@newsguard.ai`).

#### 3.2.3 User Logout
*   **FR-AUTH-LOGOUT-1**: Authenticated users shall be able to log out.
*   **FR-AUTH-LOGOUT-2**: Upon logout, `localStorage` containing the JWT token shall be cleared.
*   **FR-AUTH-LOGOUT-3**: The user shall be redirected to the login page.

#### 3.2.4 Session Management
*   **FR-AUTH-SESS-1**: The system shall use `localStorage` to persist authentication status across browser sessions.
*   **FR-AUTH-SESS-2**: Protected routes shall check for the presence of the JWT token and redirect to login if not found.

### 3.3 Dashboard
Authenticated users shall have access to a dashboard area.

#### 3.3.1 Overview & Navigation
*   **FR-DASH-NAV-1**: The dashboard shall be accessible at `/dashboard`.
*   **FR-DASH-NAV-2**: A sidebar navigation shall be present, allowing access to:
    *   Dashboard Home
    *   Text Analysis
    *   Image Analysis
    *   Activity Log
    *   Admin Users (visible only to admin users)
*   **FR-DASH-NAV-3**: The dashboard home page shall display a welcome message and quick links to Text and Image Analysis sections.
*   **FR-DASH-NAV-4**: A top navigation bar shall display a user avatar with a dropdown for logout.

#### 3.3.2 Analysis Statistics Charts
*   **FR-DASH-STATS-1**: The dashboard home page shall display a section titled "Analysis Statistics".
*   **FR-DASH-STATS-2**: This section shall contain two bar charts: one for Text Analysis stats and one for Image Analysis stats.
*   **FR-DASH-STATS-3**: Each chart shall display the count of "FAKE" and "REAL" classifications based on the user's activity logs fetched from the Supabase PostgreSQL database via the `/api/logs` endpoint.
*   **FR-DASH-STATS-4**: Charts shall use distinct colors for "FAKE" (destructive theme color) and "REAL" (primary theme color) bars.
*   **FR-DASH-STATS-5**: Charts shall display a loading indicator while data is being fetched.
*   **FR-DASH-STATS-6**: If no data is available, a message indicating this shall be displayed.

### 3.4 Text Analysis
The system shall allow users to submit text for fake news analysis.

*   **FR-TEXT-INPUT-1**: Users shall be able to input text (10-5000 characters) into a textarea on the Text Analysis page (`/dashboard/text-analysis`).
*   **FR-TEXT-ANLZ-1**: Upon submission, the system shall invoke an OpenRouter API call to analyze the text.
    *   The API utilizes the OpenAI model (`text-davinci-003`) for text analysis.
*   **FR-TEXT-RESULT-1**: The system shall display the analysis results:
    *   Classification Label (e.g., "FAKE", "REAL")
    *   Confidence Score (0.0 to 1.0)
    *   Detailed Scores for each label (e.g., FAKE: 0.8, REAL: 0.2) presented as a bar chart.
    *   Reasoning and optional supporting links for the classification (provided by the AI model).
*   **FR-TEXT-LOG-1**: The analysis input, output, and user email shall be logged to the Supabase PostgreSQL database via the `saveAnalysisLog` service.

### 3.5 Image Analysis
The system shall allow users to submit images for text extraction and fake news analysis.

*   **FR-IMG-UPLOAD-1**: Users shall be able to upload an image file (PNG/JPEG, max 5MB) on the Image Analysis page (`/dashboard/image-analysis`).
*   **FR-IMG-UPLOAD-2**: A preview of the uploaded image shall be displayed.
*   **FR-IMG-ANLZ-1**: Upon submission, the system shall invoke an OpenRouter API call to process the image.
    *   The API utilizes the OpenAI model (`image-davinci-003`) for image analysis.
    *   The model is instructed to perform OCR to extract text from the image.
*   **FR-IMG-RESULT-1**: The system shall display the analysis results:
    *   Extracted Text (if any)
    *   Classification Label (e.g., "FAKE", "REAL")
    *   Confidence Score (0.0 to 1.0)
    *   Detailed Scores for each label (e.g., FAKE: 0.8, REAL: 0.2) presented as a bar chart.
    *   Reasoning and optional supporting links for the classification (provided by the AI model).
*   **FR-IMG-RESULT-2**: If no text is extracted from the image, a message indicating this shall be displayed, and the classification may be based on this absence.
*   **FR-IMG-LOG-1**: The analysis input (image data URI), output, and user email shall be logged to the Supabase PostgreSQL database via the `saveAnalysisLog` service.

### 3.6 Activity Logging
The system shall log user analysis activities.

#### 3.6.1 Log Storage (Supabase PostgreSQL)
*   **FR-LOG-STORE-1**: All text and image analyses performed by authenticated users shall be logged.
*   **FR-LOG-STORE-2**: Each log entry shall include a unique ID, user email, timestamp, analysis type (text/image), input data (text or image data URI), and the full analysis result (label, confidence, scores, references, extracted text for images).
*   **FR-LOG-STORE-3**: Logs shall be stored in a Supabase PostgreSQL database table named `activity_logs`.

#### 3.6.2 View Activity Log Page
*   **FR-LOG-VIEW-1**: Authenticated users shall be able to access an "Activity Log" page (`/dashboard/activity-log`).
*   **FR-LOG-VIEW-2**: The page shall display a table of the user's past analysis activities, fetched from the `/api/logs` endpoint (which queries the Supabase PostgreSQL DB).
*   **FR-LOG-VIEW-3**: Each row in the table shall summarize a log entry, showing Date, Type, Input Summary, Result Label, and Confidence.
*   **FR-LOG-VIEW-4**: Users shall be able to view detailed information for each log entry in a dialog/modal, including the full input and all result details.
*   **FR-LOG-VIEW-5**: If no logs are present, an appropriate message shall be displayed.

### 3.7 Admin Functionality
The system shall provide basic administrative capabilities.

#### 3.7.1 Admin User Role
*   **FR-ADMIN-ROLE-1**: A user logging in with the email `admin@newsguard.ai` shall be designated as an administrator.
*   **FR-ADMIN-ROLE-2**: Admin users shall have access to admin-specific UI elements and pages.

#### 3.7.2 View Registered Users Page
*   **FR-ADMIN-USERS-1**: Admin users shall be able to access an "Admin Users" page (`/dashboard/admin/users`).
*   **FR-ADMIN-USERS-2**: This page shall display a table listing all registered users (email and registration date), fetched from the Supabase `auth.users` table.
*   **FR-ADMIN-USERS-3**: Non-admin users attempting to access this page shall be redirected or shown an access denied message.
*   **FR-ADMIN-USERS-4**: The link to this page in the sidebar shall only be visible to admin users.

---

## 4. External Interface Requirements

### 4.1 User Interfaces
*   **NFR-UI-1**: The application shall have a responsive web design, adaptable to desktop, tablet, and mobile screen sizes.
*   **NFR-UI-2**: The UI shall be built using React and ShadCN UI components, styled with Tailwind CSS.
*   **NFR-UI-3**: The UI shall be intuitive and provide clear feedback to user actions (e.g., loading states, success/error messages using toasts).
*   **NFR-UI-4**: Placeholder images (`https://placehold.co`) shall be used where final assets are not yet available.
*   **NFR-UI-5**: Lucide React icons shall be used for iconography.

### 4.2 Hardware Interfaces
Not applicable. The application is web-based and relies on standard client hardware for browser access.

### 4.3 Software Interfaces
*   **Supabase**: Used for authentication, database, and real-time functionality.
    *   `@supabase/supabase-js` for client-side interactions
    *   Row-Level Security (RLS) for data access control
*   **Next.js API Routes**: Used for backend operations like fetching logs (`/api/logs`), and user management.
*   **OpenAI via OpenRouter**: For AI-powered text and image analysis.
    *   `openai` npm package for API interactions
*   **Serper API**: For web search capabilities to verify facts.
*   **Web Browser localStorage**: Used for storing authentication tokens.

### 4.4 Communications Interfaces
*   HTTP/S for communication between the client (browser) and the Next.js server/API routes.
*   WebSockets for real-time updates (via Supabase Realtime).

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements
*   **NFR-PERF-1**: Landing page and dashboard pages should load within 2 seconds on a 3G connection.
*   **NFR-PERF-2**: AI analysis results should be returned within 5-10 seconds, depending on the complexity of the input.
*   **NFR-PERF-3**: The application should support at least 100 concurrent users with minimal performance degradation.

### 5.2 Safety Requirements
*   **NFR-SAFE-1**: Content moderation should be in place to filter out harmful or inappropriate content.
*   **NFR-SAFE-2**: User data should be handled in compliance with GDPR and other relevant data protection regulations.

### 5.3 Security Requirements
*   **NFR-SEC-1**: All user authentication shall be handled by Supabase Auth with JWT.
*   **NFR-SEC-2**: All API routes shall be protected with authentication middleware.
*   **NFR-SEC-3**: Sensitive data shall be encrypted both in transit (TLS 1.3) and at rest.
*   **NFR-SEC-4**: Row-Level Security (RLS) shall be enforced on all database tables.
*   **NFR-SEC-5**: Regular security audits and dependency updates shall be performed.

### 5.4 Software Quality Attributes
*   **Maintainability**: Code is organized into components, services, and hooks. TypeScript is used for type safety.
*   **Usability**: The UI is intuitive with clear navigation and feedback mechanisms.
*   **Reliability**: The system is designed to be reliable with proper error handling and logging.
*   **Testability**: The codebase is structured to be easily testable with unit and integration tests.

### 5.5 Usability
*   **NFR-USAB-1**: The application interface shall be user-friendly and accessible (WCAG 2.1 AA compliant).
*   **NFR-USAB-2**: Clear visual feedback shall be provided for user actions.
*   **NFR-USAB-3**: Error messages shall be informative and guide users toward resolution.
*   **NFR-USAB-4**: The application shall be fully responsive and work on mobile devices.

### 5.6 Scalability
*   **NFR-SCAL-1**: The application shall be designed to scale horizontally to handle increased load.
*   **NFR-SCAL-2**: Database queries shall be optimized for performance with proper indexing.
*   **NFR-SCAL-3**: Caching strategies shall be implemented where appropriate to reduce database load.

---

## 6. Other Requirements

### 6.1 Database
*   **OR-DB-1**: The application shall use Supabase PostgreSQL for data storage.
*   **OR-DB-2**: The database schema includes tables for `users` (managed by Supabase Auth) and `activity_logs`.
*   **OR-DB-3**: Row-Level Security (RLS) shall be enabled on all tables to ensure data privacy.

### 6.2 Deployment
*   **OR-DEP-1**: The application shall be deployed on Vercel.
*   **OR-DEP-2**: Environment variables shall be managed through Vercel's environment variable system.
*   **OR-DEP-3**: CI/CD pipelines shall be set up using GitHub Actions.

### 6.3 Monitoring and Logging
*   **OR-MON-1**: Application logs shall be collected and monitored.
*   **OR-MON-2**: Error tracking shall be implemented (e.g., using Sentry).
*   **OR-MON-3**: Performance metrics shall be collected and analyzed.

---

## 7. Appendix A: Tech Stack Summary

### 7.1 Frontend
*   **Framework/Library**: Next.js 15 (App Router), React 18.x
*   **Language**: TypeScript 5.0+
*   **UI Components**: ShadCN UI (built on Radix UI)
*   **Styling**: Tailwind CSS with dark/light mode support
*   **State Management**: React Context API, React Hooks
*   **Form Handling**: React Hook Form with Zod validation
*   **Data Visualization**: Recharts
*   **Icons**: Lucide React
*   **Notifications**: Sonner
*   **Animation**: Framer Motion

### 7.2 Backend/API
*   **Framework**: Next.js API Routes
*   **Runtime**: Node.js 18+
*   **Language**: TypeScript 5.0+
*   **Authentication**: Supabase Auth with JWT
*   **API Client**: `@supabase/supabase-js`
*   **Validation**: Zod
*   **Error Handling**: Custom error handling middleware

### 7.3 AI / Generative AI
*   **AI Provider**: OpenAI via OpenRouter
*   **Models**:
    *   Text Analysis: `text-davinci-003`
    *   Image Analysis: `image-davinci-003`
*   **Features**:
    *   Text classification
    *   Image analysis with OCR
    *   Confidence scoring
    *   Evidence-based reasoning

### 7.4 Database
*   **Type**: Supabase PostgreSQL
*   **Features**:
    *   Row-Level Security (RLS)
    *   Real-time subscriptions
    *   Automatic API generation
*   **Tables**:
    *   `auth.users` (managed by Supabase Auth)
    *   `public.activity_logs` (stores user activity logs)

### 7.5 Development Tools
*   **Version Control**: Git with GitHub
*   **Package Manager**: npm
*   **Linting**: ESLint with TypeScript support
*   **Code Formatting**: Prettier
*   **Type Checking**: TypeScript
*   **Build Tool**: Turbopack
*   **CI/CD**: GitHub Actions

### 7.6 Infrastructure
*   **Hosting**: Vercel (Frontend + Serverless Functions)
*   **Database**: Supabase (PostgreSQL)
*   **Content Delivery**: Vercel Edge Network
*   **Monitoring**: Vercel Analytics
*   **Error Tracking**: Console logging (extendable to Sentry)

### 7.7 Security
*   **Authentication**: JWT with HTTP-only cookies
*   **Authorization**: Row-Level Security (RLS) in PostgreSQL
*   **Data Protection**: SSL/TLS encryption
*   **Input Validation**: Zod schema validation
*   **Rate Limiting**: API route protection
*   **CORS**: Strict CORS policies
*   **Security Headers**: CSP, X-XSS-Protection, X-Content-Type-Options

---

This SRS document provides a comprehensive overview of the NewsGuard AI application, its features, and technical implementation details. It serves as a reference for developers, designers, and stakeholders involved in the project.

---

## 4. External Interface Requirements

### 4.1 User Interfaces
*   **NFR-UI-1**: The application shall have a responsive web design, adaptable to desktop, tablet, and mobile screen sizes.
*   **NFR-UI-2**: The UI shall be built using React and ShadCN UI components, styled with Tailwind CSS.
*   **NFR-UI-3**: The UI shall be intuitive and provide clear feedback to user actions (e.g., loading states, success/error messages using toasts).
*   **NFR-UI-4**: Placeholder images (`https://placehold.co`) shall be used where final assets are not yet available.
*   **NFR-UI-5**: Lucide React icons shall be used for iconography.

### 4.2 Hardware Interfaces
Not applicable. The application is web-based and relies on standard client hardware for browser access.

### 4.3 Software Interfaces
*   **OpenRouter API**: Used for defining and running AI flows, interacting with OpenAI models.
*   **Next.js API Routes**: Used for backend operations like fetching logs (`/api/logs`), registering users (`/api/auth/register`), and fetching users for admin (`/api/admin/users`).
*   **Supabase PostgreSQL**: Local database for storing activity logs and user registration information.
    *   `@supabase/postgrest-js` npm package.
*   **Web Browser localStorage**: Used for storing JWT token and user email.

### 4.4 Communications Interfaces
*   HTTP/S for communication between the client (browser) and the Next.js server/API routes.

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements
*   **NFR-PERF-1**: Landing page and dashboard pages should load reasonably fast.
*   **NFR-PERF-2**: AI analysis results should be returned in near real-time, though actual time depends on the underlying AI model performance and complexity of the input. User should be shown a loading state during analysis.

### 5.2 Safety Requirements
*   **NFR-SAFE-1**: The OpenRouter API configuration for OpenAI models may include safety settings to filter harmful content generation, although specific configurations for these are not explicitly detailed in the current flows beyond default model behaviors.

### 5.3 Security Requirements
*   **NFR-SEC-1**: User authentication is implemented using Supabase Auth with JWT, providing secure authentication.
*   **NFR-SEC-2**: Admin access is determined by a hardcoded email, which is not secure for production.
*   **NFR-SEC-3**: Data transfer should occur over HTTPS in a production environment.

### 5.4 Software Quality Attributes
*   **Maintainability**: Code is organized into components, services, and flows. TypeScript is used for type safety.
*   **Usability**: The UI aims to be intuitive with clear navigation and feedback.
*   **Reliability**: The system should reliably perform analyses and store logs. Current reliability depends on the mock components and local Supabase setup.

### 5.5 Usability
*   **NFR-USAB-1**: The application interface shall be user-friendly and easy to navigate.
*   **NFR-USAB-2**: Clear visual feedback (loading spinners, toasts) shall be provided for user actions.
*   **NFR-USAB-3**: Error messages shall be informative.

### 5.6 Scalability
*   **NFR-SCAL-1**: The current architecture with Supabase PostgreSQL and Next.js API Routes is designed for scalability.
*   **NFR-SCAL-2**: For production, a scalable database solution (e.g., managed PostgreSQL) and a robust authentication service would be needed. OpenRouter API flows themselves can be scaled depending on the deployment environment.

---

## 6. Other Requirements

### 6.1 Database
*   **OR-DB-1**: The application shall use Supabase PostgreSQL for storing activity logs and user registration data.
*   **OR-DB-2**: The database schema includes an `activity_logs` table and a `users` table. (Schema defined in `src/lib/db.ts`).

---

## Appendix A: Tech Stack Summary

### 7.1 Frontend
*   **Framework**: Next.js 15 (App Router)
*   **UI Library**: React 18 with TypeScript
*   **Styling**: Tailwind CSS with dark/light mode support
*   **State Management**: React Hooks + Context API
*   **Form Handling**: React Hook Form with Zod validation
*   **UI Components**: ShadCN UI (built on Radix UI)
*   **Data Visualization**: Recharts
*   **Icons**: Lucide React
*   **Animation**: Framer Motion
*   **Notifications**: Sonner

### 7.2 Backend/API
*   **Runtime**: Node.js 18+
*   **API Routes**: Next.js API Routes (Serverless Functions)
*   **Authentication**: Supabase Auth with JWT
*   **Database**: Supabase PostgreSQL
*   **ORM**: Supabase Client
*   **AI/ML**: OpenAI models via OpenRouter API
*   **Search**: Serper API for web search

### 7.3 Development Tools
*   **Language**: TypeScript 5.0+
*   **Build Tool**: Turbopack
*   **Linting**: ESLint with TypeScript support
*   **Code Formatting**: Prettier
*   **Version Control**: Git with GitHub
*   **Package Manager**: npm

### 7.4 Infrastructure
*   **Hosting**: Vercel (Frontend + Serverless Functions)
*   **Database Hosting**: Supabase (PostgreSQL)
*   **CI/CD**: GitHub Actions
*   **Environment Variables**: Vercel Environment Variables
*   **Monitoring**: Vercel Analytics
*   **Error Tracking**: Console logging (extendable to Sentry)
*   **Content Delivery**: Vercel Edge Network

### 7.5 Security
*   **Authentication**: JWT with HTTP-only cookies
*   **Authorization**: Row-Level Security (RLS) in PostgreSQL
*   **Data Protection**: SSL/TLS encryption
*   **Input Validation**: Zod schema validation
*   **Rate Limiting**: API route protection
*   **CORS**: Strict CORS policies
*   **Security Headers**: CSP, X-XSS-Protection, X-Content-Type-Options

### 7.6 AI / Generative AI
*   **OpenRouter API**: Used for defining and running AI flows, interacting with OpenAI models.
    *   `@openrouter/api` plugin.
    *   `ai.defineFlow`, `ai.definePrompt`, `ai.defineTool`.
*   **AI Models**:
    *   **Primary Model**: OpenAI's `text-davinci-003` (configured as default in `src/ai/openrouter.ts` and used in `analyzeTextPrompt` and `analyzeImagePrompt`).
    *   **Functionality**:
        *   Text generation and reasoning (for providing analysis references).
        *   Multimodal input processing (image + text prompt for image analysis).
        *   OCR (implicitly handled by Gemini when processing images as part of a multimodal prompt).
*   **AI Flows**:
    *   `analyzeTextFlow` (`src/ai/flows/analyze-text.ts`):
        *   Takes text input.
        *   Uses `analyzeTextPrompt` with `gemini-1.5-flash-latest`.
        *   Utilizes a mock tool `fakeNewsClassifierTool` to simulate text classification.
        *   Returns label, confidence, scores, and references.
    *   `analyzeImageFlow` (`src/ai/flows/analyze-image.ts`):
        *   Takes an image data URI as input.
        *   Uses `analyzeImagePrompt` with `gemini-1.5-flash-latest`.
        *   Instructs the model to extract text (OCR).
        *   Utilizes a mock tool `fakeNewsClassifierForImage` to simulate classification of extracted text.
        *   Returns extracted text, label, confidence, scores, and references.
*   **Tooling**: Genkit tools are defined with Zod schemas for input/output. The current tools (`fakeNewsClassifierTool`, `fakeNewsClassifierForImage`) are mock implementations that generate random classifications for demonstration.

### 7.4 Database
*   **Type**: SQLite
*   **Packages**: `sqlite`, `sqlite3`
*   **Usage**: Local development storage for `activity_logs` and `users` tables.
*   **Access**: Via `src/lib/db.ts` service module.

---
This SRS document should provide a good overview of the TruthScan application in its current state.
```