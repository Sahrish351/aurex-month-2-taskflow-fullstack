# TaskFlow — AUREX Month 2 Full-Stack Internship
## Product Requirements Document (PRD) and Antigravity Build Brief

**Version:** 1.0  
**Purpose:** Build a complete, polished, working application that follows the AUREX Month 2 Full-Stack Engineering Internship roadmap.  
**Project:** TaskFlow — Authenticated Task Management System  
**Target stack:** React + Vite, Node.js + Express, MongoDB Atlas + Mongoose, JWT + bcrypt  
**Deployment target:** Frontend on Vercel; backend on Render or Railway; database on MongoDB Atlas.

---

## 1. Source Requirements and Scope

This PRD is based on the two AUREX Month 2 documents provided:
- *AUREX Month 2 Full-Stack Engineering Internship Roadmap* (31-page document)
- *AUREX Full-Stack Engineering — Month 2 Roadmap & Guidelines* (2-page consolidated PDF)

AUREX Month 2 is a four-week progression with four integrated deliverables:
1. React component-based Task Manager.
2. API-based dashboard demonstrating API integration and async states.
3. Node/Express REST API with MongoDB/Mongoose CRUD.
4. Authenticated full-stack Task Management System.

The final application must demonstrate the progression and concepts, not merely provide a static UI. AUREX explicitly expects interns to understand and explain their submitted code.

### 1.1 Month 2 Learning Outcomes
Demonstrate:
- React, JSX, functional components, component hierarchy, props, `useState`, `useEffect`, event handling, controlled forms, validation, list and conditional rendering.
- REST API concepts, HTTP methods, request/response handling, JSON, loading/error/empty states, search and filtering.
- Node.js and Express, routes, controllers, middleware, environment variables, request/response handling.
- MongoDB Atlas, Mongoose schemas/models, validation and persistent CRUD.
- Authentication and authorization: bcrypt password hashing, JWT, protected routes, user-specific data isolation.
- Full-stack integration: React → API → Express → MongoDB.
- Git/GitHub, meaningful commits, testing, deployment and documentation.

---

## 2. Product Overview

### 2.1 Product Name
**TaskFlow**

### 2.2 Product Goal
Create a user-friendly, responsive task management application where authenticated users can organize their work and personal tasks while demonstrating the complete Month 2 full-stack development cycle.

### 2.3 User Types
- **Guest:** Can view landing page, register or log in.
- **Authenticated user:** Can manage only their own tasks and profile/authentication state.

There is no admin role in the Month 2 scope.

### 2.4 Success Criteria
The project is successful when:
- The four weekly deliverables are present and documented.
- The final TaskFlow application works end-to-end.
- Authentication is implemented using bcrypt and JWT.
- Protected APIs require a valid token.
- User A cannot read, edit or delete User B's tasks.
- CRUD persists in MongoDB.
- Frontend and backend are deployed, where deployment is feasible.
- Testing evidence, screenshots, API documentation and Postman collection are included.
- GitHub contains meaningful commits and no secrets.
- The intern can explain the project architecture and major flows.

---

## 3. Technology Stack

### Frontend
- React
- Vite
- React Router
- JavaScript (use TypeScript only if the existing project already uses it; do not needlessly convert)
- CSS Modules, plain CSS, or a clearly organized CSS system
- Fetch API (preferred for keeping the implementation straightforward)

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- bcrypt
- JWT
- Middleware for authentication, validation and error handling

### Development and QA
- Git and GitHub
- Postman or Insomnia
- Browser Developer Tools
- React Developer Tools as optional

### Deployment
- Frontend: Vercel
- Backend: Render or Railway
- Database: MongoDB Atlas

Do not add a complex framework, paid service, unnecessary AI feature, or extra database unless the requirement clearly calls for it.

---

## 4. Architecture

```text
Browser / React + Vite
        |
        | HTTP requests (JSON; auth token as configured)
        v
Express API / Node.js
   |            |
Auth routes   Task routes
   |            |
JWT middleware / validation / controllers
        |
        v
MongoDB Atlas + Mongoose
```

Use a clean separation of concerns.

Suggested repository:

```text
taskflow-aurex-month-2/
├── README.md
├── .gitignore
├── docs/
│   ├── PRD.md
│   ├── API.md
│   ├── DATABASE.md
│   ├── TESTING.md
│   └── SUBMISSION_REPORT.md
├── week-1-react-task-manager/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
├── week-2-api-dashboard/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
├── week-3-crud-api/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── README.md
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   ├── package.json
│   └── README.md
├── postman/
│   └── TaskFlow.postman_collection.json
└── screenshots/
    ├── README.md
    └── [captured screenshots]
```

The four week folders should remain runnable, understandable and clearly documented. Do not fabricate completed work in a weekly deliverable. Where possible, reuse learning or code concepts without copying the final app into earlier tasks in a way that erases their independent purpose.

---

## 5. User Experience and Visual Design

### 5.1 Design Direction
Create an editorial, premium, warm, light interface. Avoid a generic template, excessive gradients, dark-only styling, crowded screens, or decorative elements that compromise usability.

Suggested palette:
- Background: warm ivory `#FAF8F3`
- Surface: white `#FFFFFF`
- Primary text: deep forest `#183C32`
- Primary action: green `#2F6B52`
- Secondary surface: pale sage `#E6EFE8`
- Muted text: `#68746D`
- Border: `#E6E7E0`
- Accent: restrained coral or terracotta `#D98270` for occasional emphasis

Typography: choose a clear, modern pairing (e.g., a restrained serif for page headings and a readable sans-serif for UI/body). Use fonts responsibly; provide fallbacks.

### 5.2 UI Quality
- Consistent spacing and typography system.
- Clear hierarchy and readable contrast.
- Responsive mobile, tablet and desktop layout.
- Keyboard-accessible controls, visible focus states and semantic HTML.
- Buttons and links must have real behavior.
- Form validation feedback must be helpful and visible.
- Loading states should use appropriate skeletons or indicators.
- Empty states should explain what to do next.
- Error states should be actionable and not expose internal details.
- Use subtle, restrained transitions; respect reduced-motion preference.
- Avoid excessive animation, auto-playing effects and distracting motion.
- No fake charts or invented user activity.
- No dead buttons, dummy links or placeholder actions in the finished application.

### 5.3 Public Pages
#### Landing page
- TaskFlow logo/wordmark.
- Navigation to features, login and register.
- Hero section with clear value proposition and CTA.
- Product preview or genuine application UI preview.
- Feature sections describing task organization, filters, completion and privacy.
- Footer with project information and links.
- Responsive design.

#### Login page
- Email and password.
- Validation and helpful errors.
- Loading/disabled submit state.
- Link to registration.
- No app dashboard navigation on auth pages unless needed for a clear return flow.

#### Register page
- Name, email, password and confirmation.
- Validate required fields, email format and password requirements.
- Password visibility toggle if implemented accessibly.
- Link to login.
- Loading, success and error states.

### 5.4 Authenticated Application
#### Main dashboard
- Welcome header and user name when available.
- Overview statistics derived from actual task data: total, completed, active, overdue (if due dates exist).
- Task list/table/cards responsive to screen width.
- Create task action.
- Search.
- Filters (All, Active, Completed; optionally priority).
- Sort control if implemented.
- Clear empty state.
- Logout.

#### Task creation/editing
Task fields:
- Title (required, reasonable max length).
- Description (optional).
- Status: active/completed.
- Priority: low/medium/high (optional but supported).
- Due date (optional).
- Created/updated timestamps managed by server.

The AUREX-required core is add, view, edit, delete, complete and filter. Priority and due date are enhancements, not substitutes for core requirements.

#### Task details (optional)
A detail view or modal may show title, description, dates and status. Do not build an unnecessary complex route if a well-designed dialog suffices.

#### User menu
- User name/email.
- Logout.
- Optional simple account/profile display, but do not add profile editing unless it can be completed properly.

---

## 6. Functional Requirements

### 6.1 Week 1 — React Task Manager
Build a separate React/Vite task manager with:
- Add task.
- Display task list.
- Delete task.
- Mark/unmark task complete.
- Basic input validation.
- Reusable components.
- Component structure similar to:
  - App
  - Header
  - TaskForm
  - TaskList
  - TaskItem
- Use `useState`.
- Use controlled inputs.
- Use events such as `onClick`, `onChange`, `onSubmit`.
- Render lists with stable keys.
- Conditional rendering.
- Clean component hierarchy and readable code.
- Persisting in localStorage is acceptable for this Week 1 standalone learning task, but the final full-stack application must use backend persistence.

### 6.2 Week 2 — API-Based Dashboard
Build a separate React/Vite dashboard consuming a public/mock REST API. Use a well-documented API that is available during implementation. Prefer an API with stable, publicly accessible endpoints and avoid relying on a secret key.

Requirements:
- Display API records.
- Search records.
- Filter records.
- View details.
- Add record using POST where the API supports it.
- Update record where supported.
- Delete record where supported.
- `useEffect` for data loading.
- Fetch API requests using Fetch API or Axios.
- Loading state.
- Error state.
- Empty state.
- Responsive interface.
- Navigation.
- Reusable components.
- Document the API used and clearly state if the API simulates mutations or does not persist them.

Do not misrepresent simulated API changes as persistent data.

### 6.3 Week 3 — CRUD Backend
Create a standalone backend learning deliverable using Node, Express, MongoDB Atlas and Mongoose.

Required endpoints (use an `items` resource or a clearly documented equivalent):
- `POST /api/items` — create.
- `GET /api/items` — read all.
- `GET /api/items/:id` — read one.
- `PUT /api/items/:id` — update.
- `DELETE /api/items/:id` — delete.

Requirements:
- MongoDB connection via environment variable.
- Mongoose schema/model.
- Basic data validation.
- Persistence.
- Proper status codes.
- Organized routes/controllers/models/config.
- Error handling.
- Postman/Insomnia testing for successful and unsuccessful requests.
- Endpoint documentation.
- No secrets in Git.

### 6.4 Week 4 — Final Authenticated TaskFlow App
The final app must use the React frontend and the user's own Express backend with MongoDB.

#### Authentication
- Register.
- Login.
- Logout.
- Get current authenticated user (`GET /api/auth/me`).
- Hash passwords with bcrypt before storing.
- Never store plain-text passwords.
- Generate and verify JWT tokens.
- Protect task routes.
- Validate auth inputs.
- Handle duplicate email.
- Handle invalid credentials without revealing unnecessary information.
- Handle expired/invalid tokens.
- Authenticated UI and route behavior.
- Token storage and transport must be selected carefully and documented. Do not expose secrets or use unsafe shortcuts; prefer a secure approach compatible with deployment. If cookie-based auth is chosen, implement cookie settings and CSRF considerations appropriately. If bearer-token storage is used, explain the tradeoffs and protect against common risks.

#### Task management
Authenticated users can:
- Create task.
- Read their tasks.
- Read one task if the detail endpoint is implemented.
- Edit task.
- Delete task.
- Mark task complete/incomplete.
- Filter tasks.

#### Data isolation
- Every task is associated with its owner.
- Backend derives the user identity from verified authentication middleware.
- Queries and mutations are scoped to the authenticated user's ID.
- Never accept an owner/user ID from the frontend as authority.
- User A must not access, modify or delete User B's records, even if User A guesses the task ID.

---

## 7. Database Requirements

### User model
Suggested fields:
- `name` — required, trimmed.
- `email` — required, normalized, unique.
- `passwordHash` — required; never return it in API responses.
- timestamps.

### Task model
Suggested fields:
- `title` — required, trimmed, validated.
- `description` — optional.
- `status` — active/completed.
- `priority` — low/medium/high, if included.
- `dueDate` — optional.
- `owner` — required reference to User.
- timestamps.

### Database practices
- Use Mongoose models and schema validation.
- Unique email index.
- Never store plain-text passwords.
- Use appropriate query scoping for owner.
- Avoid returning secrets or password hashes.
- Use MongoDB Atlas.
- Provide a documented sample `.env.example`, not actual credentials.

---

## 8. API Specification

Use a consistent JSON response format. It may be refined during development but must be documented.

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (authenticated)

### Tasks (authenticated)
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id` (optional but recommended)
- `PUT /api/tasks/:id`
- `PATCH /api/tasks/:id/status` (optional; alternatively use PUT)
- `DELETE /api/tasks/:id`

### General
- `GET /api/health` — health check.

### Response behavior
- Use suitable HTTP status codes (200, 201, 400, 401, 403 where appropriate, 404, 409 for conflict where appropriate, 500).
- Validate inputs.
- Do not expose stack traces or sensitive information in production responses.
- Handle malformed IDs and missing records.
- Handle database errors centrally.
- Include a clear error message suitable for a user/client.
- Document request/response examples in `docs/API.md` and Postman collection.

---

## 9. Frontend Requirements

### Components (suggested)
- `App`
- `PublicLayout`
- `AuthLayout`
- `DashboardLayout`
- `Header`
- `Sidebar` or responsive navigation
- `TaskForm`
- `TaskList`
- `TaskCard` or `TaskItem`
- `TaskFilters`
- `TaskStats`
- `EmptyState`
- `LoadingState`
- `ErrorState`
- `ConfirmDialog`
- `ProtectedRoute`
- `Toast` or notification component, if implemented

### State
- React state for form and UI state.
- Context API is acceptable for auth state if appropriate.
- Avoid adding Redux or other large state libraries unless necessary.
- Keep API data state understandable and avoid duplicated state.

### API layer
- Centralized service/helper for API calls.
- API base URL from environment variable.
- Handle auth consistently.
- Handle loading, success and error states.
- Do not hardcode production URLs into components.

### Routes (suggested)
- `/` — landing.
- `/login` — login.
- `/register` — registration.
- `/dashboard` — authenticated dashboard.
- Optional `/tasks/:id` — details if necessary.

Redirect behavior should be sensible and avoid redirect loops.

---

## 10. Security Requirements

Mandatory:
- `.env` files are excluded by `.gitignore`.
- `.env.example` contains placeholders only.
- No secrets, API keys, passwords or database credentials in GitHub.
- Passwords are hashed with bcrypt.
- JWT secrets come from environment variables.
- Authentication middleware verifies tokens.
- Protected endpoints require authentication.
- Task access is owner-scoped.
- Validate request data on backend.
- Avoid leaking stack traces or sensitive details.
- Use appropriate CORS configuration for deployed frontend.
- Consider rate limiting for auth routes and basic security headers.
- Never rely solely on frontend route protection.
- Never use frontend-supplied owner ID as an authorization check.
- Do not create a backdoor, demo bypass or hardcoded user.
- If security configuration cannot be completed, document the limitation honestly.

---

## 11. Testing Plan

### Week 1
- Create task.
- Empty/invalid task submission.
- Complete/uncomplete.
- Delete.
- List rendering.
- Responsive layout.

### Week 2
- API request success.
- API failure.
- Loading state.
- Empty result.
- Search.
- Filter.
- Details.
- Mutation behavior and API limitations documented.

### Week 3
- POST valid record.
- POST invalid record.
- GET all.
- GET by ID.
- PUT update.
- DELETE.
- Invalid ID.
- Missing record.
- Database unavailable/error behavior.
- Verify in Postman or Insomnia.

### Week 4 Authentication
- Successful registration.
- Duplicate registration.
- Invalid registration.
- Successful login.
- Wrong password.
- Invalid login.
- Get current user with valid token.
- Request without token.
- Invalid/expired token.
- Logout and client auth-state behavior.

### Week 4 Tasks
- Create task.
- Read tasks.
- Update task.
- Delete task.
- Complete task.
- Filter.
- Validation.
- Task persistence.

### Isolation
- Register User A and User B.
- Create tasks for both.
- Verify A only sees A's tasks.
- Verify A cannot read, update or delete B's task by ID.
- Verify B's tasks remain intact after A's attempted actions.

### Automated tests
Implement sensible automated tests if time and project setup allow. Test API/auth/ownership behavior with a test database that does not contain real user data. Do not claim tests pass unless they were actually executed.

---

## 12. Deployment

### MongoDB Atlas
- Create database and user with minimum practical privileges.
- Configure network access responsibly.
- Store connection URI in backend environment variables.
- Never commit the URI.

### Backend
- Deploy to Render or Railway.
- Set production environment variables:
  - `PORT` (platform may supply this)
  - `MONGODB_URI`
  - `JWT_SECRET`
  - frontend origin/CORS configuration as required
  - token configuration as required
- Verify health endpoint.
- Verify API and auth from deployed frontend.
- Ensure deployment logs do not reveal secrets.

### Frontend
- Deploy to Vercel.
- Configure API base URL.
- Test login, logout and task operations against production backend.
- Verify direct navigation/refresh of frontend routes.

Deployment is only complete when URLs are actually verified. Do not invent or falsely report deployment success.

---

## 13. GitHub and Git Requirements

### Repository
Use a clear repository name such as:
`aurex-month-2-taskflow-fullstack`

### Git
- Create repository if not already present.
- Inspect current repository, branch and remote before making changes.
- Do not overwrite existing unrelated work.
- Commit in small meaningful steps.
- Commit messages should be natural and specific, e.g.:
  - `set up react task manager`
  - `add task creation and completion`
  - `build api dashboard with search`
  - `add mongoose item endpoints`
  - `implement user registration and login`
  - `protect task routes`
  - `connect frontend to task api`
  - `add tests and submission docs`
- Push to the intended GitHub repository/branch.
- Do not force-push unless the user explicitly approves and it is genuinely required.
- Never push secrets.
- Check `git status` and review staged changes before each commit.

### `.gitignore`
Ensure it covers:
- `node_modules`
- `.env` and environment variants
- build output
- coverage
- logs
- local IDE/system files where appropriate

Keep `.env.example` files with placeholders.

---

## 14. Documentation

Create a complete root README containing:
- Project title and purpose.
- AUREX Month 2 scope.
- Feature list.
- Technology stack.
- Repository structure.
- Setup instructions for frontend/backend.
- Environment setup with example variables.
- How to run each week deliverable.
- How to run the final app.
- API overview.
- Database models.
- Authentication and data isolation explanation.
- Testing commands and verified results.
- Deployment URLs only when verified.
- Screenshots.
- Known limitations.
- Learning summary.

Also create:
- `docs/API.md`
- `docs/DATABASE.md`
- `docs/TESTING.md`
- `docs/SUBMISSION_REPORT.md`

Use simple, natural code comments. Comments should explain a real reason or tricky behavior, not narrate obvious code or use robotic/AI-style filler. Keep code readable through naming and structure.

---

## 15. Screenshot and Evidence Requirements

Capture genuine screenshots of the completed, running application. Do not create mock screenshots or use image generation to fake application screens.

Suggested screenshot checklist:
1. Landing page — desktop.
2. Landing page — mobile.
3. Register page.
4. Login page.
5. Dashboard overview.
6. Task list with active tasks.
7. Completed-task filter.
8. Create/edit task UI.
9. Search/filter behavior.
10. Empty state.
11. Validation/error state.
12. Week 1 React Task Manager.
13. Week 2 API dashboard.
14. Week 3 API evidence (Postman/Insomnia, sanitized).
15. MongoDB model/Atlas evidence (no credentials).
16. User isolation test evidence (sanitized).
17. Responsive dashboard/mobile view.
18. Deployment views, if deployed.

Screenshots must be taken from the real running application and must not expose secrets, private user information or credentials.

---

## 16. Submission Report and PDF

Create a polished **AUREX Month 2 TaskFlow Submission Report** in Markdown and PDF.

The report should include:
1. Cover/title and project details.
2. Internship Month 2 objective.
3. Project overview and solution.
4. Technology stack.
5. Architecture diagram.
6. Repository structure.
7. Week 1 deliverable and screenshots.
8. Week 2 deliverable and screenshots.
9. Week 3 deliverable, API endpoints and test evidence.
10. Week 4 final application and screenshots.
11. Authentication flow.
12. Data model.
13. Data isolation evidence.
14. API documentation summary.
15. Testing summary with actual results.
16. Deployment URLs (only verified).
17. GitHub URL.
18. Challenges and solutions.
19. Learning outcomes.
20. Known limitations.
21. Conclusion.

PDF layout:
- Professional, readable and polished.
- Cover page and table of contents.
- Consistent headings, page numbers and footer.
- Screenshots placed with captions and sized to fit.
- Use actual screenshots captured from the running app.
- Avoid giant images, overflow, blank pages and unreadable captions.
- Export to a clearly named file such as `TaskFlow_AUREX_Month2_Submission_Report.pdf`.
- Also keep source Markdown report for future edits.

---

## 17. Acceptance Checklist

### Required scope
- [ ] Week 1 standalone React Task Manager.
- [ ] Week 2 API dashboard.
- [ ] Week 3 standalone Express/Mongoose CRUD backend.
- [ ] Week 4 integrated TaskFlow full-stack app.

### React
- [ ] React/Vite setup.
- [ ] Components and JSX.
- [ ] Props and state.
- [ ] Controlled forms and validation.
- [ ] Events.
- [ ] List/conditional rendering.
- [ ] `useState`.
- [ ] `useEffect`.
- [ ] Reusable components.
- [ ] Search/filter.
- [ ] Loading/error/empty states.
- [ ] Responsive UI.

### Backend
- [ ] Node/Express server.
- [ ] Organized routes/controllers/models/config.
- [ ] REST methods.
- [ ] Mongoose.
- [ ] MongoDB connection.
- [ ] CRUD.
- [ ] Validation.
- [ ] Error handling.
- [ ] Proper status codes.

### Auth/security
- [ ] Register.
- [ ] Login.
- [ ] Logout.
- [ ] bcrypt password hashing.
- [ ] JWT.
- [ ] Protected APIs.
- [ ] Current-user endpoint.
- [ ] Ownership scoping.
- [ ] User isolation tested.
- [ ] No secrets in Git.

### Quality and submission
- [ ] Postman collection.
- [ ] Automated tests where feasible and executed.
- [ ] README and docs.
- [ ] Screenshots.
- [ ] Submission report Markdown.
- [ ] Submission report PDF.
- [ ] Frontend deployed and verified (where practical).
- [ ] Backend deployed and verified (where practical).
- [ ] GitHub pushed.
- [ ] No broken links/dead controls.
- [ ] Build/lint/tests checked where configured.
- [ ] User can explain the project.

---

## 18. Antigravity Execution Instructions

Act as a senior full-stack engineer, but build this as a learning project that the intern can understand and explain. Follow the requirements above faithfully.

### Work process
1. Inspect the workspace and Git repository before changing anything. Identify existing files, branch, remote, scripts and project state.
2. Read this PRD fully.
3. Produce a concise implementation plan with phases and checklists in a project progress file (e.g. `docs/BUILD_PROGRESS.md`).
4. Implement the project phase-by-phase, keeping the four weekly deliverables independent and runnable.
5. Do not skip required features just to make the dashboard visually impressive.
6. Use simple, natural comments only where they help explain code.
7. Do not use fake functionality, placeholder buttons, fabricated API results, simulated authentication or hardcoded credentials.
8. If an API is simulated by a third-party service, document its limitation.
9. Keep code modular but avoid unnecessary architecture complexity.
10. Run install/build/lint/tests where scripts exist. Fix errors rather than claiming success.
11. Verify frontend/backend locally and test core flows.
12. Perform auth and user-isolation tests.
13. Prepare Postman collection and docs.
14. Capture real screenshots from the application.
15. Create Markdown and PDF submission reports with genuine screenshots.
16. Review `.gitignore` and inspect staged files to prevent secret leakage.
17. Make meaningful commits.
18. Push to the intended GitHub repository only after checking the remote and branch. If repository creation, authentication or permission requires the user's action, stop at that exact blocker and explain it clearly without pretending it succeeded.
19. Verify the deployed application if deployment is possible; report actual URLs and status.
20. Update the progress document with completed tasks, test results, remaining tasks and blockers.

### Communication and transparency
- Do not say a feature is complete until it is implemented and verified.
- Do not fabricate test results, screenshots, URLs or GitHub pushes.
- If an external credential or account action is needed, provide exact instructions and wait for the user.
- Explain major decisions in straightforward language.
- Prioritize the required internship scope and reliable implementation over unnecessary extras.
- Ensure the final handoff includes: GitHub repository URL, verified deployment URLs if available, screenshots, report PDF and Markdown, Postman collection, test results, and a concise list of what the intern should understand before submission.

**Definition of done:** The requirements are implemented to the extent possible, verified, documented, screenshot evidence is genuine, Git changes are reviewed and pushed when authorized and possible, and any remaining blockers are clearly reported.
