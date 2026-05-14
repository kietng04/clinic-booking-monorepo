# Clinic Manual Regression Combined Report

- Generated at (UTC): 2026-03-18T14:47:53Z
- Workspace: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend`
- Source directory: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression`
- Coverage summary: `204 Passed / 49 Failed / 15 Blocked / 2 Skipped / 0 Not started`
- Combined source files: `test-cases.md`, `coverage-status.md`, `bug-log.md`, `execution-log.md`, `next-targets.md`
---

## test-cases.md

# Manual Regression Test Inventory

Source of truth for loop-based manual testing with MCP Playwright.

Status model:
- `Not started`
- `In progress`
- `Passed`
- `Failed`
- `Blocked`
- `Skipped`

Evidence expectations per executed case:
- A short result note in `coverage-status.md`
- Screenshots, traces, or exported artifacts when relevant
- A bug entry in `bug-log.md` for every failed behavior

## Public And Auth

| ID | Area | Priority | Scenario | Expected Result |
| --- | --- | --- | --- | --- |
| PUB-001 | Public | High | Open `/` landing page | Page renders without crash and key marketing content is visible |
| PUB-002 | Public | High | Open `/login` | Login form renders and accepts input |
| PUB-003 | Public | Medium | Open `/register` | Registration form renders and primary fields are visible |
| PUB-004 | Auth | Medium | Open `/forgot-password` | Forgot password flow renders with submit action |
| PUB-005 | Auth | Medium | Open `/verify-email` | Verification UI renders without crash |
| PUB-006 | Auth | Medium | Open `/verify-phone` | Verification UI renders without crash |
| AUTH-001 | Auth | High | Login as patient with seeded account | Redirects to patient dashboard and authenticated UI is visible |
| AUTH-002 | Auth | High | Login as doctor with seeded account | Redirects to doctor dashboard and authenticated UI is visible |
| AUTH-003 | Auth | High | Login as admin with seeded account | Redirects to admin dashboard and authenticated UI is visible |
| AUTH-004 | Auth | High | Login with invalid credentials | Error state is shown and no authenticated session is created |
| AUTH-005 | Auth | Medium | Visit protected patient route while logged out | User is redirected to login or denied correctly |
| AUTH-006 | Auth | High | Cross-role route access checks | Unauthorized role cannot use protected routes of another role |
| AUTH-007 | Auth | Medium | Logout from authenticated session | Session clears and user returns to public state |

## Patient Flows

| ID | Area | Priority | Scenario | Expected Result |
| --- | --- | --- | --- | --- |
| PAT-001 | Patient Dashboard | High | Open `/dashboard` as patient | Dashboard widgets render and page is usable |
| PAT-002 | Doctor Search | High | Open `/find-doctors` and search/filter doctors | Doctor list and filtering work without errors |
| PAT-003 | Booking | High | Open `/appointments/book` and attempt booking flow | Booking UI loads and patient can complete or progress through appointment creation |
| PAT-004 | Appointments | High | Open `/appointments` and inspect existing appointments | Appointment list renders with current state |
| PAT-005 | Appointment Detail | Medium | Open one appointment detail if available | Detail page renders correct data or graceful empty state |
| PAT-006 | Payments | Medium | Open `/payments` | Payment history renders or empty state is correct |
| PAT-007 | Medical Records | High | Open `/medical-records` and inspect one record if available | Records list/detail render without crash |
| PAT-008 | Health Metrics | Medium | Open `/health-metrics` | Charts/cards render or empty state is valid |
| PAT-009 | Family | Medium | Open `/family` and test add/edit/remove when available | Family management UI behaves correctly |
| PAT-010 | Notifications | Medium | Open `/notifications` | Notifications list renders and actions work if present |
| PAT-011 | Patient Consultations | High | Open `/patient/consultations` and enter consultation flow | Consultation list/new/detail flow works or fails gracefully with evidence |
| PAT-012 | Profile | High | Open `/profile`, `/profile/security`, `/profile/notifications` | Profile settings pages render and save actions behave correctly |

## Doctor Flows

| ID | Area | Priority | Scenario | Expected Result |
| --- | --- | --- | --- | --- |
| DOC-001 | Doctor Dashboard | High | Open `/dashboard` as doctor | Dashboard renders doctor-specific overview |
| DOC-002 | Appointments | High | Open `/doctor/appointments` | Appointment management list renders and actions respond correctly |
| DOC-003 | Schedule | High | Open `/schedule` | Schedule page loads and doctor can inspect or modify availability |
| DOC-004 | Patients | High | Open `/patients` | Patient list/detail access works without unauthorized leakage |
| DOC-005 | Consultations | High | Open `/consultations` and one consultation detail if available | Consultation list/chat render and core interactions work |
| DOC-006 | Analytics | Medium | Open `/doctor/analytics` | Analytics charts and summary cards render correctly |
| DOC-007 | Create Medical Record | Medium | Open `/doctor/create-medical-record` and try record creation | Form loads and create action behaves correctly |
| DOC-008 | Profile | Medium | Open doctor profile/settings pages | Settings pages load and persist behavior is correct |

## Admin Flows

| ID | Area | Priority | Scenario | Expected Result |
| --- | --- | --- | --- | --- |
| ADM-001 | Admin Dashboard | High | Open `/dashboard` as admin | Admin dashboard renders with expected summary blocks |
| ADM-002 | Users | High | Open `/users` and inspect management actions | User management list and core actions work |
| ADM-003 | Doctors | High | Open `/doctors` and inspect approval or management actions | Doctor management works and state changes are visible |
| ADM-004 | Clinics | Medium | Open `/admin/clinics` | Clinic management renders and actions respond |
| ADM-005 | Services | Medium | Open `/admin/services` | Service management renders and CRUD-like actions behave correctly |
| ADM-006 | Rooms | Medium | Open `/admin/rooms` | Room management renders and actions behave correctly |
| ADM-007 | Reports | High | Open `/admin/reports` and run key report filters/exports if present | Reporting UI renders and main data interactions succeed |
| ADM-008 | Profile | Medium | Open admin profile/settings pages | Profile/settings pages are usable |

## Cross-Cutting And Resilience

| ID | Area | Priority | Scenario | Expected Result |
| --- | --- | --- | --- | --- |
| X-001 | Navigation | High | Use sidebar/top-nav links after login for each role | Navigation routes correctly and no broken links appear |
| X-002 | Session | High | Refresh page on authenticated route | Session restoration works or failure is explicit and consistent |
| X-003 | Error Handling | High | Trigger at least one meaningful invalid form submission per role | Validation or server error feedback is visible and actionable |
| X-004 | Console/Network | High | Monitor browser console and failed network requests while testing | Unexpected console errors or failing API calls are logged as bugs |
| X-005 | Responsiveness | Medium | Sample key pages on a narrower viewport | Layout remains usable without severe overlap/blocking issues |
| X-006 | Route Coverage | High | Visit all public and role routes defined in routing contract | Each route either works or is explicitly logged as failed/blocked |

## Expanded Batch 2

| ID | Area | Priority | Scenario | Expected Result |
| --- | --- | --- | --- | --- |
| SC-AUTH-002 | Landing | Medium | Verify hero, CTA, and key sections on `/` | Core landing content is visible and readable |
| SC-AUTH-003 | Landing | Medium | Click primary CTA from landing | User reaches the intended auth or app entrypoint |
| SC-AUTH-004 | Landing | Medium | Open chatbot/help widget if present on landing | Widget opens without breaking layout or navigation |
| SC-AUTH-010 | Auth | Medium | Submit login with empty fields | Client-side validation blocks invalid submission |
| SC-AUTH-011 | Auth | Medium | Submit login with malformed email | Validation feedback is shown clearly |
| SC-AUTH-012 | Auth | Medium | Use a quick-login shortcut if present | Shortcut signs into the selected role correctly |
| SC-AUTH-014 | Auth | Medium | Submit register form with empty required fields | Validation messages are shown for missing fields |
| SC-AUTH-015 | Auth | Medium | Submit register form with mismatched passwords | Password mismatch feedback is shown |
| SC-AUTH-016 | Auth | Medium | Submit register form with duplicate or invalid data | Server or UI error is shown gracefully without crash |
| SC-AUTH-020 | Auth Recovery | Medium | Submit forgot-password with malformed email | Validation message is shown before submit or after safe reject |
| SC-AUTH-021 | Auth Recovery | Low | Submit forgot-password with unknown email | Flow stays stable and handles the unknown account safely |
| SC-AUTH-024 | Verification | Medium | Try verify-phone with incomplete OTP | Verify action remains blocked or validation is shown |
| SC-AUTH-025 | Verification | Low | Use resend OTP action if available | UI updates correctly without breaking the flow |
| SC-AUTH-026 | Reset | Low | Open `/reset-password` without valid reset context | Graceful invalid-token or neutral reset state is shown |
| SC-AUTH-033 | Session | Medium | Open a new tab with a protected route while already signed in | Session handling remains consistent across tabs |
| SC-PAT-011 | Doctor Search | Medium | Clear doctor search/filter inputs after narrowing results | Full doctor list is restored cleanly |
| SC-PAT-012 | Doctor Search | Medium | Open a doctor detail affordance from the search page if present | Doctor info renders correctly without broken navigation |
| SC-PAT-014 | Doctor Search | Low | Search doctor list with a no-match keyword | Graceful empty state is shown |
| SC-PAT-021 | Booking | Medium | Attempt booking with missing mandatory fields | Validation blocks progression and keeps UI stable |
| SC-PAT-022 | Booking | Medium | Attempt booking with invalid date or time combination | Invalid slot selection is blocked safely |
| SC-PAT-023 | Booking | Medium | Move backward and forward through booking steps | Wizard state is preserved correctly |
| SC-PAT-024 | Booking | Medium | Cancel or abandon booking mid-flow | Flow exits safely without ghost state or crash |
| SC-PAT-031 | Appointments | Medium | Validate empty state when the patient has no appointments | Empty-state UI is graceful and informative |
| SC-PAT-033 | Appointment Detail | Medium | Use quick actions from appointment detail if available | Actions navigate or fail gracefully without route crash |
| SC-PAT-034 | Appointment Detail | Low | Open a non-existent appointment detail ID | Graceful not-found or safe fallback is shown |
| SC-PAT-037 | Payments | Medium | Search payment history by order code | Matching results are filtered correctly |
| SC-PAT-038 | Payments | Medium | Filter payment history by method or status | Filtering works without breaking the list |
| SC-PAT-039 | Payments | Medium | Open payment result or return route if reachable | Result page renders a correct success or failure state |
| SC-PAT-040 | Payments | Medium | Open payment result with missing or invalid return parameters | Graceful error or neutral result state is shown |
| SC-PAT-041 | Payments | Medium | Continue from payment history into a related appointment if linked | Cross-link navigation works correctly |
| SC-PAT-046 | Medical Records | Low | Open a non-existent medical record detail ID | Graceful not-found or safe fallback is shown |
| SC-PAT-051 | Health Metrics | Medium | Add another supported metric type beyond blood pressure if possible | New metric persists and renders correctly |
| SC-PAT-053 | Health Metrics | Medium | Submit the health-metric form with invalid input | Validation or safe server error appears clearly |
| SC-PAT-058 | Family | Medium | Delete an existing family member record | Entry is removed or explicit confirmation handles the action |
| SC-PAT-059 | Family | Medium | Submit the family-member form with missing required fields | Validation is shown and no broken record is created |
| SC-DOC-004 | Appointments | High | Verify doctor appointment data and status controls when a seeded appointment exists | Data is consistent and doctor actions are usable |
| SC-DOC-006 | Appointments | Medium | Try confirm, complete, or cancel action from doctor appointments if available | Status action works or returns a controlled denial |
| SC-DOC-009 | Schedule | Medium | Submit an invalid schedule combination if UI permits | Validation or safe error is shown |
| SC-DOC-010 | Schedule | Medium | Reload the schedule page after a save | Saved schedule persists correctly |
| SC-DOC-012 | Patients | Medium | Search or filter the doctor patient list if controls exist | Results update correctly without unauthorized leakage |
| SC-DOC-013 | Patients | Medium | Open a patient detail affordance from the doctor patient list if present | Detail view renders safely and consistently |
| SC-DOC-021 | Profile | Medium | Save doctor profile with invalid phone data | Validation or clear API error appears |
| SC-ADM-007 | Users | Medium | Attempt admin user save with invalid or empty required data | Validation or explicit error is shown safely |
| SC-ADM-008 | Users | Medium | Filter user-management data by role or status if available | Filtering works correctly without broken state |
| SC-ADM-009 | Users | Low | Retry admin user save after a transient backend failure | UI remains recoverable and later retry behavior is clear |
| SC-ADM-012 | Doctor Management | Medium | Filter doctor-management data by specialty or status if available | Filtering works without crashing the page |
| SC-ADM-013 | Doctor Management | Medium | Open doctor edit or approval action from doctor management | Modal or action panel opens correctly |
| SC-ADM-014 | Doctor Management | Medium | Save a doctor-management update if the action is available | Update succeeds or an explicit safe error is shown |
| SC-ADM-018 | Clinics | Medium | Submit clinic creation or edit with an empty required field | Required-field validation is shown |
| SC-ADM-023 | Services | Medium | Attempt an invalid service save | Validation or safe error appears without corrupting UI |

## Expanded Full Catalog Remainder

| ID | Area | Priority | Scenario | Expected Result |
| --- | --- | --- | --- | --- |
| SC-AUTH-001 | Landing | High | Preconditions: Logged out. Action: Open `/` | Landing page renders without crash |
| SC-AUTH-005 | Auth | High | Preconditions: Logged out. Action: Open `/login` | Login form renders and accepts input |
| SC-AUTH-006 | Auth | High | Preconditions: Logged out. Action: Login with valid patient account | Redirects to patient dashboard |
| SC-AUTH-007 | Auth | High | Preconditions: Logged out. Action: Login with valid doctor account | Redirects to doctor dashboard |
| SC-AUTH-008 | Auth | High | Preconditions: Logged out. Action: Login with valid admin account | Redirects to admin dashboard |
| SC-AUTH-009 | Auth | High | Preconditions: Logged out. Action: Submit invalid email/password on login | User stays unauthenticated and sees actionable error |
| SC-AUTH-013 | Auth | High | Preconditions: Logged out. Action: Open `/register` | Registration page renders correctly |
| SC-AUTH-017 | Auth | Medium | Preconditions: Logged out. Action: Complete a valid registration flow if backend permits | Account is created or system returns explicit controlled denial |
| SC-AUTH-018 | Auth Recovery | Medium | Preconditions: Logged out. Action: Open `/forgot-password` | Forgot-password form renders |
| SC-AUTH-019 | Auth Recovery | Medium | Preconditions: Logged out. Action: Submit forgot-password with valid email | Success confirmation is shown |
| SC-AUTH-022 | Verification | Medium | Preconditions: Logged out. Action: Open `/verify-email` with no token or invalid token | Graceful invalid/expired verification state is shown |
| SC-AUTH-023 | Verification | Medium | Preconditions: Logged out. Action: Open `/verify-phone` | OTP UI renders correctly |
| SC-AUTH-027 | Access Control | High | Preconditions: Logged out. Action: Open `/dashboard` directly | Redirects to `/login` or denies access safely |
| SC-AUTH-028 | Access Control | High | Preconditions: Logged out. Action: Open a patient-only route directly | Redirect or denial works correctly |
| SC-AUTH-029 | Access Control | High | Preconditions: Logged out. Action: Open a doctor-only route directly | Redirect or denial works correctly |
| SC-AUTH-030 | Access Control | High | Preconditions: Logged out. Action: Open an admin-only route directly | Redirect or denial works correctly |
| SC-AUTH-031 | Session | High | Preconditions: Logged in. Action: Use logout action from top-nav/profile menu | Session is cleared and user returns to public state |
| SC-AUTH-032 | Session | Medium | Preconditions: Logged in. Action: Refresh browser on an authenticated route | Session persists or fails explicitly and consistently |
| SC-AUTH-034 | Session | Medium | Preconditions: Logged in as patient. Action: Attempt to open doctor route | Redirects or blocks access |
| SC-AUTH-035 | Session | Medium | Preconditions: Logged in as patient. Action: Attempt to open admin route | Redirects or blocks access |
| SC-AUTH-036 | Session | Medium | Preconditions: Logged in as doctor. Action: Attempt to open patient route | Redirects or blocks access |
| SC-AUTH-037 | Session | Medium | Preconditions: Logged in as doctor. Action: Attempt to open admin route | Redirects or blocks access |
| SC-AUTH-038 | Session | Medium | Preconditions: Logged in as admin. Action: Attempt to open patient route | Redirects or blocks access |
| SC-AUTH-039 | Session | Medium | Preconditions: Logged in as admin. Action: Attempt to open doctor route | Redirects or blocks access |
| SC-PAT-001 | Dashboard | High | Preconditions: Logged in as patient. Action: Open `/dashboard` | Dashboard renders without route crash |
| SC-PAT-002 | Dashboard | High | Preconditions: Logged in as patient. Action: Validate summary cards and widgets | Core dashboard modules appear |
| SC-PAT-003 | Dashboard | High | Preconditions: Logged in as patient. Action: Observe network/console on dashboard load | No unexpected 5xx or JS exceptions |
| SC-PAT-004 | Navigation | High | Preconditions: Logged in as patient. Action: Use sidebar to move to appointments | Correct route transition occurs |
| SC-PAT-005 | Navigation | Medium | Preconditions: Logged in as patient. Action: Use sidebar to move to doctor search | Correct route transition occurs |
| SC-PAT-006 | Navigation | Medium | Preconditions: Logged in as patient. Action: Use sidebar to move to records, metrics, family, notifications | All links work |
| SC-PAT-007 | Navigation | Medium | Preconditions: Logged in as patient. Action: Use header/profile entrypoints to profile pages | Navigation works without dead links |
| SC-PAT-008 | Doctor Search | High | Preconditions: Logged in as patient. Action: Open `/find-doctors` | Doctor search page renders |
| SC-PAT-009 | Doctor Search | High | Preconditions: Logged in as patient. Action: Search by doctor name | Results filter correctly |
| SC-PAT-010 | Doctor Search | High | Preconditions: Logged in as patient. Action: Search by specialty text | Matching doctors are shown |
| SC-PAT-013 | Doctor Search | Medium | Preconditions: Logged in as patient. Action: Use booking CTA from search results | User reaches booking flow with selected doctor context |
| SC-PAT-015 | Booking | High | Preconditions: Logged in as patient. Action: Open `/appointments/book` | Booking wizard/form renders |
| SC-PAT-016 | Booking | High | Preconditions: Logged in as patient. Action: Start booking from preselected doctor | Doctor context is preserved |
| SC-PAT-017 | Booking | High | Preconditions: Logged in as patient. Action: Select doctor, date, time, notes, and continue | Flow advances correctly between steps |
| SC-PAT-018 | Booking | High | Preconditions: Logged in as patient. Action: Submit a valid booking | Appointment is created or redirected into payment flow |
| SC-PAT-019 | Booking | High | Preconditions: Logged in as patient. Action: Verify new appointment appears in appointments list | Newly created appointment is visible |
| SC-PAT-020 | Booking | High | Preconditions: Logged in as patient. Action: Verify payment handoff if booking requires it | Redirect to payment page/gateway happens correctly |
| SC-PAT-025 | Booking | Medium | Preconditions: Logged in as patient. Action: Retry after one failed booking or payment handoff | Flow stays recoverable |
| SC-PAT-026 | Appointments | High | Preconditions: Logged in as patient. Action: Open `/appointments` | Appointment list renders |
| SC-PAT-027 | Appointments | High | Preconditions: Logged in as patient with seeded appointments. Action: Inspect statuses and metadata in list | Cards/rows show correct data |
| SC-PAT-028 | Appointments | Medium | Preconditions: Logged in as patient. Action: Open an appointment detail page | Detail page renders correctly |
| SC-PAT-029 | Appointments | Medium | Preconditions: Logged in as patient. Action: Use cancel action if available | Appointment state changes or system denies safely |
| SC-PAT-030 | Appointments | Medium | Preconditions: Logged in as patient. Action: Use reschedule affordance if present | Flow opens or system states feature is unavailable |
| SC-PAT-032 | Appointment Detail | Medium | Preconditions: Logged in as patient. Action: Verify doctor, time, location, reason, notes, payment summary | Detail data is consistent |
| SC-PAT-035 | Payments | High | Preconditions: Logged in as patient. Action: Open `/payments` | Payment history page renders |
| SC-PAT-036 | Payments | High | Preconditions: Logged in as patient with prior order. Action: Verify pending/completed payment row appears | Payment entry is visible and readable |
| SC-PAT-042 | Payments | Low | Preconditions: Logged in as patient. Action: Check empty-state payment history | Empty-state UI is correct |
| SC-PAT-043 | Medical Records | High | Preconditions: Logged in as patient. Action: Open `/medical-records` | Records list renders |
| SC-PAT-044 | Medical Records | High | Preconditions: Logged in as patient. Action: Open one record detail if available | Record detail renders |
| SC-PAT-045 | Medical Records | Medium | Preconditions: Logged in as patient. Action: Validate empty-state records when none exist | Empty-state is graceful |
| SC-PAT-047 | Prescriptions | Medium | Preconditions: Logged in as patient. Action: Open linked prescription detail if available | Prescription view renders correctly |
| SC-PAT-048 | Prescriptions | Low | Preconditions: Logged in as patient. Action: Open invalid prescription ID | Safe fallback or error message is shown |
| SC-PAT-049 | Health Metrics | High | Preconditions: Logged in as patient. Action: Open `/health-metrics` | Metrics page renders |
| SC-PAT-050 | Health Metrics | High | Preconditions: Logged in as patient. Action: Add a valid blood pressure metric | Entry saves successfully |
| SC-PAT-052 | Health Metrics | Medium | Preconditions: Logged in as patient. Action: Verify newly added metric appears in cards/chart | Data refreshes correctly |
| SC-PAT-054 | Health Metrics | Low | Preconditions: Logged in as patient. Action: Validate empty-state charts before first entry | Empty-state is informative and stable |
| SC-PAT-055 | Family | High | Preconditions: Logged in as patient. Action: Open `/family` | Family management page renders |
| SC-PAT-056 | Family | High | Preconditions: Logged in as patient. Action: Add a valid family member | Family member persists and appears in list |
| SC-PAT-057 | Family | Medium | Preconditions: Logged in as patient with family entry. Action: Edit a family member | Updated data is saved |
| SC-PAT-060 | Family | Low | Preconditions: Logged in as patient. Action: Verify empty-state family page | Empty-state is graceful |
| SC-PAT-061 | Notifications | Medium | Preconditions: Logged in as patient. Action: Open `/notifications` | Notifications page renders |
| SC-PAT-062 | Notifications | Medium | Preconditions: Logged in as patient. Action: Switch notification categories/tabs | UI updates correctly |
| SC-PAT-063 | Notifications | Medium | Preconditions: Logged in as patient. Action: Mark read or use available row action if present | Item state changes correctly |
| SC-PAT-064 | Notifications | Low | Preconditions: Logged in as patient. Action: Verify empty-state notification list | Empty-state is graceful |
| SC-PAT-065 | Consultation | High | Preconditions: Logged in as patient. Action: Open `/patient/consultations` | Consultation list renders |
| SC-PAT-066 | Consultation | High | Preconditions: Logged in as patient. Action: Open new consultation request flow | Request form renders |
| SC-PAT-067 | Consultation | High | Preconditions: Logged in as patient. Action: Create a valid consultation request | New request is created in `PENDING` state |
| SC-PAT-068 | Consultation | High | Preconditions: Logged in as patient. Action: Open newly created consultation detail | Detail page renders |
| SC-PAT-069 | Consultation | High | Preconditions: Logged in as patient. Action: Send a consultation message if chat is available | Message is sent successfully |
| SC-PAT-070 | Consultation | High | Preconditions: Logged in as patient. Action: Observe realtime/websocket initialization | No unexpected realtime JS exception occurs |
| SC-PAT-071 | Consultation | Medium | Preconditions: Logged in as patient. Action: Create request with missing topic/message | Validation is shown |
| SC-PAT-072 | Consultation | Medium | Preconditions: Logged in as patient. Action: Open unauthorized or foreign consultation ID | Access is blocked |
| SC-PAT-073 | Consultation | Low | Preconditions: Logged in as patient. Action: Open non-existent consultation ID | Graceful not-found behavior appears |
| SC-PAT-074 | Messages | Low | Preconditions: Logged in as patient. Action: Open `/messages` redirect | Redirect resolves to patient consultation route |
| SC-PAT-075 | Profile | High | Preconditions: Logged in as patient. Action: Open `/profile` | Profile page renders with current data |
| SC-PAT-076 | Profile | High | Preconditions: Logged in as patient. Action: Save profile with valid data | Success feedback is shown |
| SC-PAT-077 | Profile | Medium | Preconditions: Logged in as patient. Action: Save profile with invalid phone/email if UI allows | Validation appears or server error is handled clearly |
| SC-PAT-078 | Security | High | Preconditions: Logged in as patient. Action: Open `/profile/security` | Security page renders |
| SC-PAT-079 | Security | High | Preconditions: Logged in as patient. Action: Submit mismatched new passwords | Validation message is shown |
| SC-PAT-080 | Security | Medium | Preconditions: Logged in as patient. Action: Submit valid password change if environment permits | Password update succeeds or returns controlled server response |
| SC-PAT-081 | Notifications Settings | Medium | Preconditions: Logged in as patient. Action: Open `/profile/notifications` | Notification-settings page renders |
| SC-PAT-082 | Notifications Settings | Medium | Preconditions: Logged in as patient. Action: Toggle and save notification settings | Save succeeds and UI confirms it |
| SC-DOC-001 | Dashboard | High | Preconditions: Logged in as doctor. Action: Open `/dashboard` | Doctor dashboard renders |
| SC-DOC-002 | Dashboard | High | Preconditions: Logged in as doctor. Action: Verify doctor quick actions and cards | Key widgets are visible |
| SC-DOC-003 | Appointments | High | Preconditions: Logged in as doctor. Action: Open `/doctor/appointments` | Doctor appointments page renders |
| SC-DOC-005 | Appointments | Medium | Preconditions: Logged in as doctor. Action: Validate empty-state with no appointments | Empty-state is graceful |
| SC-DOC-007 | Schedule | High | Preconditions: Logged in as doctor. Action: Open `/schedule` | Schedule page renders |
| SC-DOC-008 | Schedule | High | Preconditions: Logged in as doctor. Action: Modify schedule and save | Success feedback is shown |
| SC-DOC-011 | Patients | High | Preconditions: Logged in as doctor. Action: Open `/patients` | Doctor patient list renders |
| SC-DOC-014 | Patients | Medium | Preconditions: Logged in as doctor. Action: Validate empty-state when no assigned patients exist | Empty-state is graceful |
| SC-DOC-015 | Create Medical Record | High | Preconditions: Logged in as doctor. Action: Open `/doctor/create-medical-record` | Record creation form opens or route explains why not available |
| SC-DOC-016 | Create Medical Record | High | Preconditions: Logged in as doctor with valid appointment context. Action: Create a valid medical record | Record is saved successfully |
| SC-DOC-017 | Create Medical Record | Medium | Preconditions: Logged in as doctor. Action: Attempt record creation with invalid appointment state | Operation is rejected safely |
| SC-DOC-018 | Create Medical Record | Medium | Preconditions: Logged in as doctor. Action: Attempt record creation for another doctor's patient | Access is denied safely |
| SC-DOC-019 | Profile | Medium | Preconditions: Logged in as doctor. Action: Open `/profile` | Doctor profile renders correctly |
| SC-DOC-020 | Profile | Medium | Preconditions: Logged in as doctor. Action: Save profile with valid data | Success feedback is shown |
| SC-DOC-022 | Security | Low | Preconditions: Logged in as doctor. Action: Open `/profile/security` | Security page renders |
| SC-DOC-023 | Notifications Settings | Low | Preconditions: Logged in as doctor. Action: Open `/profile/notifications` | Notification-settings page renders |
| SC-DOC-024 | Consultations | High | Preconditions: Logged in as doctor. Action: Open `/consultations` | Consultation queue/list renders |
| SC-DOC-025 | Consultations | High | Preconditions: Logged in as doctor with pending request. Action: Accept a pending consultation | Request moves into active state |
| SC-DOC-026 | Consultations | High | Preconditions: Logged in as doctor with active consultation. Action: Open consultation detail page | Detail page renders correctly |
| SC-DOC-027 | Consultations | High | Preconditions: Logged in as doctor with active consultation. Action: Send consultation message | Message send succeeds |
| SC-DOC-028 | Consultations | High | Preconditions: Logged in as doctor. Action: Observe realtime/websocket setup on detail page | No unexpected JS exception occurs |
| SC-DOC-029 | Consultations | Medium | Preconditions: Logged in as doctor. Action: Attempt to open unauthorized consultation ID | Access is denied |
| SC-DOC-030 | Consultations | Low | Preconditions: Logged in as doctor. Action: Open non-existent consultation ID | Graceful not-found behavior appears |
| SC-DOC-031 | Messages | Low | Preconditions: Logged in as doctor. Action: Open `/messages` redirect | Redirect resolves to doctor consultation route |
| SC-DOC-032 | Analytics | Medium | Preconditions: Logged in as doctor. Action: Open `/doctor/analytics` | Analytics page renders |
| SC-DOC-033 | Analytics | Medium | Preconditions: Logged in as doctor. Action: Change date range/filter on analytics | UI refreshes without crash |
| SC-DOC-034 | Analytics | Medium | Preconditions: Logged in as doctor. Action: Validate empty-state analytics when no data exists | Empty-state is graceful |
| SC-ADM-001 | Dashboard | High | Preconditions: Logged in as admin. Action: Open `/dashboard` | Admin dashboard renders |
| SC-ADM-002 | Dashboard | Medium | Preconditions: Logged in as admin. Action: Verify summary cards and recent activity | Key widgets appear correctly |
| SC-ADM-003 | Users | High | Preconditions: Logged in as admin. Action: Open `/users` | User management page renders |
| SC-ADM-004 | Users | High | Preconditions: Logged in as admin. Action: Search user by name/email | Search results update correctly |
| SC-ADM-005 | Users | High | Preconditions: Logged in as admin. Action: Open edit modal for a user | Modal renders seeded values |
| SC-ADM-006 | Users | High | Preconditions: Logged in as admin. Action: Save a valid user edit | Save succeeds consistently |
| SC-ADM-010 | Doctor Management | High | Preconditions: Logged in as admin. Action: Open `/doctors` | Doctor management page renders |
| SC-ADM-011 | Doctor Management | High | Preconditions: Logged in as admin. Action: Search doctors by name | List filters without crashing |
| SC-ADM-015 | Clinics | Medium | Preconditions: Logged in as admin. Action: Open `/admin/clinics` | Clinic management page renders |
| SC-ADM-016 | Clinics | Medium | Preconditions: Logged in as admin. Action: Search clinics by name | Results filter correctly |
| SC-ADM-017 | Clinics | Medium | Preconditions: Logged in as admin. Action: Open and save clinic edit with valid values | Save succeeds |
| SC-ADM-019 | Services | Medium | Preconditions: Logged in as admin. Action: Open `/admin/services` | Service management page renders |
| SC-ADM-020 | Services | Medium | Preconditions: Logged in as admin. Action: Search services by keyword | Results update correctly |
| SC-ADM-021 | Services | Medium | Preconditions: Logged in as admin. Action: Filter by category if available | Filtering works |
| SC-ADM-022 | Services | Medium | Preconditions: Logged in as admin. Action: Open and save service edit | Save succeeds |
| SC-ADM-024 | Rooms | Medium | Preconditions: Logged in as admin. Action: Open `/admin/rooms` | Room management page renders |
| SC-ADM-025 | Rooms | Medium | Preconditions: Logged in as admin. Action: Search rooms by clinic/room name | Results update correctly |
| SC-ADM-026 | Rooms | Medium | Preconditions: Logged in as admin. Action: Open and save room edit | Save succeeds |
| SC-ADM-027 | Rooms | Medium | Preconditions: Logged in as admin. Action: Attempt invalid room save | Validation or safe error appears |
| SC-ADM-028 | Reports | High | Preconditions: Logged in as admin. Action: Open `/admin/reports` | Reports page renders |
| SC-ADM-029 | Reports | High | Preconditions: Logged in as admin. Action: Switch between report tabs/views | UI updates without crash |
| SC-ADM-030 | Reports | High | Preconditions: Logged in as admin. Action: Change date range | Report queries succeed and UI refreshes |
| SC-ADM-031 | Reports | Medium | Preconditions: Logged in as admin. Action: Change grouping granularity | Chart/table updates correctly |
| SC-ADM-032 | Reports | Medium | Preconditions: Logged in as admin. Action: Validate empty-state or no-data range | UI handles no data gracefully |
| SC-ADM-033 | Reports | Low | Preconditions: Logged in as admin. Action: Use export/download action if present | Artifact is generated or action fails gracefully |
| SC-ADM-034 | Profile | Medium | Preconditions: Logged in as admin. Action: Open `/profile` | Admin profile page renders |
| SC-ADM-035 | Profile | Medium | Preconditions: Logged in as admin. Action: Save valid admin profile values | Save succeeds |
| SC-ADM-036 | Profile | Medium | Preconditions: Logged in as admin. Action: Save invalid profile input if possible | Validation or explicit error appears |
| SC-X-001 | Validation | High | Preconditions: Patient logged in. Action: Submit security form with mismatched passwords | Clear validation message appears |
| SC-X-002 | Validation | High | Preconditions: Doctor logged in. Action: Submit profile with invalid phone format | UI shows actionable feedback or controlled API error |
| SC-X-003 | Validation | Medium | Preconditions: Admin logged in. Action: Submit create/edit entity form missing required name | Required-field feedback is shown |
| SC-X-004 | Validation | Medium | Preconditions: Any role. Action: Submit form twice quickly | No duplicate crash or broken pending state occurs |
| SC-X-005 | Error Handling | High | Preconditions: Any role. Action: Trigger one known server-side failure | UI shows clear non-crashing failure state |
| SC-X-006 | Error Handling | Medium | Preconditions: Any role. Action: Open route with missing entity ID | Graceful not-found or fallback behavior appears |
| SC-X-007 | Error Handling | Medium | Preconditions: Any role. Action: Simulate empty-state pages across modules | Empty-state copy and layout remain usable |
| SC-X-008 | Error Handling | Medium | Preconditions: Any role. Action: Observe toast, inline error, and loading UI states | States are visible and consistent |
| SC-X-009 | Authorization | High | Preconditions: Logged in as patient. Action: Access doctor appointment route | Access denied or redirected |
| SC-X-010 | Authorization | High | Preconditions: Logged in as patient. Action: Access admin route | Access denied or redirected |
| SC-X-011 | Authorization | High | Preconditions: Logged in as doctor. Action: Access patient booking route | Access denied or redirected |
| SC-X-012 | Authorization | High | Preconditions: Logged in as doctor. Action: Access admin route | Access denied or redirected |
| SC-X-013 | Authorization | High | Preconditions: Logged in as admin. Action: Access patient booking route | Access denied or redirected |
| SC-X-014 | Authorization | High | Preconditions: Logged in as admin. Action: Access doctor appointment route | Access denied or redirected |
| SC-X-015 | Navigation | High | Preconditions: Logged in as each role. Action: Traverse primary sidebar links | No broken links or dead routes |
| SC-X-016 | Session | High | Preconditions: Logged in as each role. Action: Refresh current authenticated page | Session persists consistently |
| SC-X-017 | Session | Medium | Preconditions: Logged in as each role. Action: Logout then use browser back button | Protected content is not reopened without auth |
| SC-X-018 | Session | Medium | Preconditions: Logged in as each role. Action: Open direct route bookmark | Correct role state is honored |
| SC-X-019 | Console | High | Preconditions: Any meaningful flow. Action: Observe browser console during core flows | No unhandled JS exception appears |
| SC-X-020 | Network | High | Preconditions: Any meaningful flow. Action: Observe failed network requests during core flows | No unexpected 5xx/4xx outside known negative tests |
| SC-X-021 | Realtime | High | Preconditions: Consultation detail open. Action: Observe websocket/STOMP initialization | Realtime setup occurs without connection exception |
| SC-X-022 | Realtime | Medium | Preconditions: Consultation detail open. Action: Send message and observe update | Message lifecycle is reflected in UI |
| SC-X-023 | Recovery | Medium | Preconditions: App running. Action: Restart frontend and re-enter seeded flow | User can continue after app restart |
| SC-X-024 | Recovery | Medium | Preconditions: App/backend partially unavailable. Action: Observe app behavior on temporary API failure | User sees controlled degraded state |
| SC-X-025 | Duplicates | Medium | Preconditions: Dashboard or menu pages loaded. Action: Watch for duplicate React key warnings | No duplicate-key warning should exist |
| SC-X-026 | State Sync | Medium | Preconditions: After create/update flows. Action: Refresh list pages after mutation | Changed entity persists after reload |
| SC-X-027 | Responsive | Medium | Preconditions: Logged out. Action: Open login page on mobile viewport | Form remains usable and readable |
| SC-X-028 | Responsive | Medium | Preconditions: Logged in as patient. Action: Open patient dashboard on mobile viewport | Main content remains usable |
| SC-X-029 | Responsive | Medium | Preconditions: Logged in as doctor. Action: Open doctor schedule on mobile viewport | Schedule page remains usable |
| SC-X-030 | Responsive | Medium | Preconditions: Logged in as admin. Action: Open admin clinics page on mobile viewport | Cards/forms remain usable |
| SC-X-031 | UX | Low | Preconditions: Any role. Action: Confirm loading spinners and transitions do not block actions permanently | Page remains usable |
| SC-X-032 | UX | Low | Preconditions: Any role. Action: Confirm long lists/cards remain scannable | Layout remains readable |


---

## coverage-status.md

# Coverage Status

Update this file every loop. Do not delete historical notes; append concise new evidence when status changes.

| ID | Status | Last Checked By | Last Checked At (UTC) | Evidence / Notes |
| --- | --- | --- | --- | --- |
| PUB-001 | Passed | Codex | 2026-03-16T12:17:25Z | `/` rendered marketing hero and CTAs without crash. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T120816Z/pub-001-landing.png` |
| PUB-002 | Passed | Codex | 2026-03-16T12:17:25Z | `/login` rendered email/password form plus quick-login buttons. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T120816Z/pub-002-login.png` |
| PUB-003 | Passed | Codex | 2026-03-16T12:17:25Z | `/register` rendered full account creation form with name/email/phone/role/password inputs and CTA. |
| PUB-004 | Passed | Codex | 2026-03-16T12:17:25Z | `/forgot-password` rendered and accepted `patient1@clinic.com`; success state `Email đã gửi!` appeared after form submission. |
| PUB-005 | Passed | Codex | 2026-03-16T12:17:25Z | `/verify-email` rendered a graceful invalid/expired link state (`Xác minh thất bại`) instead of crashing. |
| PUB-006 | Passed | Codex | 2026-03-16T12:17:25Z | `/verify-phone` rendered six OTP inputs, resend action, and disabled verify CTA until code entry. |
| AUTH-001 | Passed | Codex | 2026-03-16T12:17:25Z | Patient login with `patient1@clinic.com / password` reached `/dashboard` and patient sidebar rendered. Dashboard follow-on defect tracked separately in `BUG-002`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T120816Z/auth-001-patient-dashboard.png` |
| AUTH-002 | Passed | Codex | 2026-03-16T12:17:25Z | Doctor login with `dr.sarah@clinic.com / password` reached `/dashboard` and doctor navigation rendered. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T120816Z/auth-002-doctor-dashboard.png` |
| AUTH-003 | Passed | Codex | 2026-03-16T12:17:25Z | Admin login with `admin@clinic.com / password` reached `/dashboard` and admin summary cards rendered. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T120816Z/auth-003-admin-dashboard.png` |
| AUTH-004 | Failed | Codex | 2026-03-16T12:17:25Z | Invalid credentials kept user on `/login`, but no visible inline or toast error appeared even though `POST /api/auth/login` returned `401 Unauthorized`. See `BUG-001`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T120816Z/auth-004-invalid-login.png` |
| AUTH-005 | Passed | Codex | 2026-03-16T12:17:25Z | Logged-out visit to `/dashboard` redirected back to `/login` and the login form rendered. |
| AUTH-006 | Passed | Codex | 2026-03-16T12:17:25Z | Sampled cross-role denial checks passed: patient blocked from `/doctor/appointments` and `/users`, doctor blocked from `/appointments/book` and `/users`, admin blocked from `/appointments/book` and `/doctor/appointments`; each redirected to role dashboard. |
| AUTH-007 | Passed | Codex | 2026-03-16T12:30:22Z | Quick-login patient session successfully opened the navbar profile menu, `Đăng xuất` returned the browser to `/login`, and the public login UI rendered again. |
| PAT-001 | Failed | Codex | 2026-03-16T12:17:25Z | Patient dashboard rendered, but repeated `GET /api/statistics/aggregate/patient/223` calls returned `500 Internal Server Error` and console logged React duplicate-key warnings on load. See `BUG-002`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T120816Z/auth-001-patient-dashboard.png` |
| PAT-002 | Passed | Codex | 2026-03-16T12:30:22Z | `/find-doctors` rendered 31 doctors; searching for `Sarah` narrowed the list to 1 doctor (`Dr. Sarah Johnson`) and the booking CTA remained usable. |
| PAT-003 | Passed | Codex | 2026-03-16T12:30:22Z | `/appointments/book` completed through doctor/day/time/details/confirm steps for `BS. Tran Thu Binh`; confirmation redirected to the MoMo test gateway and the appointment later appeared in `/appointments`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T122210Z/pat-004-appointments.png` |
| PAT-004 | Passed | Codex | 2026-03-16T12:30:22Z | `/appointments` rendered the newly created pending appointment (`BS. Tran Thu Binh`, `March 17, 2026`, `08:30`) with cancel/detail actions. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T122210Z/pat-004-appointments.png` |
| PAT-005 | Passed | Codex | 2026-03-16T12:57:30Z | Opened seeded appointment detail `/appointments/1801`; doctor, date, time, reason, notes, location, quick actions, and payment summary all rendered without route crash. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T125227Z/pat-005-appointment-detail.png` |
| PAT-006 | Passed | Codex | 2026-03-16T12:57:30Z | `/payments` rendered payment history with pending MoMo order `ORDER1773663997339466297`; search by order code and payment-method filter (`Momo`) worked without breaking the list. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T125227Z/pat-006-payments.png` |
| PAT-007 | Passed | Codex | 2026-03-16T12:30:22Z | `/medical-records` rendered successfully and showed a graceful empty state (`Chưa có hồ sơ bệnh án nào`) for the seeded patient instead of crashing. |
| PAT-008 | Passed | Codex | 2026-03-16T12:57:30Z | `/health-metrics` rendered empty-state cards and chart container, then creating a blood-pressure entry (`120/80`, note `QA health metric entry`) succeeded with toast `Đã ghi nhận chỉ số sức khỏe` and the chart updated. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T125227Z/pat-008-health-metrics.png` |
| PAT-009 | Passed | Codex | 2026-03-16T12:57:30Z | `/family` rendered an empty state, and adding member `QA Family Member` (`2010-01-01`, `A+`) succeeded with toast `Đã thêm thành viên`; the new family card rendered with edit/delete controls. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T125227Z/pat-009-family.png` |
| PAT-010 | Passed | Codex | 2026-03-16T12:57:30Z | `/notifications` rendered a graceful empty state; category switching to `Thanh toán` updated the empty-state copy without crashes, and notification API requests returned `200`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T125227Z/pat-010-notifications.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T125227Z/playwright-network.log` |
| PAT-011 | Failed | Codex | 2026-03-16T12:30:22Z | Consultation request creation worked and opened `/patient/consultations/801`, but the detail page logged STOMP warnings plus `There is no underlying STOMP connection` during realtime subscription setup. See `BUG-003`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T122210Z/pat-011-consultation-detail.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T122210Z/playwright-console.log` |
| PAT-012 | Passed | Codex | 2026-03-16T12:30:22Z | `/profile` save showed `Thông tin đã được cập nhật!`; `/profile/security` mismatch password validation showed `Mật khẩu không khớp`; `/profile/notifications` save showed `Cài đặt thông báo đã được lưu!`. |
| DOC-001 | Passed | Codex | 2026-03-16T12:17:25Z | Doctor dashboard rendered overview cards, quick actions, and doctor-only navigation after seeded login. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T120816Z/auth-002-doctor-dashboard.png` |
| DOC-002 | Passed | Codex | 2026-03-16T12:39:23Z | `/doctor/appointments` rendered doctor appointment management and a graceful empty state (`Không có lịch hẹn nào`) for the seeded doctor without blocking UI errors. |
| DOC-003 | Passed | Codex | 2026-03-16T12:39:23Z | `/schedule` rendered the weekly availability editor; clicking `Lưu lịch làm việc` completed with success toast `Đã cập nhật lịch làm việc`. |
| DOC-004 | Passed | Codex | 2026-03-16T12:39:23Z | `/patients` rendered successfully and showed a safe empty state (`Chưa có bệnh nhân nào`) with no unauthorized data leakage. |
| DOC-005 | Passed | Codex | 2026-03-16T12:39:23Z | Seeded consultation `802` for `Dr. Sarah Johnson`, then `/consultations` loaded, `Chấp nhận` moved the request into `Đang tư vấn`, detail view rendered, and doctor sent `Doctor manual QA reply` successfully. Realtime console defect still reproduced separately under `BUG-003` / `X-004`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T123327Z/doc-005-consultation-detail.png` |
| DOC-006 | Passed | Codex | 2026-03-16T13:02:59Z | `/doctor/analytics` rendered summary cards and analytics sections with graceful empty states; changing the range filter from `6 tháng gần nhất` to `3 tháng gần nhất` updated the UI without crashing. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T130020Z/doc-006-analytics.png` |
| DOC-007 | Blocked | Codex | 2026-03-16T13:02:59Z | Direct navigation to `/doctor/create-medical-record` did not surface a creation form; the app redirected to `/doctor/appointments`, which showed `Không có lịch hẹn nào`, so no patient-bound record creation workflow was available for the seeded doctor in this environment. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T130020Z/doc-007-create-record-redirect.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T130020Z/playwright-network.log` |
| DOC-008 | Passed | Codex | 2026-03-16T13:02:59Z | Doctor `/profile` rendered correctly and saving the seeded profile values completed with toast `Thông tin đã được cập nhật!`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T130020Z/doc-008-profile.png` |
| ADM-001 | Passed | Codex | 2026-03-16T12:17:25Z | Admin dashboard rendered system summary cards and recent activity after seeded login. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T120816Z/auth-003-admin-dashboard.png` |
| ADM-002 | Failed | Codex | 2026-03-16T12:46:46Z | `/users` rendered, search/filter worked, and the edit modal for `Dr. Sarah Johnson` opened, but the first save attempt showed toast `Không thể lưu người dùng` while Playwright surfaced `503 Service Unavailable` for the user update request. Immediate retry later in the same turn succeeded, so the failure appears intermittent. See `BUG-004`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T124313Z/adm-002-user-save-error.png` |
| ADM-003 | Failed | Codex | 2026-03-16T12:46:46Z | `/doctors` initially rendered and loaded doctor data, but typing `Sarah` into the search box crashed the route to a blank page with `TypeError: Cannot read properties of undefined (reading 'toLowerCase')` in `DoctorManagement.jsx`. See `BUG-005`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T124313Z/adm-003-doctors-search-crash.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T124313Z/adm-003-console.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T124313Z/adm-003-network.log` |
| ADM-004 | Passed | Codex | 2026-03-16T13:11:05Z | `/admin/clinics` rendered the clinic cards; searching `Clinic 1` narrowed the list, `Chỉnh sửa` opened the modal for `HealthFlow Clinic 1`, and saving seeded values showed toast `Đã cập nhật phòng khám`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T130525Z/adm-004-clinics.png` |
| ADM-005 | Passed | Codex | 2026-03-16T13:11:05Z | `/admin/services` rendered the service catalog; searching `nội tiết` and reopening the category filter restored the matching cards, and updating `Khám nội tiết - Gói 1` with seeded values showed toast `Đã cập nhật dịch vụ`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T130525Z/adm-005-services.png` |
| ADM-006 | Passed | Codex | 2026-03-16T13:11:05Z | `/admin/rooms` rendered the room cards; searching `Phòng khám 4` filtered the list, and saving the edit modal with seeded values showed toast `Đã cập nhật phòng`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T130525Z/adm-006-rooms.png` |
| ADM-007 | Passed | Codex | 2026-03-16T12:46:46Z | `/admin/reports` rendered appointment and revenue report views; switching to `Doanh thu` plus changing date range to `30 ngày qua` and grouping to `Tuần` completed without UI crash, and `/api/reports/appointments|revenue|patients` all returned `200`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T124313Z/adm-007-reports.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T124313Z/playwright-network.log` |
| ADM-008 | Passed | Codex | 2026-03-16T13:11:05Z | Admin `/profile` rendered seeded account data, and saving the existing values completed with toast `Thông tin đã được cập nhật!`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T130525Z/adm-008-profile.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T130525Z/playwright-network.log` |
| X-001 | Passed | Codex | 2026-03-16T13:19:52Z | Navigation links were exercised in real authenticated sessions for all three roles: admin sidebar moved between `/dashboard`, `/admin/reports`, and `/profile`; patient sidebar moved from `/dashboard` to `/appointments`; doctor sidebar moved from `/dashboard` to `/schedule` and `/profile`. No broken-link route was encountered during these live link transitions. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T131255Z/playwright-network.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T131255Z/playwright-console.log` |
| X-002 | Passed | Codex | 2026-03-16T13:19:52Z | Authenticated refresh behavior held across roles: admin reloaded on `/profile`, patient reloaded on `/appointments`, and doctor reloaded on `/schedule`, with each session remaining signed in and the same route re-rendering afterward. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T131255Z/playwright-network.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T131255Z/playwright-console.log` |
| X-003 | Failed | Codex | 2026-03-16T13:19:52Z | Invalid-form feedback was sampled across roles. Patient password mismatch on `/profile/security` showed actionable feedback (`Mật khẩu không khớp`), and admin empty clinic creation showed visible required-name feedback (`Tên phòng khám là bắt buộc`), but doctor profile saved with invalid phone text (`abc`) triggered `PUT /api/profile => 500` and only surfaced the generic message `An unexpected error occurred. Please contact support.` See `BUG-007`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T131255Z/x-003-patient-security-mismatch.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T131255Z/x-003-doctor-profile-invalid-phone.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T131255Z/playwright-network.log` |
| X-004 | Failed | Codex | 2026-03-16T13:19:52Z | Console/network monitoring still shows repeated patient and doctor duplicate-sidebar-key warnings (`BUG-006`), the known patient dashboard stats `500` (`BUG-002`), consultation-detail STOMP warnings/exception (`BUG-003`), intermittent admin user-save failure (`BUG-004`), deterministic admin doctor-search crash (`BUG-005`), and now a reproducible doctor profile `PUT /api/profile => 500` on invalid phone input with only a generic support message (`BUG-007`). Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T120816Z/auth-001-patient-dashboard.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T122210Z/playwright-console.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T123327Z/playwright-console.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T123327Z/playwright-network.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T124313Z/adm-002-user-save-error.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T124313Z/adm-003-console.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T124313Z/adm-003-network.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T125227Z/playwright-console.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T125227Z/playwright-network.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T130020Z/playwright-console.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T130020Z/playwright-network.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T131255Z/x-003-doctor-profile-invalid-phone.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T131255Z/playwright-console.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T131255Z/playwright-network.log` |
| X-005 | Passed | Codex | 2026-03-16T13:24:42Z | Narrow-viewport sampling at `390x844` remained usable on `/login`, patient `/dashboard`, doctor `/schedule`, and admin `/admin/clinics`: content stacked vertically, primary actions remained reachable, cards stayed readable, and no severe overlap or blocking prevented normal use. Existing console/data issues are tracked separately under `X-004`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T132050Z/x-005-login-mobile.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T132050Z/x-005-patient-dashboard-mobile.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T132050Z/x-005-doctor-schedule-mobile.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T132050Z/x-005-admin-clinics-mobile.png` |
| X-006 | Passed | Codex | 2026-03-16T13:11:05Z | Route inventory coverage is now complete: every route-backed case from the current contract-backed ledger (`PUB-001` to `ADM-008`) is explicitly marked `Passed`, `Failed`, or `Blocked`, including blocked `/doctor/create-medical-record` under `DOC-007`. Latest completion evidence came from the final admin route pass this turn. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T130525Z/adm-004-clinics.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T130525Z/adm-005-services.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T130525Z/adm-006-rooms.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T130525Z/adm-008-profile.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T130020Z/doc-007-create-record-redirect.png` |
| SC-AUTH-002 | Passed | Codex | 2026-03-16T15:04:08Z | Logged-out landing page rendered hero, CTA buttons, feature grid, testimonials, and footer without crashing. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-002-landing.png` |
| SC-AUTH-003 | Passed | Codex | 2026-03-16T15:04:08Z | From a logged-out landing page, clicking `Get Started Free` routed to `/register` and the registration form loaded. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-002-landing.png` |
| SC-AUTH-004 | Skipped | Codex | 2026-03-16T15:04:08Z | No chatbot/help widget rendered on `/` in the current public build, so there was no landing widget interaction to exercise. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-002-landing.png` |
| SC-AUTH-010 | Passed | Codex | 2026-03-16T15:04:08Z | Empty login submit was blocked by native browser validation; focus stayed on the first invalid field and the browser bubble `Please fill out this field.` appeared. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-010-login-empty.png` |
| SC-AUTH-011 | Failed | Codex | 2026-03-16T15:04:08Z | Login with malformed identifier `not-an-email` returned `POST /api/auth/login => 400 Bad Request`, but the page stayed on `/login` with no visible inline or toast error. See `BUG-001`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-011-login-malformed-email.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-011-network.log` |
| SC-AUTH-012 | Passed | Codex | 2026-03-16T15:04:08Z | Patient quick-login button signed into the seeded patient account and reached `/dashboard`; a success toast `Đăng nhập thành công!` rendered. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-012-patient-quick-login.png` |
| SC-AUTH-014 | Passed | Codex | 2026-03-16T15:04:08Z | Empty register submit was blocked by browser validation on required fields and the required terms checkbox; focus moved to the first invalid input and no account request was sent. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-014-register-empty-required.png` |
| SC-AUTH-015 | Failed | Codex | 2026-03-16T15:04:08Z | Register submit with mismatched passwords stayed on `/register` but showed no visible inline or toast feedback after clicking `Create Account`. See `BUG-008`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-015-register-mismatch.png` |
| SC-AUTH-016 | Failed | Codex | 2026-03-16T15:04:08Z | Register submit with duplicate seeded email `patient1@clinic.com` returned `POST /api/auth/register => 409 Conflict`, but the form showed no visible error state. See `BUG-008`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-016-register-duplicate-email.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/playwright-network.log` |
| SC-AUTH-020 | Passed | Codex | 2026-03-16T15:04:08Z | Forgot-password with malformed email `bad-email` was blocked by native `type=email` validation before submit. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-020-forgot-password-malformed.png` |
| SC-AUTH-021 | Passed | Codex | 2026-03-16T15:04:08Z | Forgot-password with unknown account `unknown-account-145416@clinic.com` stayed stable and rendered the same success state `Email đã gửi!`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-021-forgot-password-unknown-email.png` |
| SC-AUTH-024 | Passed | Codex | 2026-03-16T15:04:08Z | Entering only `123` in `/verify-phone` kept the `Xác minh` button disabled, so incomplete OTP submission was blocked in the UI. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-024-verify-phone-incomplete-otp.png` |
| SC-AUTH-025 | Failed | Codex | 2026-03-16T15:04:08Z | On direct `/verify-phone` access, clicking `Gửi lại mã` triggered `POST /api/auth/send-sms-verification => 500 Internal Server Error` and the screen stayed unchanged with no user-facing feedback. See `BUG-009`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-025-resend-otp-failure.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-025-network.log` |
| SC-AUTH-026 | Passed | Codex | 2026-03-16T15:04:08Z | Opening `/reset-password` without reset context showed a graceful expired-link state (`Link hết hiệu lực`) and a `Yêu cầu link mới` CTA. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-026-reset-password-invalid-context.png` |
| SC-AUTH-033 | Passed | Codex | 2026-03-16T15:04:08Z | While signed in as the seeded patient, opening a new browser tab to `/appointments/book` preserved the session and rendered the booking wizard instead of redirecting to login. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-033-new-tab-protected-route.png` |
| SC-PAT-011 | Failed | Codex | 2026-03-16T15:18:57Z | After narrowing doctor search to a no-match state, clicking `Xóa bộ lọc` cleared the input but left the page stuck on the empty-state card until `Tìm kiếm` was clicked again manually. See `BUG-010`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T151047Z/sc-pat-011-clear-filter-stuck-empty-state.png` |
| SC-PAT-012 | Skipped | Codex | 2026-03-16T15:18:57Z | The current `/find-doctors` page exposes booking CTAs but no dedicated doctor-detail link, button, or modal affordance to exercise; clicking the rendered Sarah card itself produced no navigation or detail view. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T151047Z/sc-pat-012-no-detail-affordance-on-search-card.png` |
| SC-PAT-014 | Passed | Codex | 2026-03-16T15:18:57Z | Searching `/find-doctors` for `zzzz-no-match` rendered a graceful empty state with `Không tìm thấy bác sĩ` and a visible recovery CTA. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T151047Z/sc-pat-014-doctor-search-no-match.png` |
| SC-PAT-021 | Passed | Codex | 2026-03-16T15:18:57Z | In booking step 3, the wizard blocked progression while required clinic/service/room fields were empty; `Tiếp tục` stayed disabled until those selections were made. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T151047Z/sc-pat-021-booking-missing-required-fields.png` |
| SC-PAT-022 | Passed | Codex | 2026-03-16T15:18:57Z | For `Dr. Sarah Johnson`, selecting seeded dates such as `Tue 17` and `Wed 18` showed `Bác sĩ chưa có lịch khả dụng cho ngày này. Vui lòng chọn ngày khác.` and prevented slot progression, so invalid slot combinations failed safely. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T151047Z/sc-pat-022-booking-unavailable-day.png` |
| SC-PAT-023 | Failed | Codex | 2026-03-16T15:18:57Z | Booking wizard back-navigation did not preserve step state: after selecting `BS. Tran Thu Binh`, `Tue 17`, `08:30`, and filling step 3 fields, clicking `Quay lại` returned to step 2 with no selected slot highlighted. See `BUG-011`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T151047Z/sc-pat-023-booking-back-loses-selected-slot.png` |
| SC-PAT-024 | Passed | Codex | 2026-03-16T15:18:57Z | Abandoning the booking wizard by leaving `/appointments/book` and reopening it reset the flow cleanly to step 1 with no stale selected doctor/date/time state carried over. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T151047Z/sc-pat-024-booking-abandon-resets-wizard.png` |
| SC-PAT-031 | Passed | Codex | 2026-03-16T15:35:53Z | With the reseeded `patient1@clinic.com` account, `/appointments` rendered the empty-state card `Không có lịch hẹn` plus `Đặt lịch ngay` CTA without route crash or broken layout. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-031-appointments-empty-state-full.png` |
| SC-PAT-033 | Failed | Codex | 2026-03-16T15:35:53Z | Using fallback patient `patient.1@healthflow.vn`, appointment detail `/appointments/1100` rendered the quick actions but `Đổi lịch`, `Hủy lịch`, and `Xem hóa đơn` clicks stayed inert: no modal opened, no navigation happened, and no follow-up request fired beyond the initial detail GET. See `BUG-012`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-033-appointment-detail-quick-actions-inert.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-033-network.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-033-post-click-snapshot.md` |
| SC-PAT-034 | Passed | Codex | 2026-03-16T15:35:53Z | Direct open of non-existent appointment detail `/appointments/99999999` failed safely: the backend returned not-found, the app redirected to `/appointments`, and the list route remained usable instead of crashing. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-034-appointment-not-found-fallback.png` |
| SC-PAT-037 | Blocked | Codex | 2026-03-16T15:35:53Z | Search-by-order-code coverage is blocked because `/payments` cannot load history data for either `patient1@clinic.com` or `patient.1@healthflow.vn`: `GET /api/payments/my-payments?page=0&size=20` returned `503 Service Unavailable`, leaving no rows to search. Tracked in `BUG-013`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-payment-history-service-unavailable.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/playwright-network.log` |
| SC-PAT-038 | Blocked | Codex | 2026-03-16T15:35:53Z | Method/status filtering could not be completed because `/payments` history loading is currently failing with `503 Service Unavailable` for both patient accounts, so there is no real payment data to filter. Tracked in `BUG-013`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-payment-history-service-unavailable.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/playwright-network.log` |
| SC-PAT-039 | Passed | Codex | 2026-03-16T15:35:53Z | Opening the reachable payment-result route with prior known order `ORDER1773663997339466297` rendered a stable failure-state screen (`Thanh toán thất bại`) with clear fallback CTAs instead of a blank route or crash. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-039-payment-result-known-order.png` |
| SC-PAT-040 | Passed | Codex | 2026-03-16T15:35:53Z | Opening `/payment/result` with invalid return params (`orderId=ORDER-INVALID-152303`) showed a graceful neutral/failure state with actionable `Thử lại`, `Đặt lịch mới`, and `Về trang chủ` CTAs. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-040-payment-result-invalid-orderid.png` |
| SC-PAT-041 | Blocked | Codex | 2026-03-16T15:35:53Z | Cross-linking from payment history into a related appointment is blocked because the payment history endpoint is returning `503` before any linked payment rows can render. Tracked in `BUG-013`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-payment-history-service-unavailable.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/playwright-network.log` |
| SC-PAT-046 | Passed | Codex | 2026-03-16T15:35:53Z | Direct open of non-existent medical record `/medical-records/99999999` rendered `Không tìm thấy hồ sơ bệnh án` with a safe `Quay lại` action instead of breaking the route. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-046-medical-record-not-found.png` |
| SC-PAT-051 | Passed | Codex | 2026-03-16T15:35:53Z | On `/health-metrics`, logging a supported non-blood-pressure metric (`HEART_RATE = 72`, note `QA heart rate metric`) succeeded and the new heart-rate card rendered with the persisted value/date. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-051-heart-rate-added.png` |
| SC-PAT-053 | Passed | Codex | 2026-03-16T15:35:53Z | Submitting the health-metric form with invalid empty blood-pressure values failed safely: `POST /api/health-metrics` returned `400` and the UI showed visible toast `Không thể ghi nhận chỉ số` without route instability. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-053-health-metric-invalid-submit.png` |
| SC-PAT-058 | Passed | Codex | 2026-03-16T15:35:53Z | For fallback patient `patient.1@healthflow.vn`, a newly added family member (`QA Delete Member`) could be removed through the confirmation flow; revisiting `/family` showed the list empty again, so no broken record remained. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-058-family-delete-404.png` |
| SC-PAT-059 | Passed | Codex | 2026-03-16T15:35:53Z | Saving the family-member modal with missing required fields failed safely and surfaced validation feedback (`Ngày sinh không hợp lệ (YYYY-MM-DD)`), preventing creation of a broken record. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-059-family-missing-required-fields.png` |
| SC-DOC-004 | Failed | Codex | 2026-03-16T15:50:13Z | Using fallback doctor `doctor.1@healthflow.vn`, `/doctor/appointments` rendered `Không có lịch hẹn nào` on both `Hôm nay` and `Sắp tới` even though the same session's `/patients` list showed many linked patients with `Tổng lịch hẹn: 1` and one with `Tổng lịch hẹn: 2`, so seeded appointment/status control coverage was not reachable from the doctor appointments page. See `BUG-014`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-004-appointments-empty.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-004-patients-with-history.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-004-appointments-network.log` |
| SC-DOC-006 | Blocked | Codex | 2026-03-16T15:50:13Z | Confirm/complete/cancel controls could not be exercised because the fallback doctor appointments page stayed empty even with seeded patient history visible in `/patients`. Blocked behind `BUG-014` until real appointment cards/actions render on `/doctor/appointments`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-004-appointments-empty.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-004-patients-with-history.png` |
| SC-DOC-009 | Failed | Codex | 2026-03-16T15:50:13Z | On `/schedule`, setting Monday to invalid hours (`18:30` to `17:00`) and clicking `Lưu lịch làm việc` produced no validation, no toast, and no save request; the edited values remained on screen while the saved network log only contained GET traffic. See `BUG-015`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-009-invalid-schedule-values-retained.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-schedule-network.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-schedule-console.log` |
| SC-DOC-010 | Blocked | Codex | 2026-03-16T15:50:13Z | Schedule persistence could not be verified because the save action on `/schedule` did not fire any update request after edits, leaving nothing reliable to reload-check. Blocked behind `BUG-015`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-009-invalid-schedule-values-retained.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-schedule-network.log` |
| SC-DOC-012 | Passed | Codex | 2026-03-16T15:50:13Z | `/patients` search filtered correctly for fallback doctor `doctor.1@healthflow.vn`: entering `Le Nam Phuc` reduced the list to the expected matching patient card without leaking unrelated records. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-012-patient-search-filtered.png` |
| SC-DOC-013 | Failed | Codex | 2026-03-16T15:50:13Z | On `/patients`, clicking `Xem hồ sơ` left the route on `/patients`, opened no modal/detail view, and triggered no follow-up detail/history request. See `BUG-016`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-013-patient-detail-inert.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-013-post-click-snapshot.md`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-013-patient-detail-network.log` |
| SC-DOC-021 | Failed | Codex | 2026-03-16T15:50:13Z | On doctor `/profile`, replacing the phone with `abc` and clicking `Lưu thay đổi` produced no field validation, no visible error/success feedback, and no `PUT /api/profile` request; only initial GET traffic was recorded. See `BUG-017`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-021-profile-invalid-phone.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-021-profile-invalid-phone-snapshot.md`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-021-profile-network.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-021-profile-console.log` |
| SC-ADM-007 | Passed | Codex | 2026-03-16T16:01:30Z | On `/users`, opening `Thêm người dùng` and clicking `Lưu` with empty required fields failed safely: `POST /api/users => 400 Bad Request` and the UI surfaced toast `Không thể lưu người dùng` without breaking the modal or route. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/sc-adm-007-user-save-empty-required.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/sc-adm-007-user-save-network.log` |
| SC-ADM-008 | Passed | Codex | 2026-03-16T16:01:30Z | The `/users` role filter worked safely: selecting `Bác sĩ` switched the list to doctor-only results and the saved network log showed `GET /api/users/role/DOCTOR?page=0&size=20 => 200` with no broken state. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/sc-adm-008-users-filter-doctor.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/sc-adm-008-users-filter-network.log` |
| SC-ADM-009 | Passed | Codex | 2026-03-16T16:01:30Z | Retry behavior on admin user edit remained recoverable: clearing Dr. Sarah Johnson's phone and saving first produced `PUT /api/users/224 => 500` with a toast, then restoring the original phone and retrying immediately succeeded with `PUT /api/users/224 => 200` and success toast `Đã cập nhật người dùng`. The invalid-save defect is tracked separately in `BUG-018`, but the retry path itself was clear and successful. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/sc-adm-009-user-save-retry-success.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/sc-adm-009-user-save-retry-network.log` |
| SC-ADM-012 | Passed | Codex | 2026-03-16T16:01:30Z | On `/doctors`, the status filter `Chờ duyệt` updated the page safely to the empty state `Không tìm thấy bác sĩ nào` without reproducing the prior route crash. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/sc-adm-012-doctors-status-filter-pending.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/sc-adm-012-doctors-status-filter-network.log` |
| SC-ADM-013 | Passed | Codex | 2026-03-16T16:01:30Z | The doctor-management detail affordance opened correctly: clicking the first `Chi tiết bác sĩ` button rendered a detail drawer with specialty, rating, email, phone, and license information instead of crashing or staying inert. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/sc-adm-013-doctor-detail-opened.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/sc-adm-013-doctor-detail-network.log` |
| SC-ADM-014 | Blocked | Codex | 2026-03-16T16:01:30Z | A doctor-management update could not be exercised because the current `/doctors` UI exposed only a read-only detail drawer and the `Chờ duyệt` tab was empty; no approve/edit/save control was available to trigger an update path. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/sc-adm-012-doctors-status-filter-pending.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/sc-adm-013-doctor-detail-opened.png` |
| SC-ADM-018 | Passed | Codex | 2026-03-16T16:01:30Z | On `/admin/clinics`, opening `Thêm phòng khám` and submitting with the required clinic name empty surfaced the safe validation toast `Tên phòng khám là bắt buộc` and left the route stable. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/sc-adm-018-clinic-empty-required.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/sc-adm-018-clinic-empty-required-network.log` |
| SC-ADM-023 | Passed | Codex | 2026-03-16T16:01:30Z | On `/admin/services`, opening `Thêm dịch vụ` and submitting an invalid empty service form showed the validation toast `Tên dịch vụ là bắt buộc`; no corrupt row was created and the page remained stable. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/sc-adm-023-service-invalid-save.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/sc-adm-023-service-invalid-save-network.log` |
| SC-AUTH-001 | Passed | Codex | 2026-03-17T16:09:18Z | The public landing page rendered correctly on `/` with hero copy, CTA buttons, feature cards, testimonials, and footer links visible; no route crash occurred in real backend mode. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-001-landing.png` |
| SC-AUTH-005 | Passed | Codex | 2026-03-17T16:09:18Z | `/login` rendered the expected auth UI including quick-demo role buttons, email/phone and password inputs, remember-me checkbox, forgot-password link, and registration link. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-005-login-render.png` |
| SC-AUTH-006 | Passed | Codex | 2026-03-17T16:09:18Z | Logging in as `patient1@clinic.com / password` redirected to `/dashboard`, showed the patient dashboard for `Nguyen Van A`, and surfaced the success toast `Đăng nhập thành công!`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-006-patient-login-dashboard.png` |
| SC-AUTH-007 | Passed | Codex | 2026-03-17T16:09:18Z | Logging in as `dr.sarah@clinic.com / password` redirected to `/dashboard`, rendered the doctor dashboard for `Dr. Sarah Johnson`, and kept the route stable in real backend mode. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-007-doctor-login-dashboard.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-doctor-login-network.log` |
| SC-AUTH-008 | Passed | Codex | 2026-03-17T16:09:18Z | Logging in as `admin@clinic.com / password` redirected to `/dashboard`, rendered the admin dashboard for `Admin System`, and showed the authenticated admin navigation without crashing. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-008-admin-login-dashboard.png` |
| SC-AUTH-009 | Failed | Codex | 2026-03-17T16:09:18Z | Invalid credentials `patient1@clinic.com / wrongpass` kept the session on `/login`, but no visible inline or toast error appeared even though `POST /api/auth/login` returned `401 Unauthorized`. See `BUG-001`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-009-invalid-login.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-invalid-login-network.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-invalid-login-console.log` |
| SC-AUTH-013 | Passed | Codex | 2026-03-18T12:47:40Z | Logged-out navigation to `/register` rendered the full registration form with name, email, phone, role, password, confirm-password, terms checkbox, and submit CTA in real backend mode. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-013-register.png` |
| SC-AUTH-017 | Passed | Codex | 2026-03-18T12:47:40Z | A valid logged-out registration completed end-to-end with unique patient credentials (`qa.auth.turn.20260318t124636z@example.com`), redirected to `/dashboard`, and showed the success toast `Đăng ký thành công!`. A prior same-turn attempt briefly returned `503`, but the flow was not reproducibly broken after rerunning with fresh unique data. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-017-register-success.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-017-network.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-017-console.log` |
| SC-AUTH-018 | Passed | Codex | 2026-03-18T12:47:40Z | Logged-out navigation to `/forgot-password` rendered the recovery form with email input, submit CTA, back-to-login link, and registration link without crashing. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-018-forgot-password.png` |
| SC-AUTH-019 | Passed | Codex | 2026-03-18T12:47:40Z | Submitting forgot-password with seeded account `patient1@clinic.com` showed the success confirmation `Email đã gửi!` and the retry CTA without destabilizing the route. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-019-forgot-password-success.png` |
| SC-AUTH-022 | Passed | Codex | 2026-03-18T12:47:40Z | Opening `/verify-email` without a valid token rendered the graceful invalid/expired state `Xác minh thất bại` instead of crashing. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-022-verify-email-invalid.png` |
| SC-AUTH-023 | Passed | Codex | 2026-03-18T12:47:40Z | Opening `/verify-phone` while logged out rendered the OTP verification UI with six inputs, resend CTA, and disabled verify button before code entry. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-023-verify-phone.png` |
| SC-AUTH-027 | Passed | Codex | 2026-03-17T16:09:18Z | Opening `/dashboard` while logged out redirected safely to `/login`; no protected dashboard content leaked before the redirect completed. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-027-dashboard-redirect-login.png` |
| SC-AUTH-028 | Passed | Codex | 2026-03-17T16:09:18Z | Opening the patient-only route `/appointments/book` while logged out redirected safely to `/login` instead of exposing the booking flow. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-028-patient-route-redirect-login.png` |
| SC-AUTH-029 | Passed | Codex | 2026-03-17T16:09:18Z | Opening the doctor-only route `/doctor/appointments` while logged out redirected safely to `/login` instead of exposing doctor content. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-029-doctor-route-redirect-login.png` |
| SC-AUTH-030 | Passed | Codex | 2026-03-17T16:09:18Z | Opening the admin-only route `/users` while logged out redirected safely to `/login` instead of exposing admin content. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-030-admin-route-redirect-login.png` |
| SC-AUTH-031 | Passed | Codex | 2026-03-17T16:09:18Z | From an authenticated admin session, using the profile-menu logout action returned the app to `/login` and cleared the protected session. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-031-logout-to-login.png` |
| SC-AUTH-032 | Passed | Codex | 2026-03-18T12:47:40Z | Refreshing the authenticated patient route `/appointments` kept the active session intact and re-rendered the appointments page instead of dropping back to login. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-032-patient-refresh.png` |
| SC-AUTH-034 | Passed | Codex | 2026-03-18T12:47:40Z | While logged in as `patient1@clinic.com`, direct navigation to `/doctor/appointments` redirected back to the patient dashboard at `/dashboard`; doctor appointment content was not exposed. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-034-patient-doctor-route-denied.png` |
| SC-AUTH-035 | Passed | Codex | 2026-03-18T12:47:40Z | While logged in as `patient1@clinic.com`, direct navigation to `/users` redirected back to the patient dashboard at `/dashboard`; admin user-management content was not exposed. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-035-patient-admin-route-denied.png` |
| SC-AUTH-036 | Passed | Codex | 2026-03-18T12:47:40Z | While logged in as `dr.sarah@clinic.com`, direct navigation to `/appointments/book` redirected back to the doctor dashboard at `/dashboard`; patient booking content was not exposed. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-036-doctor-patient-route-denied.png` |
| SC-AUTH-037 | Passed | Codex | 2026-03-18T12:47:40Z | While logged in as `dr.sarah@clinic.com`, direct navigation to `/users` redirected back to the doctor dashboard at `/dashboard`; admin user-management content was not exposed. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-037-doctor-admin-route-denied.png` |
| SC-AUTH-038 | Passed | Codex | 2026-03-18T12:47:40Z | While logged in as `admin@clinic.com`, direct navigation to `/appointments/book` redirected back to the admin dashboard at `/dashboard`; patient booking content was not exposed. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-038-admin-patient-route-denied.png` |
| SC-AUTH-039 | Passed | Codex | 2026-03-18T12:47:40Z | While logged in as `admin@clinic.com`, direct navigation to `/doctor/appointments` redirected back to the admin dashboard at `/dashboard`; doctor appointment content was not exposed. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-039-admin-doctor-route-denied.png` |
| SC-PAT-001 | Passed | Codex | 2026-03-17T13:59:39Z | Patient `/dashboard` rendered successfully after seeded login. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-dashboard.png` |
| SC-PAT-002 | Passed | Codex | 2026-03-17T13:59:39Z | Dashboard summary cards and core widgets rendered (`Sắp tới`, `Đã hoàn thành`, `Đơn thuốc`, `Nhật ký`, upcoming appointments, records, health metrics). Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-dashboard.png` |
| SC-PAT-003 | Failed | Codex | 2026-03-17T13:59:39Z | Dashboard still loaded with known regressions: repeated patient stats `500` responses and duplicate-key sidebar warnings reproduced again on patient load. See `BUG-002` and `BUG-006`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-dashboard.png` |
| SC-PAT-004 | Passed | Codex | 2026-03-17T13:59:39Z | Sidebar navigation from patient dashboard into `/appointments` worked and rendered the appointment management route. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-appointments-empty.png` |
| SC-PAT-005 | Failed | Codex | 2026-03-17T13:59:39Z | Patient sidebar currently exposes `/appointments/book` but no `/find-doctors` entry, so the doctor-search navigation case cannot be completed from sidebar UI. See `BUG-019`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-005-sidebar-missing-find-doctors.md`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-009-search-sarah-not-filtered.png` |
| SC-PAT-006 | Passed | Codex | 2026-03-17T13:59:39Z | Sidebar links to `/medical-records`, `/health-metrics`, `/family`, and `/notifications` all resolved correctly in the same patient session without dead links. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-appointments-empty.png` |
| SC-PAT-007 | Passed | Codex | 2026-03-17T14:53:36Z | Header profile navigation worked in the patient session: opening the avatar menu and choosing `Cài đặt tài khoản` routed cleanly to `/profile` without a dead link. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T144514Z/sc-pat-007-profile-entrypoint.png` |
| SC-PAT-008 | Passed | Codex | 2026-03-17T13:59:39Z | Direct navigation to `/find-doctors` rendered the doctor-search page and listed 31 doctors without a route crash. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-009-search-sarah-not-filtered.png` |
| SC-PAT-009 | Failed | Codex | 2026-03-17T13:59:39Z | Searching `/find-doctors` for `Sarah` and submitting left the page at `Tìm thấy 31 bác sĩ`; unfiltered cards still rendered. See `BUG-020`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-009-search-sarah-not-filtered.png` |
| SC-PAT-010 | Failed | Codex | 2026-03-17T13:59:39Z | Searching `/find-doctors` for specialty text `Tim mạch` still left `Tìm thấy 31 bác sĩ` with mixed-specialty cards visible. See `BUG-020`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-010-search-specialty-not-filtered.png` |
| SC-PAT-013 | Passed | Codex | 2026-03-17T13:59:39Z | Using the visible `Đặt lịch` CTA from the `Dr. Sarah Johnson` search result opened `/appointments/book?doctorId=224`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-016-preselected-doctor-booking.png` |
| SC-PAT-015 | Passed | Codex | 2026-03-17T13:59:39Z | Direct `/appointments/book` rendered the booking wizard with doctor selection, specialty filter, and stepper UI. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-016-preselected-doctor-booking.png` |
| SC-PAT-016 | Passed | Codex | 2026-03-17T13:59:39Z | Starting from the search-result booking CTA preserved `Dr. Sarah Johnson` context and opened the date/time step for that doctor. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-016-preselected-doctor-booking.png` |
| SC-PAT-017 | Passed | Codex | 2026-03-17T13:59:39Z | Generic booking flow for `BS. Tran Thu Binh` advanced through doctor selection, date/time, details, and confirmation. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-017-booking-confirmation-step.png` |
| SC-PAT-018 | Passed | Codex | 2026-03-17T13:59:39Z | Valid submission created the appointment successfully (`POST /api/appointments => 201`); the downstream payment redirect defect is tracked separately under `SC-PAT-020` / `BUG-021`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/bug-pat-payment-handoff-network.log` |
| SC-PAT-019 | Passed | Codex | 2026-03-17T13:59:39Z | The newly created appointment for `BS. Tran Thu Binh` on `March 18, 2026` at `08:30` appeared immediately in `/appointments` with `Chờ xác nhận` status. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-019-appointment-visible.png` |
| SC-PAT-020 | Failed | Codex | 2026-03-17T13:59:39Z | Payment handoff failed: after appointment creation, `POST /api/payments` returned `503 Service Unavailable` and the UI stayed on the booking confirmation step instead of redirecting to payment. See `BUG-021`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/bug-pat-payment-handoff-503.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/bug-pat-payment-handoff-network.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/bug-pat-payment-handoff-console.log` |
| SC-PAT-025 | Passed | Codex | 2026-03-17T14:53:36Z | After the earlier failed payment handoff, `/appointments/book` remained recoverable: the booking wizard reopened at step 1 with doctor cards, search, and specialty filter available for a fresh retry. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T144514Z/sc-pat-025-booking-recoverable.png` |
| SC-PAT-026 | Passed | Codex | 2026-03-17T14:11:23Z | `/appointments` rendered correctly in the seeded patient session with current appointment rows visible. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/sc-pat-029-cancel-success.png` |
| SC-PAT-027 | Passed | Codex | 2026-03-17T14:11:23Z | Appointment rows displayed consistent status and metadata for the seeded patient, including doctor name, date, time, visit type, and `Chờ xác nhận` / `Đã hủy` state chips. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/sc-pat-029-cancel-success.png` |
| SC-PAT-028 | Passed | Codex | 2026-03-17T14:11:23Z | Opened `/appointments/1801`; detail page rendered doctor, date, time, reason, notes, location, payment section, and quick actions without crashing. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/bug-pat-reschedule-500.png` |
| SC-PAT-029 | Passed | Codex | 2026-03-17T14:11:23Z | Cancel flow on appointment `1802` worked: confirmation modal opened, `Xác nhận hủy` succeeded, and the list updated to `Đã hủy` with toast `Đã hủy lịch hẹn`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/sc-pat-029-cancel-success.png` |
| SC-PAT-030 | Failed | Codex | 2026-03-17T14:11:23Z | Reschedule flow opened on appointment `1801`, but confirming a new slot posted `POST /api/appointments/1801/reschedule => 500 Internal Server Error` and the UI showed `Request failed with status code 500`. See `BUG-022`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/bug-pat-reschedule-500.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/bug-pat-reschedule-network.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/bug-pat-reschedule-console.log` |
| SC-PAT-032 | Passed | Codex | 2026-03-17T14:53:36Z | Appointment detail data stayed consistent on `/appointments/1801`: doctor, date, time, visit mode, reason, notes, clinic address, and payment summary all rendered without mismatch or route failure. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T144514Z/sc-pat-032-appointment-detail.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T144514Z/sc-pat-032-appointment-detail-network.log` |
| SC-PAT-035 | Failed | Codex | 2026-03-17T14:42:14Z | `/payments` still cannot load history data: `GET /api/payments/my-payments?page=0&size=20` returned `503 Service Unavailable`, while the UI fell back to `Không có giao dịch nào` instead of rendering real payment history. See `BUG-013`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T143716Z/sc-pat-payments-empty-with-errors.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T143716Z/sc-pat-payments-network.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T143716Z/sc-pat-payments-console.log` |
| SC-PAT-036 | Blocked | Codex | 2026-03-17T14:42:14Z | Verification of a pending/completed payment row is still blocked because `/api/payments/my-payments` is returning `503 Service Unavailable` before any payment rows can load. Tracked in `BUG-013`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T143716Z/sc-pat-payments-empty-with-errors.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T143716Z/sc-pat-payments-network.log` |
| SC-PAT-042 | Failed | Codex | 2026-03-17T14:42:14Z | The payment empty state is not trustworthy: the UI shows `Không có giao dịch nào` even though `GET /api/payments/my-payments?page=0&size=20` is failing with `503 Service Unavailable`, so the page is masking a backend error as empty data. See `BUG-013`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T143716Z/sc-pat-payments-empty-with-errors.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T143716Z/sc-pat-payments-network.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T143716Z/sc-pat-payments-console.log` |
| SC-PAT-043 | Passed | Codex | 2026-03-17T14:34:02Z | `/medical-records` rendered correctly with the patient medical-record shell, search input, and result area in real backend mode. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-medical-records-empty.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-medical-records-network.log` |
| SC-PAT-044 | Blocked | Codex | 2026-03-17T14:34:02Z | No medical-record rows were available for the seeded patient after `/api/medical-records/patient/223 => 200 OK`, so there was no record detail target to open this turn. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-medical-records-empty.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-medical-records-network.log` |
| SC-PAT-045 | Passed | Codex | 2026-03-17T14:34:02Z | The empty-state records experience was graceful: `/medical-records` showed `Chưa có hồ sơ bệnh án nào` without route failure. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-medical-records-empty.png` |
| SC-PAT-047 | Blocked | Codex | 2026-03-17T14:34:02Z | No prescription-linked medical record was available in the current patient dataset, so there was no prescription detail to open this turn. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-medical-records-empty.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-medical-records-network.log` |
| SC-PAT-048 | Passed | Codex | 2026-03-17T14:53:36Z | Opening invalid prescription route `/prescriptions/999999` failed safely: the app handled `GET /api/prescriptions/999999 => 404` by falling back to `/medical-records` and showing the existing empty-state shell instead of crashing. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T144514Z/sc-pat-048-invalid-prescription-fallback.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T144514Z/sc-pat-048-invalid-prescription-network.log` |
| SC-PAT-049 | Passed | Codex | 2026-03-17T14:34:02Z | `/health-metrics` rendered correctly with metric cards, add-entry CTA, and the tracking chart area in real backend mode. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-health-metrics-saved.png` |
| SC-PAT-050 | Passed | Codex | 2026-03-17T14:34:02Z | Added a valid blood-pressure metric `120/80` with note `Manual QA blood pressure entry 2026-03-17`; `POST /api/health-metrics => 201 Created` and success feedback `Đã ghi nhận chỉ số sức khỏe` appeared. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-health-metrics-saved.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-health-metrics-network.log` |
| SC-PAT-052 | Passed | Codex | 2026-03-17T14:34:02Z | The newly added blood-pressure metric refreshed immediately in both the `Huyết áp` summary card and the trend chart. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-health-metrics-saved.png` |
| SC-PAT-054 | Blocked | Codex | 2026-03-17T14:53:36Z | The required `before first entry` precondition is unavailable in the current real-mode datasets: `patient1@clinic.com` already has newly created metrics from turn 18, and fallback account `patient.1@healthflow.vn` also loads seeded heart-rate/weight history. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-health-metrics-saved.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T144514Z/sc-pat-054-seeded-health-metrics.png` |
| SC-PAT-055 | Passed | Codex | 2026-03-17T14:34:02Z | `/family` rendered correctly with family-member management UI, add-member CTA, and an empty state before creation. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-family-member-saved.png` |
| SC-PAT-056 | Passed | Codex | 2026-03-17T14:34:02Z | Added a valid family member `QA Family Member 2026-03-17`; `POST /api/family-members => 201 Created` and the new member appeared in the list. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-family-member-saved.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-family-network.log` |
| SC-PAT-057 | Passed | Codex | 2026-03-17T14:34:02Z | Editing the newly added family member succeeded; `PUT /api/family-members/221 => 200 OK` and the UI confirmed `Đã cập nhật thành viên`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-family-member-saved.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-family-network.log` |
| SC-PAT-060 | Passed | Codex | 2026-03-17T14:53:36Z | Fallback patient `patient.1@healthflow.vn` rendered a graceful family empty state on `/family` with explanatory copy and working `Thêm thành viên` CTAs. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T144514Z/sc-pat-060-family-empty-state.png` |
| SC-PAT-061 | Passed | Codex | 2026-03-17T14:34:02Z | `/notifications` rendered correctly with the notification center, category tabs, unread state, and row actions. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-notifications-page.png` |
| SC-PAT-062 | Passed | Codex | 2026-03-17T14:34:02Z | Switching notification categories updated the UI correctly; the `Lịch hẹn` filter activated and the appointment notification remained visible under that category. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-notifications-page.png` |
| SC-PAT-063 | Passed | Codex | 2026-03-17T14:34:02Z | Marking notifications as read worked cleanly: `PUT /api/notifications/user/223/read-all => 204 No Content` and the UI confirmed `Đã đánh dấu tất cả đã đọc`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-notifications-page.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-notifications-network.log` |
| SC-PAT-064 | Blocked | Codex | 2026-03-17T14:53:36Z | The empty-state notification precondition is unavailable in the current real-mode datasets: `patient1@clinic.com` already had notifications in turn 18, and fallback account `patient.1@healthflow.vn` also loads seeded notification rows on `/notifications`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-notifications-page.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T144514Z/sc-pat-064-seeded-notifications.png` |
| SC-PAT-065 | Passed | Codex | 2026-03-17T14:11:23Z | `/patient/consultations` rendered correctly and showed the patient empty state plus the `Tạo yêu cầu tư vấn` CTA before creation. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/sc-pat-067-consultation-detail.png` |
| SC-PAT-066 | Passed | Codex | 2026-03-17T14:11:23Z | The new consultation request flow opened at `/patient/consultations/new` with doctor selector, topic, description, fee summary, and submit CTA. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/sc-pat-067-consultation-detail.png` |
| SC-PAT-067 | Passed | Codex | 2026-03-17T14:11:23Z | Created a valid consultation request for `Dr. Sarah Johnson`; `POST /api/consultations => 201` and the detail page opened in `Chờ xác nhận` state with success toast `Đã tạo yêu cầu tư vấn thành công!`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/sc-pat-067-consultation-detail.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/sc-pat-consultation-network.log` |
| SC-PAT-068 | Passed | Codex | 2026-03-17T14:11:23Z | The resulting consultation detail `/patient/consultations/801` rendered doctor identity, request subject, pending-state banner, and request actions without route failure. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/sc-pat-067-consultation-detail.png` |
| SC-PAT-069 | Failed | Codex | 2026-03-17T14:42:14Z | Doctor acceptance now works (`PUT /api/consultations/801/accept => 200`), and the patient can reach an active chat, but the primary send button is obstructed by the floating chatbot widget. Mouse-click submission is blocked by overlay interception; the message could only be sent with the Enter key workaround (`POST /api/messages => 201`). See `BUG-025`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T143716Z/bug-pat-chatbot-overlaps-send-button.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T143716Z/sc-pat-069-doctor-accepted-network.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T143716Z/sc-pat-069-messaging-network.log` |
| SC-PAT-070 | Failed | Codex | 2026-03-17T14:11:23Z | Realtime initialization still throws the known STOMP lifecycle defect on patient consultation detail: console logged missing auto-reconnect warnings plus `There is no underlying STOMP connection` before recovering. See `BUG-003`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/sc-pat-consultation-console.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/sc-pat-consultation-network.log` |
| SC-PAT-071 | Passed | Codex | 2026-03-17T14:23:24Z | Consultation creation validation fired correctly: after selecting `Dr. Sarah Johnson` and submitting a 1-character topic, the UI showed `Chủ đề phải có ít nhất 5 ký tự` and did not create a request. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/sc-pat-071-validation.png` |
| SC-PAT-072 | Passed | Codex | 2026-03-17T14:23:24Z | Direct navigation to foreign consultation `/patient/consultations/800` was blocked safely; the backend returned `403 Forbidden` for both consultation and message APIs, and the app sent the patient back to the consultations list instead of exposing other-user data. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/sc-pat-072-foreign-consultation-blocked.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/sc-pat-072-foreign-consultation-network.log` |
| SC-PAT-073 | Failed | Codex | 2026-03-17T14:23:24Z | Nonexistent consultation detail handling is not graceful. Opening `/patient/consultations/999999` only falls back to the generic toast `Không thể tải dữ liệu tư vấn` after duplicate `404` requests for consultation and messages plus premature WebSocket subscription attempts. See `BUG-024`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/bug-pat-consultation-invalid-route.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/bug-pat-consultation-invalid-route-network.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/bug-pat-consultation-invalid-route-console.log` |
| SC-PAT-074 | Passed | Codex | 2026-03-17T14:23:24Z | Navigating to `/messages` resolved directly to `/patient/consultations` without an auth loop or dead-end route. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/sc-pat-074-messages-redirect.png` |
| SC-PAT-075 | Passed | Codex | 2026-03-17T14:11:23Z | `/profile` rendered with the current patient data, avatar affordance, editable name/phone/birthdate fields, gender selector, and save CTA. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/sc-pat-075-profile.png` |
| SC-PAT-076 | Passed | Codex | 2026-03-17T14:23:24Z | Saving the patient profile with valid data succeeded and showed the success toast `Thông tin đã được cập nhật!` on `/profile`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/sc-pat-076-profile-save-success.png` |
| SC-PAT-077 | Failed | Codex | 2026-03-17T14:23:24Z | Invalid profile input is not handled cleanly. Replacing the phone field with `abc` and saving triggered `PUT /api/profile => 500 Internal Server Error`, and the UI only showed the generic message `An unexpected error occurred. Please contact support.` See `BUG-023`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/bug-pat-profile-invalid-phone.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/bug-pat-profile-invalid-phone-network.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/bug-pat-profile-invalid-phone-console.log` |
| SC-PAT-078 | Passed | Codex | 2026-03-17T14:11:23Z | `/profile/security` rendered email/phone verification status plus current/new/confirm password fields and the password-update CTA. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/sc-pat-078-security.png` |
| SC-PAT-079 | Passed | Codex | 2026-03-17T14:23:24Z | The password form correctly prevented a mismatched submission and showed inline validation `Mật khẩu không khớp` on `/profile/security`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/sc-pat-079-password-mismatch.png` |
| SC-PAT-080 | Passed | Codex | 2026-03-17T14:23:24Z | A valid password change succeeded on `/profile/security`; the patient password was changed to a temporary value, success feedback `Mật khẩu đã được thay đổi!` appeared, and the seeded password was then restored to `password` to keep later turns deterministic. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/sc-pat-080-password-change-success.png` |
| SC-PAT-081 | Passed | Codex | 2026-03-17T14:23:24Z | `/profile/notifications` rendered grouped Email, SMS, Push Notification, and reminder-time settings with individual toggles and a save CTA. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/sc-pat-082-notification-save-success.png` |
| SC-PAT-082 | Passed | Codex | 2026-03-17T14:23:24Z | Notification settings persisted successfully: the patient toggled the `Tin tức & khuyến mãi` email setting on and the page confirmed `Cài đặt thông báo đã được lưu!`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/sc-pat-082-notification-save-success.png` |
| SC-DOC-001 | Passed | Codex | 2026-03-17T14:59:32Z | Doctor `/dashboard` rendered correctly for `Dr. Sarah Johnson` with the doctor sidebar, greeting header, today schedule panel, and quick actions visible. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T145610Z/sc-doc-001-dashboard.png` |
| SC-DOC-002 | Passed | Codex | 2026-03-17T14:59:32Z | Doctor dashboard widgets were present and stable: summary cards for today/week appointments, patients, rating, the `Lịch trình hôm nay` panel, and quick actions for schedule, patients, and prescription creation. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T145610Z/sc-doc-001-dashboard.png` |
| SC-DOC-003 | Passed | Codex | 2026-03-17T14:59:32Z | `/doctor/appointments` rendered successfully with doctor navigation, status tabs (`Hôm nay`, `Sắp tới`, `Đã hoàn thành`), and appointment-management layout in real backend mode. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T145610Z/sc-doc-003-appointments.png` |
| SC-DOC-005 | Passed | Codex | 2026-03-17T14:59:32Z | The doctor appointments page handled the no-data state gracefully, showing `Không có lịch hẹn nào` without route failure or broken controls. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T145610Z/sc-doc-003-appointments.png` |
| SC-DOC-007 | Passed | Codex | 2026-03-17T14:59:32Z | `/schedule` rendered the weekly schedule editor with weekday toggles, editable time ranges, save CTA, and explanatory note panel. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T145610Z/sc-doc-007-schedule.png` |
| SC-DOC-008 | Passed | Codex | 2026-03-17T14:59:32Z | A valid Friday schedule edit saved successfully: changing `Thứ 6` to `09:00-16:00` showed toast `Đã cập nhật lịch làm việc`, backend schedule writes returned success, and the baseline was restored to `08:00-17:00` afterward. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T145610Z/sc-doc-008-schedule-saved.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T145610Z/sc-doc-network.log` |
| SC-DOC-011 | Passed | Codex | 2026-03-17T15:08:57Z | `/patients` rendered correctly for the doctor role with search UI and patient-management layout. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-011-patients.png` |
| SC-DOC-014 | Passed | Codex | 2026-03-17T15:08:57Z | The doctor patient list handled the empty state gracefully, showing `Chưa có bệnh nhân nào` without route failure. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-011-patients.png` |
| SC-DOC-015 | Failed | Codex | 2026-03-17T15:08:57Z | Opening `/doctor/create-medical-record` never surfaced the record form and instead redirected back to `/doctor/appointments` with no stable explanatory state about the missing appointment context. See `BUG-026`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-015-create-record-redirected.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-turn22-network-final.log` |
| SC-DOC-016 | Blocked | Codex | 2026-03-17T15:08:57Z | The current doctor dataset exposed no appointment rows on `/doctor/appointments`, and the create-record route was inaccessible this turn, so no valid appointment context was available for a positive medical-record save. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T145610Z/sc-doc-003-appointments.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-015-create-record-redirected.png` |
| SC-DOC-017 | Failed | Codex | 2026-03-17T15:08:57Z | Attempting record creation without a valid appointment state was not rejected safely: `/doctor/create-medical-record` redirected silently to the doctor appointments page instead of showing a clear validation or route-level explanation. See `BUG-026`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-015-create-record-redirected.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-turn22-network-final.log` |
| SC-DOC-018 | Blocked | Codex | 2026-03-17T15:08:57Z | No accessible create-record form or other-doctor appointment context was available in the current doctor dataset, so cross-doctor record-creation access control could not be exercised honestly this turn. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-015-create-record-redirected.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-turn22-network-final.log` |
| SC-DOC-019 | Passed | Codex | 2026-03-17T15:19:42Z | Doctor `/profile` rendered correctly with avatar, name, specialty, editable personal fields, and profile-save CTA for `dr.sarah@clinic.com`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/sc-doc-019-profile.png` |
| SC-DOC-020 | Passed | Codex | 2026-03-17T15:19:42Z | Doctor profile updates worked with a valid unique phone: changing the phone to `0918887766` saved successfully with `Thông tin đã được cập nhật!`, and the original phone `0909999002` was restored afterward to preserve seed expectations. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/sc-doc-020-profile-save-success.png` |
| SC-DOC-022 | Passed | Codex | 2026-03-17T15:19:42Z | `/profile/security` rendered successfully with verified email/phone status, password-change form, and session/security layout intact. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/sc-doc-022-security.png` |
| SC-DOC-023 | Passed | Codex | 2026-03-17T15:19:42Z | `/profile/notifications` rendered grouped doctor notification preferences with Email, SMS, Push toggles and reminder-time controls without route errors. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/sc-doc-023-notifications-settings.png` |
| SC-DOC-024 | Passed | Codex | 2026-03-17T15:08:57Z | `/consultations` rendered successfully with summary cards, status tabs, search box, and the seeded active consultation row for `Nguyen Van A`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-024-consultations-list.png` |
| SC-DOC-025 | Blocked | Codex | 2026-03-17T15:08:57Z | The consultation queue currently shows `Chờ duyệt: 0` and only one active consultation, so there was no pending request available to accept this turn. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-024-consultations-list.png` |
| SC-DOC-026 | Passed | Codex | 2026-03-17T15:08:57Z | Active consultation detail `/doctor/consultations/801` rendered correctly with patient identity, topic, status, message history, and send/complete controls. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-026-consultation-detail.png` |
| SC-DOC-027 | Failed | Codex | 2026-03-17T15:08:57Z | The doctor-side chat input works, but clicking the send button is blocked by the floating chatbot widget. The message only posted via the Enter key workaround (`POST /api/messages => 201`). See `BUG-027`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-026-consultation-detail.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-turn22-network.log` |
| SC-DOC-028 | Failed | Codex | 2026-03-17T15:08:57Z | Doctor consultation detail still reproduces the known realtime defect: STOMP warnings plus `Ignoring an exception thrown by a frame handler. Original exception: TypeError: There is no underlying STOMP connection` appeared during `/doctor/consultations/801` load. See `BUG-003`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-turn22-console.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-026-consultation-detail.png` |
| SC-DOC-029 | Failed | Codex | 2026-03-17T15:19:42Z | Unauthorized consultation route `/doctor/consultations/800` did not show a clear denied state. The app fell back to `/consultations` only after duplicate `403` request traffic, repeated `Failed to load consultation`, and invalid WebSocket/STOMP subscription activity. See `BUG-028`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/bug-doc-consultation-invalid-route.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/bug-doc-consultation-unauthorized-network.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/bug-doc-consultation-unauthorized-console.log` |
| SC-DOC-030 | Failed | Codex | 2026-03-17T15:19:42Z | Nonexistent consultation route `/doctor/consultations/999999` fell back to `/consultations` only after duplicate `404` request traffic, repeated `Failed to load consultation`, and invalid WebSocket/STOMP subscription activity instead of a clean not-found state. See `BUG-028`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/bug-doc-consultation-invalid-route.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/bug-doc-consultation-invalid-route-network.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/bug-doc-consultation-invalid-route-console.log` |
| SC-DOC-031 | Passed | Codex | 2026-03-17T15:19:42Z | Visiting `/messages` as a doctor redirected cleanly to `/consultations` without a dead-end route or broken navigation state. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/sc-doc-031-messages-redirect.png` |
| SC-DOC-032 | Passed | Codex | 2026-03-17T15:19:42Z | `/doctor/analytics` rendered correctly with period filter, summary cards, chart containers, and no-data sections in real backend mode. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/sc-doc-032-analytics.png` |
| SC-DOC-033 | Passed | Codex | 2026-03-17T15:19:42Z | Changing the analytics period filter from `6 tháng gần nhất` to `3 tháng gần nhất` refreshed the view cleanly without a route crash or broken controls. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/sc-doc-032-analytics.png` |
| SC-DOC-034 | Passed | Codex | 2026-03-17T15:19:42Z | Doctor analytics handled the empty-data state gracefully: chart sections and summary areas stayed usable with no-data messaging instead of crashing. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/sc-doc-032-analytics.png` |
| SC-ADM-001 | Passed | Codex | 2026-03-17T15:31:42Z | Admin `/dashboard` rendered correctly with system summary cards, recent activity feed, and key overview widgets visible in real backend mode. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/sc-adm-001-dashboard.png` |
| SC-ADM-002 | Passed | Codex | 2026-03-17T15:53:07Z | Admin dashboard summary cards and recent activity widgets rendered correctly with live seeded counts and feed entries. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-002-dashboard-widgets.png` |
| SC-ADM-003 | Passed | Codex | 2026-03-17T15:31:42Z | `/users` rendered successfully with admin navigation, add-user CTA, search box, role filter, and seeded user cards. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/sc-adm-003-users.png` |
| SC-ADM-004 | Passed | Codex | 2026-03-17T15:31:42Z | User search filtered correctly by email: entering `admin@clinic.com` narrowed the list to the matching admin card without a route crash. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/sc-adm-004-user-search.png` |
| SC-ADM-005 | Passed | Codex | 2026-03-17T15:31:42Z | The admin user edit modal opened correctly with seeded values for full name, email, phone, and role on the filtered admin record. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/sc-adm-005-user-edit-modal.png` |
| SC-ADM-006 | Failed | Codex | 2026-03-17T15:31:42Z | A valid admin user edit did not save consistently: attempting to save the filtered admin record triggered `PUT /api/users/225 => 503 Service Unavailable` and the toast `Không thể lưu người dùng`. See `BUG-029`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/bug-adm-user-save-503.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/bug-adm-user-save-network.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/bug-adm-user-save-console.log` |
| SC-ADM-010 | Passed | Codex | 2026-03-17T15:31:42Z | `/doctors` rendered successfully with status tabs, doctor-management cards, search box, and detail actions visible for the admin role. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/sc-adm-010-doctors.png` |
| SC-ADM-011 | Failed | Codex | 2026-03-17T15:31:42Z | Searching doctors by name is broken: typing `Sarah` into the doctor search box crashed the page to a blank white screen with `TypeError: Cannot read properties of undefined (reading 'toLowerCase')` in `DoctorManagement.jsx`. See `BUG-030`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/bug-adm-doctor-search-crash.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/bug-adm-doctor-search-console.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/sc-adm-doctors-network.log` |
| SC-ADM-015 | Passed | Codex | 2026-03-17T15:41:14Z | `/admin/clinics` rendered correctly with clinic cards, search, and edit controls in real backend mode. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/sc-adm-015-clinics.png` |
| SC-ADM-016 | Passed | Codex | 2026-03-17T15:41:14Z | Clinic search filtered correctly by name: entering `Clinic 2` narrowed the results to `HealthFlow Clinic 2` without a crash. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/sc-adm-016-clinic-search.png` |
| SC-ADM-017 | Passed | Codex | 2026-03-17T15:41:14Z | Opening and saving a valid clinic edit succeeded twice: the clinic modal saved a temporary description successfully, then the original seeded description was restored successfully. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/sc-adm-017-clinic-edit-modal.png` |
| SC-ADM-019 | Passed | Codex | 2026-03-17T15:41:14Z | `/admin/services` rendered correctly with service cards, search, clinic/category filters, and management controls. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/sc-adm-019-services.png` |
| SC-ADM-020 | Passed | Codex | 2026-03-17T15:41:14Z | Service search updated correctly by keyword: entering `hô hấp` narrowed the results to the respiratory service set without a route crash. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/sc-adm-020-service-search.png` |
| SC-ADM-021 | Passed | Codex | 2026-03-17T15:41:14Z | Category filtering worked safely on `/admin/services`: changing the category filter refreshed the list to a clean empty state instead of crashing. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/sc-adm-021-service-filter.png` |
| SC-ADM-022 | Passed | Codex | 2026-03-17T15:53:07Z | Opening and saving a valid service edit succeeded with success feedback (`Đã cập nhật dịch vụ`) in real backend mode. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-022-service-edit-modal.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-turn26-network.log` |
| SC-ADM-024 | Passed | Codex | 2026-03-17T15:41:14Z | `/admin/rooms` rendered correctly with room cards, search box, clinic filter, and edit controls in real backend mode. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/sc-adm-024-rooms.png` |
| SC-ADM-025 | Passed | Codex | 2026-03-17T15:41:14Z | Room search updated correctly by clinic and room name: filtering to `HealthFlow Clinic 2` and `R02` narrowed the list to the matching room card without a crash. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/sc-adm-025-room-search.png` |
| SC-ADM-026 | Passed | Codex | 2026-03-17T15:53:07Z | A valid room edit save succeeded with the success toast `Đã cập nhật phòng`, and the changed room capacity was restored afterward to keep the seeded baseline usable. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-026-room-edit-modal.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/bug-adm-room-invalid-network.log` |
| SC-ADM-027 | Failed | Codex | 2026-03-17T15:53:07Z | Invalid room save was not blocked safely: setting capacity `0` still triggered a successful update (`PUT /api/rooms/2 => 200 OK`) and a success toast instead of validation or a controlled error. See `BUG-032`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/bug-adm-room-invalid-save-succeeded.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/bug-adm-room-invalid-network.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/bug-adm-room-invalid-console.log` |
| SC-ADM-028 | Passed | Codex | 2026-03-17T15:41:14Z | `/admin/reports` rendered successfully with report tabs, date/grouping controls, export actions, KPI cards, and controlled fallback messaging despite backend report outages. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/sc-adm-028-reports.png` |
| SC-ADM-029 | Passed | Codex | 2026-03-17T15:41:14Z | Switching between `Lịch hẹn`, `Doanh thu`, and `Bệnh nhân` report views updated the UI without a route crash or blank page. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/sc-adm-029-report-tabs.png` |
| SC-ADM-030 | Failed | Codex | 2026-03-17T15:41:14Z | Changing the report date range from `6 tháng qua` to `30 ngày qua` refreshed the UI, but the underlying report queries still failed: `GET /api/reports/appointments`, `GET /api/reports/revenue`, and `GET /api/reports/patients` all returned `503 Service Unavailable` instead of succeeding. See `BUG-031`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/bug-adm-reports-date-range-503.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/bug-adm-reports-network.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/bug-adm-reports-console.log` |
| SC-ADM-031 | Failed | Codex | 2026-03-17T15:53:07Z | Changing reports grouping from `Tháng` to `Tuần` did not update correctly: all weekly report queries returned `500 Internal Server Error`, and the page showed an unexpected-error banner instead of refreshed charts. See `BUG-034`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-031-grouping-blocked.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-reports-medium-network.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-reports-medium-console.log` |
| SC-ADM-032 | Passed | Codex | 2026-03-17T15:53:07Z | The reports page handled the no-data state gracefully: KPI cards, charts, and empty-state copy remained readable and stable instead of crashing. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-031-grouping-blocked.png` |
| SC-ADM-033 | Failed | Codex | 2026-03-17T15:53:07Z | The `Xuất PDF` action did not generate a download and did not fail gracefully: Playwright observed no download event while `GET /api/reports/export/pdf?dateRange=6months&groupBy=week` returned `503 Service Unavailable`. See `BUG-034`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-033-export-failed.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-reports-medium-network.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-reports-medium-console.log` |
| SC-ADM-034 | Passed | Codex | 2026-03-17T15:53:07Z | `/profile` rendered correctly for the admin role with avatar, seeded profile values, and editable fields. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-034-profile.png` |
| SC-ADM-035 | Passed | Codex | 2026-03-17T15:53:07Z | A valid admin profile save succeeded with success feedback, and the original phone number was restored after the save test. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-034-profile.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-profile-network.log` |
| SC-ADM-036 | Failed | Codex | 2026-03-17T15:53:07Z | Invalid admin profile input was not validated safely: submitting phone `12` triggered `PUT /api/profile => 500 Internal Server Error` and the generic message `An unexpected error occurred. Please contact support.` instead of validation feedback. See `BUG-033`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/bug-adm-profile-invalid-phone-500.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/bug-adm-profile-invalid-network.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/bug-adm-profile-invalid-console.log` |
| SC-X-001 | Passed | Codex | 2026-03-18T12:47:40Z | While logged in as `patient1@clinic.com`, submitting `/profile/security` with mismatched new passwords surfaced the inline message `Mật khẩu không khớp` and left the route stable. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-x-001-security-mismatch.png` |
| SC-X-002 | Failed | Codex | 2026-03-18T12:47:40Z | While logged in as `dr.sarah@clinic.com`, submitting doctor profile phone `abc` still triggered `PUT /api/profile => 500 Internal Server Error` and only the generic message `An unexpected error occurred. Please contact support.` instead of actionable validation or a controlled error. See `BUG-007`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-x-002-doctor-invalid-phone.png` |
| SC-X-003 | Passed | Codex | 2026-03-18T13:30:33Z | On `/admin/clinics`, opening `Thêm phòng khám` and submitting without a clinic name showed the required-field toast `Tên phòng khám là bắt buộc` without crashing the modal or page. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T131438Z/sc-x-003-admin-required-name.png` |
| SC-X-004 | Passed | Codex | 2026-03-18T13:30:33Z | On `/schedule` as doctor, clicking `Lưu lịch làm việc` twice in succession left the page stable, preserved the weekly editor, and returned to a usable save button state instead of a duplicate-submit crash or stuck pending UI. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T131438Z/sc-x-004-doctor-double-submit-stable.jpeg` |
| SC-X-005 | Passed | Codex | 2026-03-18T12:47:40Z | A known server-side failure was exercised on `/admin/reports`: the report datasets returned `503`, but the UI stayed stable and showed the clear banner `The service is temporarily unavailable. Please try again later.` with readable fallback cards instead of crashing. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-x-005-reports-service-unavailable.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-x-005-network.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-x-005-console.log` |
| SC-X-006 | Passed | Codex | 2026-03-18T13:30:33Z | Opening `/appointments/999999` as the seeded patient did not crash the app; the route fell back safely to `/appointments` and rendered the standard empty-state card (`Không có lịch hẹn`). Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T131438Z/sc-x-006-missing-appointment-id-fallback.jpeg` |
| SC-X-007 | Passed | Codex | 2026-03-18T13:30:33Z | Empty-state handling remained usable across modules in real mode: doctor `/doctor/appointments` showed `Không có lịch hẹn nào`, doctor `/patients` showed `Chưa có bệnh nhân nào`, and patient `/payments` showed `Không có giao dịch nào` without layout breakage. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T131438Z/sc-x-007-doctor-appointments-empty-state.jpeg`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T131438Z/sc-x-007-doctor-patients-empty-state.jpeg`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T131438Z/sc-x-018-patient-direct-route.jpeg` |
| SC-X-008 | Passed | Codex | 2026-03-18T13:30:33Z | Sampled all three UI state types in a real patient session: route transitions first rendered `Đang tải trang...`, `/profile/security` mismatch showed inline `Mật khẩu không khớp`, and `/profile/notifications` save surfaced `Cài đặt thông báo đã được lưu!`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T131438Z/sc-x-008-inline-error-mismatch.jpeg`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T131438Z/sc-x-008-ui-state-observations.txt` |
| SC-X-009 | Passed | Codex | 2026-03-18T12:47:40Z | While logged in as `patient1@clinic.com`, direct navigation to `/doctor/appointments` redirected back to `/dashboard`; doctor appointment content was not exposed. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-034-patient-doctor-route-denied.png` |
| SC-X-010 | Passed | Codex | 2026-03-18T12:47:40Z | While logged in as `patient1@clinic.com`, direct navigation to `/users` redirected back to `/dashboard`; admin content was not exposed. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-035-patient-admin-route-denied.png` |
| SC-X-011 | Passed | Codex | 2026-03-18T12:47:40Z | While logged in as `dr.sarah@clinic.com`, direct navigation to `/appointments/book` redirected back to `/dashboard`; patient booking content was not exposed. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-036-doctor-patient-route-denied.png` |
| SC-X-012 | Passed | Codex | 2026-03-18T12:47:40Z | While logged in as `dr.sarah@clinic.com`, direct navigation to `/users` redirected back to `/dashboard`; admin user-management content was not exposed. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-037-doctor-admin-route-denied.png` |
| SC-X-013 | Passed | Codex | 2026-03-17T16:09:18Z | While logged in as `admin@clinic.com`, navigating directly to the patient-only route `/appointments/book` redirected back to the admin dashboard at `/dashboard`; patient booking content was not exposed. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-x-013-admin-patient-route-denied.png` |
| SC-X-014 | Passed | Codex | 2026-03-17T16:09:18Z | While logged in as `admin@clinic.com`, navigating directly to the doctor-only route `/doctor/appointments` redirected back to the admin dashboard at `/dashboard`; doctor scheduling content was not exposed. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-x-014-admin-doctor-route-denied.png` |
| SC-X-015 | Passed | Codex | 2026-03-18T13:30:33Z | Sampled the primary authenticated sidebar destination set across roles in live sessions: doctor `/schedule`, `/patients`, `/consultations`; patient `/appointments`, `/payments`, `/profile/notifications`; admin `/dashboard`, `/admin/clinics`, `/admin/reports`. Each route rendered with the matching role sidebar present and no dead-end route. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T131438Z/sc-x-004-doctor-double-submit-stable.jpeg`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T131438Z/sc-x-018-patient-direct-route.jpeg`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T131438Z/sc-x-018-admin-direct-route.jpeg`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T131438Z/sc-x-003-admin-required-name.png` |
| SC-X-016 | Passed | Codex | 2026-03-18T12:47:40Z | Refreshing authenticated pages as patient (`/appointments`), doctor (`/schedule`), and admin (`/dashboard`) preserved each active session and re-rendered the expected role-specific route instead of forcing logout. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-032-patient-refresh.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-x-016-doctor-refresh.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-x-016-admin-refresh.png` |
| SC-X-017 | Passed | Codex | 2026-03-18T13:30:33Z | After logging out as patient, doctor, and admin, using the browser Back action kept each session on `/login`; protected content did not reopen from history. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T131438Z/sc-x-017-patient-back-after-logout.jpeg`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T131438Z/sc-x-017-doctor-back-after-logout.jpeg`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T131438Z/sc-x-017-admin-back-after-logout.jpeg` |
| SC-X-018 | Passed | Codex | 2026-03-18T13:30:33Z | Direct bookmarked role routes were honored correctly while authenticated: patient `/payments`, doctor `/consultations`, and admin `/admin/reports` each opened the expected role page instead of redirecting away. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T131438Z/sc-x-018-patient-direct-route.jpeg`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T131438Z/sc-x-018-doctor-direct-route.jpeg`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T131438Z/sc-x-018-admin-direct-route.jpeg` |
| SC-X-019 | Failed | Codex | 2026-03-18T13:47:54Z | Core-flow console monitoring stayed free of a full route crash, but active consultation detail `/patient/consultations/427` still logged the realtime startup exception `There is no underlying STOMP connection` during STOMP initialization. See `BUG-003`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-021-patient-consultation-stomp-warning.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-021-022-patient-console.log` |
| SC-X-020 | Failed | Codex | 2026-03-18T13:47:54Z | Unexpected backend failures still appear during a normal patient core flow. Loading `/dashboard` as `patient1@clinic.com` reproduced repeated `GET /api/statistics/aggregate/patient/223 => 500 Internal Server Error`. See `BUG-002`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-020-patient-dashboard-aggregate-500.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-019-020-025-network.log` |
| SC-X-021 | Failed | Codex | 2026-03-18T13:47:54Z | Opening active consultation `/patient/consultations/427` initialized realtime only after STOMP warnings and the frame-handler exception `There is no underlying STOMP connection`, so websocket setup is still not clean. See `BUG-003`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-021-patient-consultation-stomp-warning.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-021-022-patient-console.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-021-022-patient-network.log` |
| SC-X-022 | Passed | Codex | 2026-03-18T13:47:54Z | Using the seeded realtime pair `patient.52@healthflow.vn` and `doctor.27@healthflow.vn` on consultation `427`, sending `SC-X-022 realtime 20260318T133547Z` from the patient view posted successfully, appeared in the patient thread, appeared in the doctor thread, and surfaced in the patient consultation list preview. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-022-patient-message-visible.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-022-doctor-message-visible.jpeg` |
| SC-X-023 | Passed | Codex | 2026-03-18T13:47:54Z | While authenticated on `/patient/consultations/427`, the frontend was stopped and restarted on `127.0.0.1:3000`; reloading the same seeded route after recovery preserved the session and returned to a usable consultation view with the message input still available. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-023-recovered-after-frontend-restart.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-023-restart-console.log` |
| SC-X-024 | Passed | Codex | 2026-03-18T13:47:54Z | A temporary API failure was simulated by forcing `GET /api/messages/consultation/427` to return `503`. The patient consultation view did not white-screen or hang; it fell back to `/patient/consultations` and remained usable, providing controlled degraded behavior under partial backend failure. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-024-controlled-api-failure-fallback.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-024-network.log`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-024-console.log` |
| SC-X-025 | Failed | Codex | 2026-03-18T13:47:54Z | Duplicate React key warnings are still present on authenticated navigation surfaces. Patient dashboard and consultation routes continued to log `Warning: Encountered two children with the same key` during normal rendering. See `BUG-006`. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-019-020-025-console.log` |
| SC-X-026 | Passed | Codex | 2026-03-18T13:47:54Z | Created consultation request `SC-X-026 state sync 20260318T133547Z` for `Dr. Sarah Johnson` from `/patient/consultations/new`, then opened `/patient/consultations` and refreshed the page. The newly created item remained visible before and after reload, confirming mutation state persisted across list refresh. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-026-consultation-persists-after-reload.png` |
| SC-X-027 | Passed | Codex | 2026-03-18T13:55:34Z | On a `390x844` mobile viewport while logged out, the login page remained readable and fully usable: demo-role buttons, email/password fields, remember-me checkbox, and submit action all stayed visible without clipped controls. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T135111Z/sc-x-027-mobile-login.png` |
| SC-X-028 | Passed | Codex | 2026-03-18T13:55:34Z | On a `390x844` mobile viewport as `patient1@clinic.com`, the patient dashboard stacked cleanly into readable cards and preserved the primary action (`Đặt lịch khám`) plus the downstream section links. The separate known patient stats bug still reproduced in console/network, but the main mobile layout remained usable. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T135111Z/sc-x-028-mobile-patient-dashboard.png` |
| SC-X-029 | Passed | Codex | 2026-03-18T13:55:34Z | On a `390x844` mobile viewport as `dr.sarah@clinic.com`, `/schedule` remained usable: daily toggles, time controls, the weekly card layout, and the `Lưu lịch làm việc` action all remained visible without collapsing the page into an unreadable state. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T135111Z/sc-x-029-mobile-doctor-schedule.png` |
| SC-X-030 | Passed | Codex | 2026-03-18T13:55:34Z | On a `390x844` mobile viewport as `admin@clinic.com`, `/admin/clinics` kept the admin controls usable: the page header, `Thêm phòng khám` action, search field, and stacked clinic cards all remained readable and operable on mobile. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T135111Z/sc-x-030-mobile-admin-clinics.png` |
| SC-X-031 | Passed | Codex | 2026-03-18T13:55:34Z | Loading states and route transitions did not block the UI permanently in the final responsive slice. The login page settled cleanly, patient quick-login reached a usable dashboard, and admin `/admin/clinics` kept `Thêm phòng khám` visible and enabled before and after a dashboard -> clinics round trip. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T135111Z/sc-x-031-032-observations.txt`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T135111Z/sc-x-030-mobile-admin-clinics.png` |
| SC-X-032 | Passed | Codex | 2026-03-18T13:55:34Z | Long stacked cards remained scannable on the mobile admin clinics page: each clinic card preserved readable title, status, contact details, metric row, and edit button with consistent spacing and no text overlap in the full-page capture. Evidence: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T135111Z/sc-x-030-mobile-admin-clinics.png`, `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T135111Z/sc-x-031-032-observations.txt` |


---

## bug-log.md

# Bug Log

Create one section per bug. Keep newest bugs at the top.

Last reviewed at 2026-03-18T13:55:34Z: closed `SC-X-027`, `SC-X-028`, `SC-X-029`, `SC-X-030`, `SC-X-031`, and `SC-X-032` without creating a new bug entry. There are now no `Not started` rows remaining in the catalog.

### BUG-034 - Admin reports weekly grouping and PDF export are broken
- Status: Open
- Severity: High
- Area: Admin / Reports
- Test Case IDs: SC-ADM-031, SC-ADM-033
- Found At (UTC): 2026-03-17T15:53:07Z
- Environment: local frontend + local backend
- Preconditions: logged in as `admin@clinic.com`; opened `http://127.0.0.1:3000/admin/reports`
- Steps To Reproduce:
  1. Sign in as `admin@clinic.com / password`.
  2. Open `http://127.0.0.1:3000/admin/reports`.
  3. Change the grouping control from `Tháng` to `Tuần`.
  4. Click `Xuất PDF`.
- Expected:
  - Weekly charts should refresh correctly, and the PDF export should generate a download or fail with clear controlled feedback.
- Actual:
  - Switching to weekly grouping triggers `500 Internal Server Error` responses on all three report datasets and surfaces an unexpected-error banner.
  - Clicking `Xuất PDF` does not trigger any download event; the export endpoint returns `503 Service Unavailable`.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-031-grouping-blocked.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-033-export-failed.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-reports-medium-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-reports-medium-console.log`
- Network / Console Notes:
  - Saved network traffic shows `GET /api/reports/appointments?dateRange=6months&groupBy=week => 500`, `GET /api/reports/revenue?dateRange=6months&groupBy=week => 500`, and `GET /api/reports/patients?dateRange=6months&groupBy=week => 500`.
  - The export action then calls `GET /api/reports/export/pdf?dateRange=6months&groupBy=week => 503`.
  - Playwright did not observe any download event after clicking `Xuất PDF`.
- Related Coverage Rows:
  - SC-ADM-031 -> Failed
  - SC-ADM-033 -> Failed

### BUG-033 - Invalid admin profile phone input returns `500` instead of validation feedback
- Status: Open
- Severity: Medium
- Area: Admin / Profile
- Test Case IDs: SC-ADM-036
- Found At (UTC): 2026-03-17T15:53:07Z
- Environment: local frontend + local backend
- Preconditions: logged in as `admin@clinic.com`; opened `http://127.0.0.1:3000/profile`
- Steps To Reproduce:
  1. Sign in as `admin@clinic.com / password`.
  2. Open `http://127.0.0.1:3000/profile`.
  3. Replace the phone number with an invalid value such as `12`.
  4. Click `Lưu thay đổi`.
- Expected:
  - The form should block the submit with validation feedback or return a controlled field-level/profile-level error without a backend `500`.
- Actual:
  - `PUT /api/profile` returns `500 Internal Server Error`, and the UI shows the generic message `An unexpected error occurred. Please contact support.`
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/bug-adm-profile-invalid-phone-500.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/bug-adm-profile-invalid-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/bug-adm-profile-invalid-console.log`
- Network / Console Notes:
  - Saved network traffic shows `PUT /api/profile => 500 Internal Server Error` after the invalid phone submission.
  - Saved console output captures the matching failed resource error for `http://localhost:8080/api/profile`.
- Related Coverage Rows:
  - SC-ADM-036 -> Failed

### BUG-032 - Admin room edit accepts invalid capacity and saves successfully
- Status: Open
- Severity: High
- Area: Admin / Rooms
- Test Case IDs: SC-ADM-027
- Found At (UTC): 2026-03-17T15:53:07Z
- Environment: local frontend + local backend
- Preconditions: logged in as `admin@clinic.com`; opened `http://127.0.0.1:3000/admin/rooms`; opened a room edit modal
- Steps To Reproduce:
  1. Sign in as `admin@clinic.com / password`.
  2. Open `http://127.0.0.1:3000/admin/rooms`.
  3. Open any room edit modal.
  4. Set `Sức chứa (người)` to `0`.
  5. Click `Cập nhật`.
- Expected:
  - The form should reject the invalid capacity with validation feedback or a controlled error, and it should not persist the change.
- Actual:
  - The submit succeeds with `PUT /api/rooms/2 => 200 OK` and the success toast `Đã cập nhật phòng`, indicating the invalid value was accepted instead of blocked.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-026-room-edit-modal.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/bug-adm-room-invalid-save-succeeded.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/bug-adm-room-invalid-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/bug-adm-room-invalid-console.log`
- Network / Console Notes:
  - Saved network traffic shows successful writes during the room edit pass, including the invalid submit `PUT /api/rooms/2 => 200 OK`.
  - No protective client-side validation or controlled error was emitted to the console.
- Related Coverage Rows:
  - SC-ADM-027 -> Failed

### BUG-031 - Admin reports date-range changes trigger `503` failures for all report datasets
- Status: Open
- Severity: High
- Area: Admin / Reports
- Test Case IDs: SC-ADM-030
- Found At (UTC): 2026-03-17T15:41:14Z
- Environment: local frontend + local backend
- Preconditions: logged in as `admin@clinic.com`; opened `http://127.0.0.1:3000/admin/reports`
- Steps To Reproduce:
  1. Sign in as `admin@clinic.com / password`.
  2. Open `http://127.0.0.1:3000/admin/reports`.
  3. Leave the default `6 tháng qua` range loaded, then change the date range to `30 ngày qua`.
- Expected:
  - The report queries should succeed for the selected range and the charts/cards should refresh with backend-backed data or a controlled no-data response.
- Actual:
  - The UI refreshes, but every report dataset request fails with `503 Service Unavailable`, and the page falls back to the banner `The service is temporarily unavailable. Please try again later.` plus empty report cards.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/sc-adm-028-reports.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/sc-adm-029-report-tabs.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/bug-adm-reports-date-range-503.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/bug-adm-reports-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/bug-adm-reports-console.log`
- Network / Console Notes:
  - Saved network traffic shows `GET /api/reports/appointments?dateRange=6months&groupBy=month => 503`, `GET /api/reports/revenue?dateRange=6months&groupBy=month => 503`, and `GET /api/reports/patients?dateRange=6months&groupBy=month => 503`.
  - After switching to `30 ngày qua`, the same three endpoints still fail: `GET /api/reports/appointments?dateRange=30days&groupBy=month => 503`, `GET /api/reports/revenue?dateRange=30days&groupBy=month => 503`, and `GET /api/reports/patients?dateRange=30days&groupBy=month => 503`.
  - Saved console output captures matching failed resource errors for all three report endpoints.
- Related Coverage Rows:
  - SC-ADM-030 -> Failed

### BUG-030 - Admin doctor search crashes the management page with `undefined.toLowerCase()`
- Status: Open
- Severity: High
- Area: Admin / Doctor Management
- Test Case IDs: SC-ADM-011
- Found At (UTC): 2026-03-17T15:31:42Z
- Environment: local frontend + local backend
- Preconditions: logged in as `admin@clinic.com`; opened `http://127.0.0.1:3000/doctors`
- Steps To Reproduce:
  1. Sign in as `admin@clinic.com / password`.
  2. Open `http://127.0.0.1:3000/doctors`.
  3. Type `Sarah` into the doctor search box.
- Expected:
  - The doctor list should filter by name without crashing the page.
- Actual:
  - The page crashes to a blank white screen and the console records `TypeError: Cannot read properties of undefined (reading 'toLowerCase')` from `DoctorManagement.jsx`.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/sc-adm-010-doctors.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/bug-adm-doctor-search-crash.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/bug-adm-doctor-search-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/sc-adm-doctors-network.log`
- Network / Console Notes:
  - Saved network traffic only shows successful doctor list loads (`GET /api/users/role/DOCTOR?page=0&size=20 => 200 OK`), indicating this regression is client-side rather than a backend query failure.
  - Saved console output points to `src/pages/admin/DoctorManagement.jsx:67` inside `filterDoctors`.
- Related Coverage Rows:
  - SC-ADM-011 -> Failed

### BUG-029 - Admin valid user edit returns `503` and an error toast instead of saving cleanly
- Status: Open
- Severity: High
- Area: Admin / Users
- Test Case IDs: SC-ADM-006
- Found At (UTC): 2026-03-17T15:31:42Z
- Environment: local frontend + local backend
- Preconditions: logged in as `admin@clinic.com`; opened `http://127.0.0.1:3000/users`; filtered the list with `admin@clinic.com`; opened the edit modal for the admin record
- Steps To Reproduce:
  1. Sign in as `admin@clinic.com / password`.
  2. Open `http://127.0.0.1:3000/users`.
  3. Search for `admin@clinic.com`.
  4. Click `Sửa`, change the full name to a valid value such as `Admin System QA`, and click `Lưu`.
- Expected:
  - The valid edit should save successfully, close the modal, and show success feedback.
- Actual:
  - `PUT /api/users/225` returns `503 Service Unavailable`, and the UI shows the toast `Không thể lưu người dùng` instead of a successful save path.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/sc-adm-005-user-edit-modal.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/bug-adm-user-save-503.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/bug-adm-user-save-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/bug-adm-user-save-console.log`
- Network / Console Notes:
  - Saved network log shows the failing write call `PUT /api/users/225 => 503 Service Unavailable`.
  - Saved console log captures the matching failed resource error for `http://localhost:8080/api/users/225`.
- Related Coverage Rows:
  - SC-ADM-006 -> Failed

### BUG-028 - Doctor invalid consultation routes fall back to the queue after duplicate 403/404 errors and WebSocket subscriptions instead of a clear denied/not-found state
- Status: Open
- Severity: Medium
- Area: Doctor / Consultations
- Test Case IDs: SC-DOC-029, SC-DOC-030
- Found At (UTC): 2026-03-17T15:19:42Z
- Environment: local frontend + local backend
- Preconditions: logged in as `dr.sarah@clinic.com`
- Steps To Reproduce:
  1. Sign in as `dr.sarah@clinic.com / password`.
  2. Open `http://127.0.0.1:3000/doctor/consultations/800` or `http://127.0.0.1:3000/doctor/consultations/999999`.
  3. Wait for the route to settle.
- Expected:
  - The app should show a clear access-denied or not-found state without duplicate retries or invalid realtime subscriptions.
- Actual:
  - The route falls back to `/consultations` only after duplicate `403`/`404` traffic, repeated `Failed to load consultation` errors, and WebSocket/STOMP subscription activity for the invalid consultation ID.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/bug-doc-consultation-invalid-route.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/bug-doc-consultation-unauthorized-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/bug-doc-consultation-unauthorized-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/bug-doc-consultation-invalid-route-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/bug-doc-consultation-invalid-route-console.log`
- Network / Console Notes:
  - Unauthorized access to consultation `800` produced duplicate `GET /api/consultations/800 => 403 Forbidden` and `GET /api/messages/consultation/800 => 403 Forbidden` requests before the route fell back.
  - Nonexistent consultation `999999` produced duplicate `GET /api/consultations/999999 => 404 Not Found` and `GET /api/messages/consultation/999999 => 404 Not Found` requests before the route fell back.
  - Saved console logs show repeated `Failed to load consultation` messages while STOMP/WebSocket activity still attempted to subscribe to the invalid consultation IDs.
- Related Coverage Rows:
  - SC-DOC-029 -> Failed
  - SC-DOC-030 -> Failed

### BUG-027 - Floating chatbot widget blocks mouse clicks on the doctor consultation send button
- Status: Open
- Severity: Medium
- Area: Doctor / Consultations / Messaging
- Test Case IDs: SC-DOC-027
- Found At (UTC): 2026-03-17T15:08:57Z
- Environment: local frontend + local backend
- Preconditions: logged in as `dr.sarah@clinic.com`; opened active consultation `http://127.0.0.1:3000/doctor/consultations/801`
- Steps To Reproduce:
  1. Sign in as `dr.sarah@clinic.com / password`.
  2. Open `http://127.0.0.1:3000/doctor/consultations/801`.
  3. Type a message into the doctor chat input.
  4. Try to click the send button with the mouse.
- Expected:
  - The doctor should be able to click the send button and post the message normally.
- Actual:
  - The floating chatbot widget overlaps the send button and intercepts pointer events, so mouse-click submission times out. Pressing Enter still posts the message successfully.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-026-consultation-detail.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-turn22-network.log`
- Network / Console Notes:
  - The saved network log shows the keyboard fallback path succeeding with `POST /api/messages => 201 Created`.
  - The Playwright click attempt failed because the floating chatbot `Open chatbot` button intercepted pointer events over the send button.
- Related Coverage Rows:
  - SC-DOC-027 -> Failed

### BUG-026 - Doctor medical-record entry route redirects back to appointments without opening the form or explaining the missing context
- Status: Open
- Severity: Medium
- Area: Doctor / Create Medical Record
- Test Case IDs: SC-DOC-015, SC-DOC-017
- Found At (UTC): 2026-03-17T15:08:57Z
- Environment: local frontend + local backend
- Preconditions: logged in as `dr.sarah@clinic.com`; doctor appointments list is empty
- Steps To Reproduce:
  1. Sign in as `dr.sarah@clinic.com / password`.
  2. Navigate directly to `http://127.0.0.1:3000/doctor/create-medical-record`.
  3. Wait for the route to settle.
- Expected:
  - The app should either open the record-creation form or present a clear explanation that a valid appointment context is required before creating a medical record.
- Actual:
  - The route bounces back to `/doctor/appointments` and only shows the generic empty appointments state, leaving no stable route-level explanation or actionable next step for the missing context.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-015-create-record-redirected.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-turn22-network-final.log`
- Network / Console Notes:
  - The saved network log for the redirected state only shows doctor appointment search traffic (`GET /api/appointments/search?...doctorId=224 => 200 OK`); no medical-record form retrieval or context-specific explanation is surfaced.
- Related Coverage Rows:
  - SC-DOC-015 -> Failed
  - SC-DOC-017 -> Failed

### BUG-025 - Floating chatbot widget blocks mouse clicks on the patient consultation send button
- Status: Open
- Severity: Medium
- Area: Patient / Consultations / Messaging
- Test Case IDs: SC-PAT-069
- Found At (UTC): 2026-03-17T14:42:14Z
- Environment: local frontend + local backend
- Preconditions: consultation `801` was accepted from the doctor side; logged in again as `patient1@clinic.com`; opened `http://127.0.0.1:3000/patient/consultations/801`
- Steps To Reproduce:
  1. Sign in as `dr.sarah@clinic.com / password` and accept consultation `801`.
  2. Sign back in as `patient1@clinic.com / password`.
  3. Open `http://127.0.0.1:3000/patient/consultations/801`.
  4. Type a message into the patient chat input.
  5. Try to click the send button with the mouse.
- Expected:
  - The send button should remain clickable and submit the message normally.
- Actual:
  - The floating chatbot widget overlaps the send button and intercepts pointer events, so mouse-click submission fails. The message can only be sent with the Enter key workaround.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T143716Z/bug-pat-chatbot-overlaps-send-button.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T143716Z/sc-pat-069-doctor-accepted-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T143716Z/sc-pat-069-messaging-network.log`
- Network / Console Notes:
  - The doctor-side unblock worked with `PUT /api/consultations/801/accept => 200 OK`.
  - The patient-side fallback sent the message with `POST /api/messages => 201 Created`, confirming the workflow only succeeds via keyboard while the button remains obstructed.
- Related Coverage Rows:
  - SC-PAT-069 -> Failed

### BUG-024 - Nonexistent consultation routes trigger duplicate 404 traffic and WebSocket subscriptions instead of a graceful not-found state
- Status: Open
- Severity: Medium
- Area: Patient / Consultations
- Test Case IDs: SC-PAT-073
- Found At (UTC): 2026-03-17T14:23:24Z
- Environment: local frontend + local backend
- Preconditions: logged in as `patient1@clinic.com`; opened `http://127.0.0.1:3000/patient/consultations/999999`
- Steps To Reproduce:
  1. Sign in as `patient1@clinic.com / password`.
  2. Navigate directly to `http://127.0.0.1:3000/patient/consultations/999999`.
  3. Wait for the route to settle.
- Expected:
  - The app should show a clear not-found state or route-level fallback without repeated background errors.
- Actual:
  - The app falls back to the generic toast `Không thể tải dữ liệu tư vấn`, but only after issuing duplicate `404 Not Found` requests for both the consultation and its messages and opening WebSocket handshake/subscription attempts for the nonexistent consultation ID.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/bug-pat-consultation-invalid-route.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/bug-pat-consultation-invalid-route-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/bug-pat-consultation-invalid-route-console.log`
- Network / Console Notes:
  - Saved network log shows duplicate `GET /api/consultations/999999 => 404 Not Found` and `GET /api/messages/consultation/999999 => 404 Not Found` requests plus `GET /ws/info => 200 OK`.
  - Saved console log records repeated `Failed to load consultation` errors and `Subscribed to consultation 999999` despite the missing entity.
- Related Coverage Rows:
  - SC-PAT-073 -> Failed

### BUG-023 - Invalid patient profile phone submission returns 500 instead of validation or a controlled rejection
- Status: Open
- Severity: Medium
- Area: Patient / Profile
- Test Case IDs: SC-PAT-077
- Found At (UTC): 2026-03-17T14:23:24Z
- Environment: local frontend + local backend
- Preconditions: logged in as `patient1@clinic.com`; opened `http://127.0.0.1:3000/profile`
- Steps To Reproduce:
  1. Sign in as `patient1@clinic.com / password`.
  2. Navigate to `http://127.0.0.1:3000/profile`.
  3. Replace the phone number with invalid text such as `abc`.
  4. Click `Lưu thay đổi`.
- Expected:
  - The form should block submission with inline validation or return a controlled validation-style response that explains how to fix the field.
- Actual:
  - `PUT /api/profile` returns `500 Internal Server Error`, and the UI only surfaces the generic message `An unexpected error occurred. Please contact support.`
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/bug-pat-profile-invalid-phone.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/bug-pat-profile-invalid-phone-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/bug-pat-profile-invalid-phone-console.log`
- Network / Console Notes:
  - Saved network log shows the good-control path `PUT /api/profile => 200 OK` for a valid save, followed by the invalid-phone attempt `PUT /api/profile => 500 Internal Server Error`.
  - Saved console log captures the matching failed resource entry for `http://localhost:8080/api/profile`.
- Related Coverage Rows:
  - SC-PAT-077 -> Failed

### BUG-022 - Patient appointment reschedule fails with 500 after selecting a valid new slot
- Status: Open
- Severity: High
- Area: Patient / Appointments
- Test Case IDs: SC-PAT-030
- Found At (UTC): 2026-03-17T14:11:23Z
- Environment: local frontend + local backend
- Preconditions: logged in as `patient1@clinic.com`; opened `http://127.0.0.1:3000/appointments/1801`; appointment status was `Chờ xác nhận`
- Steps To Reproduce:
  1. Sign in as `patient1@clinic.com / password`.
  2. Open `http://127.0.0.1:3000/appointments/1801`.
  3. Click `Đổi lịch`.
  4. Choose a valid-looking replacement slot such as `Th 5 19/3` at `10:00`.
  5. Enter an optional reason and click `Xác nhận đổi lịch`.
- Expected:
  - The appointment should reschedule successfully or return a handled validation-style error if the chosen slot is not allowed.
- Actual:
  - The frontend posts to `POST /api/appointments/1801/reschedule`, receives `500 Internal Server Error`, and shows the toast `Request failed with status code 500`.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/bug-pat-reschedule-500.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/bug-pat-reschedule-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/bug-pat-reschedule-console.log`
- Network / Console Notes:
  - Saved network log shows `POST /api/appointments/1801/reschedule => 500 Internal Server Error`.
  - Saved console log captures the matching failed resource entry for `http://localhost:8080/api/appointments/1801/reschedule`.
- Related Coverage Rows:
  - SC-PAT-030 -> Failed

### BUG-021 - Booking confirmation creates the appointment but payment handoff fails with 503
- Status: Open
- Severity: High
- Area: Patient / Booking / Payments
- Test Case IDs: SC-PAT-020
- Found At (UTC): 2026-03-17T13:59:39Z
- Environment: local frontend + local backend
- Preconditions: logged in as `patient1@clinic.com`; opened `http://127.0.0.1:3000/appointments/book`; selected `BS. Tran Thu Binh`, a valid date/time, clinic, service, room, and booking reason
- Steps To Reproduce:
  1. Sign in as `patient1@clinic.com / password`.
  2. Navigate to `http://127.0.0.1:3000/appointments/book`.
  3. Complete a valid booking flow and reach the final confirmation step.
  4. Click `Xác nhận & Thanh toán`.
- Expected:
  - The app should hand off into the payment flow or redirect to the external gateway after creating the appointment.
- Actual:
  - The appointment is created successfully, but `POST /api/payments` returns `503 Service Unavailable` and the UI remains on the confirmation step without a payment redirect.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/bug-pat-payment-handoff-503.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/bug-pat-payment-handoff-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/bug-pat-payment-handoff-console.log`
- Network / Console Notes:
  - Saved network log shows `POST /api/appointments => 201 Created` immediately followed by `POST /api/payments => 503 Service Unavailable`.
  - Saved console log captures the matching `Failed to load resource` error for `http://localhost:8080/api/payments`.
- Related Coverage Rows:
  - SC-PAT-020 -> Failed

### BUG-020 - Patient doctor-search submit leaves results unfiltered for both name and specialty queries
- Status: Open
- Severity: High
- Area: Patient / Doctor Search
- Test Case IDs: SC-PAT-009, SC-PAT-010
- Found At (UTC): 2026-03-17T13:59:39Z
- Environment: local frontend + local backend
- Preconditions: logged in as `patient1@clinic.com`; opened `http://127.0.0.1:3000/find-doctors`
- Steps To Reproduce:
  1. Sign in as `patient1@clinic.com / password`.
  2. Navigate to `http://127.0.0.1:3000/find-doctors`.
  3. Enter `Sarah` in the search box and click `Tìm kiếm`.
  4. Repeat with specialty text such as `Tim mạch`.
- Expected:
  - The page should narrow to matching doctor cards and update the result count.
- Actual:
  - The page remains at `Tìm thấy 31 bác sĩ`; unrelated cards stay visible for both the name and specialty queries.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-009-search-sarah-not-filtered.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-010-search-specialty-not-filtered.png`
- Network / Console Notes:
  - The regression reproduced without a route crash; the visible UI state simply failed to narrow the result set after submit.
- Related Coverage Rows:
  - SC-PAT-009 -> Failed
  - SC-PAT-010 -> Failed

### BUG-019 - Patient sidebar no longer exposes a doctor-search entry
- Status: Open
- Severity: Medium
- Area: Patient / Navigation
- Test Case IDs: SC-PAT-005
- Found At (UTC): 2026-03-17T13:59:39Z
- Environment: local frontend + local backend
- Preconditions: logged in as `patient1@clinic.com`
- Steps To Reproduce:
  1. Sign in as `patient1@clinic.com / password`.
  2. Open any authenticated patient route that renders the sidebar, for example `http://127.0.0.1:3000/dashboard` or `http://127.0.0.1:3000/find-doctors`.
  3. Inspect the patient sidebar links.
- Expected:
  - The patient navigation should expose a doctor-search entry for `/find-doctors`.
- Actual:
  - The sidebar includes `Đặt lịch khám`, `Lịch hẹn`, `Hồ sơ bệnh án`, `Lịch sử thanh toán`, `Chỉ số sức khỏe`, `Thông báo`, `Tin nhắn`, `Gia đình`, and `Tài khoản`, but no `/find-doctors` link is rendered.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-005-sidebar-missing-find-doctors.md`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-009-search-sarah-not-filtered.png`
- Network / Console Notes:
  - The saved accessibility snapshot for `/find-doctors` shows the patient sidebar items and confirms there is no `/find-doctors` entry even while the route itself is reachable directly.
- Related Coverage Rows:
  - SC-PAT-005 -> Failed

### BUG-018 - Admin user edit accepts invalid phone submission until backend returns 500
- Status: Open
- Severity: Medium
- Area: Admin / User Management
- Test Case IDs: SC-ADM-009
- Found At (UTC): 2026-03-16T16:01:30Z
- Environment: local frontend + local backend
- Preconditions: logged in as `admin@clinic.com`; opened `http://127.0.0.1:3000/users`; opened edit modal for `Dr. Sarah Johnson`
- Steps To Reproduce:
  1. Sign in as `admin@clinic.com / password`.
  2. Navigate to `http://127.0.0.1:3000/users`.
  3. Click `Sửa` on `Dr. Sarah Johnson`.
  4. Clear the phone field and click `Lưu`.
- Expected:
  - The modal should block the invalid submission with validation or return a handled 4xx-style validation response.
- Actual:
  - The frontend sends `PUT /api/users/224`, the backend returns `500 Internal Server Error`, and the UI only shows the generic toast `Không thể lưu người dùng`.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/bug-018-admin-user-edit-invalid-phone-500.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/bug-018-admin-user-edit-invalid-phone-500-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/playwright-console.log`
- Network / Console Notes:
  - Saved network log shows the invalid edit path as `PUT /api/users/224 => 500 Internal Server Error`.
  - The same session could recover on retry with the original phone value, so the defect is specifically invalid-input handling on the admin edit endpoint.
- Related Coverage Rows:
  - SC-ADM-009 -> Passed

### BUG-017 - Doctor profile save CTA is inert on invalid phone edits
- Status: Open
- Severity: Medium
- Area: Doctor / Profile
- Test Case IDs: SC-DOC-021
- Found At (UTC): 2026-03-16T15:46:08Z
- Environment: local frontend + local backend
- Preconditions: logged in as fallback doctor `doctor.1@healthflow.vn`; opened `http://127.0.0.1:3000/profile`
- Steps To Reproduce:
  1. Sign in as `doctor.1@healthflow.vn / password`.
  2. Navigate to `http://127.0.0.1:3000/profile`.
  3. Replace the phone field value with `abc`.
  4. Click `Lưu thay đổi`.
- Expected:
  - The form should block submission with field validation or send an update request that returns a handled validation error.
- Actual:
  - The page stays unchanged with no visible validation, no success/error feedback, and no `PUT /api/profile` request; only the initial profile/notification GETs appear in the saved network log.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-021-profile-invalid-phone.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-021-profile-invalid-phone-snapshot.md`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-021-profile-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-021-profile-console.log`
- Network / Console Notes:
  - Saved network log shows `GET /api/profile => 200` plus notification GETs only; no profile update request was fired after clicking save.
- Related Coverage Rows:
  - SC-DOC-021 -> Failed

### BUG-016 - Doctor patient-list detail action is inert
- Status: Open
- Severity: Medium
- Area: Doctor / Patients
- Test Case IDs: SC-DOC-013
- Found At (UTC): 2026-03-16T15:43:58Z
- Environment: local frontend + local backend
- Preconditions: logged in as fallback doctor `doctor.1@healthflow.vn`; opened `http://127.0.0.1:3000/patients`
- Steps To Reproduce:
  1. Sign in as `doctor.1@healthflow.vn / password`.
  2. Navigate to `http://127.0.0.1:3000/patients`.
  3. Click any visible `Xem hồ sơ` action, for example on patient `Le Nam Phuc`.
- Expected:
  - The patient detail affordance should open a modal or detail view and load the current doctor's visit history consistently.
- Actual:
  - Clicking `Xem hồ sơ` does nothing: the route remains `/patients`, no modal opens, and no follow-up detail/history request is fired.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-013-patient-detail-inert.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-013-post-click-snapshot.md`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-013-patient-detail-network.log`
- Network / Console Notes:
  - The saved post-click network log contains no patient-detail or appointment-history fetch after the click.
- Related Coverage Rows:
  - SC-DOC-013 -> Failed

### BUG-015 - Doctor schedule save action is inert and skips validation
- Status: Open
- Severity: Medium
- Area: Doctor / Schedule
- Test Case IDs: SC-DOC-009, SC-DOC-010
- Found At (UTC): 2026-03-16T15:41:13Z
- Environment: local frontend + local backend
- Preconditions: logged in as fallback doctor `doctor.1@healthflow.vn`; opened `http://127.0.0.1:3000/schedule`
- Steps To Reproduce:
  1. Sign in as `doctor.1@healthflow.vn / password`.
  2. Navigate to `http://127.0.0.1:3000/schedule`.
  3. Edit a working-day row to an invalid combination, for example start `18:30` and end `17:00`.
  4. Click `Lưu lịch làm việc`.
- Expected:
  - The UI should show validation or submit a save request that returns a handled error; a valid save should then be reload-persistent.
- Actual:
  - No validation appears, no toast appears, and no save request is fired at all; the edited values remain in the form, which also blocks any meaningful persistence check.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-009-invalid-schedule-values-retained.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-schedule-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-schedule-console.log`
- Network / Console Notes:
  - Saved network log shows only initial GETs such as `GET /api/schedules/doctor/181 => 200`; no POST/PUT schedule save request was emitted after the click.
- Related Coverage Rows:
  - SC-DOC-009 -> Failed
  - SC-DOC-010 -> Blocked

### BUG-014 - Doctor appointments page shows no seeded appointments or status actions
- Status: Open
- Severity: High
- Area: Doctor / Appointments
- Test Case IDs: SC-DOC-004, SC-DOC-006
- Found At (UTC): 2026-03-16T15:39:20Z
- Environment: local frontend + local backend
- Preconditions: logged in as fallback doctor `doctor.1@healthflow.vn`; opened `http://127.0.0.1:3000/doctor/appointments`
- Steps To Reproduce:
  1. Sign in as `doctor.1@healthflow.vn / password`.
  2. Navigate to `http://127.0.0.1:3000/doctor/appointments`.
  3. Check the `Hôm nay` and `Sắp tới` tabs.
  4. Compare against `http://127.0.0.1:3000/patients` in the same session.
- Expected:
  - When seeded appointment-linked patients exist for the doctor, `/doctor/appointments` should render consistent appointment cards and expose status controls where applicable.
- Actual:
  - `/doctor/appointments` stays on `Không có lịch hẹn nào`, while `/patients` in the same session shows many patients with `Tổng lịch hẹn: 1` and one with `Tổng lịch hẹn: 2`, leaving no doctor status controls reachable from the appointments route.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-004-appointments-empty.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-004-patients-with-history.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-004-appointments-network.log`
- Network / Console Notes:
  - The doctor appointments screen rendered without any appointment cards or actionable rows during the session; the patient list proves linked history exists elsewhere in the doctor experience.
- Related Coverage Rows:
  - SC-DOC-004 -> Failed
  - SC-DOC-006 -> Blocked

### BUG-013 - Patient payment history is unavailable because `/api/payments/my-payments` returns 503
- Status: Open
- Severity: Medium
- Area: Patient / Payments
- Test Case IDs: SC-PAT-035, SC-PAT-037, SC-PAT-038, SC-PAT-041, SC-PAT-042
- Found At (UTC): 2026-03-16T15:25:42Z
- Environment: local frontend + local backend
- Preconditions: signed in as `patient1@clinic.com` or fallback patient `patient.1@healthflow.vn`; opened `http://127.0.0.1:3000/payments`
- Steps To Reproduce:
  1. Open `http://127.0.0.1:3000/login` and sign in as either seeded patient account.
  2. Navigate to `http://127.0.0.1:3000/payments`.
  3. Wait for the history list to load.
- Expected:
  - Payment history should load real rows or an accurate empty state based on backend data so search, filtering, and linked appointment follow-ups can be exercised.
- Actual:
  - `GET /api/payments/my-payments?page=0&size=20` returns `503 Service Unavailable`, the page shows the generic support toast, and the history area falls back to `Không có giao dịch nào`, blocking the downstream search/filter/cross-link scenarios.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-payment-history-service-unavailable.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/playwright-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/playwright-console.log`
- Network / Console Notes:
  - Saved network log shows repeated `[GET] http://localhost:8080/api/payments/my-payments?page=0&size=20 => [503] Service Unavailable`.
  - Saved console log records the matching failed resource loads at lines 41 and 58.
- Related Coverage Rows:
  - SC-PAT-035 -> Failed
  - SC-PAT-037 -> Blocked
  - SC-PAT-038 -> Blocked
  - SC-PAT-041 -> Blocked
  - SC-PAT-042 -> Failed

### BUG-012 - Appointment detail quick actions are inert on a pending patient appointment
- Status: Open
- Severity: Medium
- Area: Patient / Appointment Detail
- Test Case IDs: SC-PAT-033
- Found At (UTC): 2026-03-16T15:31:07Z
- Environment: local frontend + local backend
- Preconditions: logged in as fallback patient `patient.1@healthflow.vn`; opened `http://127.0.0.1:3000/appointments/1100`
- Steps To Reproduce:
  1. Sign in as `patient.1@healthflow.vn / password`.
  2. Open pending appointment detail `http://127.0.0.1:3000/appointments/1100`.
  3. Click the visible quick actions such as `Đổi lịch`, `Hủy lịch`, or `Xem hóa đơn`.
- Expected:
  - The clicked action should open its modal or navigate to the target route.
- Actual:
  - The buttons remain inert: no modal opens, the route stays on `/appointments/1100`, and no follow-up network request is fired beyond the initial detail fetch.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-033-appointment-detail-quick-actions-inert.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-033-post-click-snapshot.md`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-033-network.log`
- Network / Console Notes:
  - The saved post-click network log contains only the initial `GET /api/appointments/1100` and notification calls; no cancel/reschedule/payment-follow-up request was triggered by the user clicks.
- Related Coverage Rows:
  - SC-PAT-033 -> Failed

### BUG-011 - Booking wizard loses selected slot when navigating back from details step
- Status: Open
- Severity: Medium
- Area: Patient / Booking
- Test Case IDs: SC-PAT-023
- Found At (UTC): 2026-03-16T15:16:29Z
- Environment: local frontend + local backend
- Preconditions: logged in as `patient1@clinic.com`; opened `http://127.0.0.1:3000/appointments/book`
- Steps To Reproduce:
  1. Select `BS. Tran Thu Binh`.
  2. Select `Tue 17` and time slot `08:30`.
  3. On step 3, fill required clinic/service/room selections and type any reason, for example `QA preserve booking state`.
  4. Click `Quay lại`.
- Expected:
  - Returning to the previous step preserves the chosen date and time so the patient can continue editing without reselecting the slot.
- Actual:
  - The wizard returns to step 2 with no selected slot highlighted, so the patient must reselect date/time before moving forward again.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T151047Z/sc-pat-023-booking-back-loses-selected-slot.png`
- Network / Console Notes:
  - No new API failure was needed to trigger the regression; the state loss happened entirely in client-side step navigation.
- Related Coverage Rows:
  - SC-PAT-023 -> Failed

### BUG-010 - Doctor search clear action leaves the page stuck in empty state
- Status: Open
- Severity: Medium
- Area: Patient / Doctor Search
- Test Case IDs: SC-PAT-011
- Found At (UTC): 2026-03-16T15:14:00Z
- Environment: local frontend + local backend
- Preconditions: logged in as `patient1@clinic.com`; opened `http://127.0.0.1:3000/find-doctors`
- Steps To Reproduce:
  1. Search `/find-doctors` with a no-match keyword such as `zzzz-no-match`.
  2. Wait for the empty state `Không tìm thấy bác sĩ`.
  3. Click `Xóa bộ lọc`.
- Expected:
  - Clearing the filter immediately restores the unfiltered doctor list.
- Actual:
  - The search box clears, but the page stays on the empty-state card until the patient clicks `Tìm kiếm` manually.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T151047Z/sc-pat-011-clear-filter-stuck-empty-state.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T151047Z/sc-pat-014-doctor-search-no-match.png`
- Network / Console Notes:
  - The regression reproduced without any backend error; it is a broken recovery action on the patient search UI.
- Related Coverage Rows:
  - SC-PAT-011 -> Failed

### BUG-009 - Verify-phone resend action fails with 500 and no visible feedback
- Status: Open
- Severity: Medium
- Area: Auth / Verification
- Test Case IDs: SC-AUTH-025
- Found At (UTC): 2026-03-16T15:03:31Z
- Environment: local frontend + local backend
- Preconditions: logged out and opened `http://127.0.0.1:3000/verify-phone` directly
- Steps To Reproduce:
  1. Open `http://127.0.0.1:3000/verify-phone`.
  2. Click `Gửi lại mã`.
- Expected:
  - The resend action either sends a new OTP successfully or tells the user clearly that prerequisite phone context is missing.
- Actual:
  - The frontend sends `POST /api/auth/send-sms-verification`, the backend returns `500 Internal Server Error`, and the verification screen stays unchanged with no inline or toast feedback.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-025-resend-otp-failure.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-025-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-025-console.log`
- Network / Console Notes:
  - Saved network log reproduces `[POST] http://localhost:8080/api/auth/send-sms-verification => [500] Internal Server Error`.
  - The saved console log shows only the failed resource load and no compensating user-facing message path.
- Related Coverage Rows:
  - SC-AUTH-025 -> Failed

### BUG-008 - Register form failures do not surface visible feedback
- Status: Open
- Severity: Medium
- Area: Auth / Registration
- Test Case IDs: SC-AUTH-015, SC-AUTH-016
- Found At (UTC): 2026-03-16T15:01:16Z
- Environment: local frontend + local backend
- Preconditions: logged out on `http://127.0.0.1:3000/register`
- Steps To Reproduce:
  1. Fill the required register fields and submit with mismatched passwords, or submit with duplicate seeded email `patient1@clinic.com`.
  2. Click `Create Account`.
- Expected:
  - The form shows visible, actionable validation or duplicate-account feedback so the user knows how to fix the submission.
- Actual:
  - On the mismatched-password path, the form stays on `/register` with no visible inline or toast error.
  - On the duplicate-email path, `POST /api/auth/register` returns `409 Conflict`, but the form still shows no visible error state.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-015-register-mismatch.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-016-register-duplicate-email.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/playwright-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/playwright-console.log`
- Network / Console Notes:
  - The saved network log shows `[POST] http://localhost:8080/api/auth/register => [409] Conflict` for the duplicate-email submission.
  - The mismatched-password path stayed on the form with no visible error text and no compensating network request.
- Related Coverage Rows:
  - SC-AUTH-015 -> Failed
  - SC-AUTH-016 -> Failed

### BUG-007 - Doctor profile invalid phone submission returns 500 with only generic feedback
- Status: Open
- Severity: Medium
- Area: Doctor / Profile
- Test Case IDs: X-003, X-004, SC-X-002
- Found At (UTC): 2026-03-16T13:19:52Z
- Environment: local frontend + local backend
- Preconditions: logged in as `dr.sarah@clinic.com`; opened `http://127.0.0.1:3000/profile`
- Steps To Reproduce:
  1. Open `http://127.0.0.1:3000/login` and quick-login as doctor.
  2. Open `http://127.0.0.1:3000/profile`.
  3. Replace the phone field value with `abc`.
  4. Click `Lưu thay đổi`.
- Expected:
  - The profile form blocks the submission with field-level validation or returns a handled 4xx-style validation error that tells the doctor how to fix the phone input.
- Actual:
  - The frontend sends the update request, `PUT /api/profile` returns `500 Internal Server Error`, and the UI only shows the generic message `An unexpected error occurred. Please contact support.`
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T131255Z/x-003-doctor-profile-invalid-phone.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-x-002-doctor-invalid-phone.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T131255Z/playwright-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T131255Z/playwright-network.log`
- Network / Console Notes:
  - The failure reproduced twice in the same turn: `PUT /api/profile => 500` at lines 32 and 37 of the saved network log.
  - Restoring the seeded phone value `0909999002` immediately afterward returned `PUT /api/profile => 200`, so the issue is tied to invalid input handling rather than a broken profile endpoint.
  - Reproduced again on 2026-03-18 while executing `SC-X-002`; the doctor profile still showed only the generic support error after an invalid phone submit.
- Related Coverage Rows:
  - X-003 -> Failed
  - X-004 -> Failed
  - SC-X-002 -> Failed

### BUG-006 - Authenticated sidebar logs duplicate-key React warnings across routes
- Status: Open
- Severity: Low
- Area: Cross-cutting / Navigation
- Test Case IDs: X-004, SC-X-025
- Found At (UTC): 2026-03-16T13:02:59Z
- Environment: local frontend + local backend
- Preconditions: logged in on an authenticated patient or doctor session
- Steps To Reproduce:
  1. Sign in as a patient or doctor.
  2. Open authenticated routes that render the dashboard sidebar, such as `/dashboard`, `/consultations`, `/patient/consultations`, or `/doctor/create-medical-record`.
  3. Observe the browser console during navigation.
- Expected:
  - Authenticated navigation renders without React key warnings.
- Actual:
  - The console repeatedly logs `Warning: Encountered two children with the same key` for sidebar route entries such as `/consultations` and `/patient/consultations`.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T125227Z/playwright-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T130020Z/playwright-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-019-020-025-console.log`
- Network / Console Notes:
  - The warning is reproducible across both patient and doctor sessions, so it is broader than a single feature page.
  - Current doctor-side evidence logs the warning against `/consultations` while rendering analytics/profile/create-record flows.
  - This turn reproduced the same warning again on patient routes including `/dashboard`, `/patient/consultations/new`, and `/patient/consultations/427`.
- Related Coverage Rows:
  - X-004 -> Failed
  - SC-X-025 -> Failed

### BUG-005 - Admin doctor search crashes DoctorManagement page
- Status: Open
- Severity: High
- Area: Admin / Doctor Management
- Test Case IDs: ADM-003, X-004
- Found At (UTC): 2026-03-16T12:46:46Z
- Environment: local frontend + local backend
- Preconditions: logged in as `admin@clinic.com`; opened `http://127.0.0.1:3000/doctors`
- Steps To Reproduce:
  1. Open `http://127.0.0.1:3000/doctors`.
  2. Wait for the doctor cards to load.
  3. Type `Sarah` into `Tìm theo tên hoặc chuyên khoa...`.
- Expected:
  - The list filters to matching doctors without crashing the page.
- Actual:
  - The route crashes to a blank page and React logs `TypeError: Cannot read properties of undefined (reading 'toLowerCase')`.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T124313Z/adm-003-doctors-search-crash.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T124313Z/adm-003-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T124313Z/adm-003-network.log`
- Network / Console Notes:
  - `GET /api/users/role/DOCTOR?page=0&size=20 => 200`, so the page has data before the crash.
  - Console points to `src/pages/admin/DoctorManagement.jsx:67` inside `filterDoctors`.
- Related Coverage Rows:
  - ADM-003 -> Failed
  - X-004 -> Failed

### BUG-004 - Admin user edit save intermittently fails with 503
- Status: Open
- Severity: Medium
- Area: Admin / User Management
- Test Case IDs: ADM-002, X-004
- Found At (UTC): 2026-03-16T12:46:46Z
- Environment: local frontend + local backend
- Preconditions: logged in as `admin@clinic.com`; opened `http://127.0.0.1:3000/users`
- Steps To Reproduce:
  1. Open `http://127.0.0.1:3000/users`.
  2. Search for `Sarah` and open the `Sửa` modal for `Dr. Sarah Johnson`.
  3. Click `Lưu` without changing the seeded values.
- Expected:
  - The user update completes successfully or performs a harmless no-op save.
- Actual:
  - The first save attempt in this turn showed toast `Không thể lưu người dùng`, and Playwright reported `503 Service Unavailable` for the update request. An immediate retry later in the same session succeeded, so the regression appears intermittent.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T124313Z/adm-002-user-save-error.png`
- Network / Console Notes:
  - The failing attempt surfaced `Failed to load resource: the server responded with a status of 503 (Service Unavailable)` for `http://localhost:8080/api/users/224`.
  - A later retry against the same seeded record returned success toast `Đã cập nhật người dùng`.
- Related Coverage Rows:
  - ADM-002 -> Failed
  - X-004 -> Failed

### BUG-003 - Consultation detail throws STOMP connection exception during realtime setup
- Status: Open
- Severity: Medium
- Area: Consultation / Cross-cutting
- Test Case IDs: PAT-011, SC-PAT-070, SC-DOC-028, X-004, SC-X-019, SC-X-021
- Found At (UTC): 2026-03-16T12:30:22Z
- Environment: local frontend + local backend
- Preconditions: logged in as a consultation participant and opened a consultation detail page after creating or accepting a request
- Steps To Reproduce:
  1. As a patient, open `http://127.0.0.1:3000/patient/consultations`, create a consultation request, and open the resulting detail page.
  2. Or as a doctor, open `http://127.0.0.1:3000/consultations`, accept a pending request, and open the consultation detail page.
  3. Wait for the consultation detail view to initialize its realtime connection.
- Expected:
  - Consultation detail initializes its realtime subscription without JS exceptions or websocket lifecycle warnings.
- Actual:
  - The detail page renders and core chat actions can still work, but the console logs STOMP warnings about missing auto reconnect and an exception: `There is no underlying STOMP connection` before the subscription recovers.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T122210Z/pat-011-consultation-detail.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T122210Z/playwright-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T123327Z/doc-005-consultation-detail.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T123327Z/playwright-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T123327Z/playwright-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-021-patient-consultation-stomp-warning.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-021-022-patient-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-021-022-patient-network.log`
- Network / Console Notes:
  - Patient detail for consultation `801` and doctor detail for consultation `802` both reproduced the same STOMP lifecycle warnings.
  - For doctor consultation `802`, `PUT /api/consultations/802/accept => 200`, `GET /api/consultations/802 => 200`, `GET /api/messages/consultation/802 => 200`, `GET /ws/info => 200`, `POST /api/messages => 201`, and `PUT /api/messages/consultation/802/read => 204`, so the failure is in the frontend websocket/STOMP lifecycle rather than a missing backend endpoint.
  - Console recorded `Stomp.over did not receive a factory, auto reconnect will not work` and `Ignoring an exception thrown by a frame handler ... There is no underlying STOMP connection`.
  - This turn reproduced the same startup warnings and frame-handler exception again on patient consultation `427`, even though live message delivery still worked once the page settled.
- Related Coverage Rows:
  - PAT-011 -> Failed
  - SC-PAT-070 -> Failed
  - SC-DOC-028 -> Failed
  - X-004 -> Failed
  - SC-X-019 -> Failed
  - SC-X-021 -> Failed

### BUG-002 - Patient dashboard hits repeated 500 stats error on initial load
- Status: Open
- Severity: Medium
- Area: Patient / Cross-cutting
- Test Case IDs: PAT-001, SC-PAT-003, X-004, SC-X-020
- Found At (UTC): 2026-03-16T12:17:25Z
- Environment: local frontend + local backend
- Preconditions: deterministic seed prepared; logged in as `patient1@clinic.com`
- Steps To Reproduce:
  1. Open `http://127.0.0.1:3000/login`.
  2. Sign in with `patient1@clinic.com / password`.
  3. Wait for the patient dashboard at `/dashboard` to finish loading.
- Expected:
  - Patient dashboard loads without failing API requests or unexpected console errors.
- Actual:
  - The dashboard renders, but repeated stats requests fail and the browser console logs React warnings during page load.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T120816Z/auth-001-patient-dashboard.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-020-patient-dashboard-aggregate-500.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-019-020-025-network.log`
- Network / Console Notes:
  - `GET http://localhost:8080/api/statistics/aggregate/patient/223 => 500 Internal Server Error` twice during the same dashboard load.
  - The dashboard load still includes the stats `500`, while the broader duplicate-key warning is now tracked separately in `BUG-006`.
  - A second seeded patient session (`patient.52@healthflow.vn`) also reproduced the same aggregate stats failure pattern this turn via `GET /api/statistics/aggregate/patient/52 => 500`.
- Related Coverage Rows:
  - PAT-001 -> Failed
  - SC-PAT-003 -> Failed
  - X-004 -> Failed
  - SC-X-020 -> Failed

### BUG-001 - Login failures return no visible user-facing error
- Status: Open
- Severity: Medium
- Area: Auth
- Test Case IDs: AUTH-004, SC-AUTH-009, SC-AUTH-011
- Found At (UTC): 2026-03-16T12:17:25Z
- Environment: local frontend + local backend
- Preconditions: logged out on `/login`
- Steps To Reproduce:
  1. Open `http://127.0.0.1:3000/login`.
  2. Enter invalid credentials such as `invalid-user@clinic.com / wrong-password`, or enter a malformed identifier such as `not-an-email / password`.
  3. Submit the login form.
- Expected:
  - The page stays unauthenticated and shows a visible inline or toast error explaining that the credentials are invalid.
- Actual:
  - The page stays on `/login`, but no visible validation or server error message appears after the failed login attempt.
- Evidence:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T120816Z/auth-004-invalid-login.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-009-invalid-login.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-invalid-login-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-011-login-malformed-email.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-011-network.log`
- Network / Console Notes:
  - `POST http://localhost:8080/api/auth/login => 401 Unauthorized` during the invalid login attempt.
  - `POST http://localhost:8080/api/auth/login => 401 Unauthorized` also reproduced for `patient1@clinic.com / wrongpass` on 2026-03-17 with the same missing user-facing feedback.
  - `POST http://localhost:8080/api/auth/login => 400 Bad Request` during malformed identifier submission `not-an-email`, with the same missing user-facing feedback.
- Related Coverage Rows:
  - AUTH-004 -> Failed
  - SC-AUTH-009 -> Failed
  - SC-AUTH-011 -> Failed

## Bug Template

### BUG-XXX - Short title
- Status: Open
- Severity: Critical | High | Medium | Low
- Area: Auth / Patient / Doctor / Admin / Cross-cutting
- Test Case IDs: AUTH-001
- Found At (UTC): 2026-03-16T00:00:00Z
- Environment: local frontend + local backend
- Preconditions: logged in as patient
- Steps To Reproduce:
  1. Step one
  2. Step two
  3. Step three
- Expected:
  - Expected result
- Actual:
  - Actual result
- Evidence:
  - `/absolute/path/to/screenshot-or-trace`
  - `/absolute/path/to/video-or-log`
- Network / Console Notes:
  - Optional API error or console stack
- Related Coverage Rows:
  - AUTH-001 -> Failed


---

## execution-log.md

# Execution Log

Append one entry per loop turn. Keep entries short and factual.

## Template

### 2026-03-16T00:00:00Z
- Agent turn: 1
- Focus: auth smoke and public routes
- Cases touched: PUB-001, PUB-002, AUTH-001, AUTH-004
- Outcome: 3 passed, 1 failed
- Artifacts:
  - `/absolute/path/to/artifact`
- Notes:
  - Short summary
- Next target:
  - Continue with patient dashboard and booking


### 2026-03-16T12:17:25Z
- Agent turn: 1
- Focus: environment restore, public/auth smoke, role dashboard/access smoke
- Cases touched: PUB-001, PUB-002, PUB-003, PUB-004, PUB-005, PUB-006, AUTH-001, AUTH-002, AUTH-003, AUTH-004, AUTH-005, AUTH-006, PAT-001, DOC-001, ADM-001, X-004
- Outcome: 13 passed, 3 failed
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T120816Z/pub-001-landing.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T120816Z/pub-002-login.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T120816Z/auth-004-invalid-login.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T120816Z/auth-001-patient-dashboard.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T120816Z/auth-002-doctor-dashboard.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T120816Z/auth-003-admin-dashboard.png`
- Notes:
  - Restored deterministic backend data with `E2E_SKIP_DOCKER_START=true npm run test:e2e:prepare` after resolving a stale Docker compose name conflict; auth preflight passed afterward.
  - Started a fresh Vite dev server on `http://127.0.0.1:3000`.
  - Invalid login produced backend `401` without user-facing feedback.
  - Patient dashboard reproduced repeated `500` stats requests and duplicate-key React warnings.
- Next target:
  - Continue with AUTH-007 logout, then patient high-priority route coverage (`PAT-002`, `PAT-003`, `PAT-004`, `PAT-007`, `PAT-011`, `PAT-012`).

### 2026-03-16T12:30:22Z
- Agent turn: 2
- Focus: frontend restore, logout validation, patient high-priority route coverage
- Cases touched: AUTH-007, PAT-002, PAT-003, PAT-004, PAT-007, PAT-011, PAT-012, X-004
- Outcome: 6 passed, 2 failed
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T122210Z/pat-004-appointments.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T122210Z/pat-011-consultation-detail.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T122210Z/playwright-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T122210Z/playwright-network.log`
- Notes:
  - Restarted the Vite dev server after the prior turn's frontend process had exited; backend remained healthy on `:8080`.
  - Verified real navbar logout via patient quick-login and `Đăng xuất`.
  - Confirmed patient doctor search, booking, appointments list, records empty state, and profile/settings flows.
  - Created consultation `801`; detail page rendered but logged websocket/STOMP lifecycle warnings and a connection exception, captured as `BUG-003`.
- Next target:
  - Shift to remaining untested high-priority doctor routes (`DOC-002`, `DOC-003`, `DOC-004`, `DOC-005`) and admin high-priority routes (`ADM-002`, `ADM-003`, `ADM-007`), then return to patient medium-priority routes and `PAT-005`.

### 2026-03-16T12:39:23Z
- Agent turn: 3
- Focus: frontend restore, doctor high-priority route coverage, consultation realtime reconfirmation
- Cases touched: DOC-002, DOC-003, DOC-004, DOC-005, X-004
- Outcome: 4 passed, 1 failed
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T123327Z/doc-005-consultation-detail.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T123327Z/playwright-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T123327Z/playwright-network.log`
- Notes:
  - Frontend required another Vite restart; backend health stayed `UP` on `:8080`.
  - Verified doctor appointments, schedule save, and patients empty-state flows without blocking defects.
  - Seeded consultation `802` for `Dr. Sarah Johnson`, accepted it from `/consultations`, opened the detail view, and sent `Doctor manual QA reply` successfully.
  - Console/network monitoring reconfirmed the consultation realtime STOMP lifecycle defect on the doctor detail page while backend consultation/message endpoints still returned success codes.
- Next target:
  - Move to remaining untested high-priority admin routes (`ADM-002`, `ADM-003`, `ADM-007`), then continue medium-priority patient and doctor coverage (`PAT-005`, `PAT-006`, `PAT-008`, `PAT-009`, `PAT-010`, `DOC-006`, `DOC-007`, `DOC-008`).

### 2026-03-16T12:46:46Z
- Agent turn: 4
- Focus: frontend restore, high-priority admin route coverage, new admin defect capture
- Cases touched: ADM-002, ADM-003, ADM-007, X-004
- Outcome: 1 passed, 3 failed
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T124313Z/adm-002-user-save-error.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T124313Z/adm-003-doctors-search-crash.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T124313Z/adm-003-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T124313Z/adm-003-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T124313Z/adm-007-reports.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T124313Z/playwright-network.log`
- Notes:
  - Backend remained healthy, but the frontend dev server had exited again and was restarted before admin testing.
  - `/users` loaded and edit/save ultimately worked on retry, but the first save attempt for `Dr. Sarah Johnson` failed with a visible error toast and `503 Service Unavailable`, captured as `BUG-004`.
  - `/doctors` loaded, but entering `Sarah` into the search box crashed the route with `TypeError: Cannot read properties of undefined (reading 'toLowerCase')`, captured as `BUG-005`.
  - `/admin/reports` rendered and its report filter requests continued returning `200` while switching tabs and groupings.
- Next target:
  - Continue with medium-priority patient routes (`PAT-005`, `PAT-006`, `PAT-008`, `PAT-009`, `PAT-010`), then remaining doctor/admin medium-priority routes and cross-cutting navigation/session/error-handling coverage.

### 2026-03-16T12:57:30Z
- Agent turn: 5
- Focus: frontend restore, patient medium-priority route coverage, console follow-up
- Cases touched: PAT-005, PAT-006, PAT-008, PAT-009, PAT-010, X-004
- Outcome: 5 passed, 1 failed
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T125227Z/pat-005-appointment-detail.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T125227Z/pat-006-payments.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T125227Z/pat-008-health-metrics.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T125227Z/pat-009-family.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T125227Z/pat-010-notifications.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T125227Z/playwright-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T125227Z/playwright-network.log`
- Notes:
  - Backend stayed healthy, but the frontend dev server had exited again and was restarted before patient route coverage resumed.
  - Confirmed seeded appointment detail `/appointments/1801` and payment history for the pending MoMo order from the earlier booking flow.
  - Added one blood-pressure health metric entry and one family member record (`QA Family Member`), both of which persisted and rendered immediately.
  - Notifications rendered empty-state and filter behavior correctly, while console monitoring still captured the existing duplicate-key warning pattern with no new distinct bug beyond the already-open `X-004`.
- Next target:
  - Move to remaining doctor/admin medium-priority routes (`DOC-006`, `DOC-007`, `DOC-008`, `ADM-004`, `ADM-005`, `ADM-006`, `ADM-008`), then complete cross-cutting high-priority coverage (`X-001`, `X-002`, `X-003`, `X-006`) and sample responsiveness (`X-005`).

### 2026-03-16T13:02:59Z
- Agent turn: 6
- Focus: frontend restore, doctor medium-priority route coverage, blocked create-record triage
- Cases touched: DOC-006, DOC-007, DOC-008, X-004
- Outcome: 2 passed, 1 blocked, 1 failed
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T130020Z/doc-006-analytics.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T130020Z/doc-007-create-record-redirect.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T130020Z/doc-008-profile.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T130020Z/playwright-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T130020Z/playwright-network.log`
- Notes:
  - Backend stayed healthy, but the frontend dev server had exited again and was restarted before doctor route coverage resumed.
  - `/doctor/analytics` rendered its summary cards and empty analytics states cleanly, and the range filter switched between `6 tháng gần nhất` and `3 tháng gần nhất`.
  - `/doctor/create-medical-record` redirected into `/doctor/appointments`, where the seeded doctor still had no appointments or patient context; no creation form surfaced, so the case was marked `Blocked`.
  - Doctor `/profile` rendered and saving the seeded values completed successfully, while console monitoring reconfirmed the cross-role duplicate-sidebar-key warning now tracked as `BUG-006`.
- Next target:
  - Continue with the remaining admin medium-priority routes (`ADM-004`, `ADM-005`, `ADM-006`, `ADM-008`), then complete cross-cutting high-priority coverage (`X-001`, `X-002`, `X-003`, `X-006`) and revisit `DOC-007` only if patient-linked medical-record creation becomes accessible.

### 2026-03-16T13:11:05Z
- Agent turn: 7
- Focus: frontend restore, admin medium-priority route coverage, route-inventory closure
- Cases touched: ADM-004, ADM-005, ADM-006, ADM-008, X-006
- Outcome: 5 passed
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T130525Z/adm-004-clinics.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T130525Z/adm-005-services.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T130525Z/adm-006-rooms.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T130525Z/adm-008-profile.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T130525Z/playwright-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T130525Z/playwright-network.log`
- Notes:
  - Backend stayed healthy, but the frontend dev server had exited again and was restarted before the admin medium-priority pass.
  - `/admin/clinics`, `/admin/services`, `/admin/rooms`, and admin `/profile` all rendered and their edit/save flows completed successfully using seeded values.
  - This turn did not surface any new distinct console or network defects; the current console export only contains the standard React Router future-flag warnings.
  - With the final admin route pass complete, every route-backed case in the current inventory is now explicitly marked passed, failed, or blocked, so `X-006` was closed as passed.
- Next target:
  - Complete the remaining cross-cutting high-priority coverage (`X-001`, `X-002`, `X-003`), then sample responsiveness for `X-005` and revisit `DOC-007` only if a patient-linked medical-record entrypoint becomes available.

### 2026-03-16T13:19:52Z
- Agent turn: 8
- Focus: frontend restore, cross-cutting navigation/session coverage, cross-role invalid-form handling
- Cases touched: X-001, X-002, X-003, X-004
- Outcome: 2 passed, 2 failed
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T131255Z/x-003-patient-security-mismatch.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T131255Z/x-003-doctor-profile-invalid-phone.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T131255Z/x-003-admin-clinic-required.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T131255Z/playwright-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T131255Z/playwright-network.log`
- Notes:
  - Backend stayed healthy, but the frontend dev server had exited again and was restarted before the cross-cutting pass.
  - Real authenticated link navigation was exercised for admin, patient, and doctor sessions, and authenticated reloads held on `/profile`, `/appointments`, and `/schedule` without dropping the session.
  - Patient password mismatch and admin empty-clinic submission both surfaced visible feedback, but doctor profile rejected invalid phone text by returning backend `500` and only a generic support message, logged as `BUG-007`.
  - Console/network monitoring also reconfirmed the known duplicate-sidebar-key warnings during patient and doctor navigation, so `X-004` remains failed.
- Next target:
  - Sample responsiveness for `X-005`, then re-check definition-of-done coverage and revisit blocked `DOC-007` only if a patient-linked medical-record entrypoint becomes available.

### 2026-03-16T13:24:42Z
- Agent turn: 9
- Focus: frontend restore, narrow-viewport responsiveness sampling, definition-of-done check
- Cases touched: X-005
- Outcome: 1 passed
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T132050Z/x-005-login-mobile.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T132050Z/x-005-patient-dashboard-mobile.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T132050Z/x-005-doctor-schedule-mobile.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T132050Z/x-005-admin-clinics-mobile.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T132050Z/playwright-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T132050Z/playwright-network.log`
- Notes:
  - Backend stayed healthy, but the frontend dev server had exited again and was restarted before the responsiveness pass.
  - Sampled public, patient, doctor, and admin pages at `390x844`; layouts stacked vertically and remained usable without severe overlap or blocked primary actions.
  - Mobile screenshots still show the previously known console/data defects in affected flows, but no new responsiveness-specific regression was identified.
  - With `X-005` complete, every inventory row now has a terminal status (`Passed`, `Failed`, or `Blocked`).
- Next target:
  - No unexecuted test cases remain in the current inventory; only bug fixes or environment changes would justify another QA pass.

### 2026-03-16T15:04:08Z
- Agent turn: 10
- Focus: environment restore, expanded `SC-AUTH-*` public/auth validation batch
- Cases touched: SC-AUTH-002, SC-AUTH-003, SC-AUTH-004, SC-AUTH-010, SC-AUTH-011, SC-AUTH-012, SC-AUTH-014, SC-AUTH-015, SC-AUTH-016, SC-AUTH-020, SC-AUTH-021, SC-AUTH-024, SC-AUTH-025, SC-AUTH-026, SC-AUTH-033
- Outcome: 10 passed, 4 failed, 1 skipped
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-002-landing.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-010-login-empty.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-011-login-malformed-email.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-011-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-012-patient-quick-login.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-015-register-mismatch.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-016-register-duplicate-email.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-020-forgot-password-malformed.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-021-forgot-password-unknown-email.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-024-verify-phone-incomplete-otp.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-025-resend-otp-failure.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-025-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-026-reset-password-invalid-context.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T145416Z/sc-auth-033-new-tab-protected-route.png`
- Notes:
  - Initial `npm run test:e2e:prepare` hit the known Docker container-name conflict on `clinic_chatbot_service`; reused the already healthy backend stack and restored deterministic data with `E2E_SKIP_DOCKER_START=true npm run test:e2e:prepare`.
  - Started a fresh Vite dev server on `http://127.0.0.1:3000`.
  - Public/auth batch 2 covered landing content, CTA routing, empty-field validation, quick-login, forgot-password edge cases, verify-phone behavior, invalid reset state, and same-session new-tab behavior.
  - Expanded auth defect coverage: malformed login `400` still has no visible feedback (`BUG-001`), register mismatch and duplicate-email failures are silent (`BUG-008`), and verify-phone resend on direct access triggers `500` with no user feedback (`BUG-009`).
- Next target:
  - Move into patient negative/edge coverage starting with `SC-PAT-011`, `SC-PAT-012`, `SC-PAT-014`, and the booking wizard resilience cases `SC-PAT-021` to `SC-PAT-024`.

### 2026-03-16T15:18:57Z
- Agent turn: 11
- Focus: environment restore, patient search edge cases, and booking wizard resilience
- Cases touched: SC-PAT-011, SC-PAT-012, SC-PAT-014, SC-PAT-021, SC-PAT-022, SC-PAT-023, SC-PAT-024
- Outcome: 4 passed, 2 failed, 1 skipped
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T151047Z/sc-pat-011-clear-filter-stuck-empty-state.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T151047Z/sc-pat-012-no-detail-affordance-on-search-card.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T151047Z/sc-pat-014-doctor-search-no-match.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T151047Z/sc-pat-021-booking-missing-required-fields.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T151047Z/sc-pat-022-booking-unavailable-day.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T151047Z/sc-pat-023-booking-back-loses-selected-slot.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T151047Z/sc-pat-024-booking-abandon-resets-wizard.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T151047Z/playwright-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T151047Z/playwright-network.log`
- Notes:
  - Backend containers were still healthy, so deterministic state was restored with `E2E_SKIP_DOCKER_START=true npm run test:e2e:prepare`; Vite then had to be restarted on `http://127.0.0.1:3000`.
  - Doctor-search edge coverage found a broken recovery path: `Xóa bộ lọc` clears the keyword but leaves the page stuck in empty state (`BUG-010`).
  - Booking resilience coverage showed safe handling for unavailable dates and missing required details, but back-navigation from step 3 drops the selected slot instead of preserving step state (`BUG-011`).
  - The current patient search UI exposes booking actions only; no separate doctor-detail affordance was present to exercise for `SC-PAT-012`.
- Next target:
  - Continue with the remaining patient detail/data-edge cases `SC-PAT-031`, `SC-PAT-033`, `SC-PAT-034`, `SC-PAT-037` to `SC-PAT-041`, `SC-PAT-046`, `SC-PAT-051`, `SC-PAT-053`, `SC-PAT-058`, and `SC-PAT-059`.

### 2026-03-16T15:35:53Z
- Agent turn: 12
- Focus: remaining patient detail/data-edge coverage, alternate-patient validation, payment-history blockage check
- Cases touched: SC-PAT-031, SC-PAT-033, SC-PAT-034, SC-PAT-037, SC-PAT-038, SC-PAT-039, SC-PAT-040, SC-PAT-041, SC-PAT-046, SC-PAT-051, SC-PAT-053, SC-PAT-058, SC-PAT-059
- Outcome: 9 passed, 1 failed, 3 blocked
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-031-appointments-empty-state-full.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-033-appointment-detail-quick-actions-inert.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-033-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-034-appointment-not-found-fallback.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-payment-history-service-unavailable.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-039-payment-result-known-order.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-040-payment-result-invalid-orderid.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-046-medical-record-not-found.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-051-heart-rate-added.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-053-health-metric-invalid-submit.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-058-family-delete-404.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/sc-pat-059-family-missing-required-fields.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/playwright-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T152303Z/playwright-network.log`
- Notes:
  - Backend health stayed `UP`; Vite required a fresh restart on `http://127.0.0.1:3000` before the browser pass.
  - Reseeded `patient1@clinic.com` covered the empty-state appointment path, while fallback patient `patient.1@healthflow.vn` was needed to reach live appointment-detail quick actions.
  - Payment history is currently blocked for both patient accounts because `GET /api/payments/my-payments?page=0&size=20` returned `503 Service Unavailable`, so the payment search/filter/link cases were marked blocked behind `BUG-013`.
  - Appointment detail quick actions on `/appointments/1100` are inert even though the buttons render, captured as `BUG-012`.
- Next target:
  - Move to the queued doctor validation scenarios `SC-DOC-004`, `SC-DOC-006`, `SC-DOC-009`, `SC-DOC-010`, `SC-DOC-012`, `SC-DOC-013`, and `SC-DOC-021`, then continue admin validation coverage.

### 2026-03-16T15:50:13Z
- Agent turn: 13
- Focus: doctor validation scenarios, fallback-doctor coverage, and inert-action capture
- Cases touched: SC-DOC-004, SC-DOC-006, SC-DOC-009, SC-DOC-010, SC-DOC-012, SC-DOC-013, SC-DOC-021
- Outcome: 1 passed, 4 failed, 2 blocked
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-004-appointments-empty.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-004-patients-with-history.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-004-appointments-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-009-invalid-schedule-values-retained.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-schedule-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-012-patient-search-filtered.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-013-patient-detail-inert.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-013-patient-detail-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-021-profile-invalid-phone.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T154420Z/sc-doc-021-profile-network.log`
- Notes:
  - Backend health remained `UP`; the frontend Vite server had to be restarted again on `http://127.0.0.1:3000` before the browser pass.
  - Quick-login doctor `dr.sarah@clinic.com` still had no reachable appointment data, so the seeded fallback doctor `doctor.1@healthflow.vn` was used for the doctor validation batch.
  - The dominant regression pattern this turn was inert doctor-side actions: appointments stayed empty despite linked patient history, schedule save fired no request, patient `Xem hồ sơ` did nothing, and profile save with invalid phone fired no request.
  - Patient-list search itself behaved correctly, so `SC-DOC-012` closed as passed.
- Next target:
  - Move to admin validation and recovery coverage `SC-ADM-007`, `SC-ADM-008`, `SC-ADM-009`, `SC-ADM-012`, `SC-ADM-013`, `SC-ADM-014`, `SC-ADM-018`, and `SC-ADM-023`, then revisit blocked payment-history and doctor rechecks if fixes land.

### 2026-03-16T16:01:30Z
- Agent turn: 14
- Focus: remaining admin validation/recovery coverage and final inventory closure
- Cases touched: SC-ADM-007, SC-ADM-008, SC-ADM-009, SC-ADM-012, SC-ADM-013, SC-ADM-014, SC-ADM-018, SC-ADM-023
- Outcome: 7 passed, 1 blocked
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/sc-adm-007-user-save-empty-required.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/sc-adm-008-users-filter-doctor.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/sc-adm-009-user-save-retry-success.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/bug-018-admin-user-edit-invalid-phone-500.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/sc-adm-012-doctors-status-filter-pending.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/sc-adm-013-doctor-detail-opened.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/sc-adm-018-clinic-empty-required.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/sc-adm-023-service-invalid-save.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260316T155423Z/playwright-console.log`
- Notes:
  - Backend health stayed `UP`; the frontend Vite server had to be restarted again on `http://127.0.0.1:3000` before the admin pass.
  - User-management validation, filtering, and retry-recovery paths all worked well enough to close their cases, but an invalid admin user edit still returned `500` instead of validation and was logged as `BUG-018`.
  - Doctor-management status filtering and detail opening worked safely; however, no approve/edit/save control was available in the current `/doctors` data/UI, so `SC-ADM-014` was marked blocked rather than guessed.
  - With the admin batch complete, every currently listed `SC-*` case in the manual regression inventory now has a terminal status.
- Next target:
  - No mandatory inventory cases remain; only optional bug revalidation is left if fixes or environment changes land.

### 2026-03-17T13:59:39Z
- Agent turn: 15
- Focus: environment restore plus patient navigation, doctor-search, and booking happy-path expansion for newly appended `SC-PAT-*` coverage
- Cases touched: SC-PAT-001, SC-PAT-002, SC-PAT-003, SC-PAT-004, SC-PAT-005, SC-PAT-006, SC-PAT-008, SC-PAT-009, SC-PAT-010, SC-PAT-013, SC-PAT-015, SC-PAT-016, SC-PAT-017, SC-PAT-018, SC-PAT-019, SC-PAT-020
- Outcome: 11 passed, 5 failed
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-dashboard.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-appointments-empty.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-005-sidebar-missing-find-doctors.md`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-009-search-sarah-not-filtered.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-010-search-specialty-not-filtered.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-016-preselected-doctor-booking.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-017-booking-confirmation-step.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/sc-pat-019-appointment-visible.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/bug-pat-payment-handoff-503.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/bug-pat-payment-handoff-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T134531Z/bug-pat-payment-handoff-console.log`
- Notes:
  - Refreshed deterministic backend data with `E2E_SKIP_DOCKER_START=true npm run test:e2e:prepare`, then started a fresh Vite server on `http://127.0.0.1:3000`.
  - Patient dashboard still reproduces the known stats `500` and duplicate-key sidebar warning pattern while remaining usable enough for route coverage.
  - New patient regressions were isolated around navigation/search: the sidebar no longer exposes a `/find-doctors` link, and submitted doctor-search queries for both `Sarah` and `Tim mạch` left the result set unfiltered at 31 doctors.
  - Booking still works far enough to create appointments and render them in `/appointments`, but the payment handoff is currently broken because `POST /api/payments` returns `503 Service Unavailable` after `POST /api/appointments => 201`.
- Next target:
  - Continue with the highest-priority untested patient catalog closest to the current state: `SC-PAT-026`, `SC-PAT-027`, `SC-PAT-028`, `SC-PAT-029`, `SC-PAT-030`, then consultation/profile high-priority rows `SC-PAT-065` to `SC-PAT-070`, `SC-PAT-075`, and `SC-PAT-078`.

### 2026-03-17T14:11:23Z
- Agent turn: 16
- Focus: patient appointment-management follow-up, patient consultation high-priority coverage, and profile/security render checks
- Cases touched: SC-PAT-026, SC-PAT-027, SC-PAT-028, SC-PAT-029, SC-PAT-030, SC-PAT-065, SC-PAT-066, SC-PAT-067, SC-PAT-068, SC-PAT-069, SC-PAT-070, SC-PAT-075, SC-PAT-078
- Outcome: 10 passed, 2 failed, 1 blocked
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/sc-pat-029-cancel-success.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/bug-pat-reschedule-500.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/bug-pat-reschedule-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/bug-pat-reschedule-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/sc-pat-067-consultation-detail.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/sc-pat-consultation-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/sc-pat-consultation-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/sc-pat-075-profile.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T140338Z/sc-pat-078-security.png`
- Notes:
  - Backend stayed healthy and the frontend was restored with a fresh Vite restart before continuing from the existing patient session and seeded appointments created in the prior turn.
  - Appointment list/detail coverage expanded cleanly: list metadata matched the seeded appointments, detail rendered correctly, cancel succeeded on appointment `1802`, and the list reflected the `Đã hủy` transition immediately.
  - Appointment reschedule is currently broken: attempting to move appointment `1801` to a new slot reproducibly returns `POST /api/appointments/1801/reschedule => 500`, logged as `BUG-022`.
  - Patient consultation creation still works (`POST /api/consultations => 201`), but chat messaging remains blocked while the request is pending and the detail page still reproduces the known STOMP lifecycle defect from `BUG-003`.
- Next target:
  - Finish the remaining patient consultation/profile/security rows (`SC-PAT-071`, `SC-PAT-072`, `SC-PAT-073`, `SC-PAT-074`, `SC-PAT-076`, `SC-PAT-077`, `SC-PAT-079`, `SC-PAT-080`, `SC-PAT-081`, `SC-PAT-082`), then use a doctor session to accept consultation `801` so `SC-PAT-069` can be unblocked before shifting into the unstarted doctor catalog.

### 2026-03-17T14:23:24Z
- Agent turn: 17
- Focus: remaining patient consultation/profile/security edge cases plus resumable evidence capture for redirects and negative routes
- Cases touched: SC-PAT-071, SC-PAT-072, SC-PAT-073, SC-PAT-074, SC-PAT-076, SC-PAT-077, SC-PAT-079, SC-PAT-080, SC-PAT-081, SC-PAT-082
- Outcome: 8 passed, 2 failed
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/sc-pat-071-validation.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/sc-pat-072-foreign-consultation-blocked.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/sc-pat-072-foreign-consultation-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/bug-pat-consultation-invalid-route.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/bug-pat-consultation-invalid-route-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/bug-pat-consultation-invalid-route-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/sc-pat-074-messages-redirect.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/sc-pat-076-profile-save-success.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/bug-pat-profile-invalid-phone.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/bug-pat-profile-invalid-phone-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/bug-pat-profile-invalid-phone-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/sc-pat-079-password-mismatch.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/sc-pat-080-password-change-success.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T141508Z/sc-pat-082-notification-save-success.png`
- Notes:
  - Backend health remained `UP`; the frontend Vite server had to be restarted again on `http://127.0.0.1:3000` before the browser batch.
  - Consultation-side negative coverage is partly healthy: short-topic validation worked, `/messages` redirected correctly to `/patient/consultations`, and direct navigation to foreign consultation `800` was blocked with `403 Forbidden`.
  - Two new patient regressions were isolated. Nonexistent consultation `999999` does not fail gracefully and still opens duplicate `404` traffic plus WebSocket subscriptions (`BUG-024`), and invalid profile phone submission returns backend `500` instead of validation (`BUG-023`).
  - Profile save, security mismatch validation, valid password change, and notification-settings persistence all worked; the seeded patient password was restored to `password` after the positive password-change check to preserve deterministic access for later turns.
- Next target:
  - Stay in the patient role for the highest-priority untested route clusters: `SC-PAT-043`, `SC-PAT-044`, `SC-PAT-049`, `SC-PAT-050`, `SC-PAT-055`, `SC-PAT-056`, then close the adjacent medium rows `SC-PAT-045`, `SC-PAT-047`, `SC-PAT-052`, `SC-PAT-057`, `SC-PAT-061`, `SC-PAT-062`, `SC-PAT-063`. After that, use a doctor session to accept consultation `801` so blocked `SC-PAT-069` can be retried, then revisit the payment-dependent patient rows if payment services recover.

### 2026-03-17T14:34:02Z
- Agent turn: 18
- Focus: remaining patient route coverage across medical records, health metrics, family management, and in-app notifications
- Cases touched: SC-PAT-043, SC-PAT-044, SC-PAT-045, SC-PAT-047, SC-PAT-049, SC-PAT-050, SC-PAT-052, SC-PAT-055, SC-PAT-056, SC-PAT-057, SC-PAT-061, SC-PAT-062, SC-PAT-063
- Outcome: 11 passed, 2 blocked
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-medical-records-empty.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-medical-records-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-health-metrics-saved.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-health-metrics-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-family-member-saved.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-family-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-notifications-page.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T142946Z/sc-pat-notifications-network.log`
- Notes:
  - Backend remained `UP`; the frontend Vite server had to be restarted again on `http://127.0.0.1:3000` before the patient-route batch.
  - Medical records rendered cleanly but the current patient dataset still contains no records, so the record-detail and prescription-detail cases were blocked rather than guessed.
  - Health metrics behaved well end-to-end: the page rendered, a valid blood-pressure entry was created with `POST /api/health-metrics => 201 Created`, and the new data appeared immediately in the summary card and chart.
  - Family management also worked in real mode: a new family member was created with `POST /api/family-members => 201 Created`, then edited successfully with `PUT /api/family-members/221 => 200 OK`.
  - In-app notifications rendered, category filtering updated the view, and `PUT /api/notifications/user/223/read-all => 204 No Content` confirmed the mark-read flow.
- Next target:
  - Use a doctor session to accept consultation `801` so blocked `SC-PAT-069` can be retried from the patient side. After that, revisit the payment-dependent patient rows `SC-PAT-020`, `SC-PAT-035`, `SC-PAT-036`, `SC-PAT-037`, `SC-PAT-038`, `SC-PAT-041`, and `SC-PAT-042` if payment services have recovered, then close the remaining untested patient medium/low rows `SC-PAT-007`, `SC-PAT-025`, `SC-PAT-032`, `SC-PAT-048`, `SC-PAT-054`, `SC-PAT-060`, and `SC-PAT-064`.

### 2026-03-17T14:42:14Z
- Agent turn: 19
- Focus: unblock patient consultation messaging via doctor acceptance, then refresh the payment-history cases with current backend evidence
- Cases touched: SC-PAT-069, SC-PAT-035, SC-PAT-036, SC-PAT-042
- Outcome: 3 failed, 1 blocked
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T143716Z/sc-pat-069-doctor-accepted-consultation.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T143716Z/sc-pat-069-doctor-accepted-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T143716Z/sc-pat-069-messaging-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T143716Z/sc-pat-069-messaging-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T143716Z/bug-pat-chatbot-overlaps-send-button.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T143716Z/sc-pat-payments-empty-with-errors.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T143716Z/sc-pat-payments-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T143716Z/sc-pat-payments-console.log`
- Notes:
  - Backend remained `UP`; the frontend had to be restarted again on `http://127.0.0.1:3000` before the doctor/patient role-switch pass.
  - The doctor-side acceptance path worked: consultation `801` moved from `Chờ duyệt` to `Đang tư vấn` with `PUT /api/consultations/801/accept => 200 OK`.
  - The patient-side chat is no longer blocked by consultation state, but the primary send button is obstructed by the floating chatbot widget. A message could only be posted by pressing Enter, so `SC-PAT-069` now closes as failed under `BUG-025` instead of staying blocked.
  - Payment history is still degraded under `BUG-013`: `/payments` renders its shell, but `GET /api/payments/my-payments?page=0&size=20` still returns `503 Service Unavailable`, which blocks row verification and causes a misleading empty-state fallback.
- Next target:
  - Close the remaining untested patient medium/low rows `SC-PAT-007`, `SC-PAT-025`, `SC-PAT-032`, `SC-PAT-048`, `SC-PAT-054`, `SC-PAT-060`, and `SC-PAT-064`, then shift into the unstarted doctor high-priority catalog `SC-DOC-001`, `SC-DOC-002`, `SC-DOC-003`, `SC-DOC-007`, and `SC-DOC-008`. Revisit the payment-history cases only if `BUG-013` clears.

### 2026-03-17T14:53:36Z
- Agent turn: 20
- Focus: close the remaining patient medium/low route rows with recoverability checks, detail consistency checks, and fallback-account empty-state sampling
- Cases touched: SC-PAT-007, SC-PAT-025, SC-PAT-032, SC-PAT-048, SC-PAT-054, SC-PAT-060, SC-PAT-064
- Outcome: 5 passed, 2 blocked
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T144514Z/sc-pat-007-profile-entrypoint.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T144514Z/sc-pat-025-booking-recoverable.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T144514Z/sc-pat-032-appointment-detail.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T144514Z/sc-pat-032-appointment-detail-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T144514Z/sc-pat-048-invalid-prescription-fallback.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T144514Z/sc-pat-048-invalid-prescription-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T144514Z/sc-pat-054-seeded-health-metrics.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T144514Z/sc-pat-060-family-empty-state.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T144514Z/sc-pat-064-seeded-notifications.png`
- Notes:
  - Backend remained `UP`; the frontend had already been restored at turn start after the prior `127.0.0.1:3000` outage, so the browser pass continued on the fresh Vite session.
  - Patient navigation and recoverability checks closed cleanly: header profile entrypoint reached `/profile`, `/appointments/book` reopened in a usable retry state after the known payment-handoff failure, and `/appointments/1801` detail data remained internally consistent.
  - Invalid prescription navigation behaved safely enough to pass the fallback case: `/prescriptions/999999` produced a backend `404` but the UI recovered to `/medical-records` without a route crash.
  - To test remaining empty-state rows honestly, a second real-mode patient account (`patient.1@healthflow.vn`) was used. That account provided a valid family empty state, but health metrics and notifications were already seeded, so `SC-PAT-054` and `SC-PAT-064` were closed as blocked by dataset constraints rather than guessed.
- Next target:
  - Shift into the unstarted doctor high-priority catalog `SC-DOC-001`, `SC-DOC-002`, `SC-DOC-003`, `SC-DOC-007`, and `SC-DOC-008`, then continue broader doctor coverage. Revisit blocked patient data-dependent rows only after fresh empty/record-bearing patient data becomes available, and recheck payment-history rows only if `BUG-013` clears.

### 2026-03-17T14:59:32Z
- Agent turn: 21
- Focus: first doctor high-priority batch across dashboard, appointments, and weekly schedule management
- Cases touched: SC-DOC-001, SC-DOC-002, SC-DOC-003, SC-DOC-005, SC-DOC-007, SC-DOC-008
- Outcome: 6 passed
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T145610Z/sc-doc-001-dashboard.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T145610Z/sc-doc-003-appointments.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T145610Z/sc-doc-007-schedule.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T145610Z/sc-doc-008-schedule-saved.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T145610Z/sc-doc-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T145610Z/sc-doc-console.log`
- Notes:
  - Backend stayed `UP`; the frontend Vite app had dropped again at turn start and was restarted on `http://127.0.0.1:3000` before the doctor-role pass.
  - Doctor dashboard coverage was healthy: the route rendered, key cards and quick actions were visible, and no new route-specific regression blocked use despite the already known duplicate-sidebar-key warnings.
  - `/doctor/appointments` rendered cleanly and also provided a graceful empty-state message, allowing the adjacent empty-state row to be closed in the same pass.
  - `/schedule` rendered the weekly editor, a valid Friday update saved with visible success feedback, backend schedule writes completed successfully, and the original Friday hours were restored immediately afterward to preserve deterministic expectations for later turns.
- Next target:
  - Continue the unstarted doctor high-priority catalog with `SC-DOC-011`, `SC-DOC-015`, `SC-DOC-024`, `SC-DOC-025`, `SC-DOC-026`, `SC-DOC-027`, and `SC-DOC-028`, then close adjacent medium doctor rows on the same surfaces.

### 2026-03-17T15:08:57Z
- Agent turn: 22
- Focus: doctor patients, create-medical-record entry behavior, and consultation queue/detail coverage
- Cases touched: SC-DOC-011, SC-DOC-014, SC-DOC-015, SC-DOC-016, SC-DOC-017, SC-DOC-018, SC-DOC-024, SC-DOC-025, SC-DOC-026, SC-DOC-027, SC-DOC-028
- Outcome: 4 passed, 4 failed, 3 blocked
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-011-patients.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-015-create-record-redirected.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-015-create-record-unavailable.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-024-consultations-list.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-026-consultation-detail.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-turn22-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-turn22-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T150151Z/sc-doc-turn22-network-final.log`
- Notes:
  - Backend stayed `UP`; the frontend Vite app had dropped again at turn start and was restarted on `http://127.0.0.1:3000` before continuing with the existing doctor session.
  - `/patients` rendered and closed both the primary route row and the adjacent empty-state row because the current doctor dataset still has no assigned patients.
  - The create-medical-record entrypoint is currently broken for no-context access: direct navigation to `/doctor/create-medical-record` bounced back to `/doctor/appointments` instead of opening a form or presenting a stable explanation, logged as `BUG-026`. Because the doctor dataset also has no appointment rows, the positive and cross-doctor medical-record cases remained blocked.
  - Consultation coverage advanced on the existing active consultation `801`: the list rendered, detail opened, and a doctor reply posted successfully via Enter (`POST /api/messages => 201`). Two defects remain: the send button is obstructed by the floating chatbot widget (`BUG-027`), and the detail page still reproduces the known STOMP/frame-handler exception from `BUG-003`.
- Next target:
  - Continue the remaining medium doctor surfaces while the doctor session is active: `SC-DOC-019`, `SC-DOC-020`, `SC-DOC-022`, `SC-DOC-023`, `SC-DOC-029`, `SC-DOC-030`, `SC-DOC-031`, `SC-DOC-032`, `SC-DOC-033`, and `SC-DOC-034`. Retry blocked doctor data-dependent rows only after a pending consultation or valid appointment context is available.

### 2026-03-17T15:19:42Z
- Agent turn: 23
- Focus: doctor profile/settings, consultation edge routes, messages redirect, and analytics coverage
- Cases touched: SC-DOC-019, SC-DOC-020, SC-DOC-022, SC-DOC-023, SC-DOC-029, SC-DOC-030, SC-DOC-031, SC-DOC-032, SC-DOC-033, SC-DOC-034
- Outcome: 8 passed, 2 failed
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/sc-doc-019-profile.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/sc-doc-020-profile-save-success.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/sc-doc-022-security.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/sc-doc-023-notifications-settings.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/sc-doc-031-messages-redirect.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/sc-doc-032-analytics.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/bug-doc-consultation-invalid-route.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/bug-doc-consultation-unauthorized-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/bug-doc-consultation-unauthorized-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/bug-doc-consultation-invalid-route-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T151319Z/bug-doc-consultation-invalid-route-console.log`
- Notes:
  - Backend stayed `UP`; the frontend Vite app had dropped again at turn start and was restarted on `http://127.0.0.1:3000` before continuing with the doctor session.
  - Doctor profile/settings coverage was healthy: `/profile`, `/profile/security`, and `/profile/notifications` all rendered correctly, and a valid unique phone save succeeded before the original phone number was restored.
  - `/messages` redirected cleanly to `/consultations`, and doctor analytics rendered with graceful no-data states while the period filter refreshed cleanly from `6 tháng gần nhất` to `3 tháng gần nhất`.
  - Invalid consultation edge routes are now isolated as `BUG-028`: both unauthorized and nonexistent detail URLs fell back to the queue only after duplicate backend errors, repeated `Failed to load consultation`, and invalid realtime subscription activity.
- Next target:
  - Shift into the highest-priority unstarted admin catalog next: `SC-ADM-001`, `SC-ADM-003`, `SC-ADM-004`, `SC-ADM-005`, `SC-ADM-006`, `SC-ADM-010`, and `SC-ADM-011`. Revisit blocked doctor rows `SC-DOC-016`, `SC-DOC-018`, and `SC-DOC-025` only after valid appointment or pending-consultation context becomes available.

### 2026-03-17T15:31:42Z
- Agent turn: 24
- Focus: admin dashboard, users management, and doctor-management high-priority coverage
- Cases touched: SC-ADM-001, SC-ADM-003, SC-ADM-004, SC-ADM-005, SC-ADM-006, SC-ADM-010, SC-ADM-011
- Outcome: 5 passed, 2 failed
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/sc-adm-001-dashboard.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/sc-adm-003-users.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/sc-adm-004-user-search.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/sc-adm-005-user-edit-modal.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/bug-adm-user-save-503.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/bug-adm-user-save-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/bug-adm-user-save-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/sc-adm-010-doctors.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/bug-adm-doctor-search-crash.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/bug-adm-doctor-search-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T152720Z/sc-adm-doctors-network.log`
- Notes:
  - Backend stayed `UP`; the frontend Vite app had dropped again at turn start and was restarted on `http://127.0.0.1:3000` before the admin-role pass.
  - Admin dashboard, `/users`, and `/doctors` all rendered successfully, and the users search flow narrowed correctly to the admin seed account.
  - The admin user edit modal rendered seeded values, but the first valid save attempt failed with `PUT /api/users/225 => 503 Service Unavailable` and the toast `Không thể lưu người dùng`, logged as `BUG-029`.
  - The admin doctor search path is currently unstable: typing `Sarah` into the search box crashed the page to a blank screen with `TypeError: Cannot read properties of undefined (reading 'toLowerCase')` from `DoctorManagement.jsx`, logged as `BUG-030`.
  - After the failed user-save reproduction, the admin name was restored manually to `Admin System` so the seeded baseline remains usable for later turns.
- Next target:
  - Continue the remaining admin route coverage next: `SC-ADM-015`, `SC-ADM-019`, `SC-ADM-024`, `SC-ADM-028`, `SC-ADM-029`, and `SC-ADM-030`, then close adjacent admin medium checks `SC-ADM-002`, `SC-ADM-016`, `SC-ADM-017`, `SC-ADM-020`, `SC-ADM-021`, `SC-ADM-025`, `SC-ADM-026`, and `SC-ADM-027`. Revisit blocked doctor rows `SC-DOC-016`, `SC-DOC-018`, and `SC-DOC-025` only after fresh appointment or pending-consultation context is available.

### 2026-03-17T15:41:14Z
- Agent turn: 25
- Focus: admin clinics, services, rooms, and reports coverage
- Cases touched: SC-ADM-015, SC-ADM-016, SC-ADM-017, SC-ADM-019, SC-ADM-020, SC-ADM-021, SC-ADM-024, SC-ADM-025, SC-ADM-028, SC-ADM-029, SC-ADM-030
- Outcome: 10 passed, 1 failed
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/sc-adm-015-clinics.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/sc-adm-016-clinic-search.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/sc-adm-017-clinic-edit-modal.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/sc-adm-019-services.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/sc-adm-020-service-search.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/sc-adm-021-service-filter.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/sc-adm-024-rooms.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/sc-adm-025-room-search.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/sc-adm-028-reports.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/sc-adm-029-report-tabs.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/bug-adm-reports-date-range-503.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/bug-adm-reports-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T153445Z/bug-adm-reports-console.log`
- Notes:
  - Backend health stayed `UP`; the Vite frontend had dropped again at turn start and was restarted on `http://127.0.0.1:3000` before continuing in the admin session.
  - `/admin/clinics`, `/admin/services`, and `/admin/rooms` all rendered correctly, and the clinic edit save path succeeded with a temporary ASCII description before the original seeded description was restored.
  - Service search/category filtering and room search/filtering behaved correctly without route crashes or blank states beyond expected empty-state messaging.
  - `/admin/reports` rendered and report-tab switching stayed stable, but changing the date range still triggered `503 Service Unavailable` failures for all three report datasets, isolated as `BUG-031`.
- Next target:
  - Continue the remaining admin medium coverage next: `SC-ADM-002`, `SC-ADM-022`, `SC-ADM-026`, `SC-ADM-027`, `SC-ADM-031`, `SC-ADM-032`, `SC-ADM-033`, `SC-ADM-034`, `SC-ADM-035`, and `SC-ADM-036`. Revisit blocked doctor rows `SC-DOC-016`, `SC-DOC-018`, and `SC-DOC-025` only after fresh appointment or pending-consultation context is available.

### 2026-03-17T15:53:07Z
- Agent turn: 26
- Focus: remaining admin medium coverage across dashboard widgets, service/room edits, reports controls, and admin profile
- Cases touched: SC-ADM-002, SC-ADM-022, SC-ADM-026, SC-ADM-027, SC-ADM-031, SC-ADM-032, SC-ADM-033, SC-ADM-034, SC-ADM-035, SC-ADM-036
- Outcome: 6 passed, 4 failed
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-002-dashboard-widgets.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-022-service-edit-modal.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-026-room-edit-modal.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/bug-adm-room-invalid-save-succeeded.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/bug-adm-room-invalid-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-031-grouping-blocked.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-033-export-failed.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-reports-medium-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-reports-medium-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/sc-adm-034-profile.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/bug-adm-profile-invalid-phone-500.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/bug-adm-profile-invalid-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T154343Z/bug-adm-profile-invalid-console.log`
- Notes:
  - Backend health stayed `UP`; the Vite frontend had dropped again at turn start and was restarted on `http://127.0.0.1:3000` before continuing the admin pass.
  - Admin dashboard widgets, service edit save, room edit save, report no-data handling, and admin profile render/save all behaved correctly; the original admin phone number `0909999003` was restored after testing.
  - Invalid room capacity save is now isolated as `BUG-032`: capacity `0` was accepted and persisted with a success toast instead of validation.
  - Reports controls are further degraded beyond `BUG-031`: switching grouping to `Tuần` triggers backend `500` responses, and `Xuất PDF` returns `503` with no download event, logged as `BUG-034`.
  - Invalid admin profile phone input reproduces another shared `/api/profile` validation gap: `PUT /api/profile => 500` with only a generic support toast, logged as `BUG-033`.
- Next target:
  - Shift to the highest-priority untested auth and cross-role coverage next: `SC-AUTH-001`, `SC-AUTH-005`, `SC-AUTH-006`, `SC-AUTH-007`, `SC-AUTH-008`, `SC-AUTH-009`, `SC-AUTH-027`, `SC-AUTH-028`, `SC-AUTH-029`, `SC-AUTH-030`, `SC-AUTH-031`, then `SC-X-001`, `SC-X-002`, `SC-X-005`, and `SC-X-009` through `SC-X-016`.

### 2026-03-17T16:09:18Z
- Agent turn: 27
- Focus: high-priority auth coverage plus admin authorization redirects
- Cases touched: SC-AUTH-001, SC-AUTH-005, SC-AUTH-006, SC-AUTH-007, SC-AUTH-008, SC-AUTH-009, SC-AUTH-027, SC-AUTH-028, SC-AUTH-029, SC-AUTH-030, SC-AUTH-031, SC-X-013, SC-X-014
- Outcome: 12 passed, 1 failed
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-031-logout-to-login.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-005-login-render.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-001-landing.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-027-dashboard-redirect-login.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-028-patient-route-redirect-login.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-029-doctor-route-redirect-login.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-030-admin-route-redirect-login.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-009-invalid-login.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-invalid-login-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-invalid-login-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-006-patient-login-dashboard.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-007-doctor-login-dashboard.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-doctor-login-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-008-admin-login-dashboard.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-x-013-admin-patient-route-denied.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-x-014-admin-doctor-route-denied.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-turn27-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260317T160023Z/sc-auth-turn27-console.log`
- Notes:
  - Backend health stayed `UP`; the Vite frontend had dropped again at turn start and was restarted on `http://127.0.0.1:3000` before continuing the auth pass.
  - Public landing, login-page render, patient login, doctor login, admin login, logged-out protected-route redirects, and explicit admin logout all behaved correctly in real backend mode.
  - Invalid credentials still reproduce the existing auth-feedback defect from `BUG-001`: `POST /api/auth/login => 401` returns no visible inline or toast error on `/login`.
  - While authenticated as admin, direct navigation to `/appointments/book` and `/doctor/appointments` correctly redirected back to `/dashboard`, so patient and doctor surfaces were not exposed cross-role.
- Next target:
  - Continue the remaining highest-priority cross-role and validation coverage next: `SC-X-001`, `SC-X-002`, `SC-X-005`, `SC-X-009`, `SC-X-010`, `SC-X-011`, `SC-X-012`, `SC-X-015`, and `SC-X-016`, then resume the unstarted medium auth rows `SC-AUTH-013`, `SC-AUTH-017`, `SC-AUTH-018`, `SC-AUTH-019`, `SC-AUTH-022`, `SC-AUTH-023`, `SC-AUTH-032`, and `SC-AUTH-034` through `SC-AUTH-039`.

### 2026-03-18T12:47:40Z
- Agent turn: 28
- Focus: E2E reseed, medium auth closure, and the remaining high-priority cross-role/session matrix
- Cases touched: SC-AUTH-013, SC-AUTH-017, SC-AUTH-018, SC-AUTH-019, SC-AUTH-022, SC-AUTH-023, SC-AUTH-032, SC-AUTH-034, SC-AUTH-035, SC-AUTH-036, SC-AUTH-037, SC-AUTH-038, SC-AUTH-039, SC-X-001, SC-X-002, SC-X-005, SC-X-009, SC-X-010, SC-X-011, SC-X-012, SC-X-016
- Outcome: 20 passed, 1 failed
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-013-register.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-017-register-success.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-017-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-018-forgot-password.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-019-forgot-password-success.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-022-verify-email-invalid.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-023-verify-phone.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-x-001-security-mismatch.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-x-002-doctor-invalid-phone.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-x-005-reports-service-unavailable.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-x-005-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-034-patient-doctor-route-denied.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-036-doctor-patient-route-denied.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-auth-038-admin-patient-route-denied.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T123622Z/sc-x-016-admin-refresh.png`
- Notes:
  - Re-seeded the real backend deterministically with `E2E_SKIP_DOCKER_START=true npm run test:e2e:prepare` and restarted the Vite frontend on `http://127.0.0.1:3000` before testing.
  - Closed the remaining unstarted medium auth render/recovery/session rows: register, forgot-password, verify-email invalid state, verify-phone render, authenticated refresh, and the patient/doctor/admin cross-role route denials all behaved correctly.
  - A first valid registration submit briefly returned `503`, but rerunning the same case with fresh unique credentials succeeded end-to-end and created a new patient account; the row was closed `Passed` with the successful path and a note about the transient earlier response.
  - Reproduced the known doctor invalid-phone regression again for `SC-X-002`: invalid phone input still drives `PUT /api/profile => 500` and only a generic support message, so `BUG-007` now covers the new row.
  - `SC-X-005` also closed `Passed`: admin reports still hit the known `503` backend outage, but the page handled it with a clear service-unavailable banner and non-crashing fallback UI.
- Next target:
  - Finish the remaining unstarted cross-cutting rows next, led by `SC-X-015`, then `SC-X-003`, `SC-X-004`, `SC-X-006`, `SC-X-007`, `SC-X-008`, `SC-X-017`, and `SC-X-018`, before shifting back to the broader pool of untouched patient/doctor/admin cases.

### 2026-03-18T13:30:33Z
- Agent turn: 29
- Focus: real-mode reseed recovery, frontend restore, and the remaining unstarted `SC-X-*` resilience/session slice
- Cases touched: SC-X-003, SC-X-004, SC-X-006, SC-X-007, SC-X-008, SC-X-015, SC-X-017, SC-X-018
- Outcome: 8 passed
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T131438Z/sc-x-003-admin-required-name.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T131438Z/sc-x-004-doctor-double-submit-stable.jpeg`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T131438Z/sc-x-006-missing-appointment-id-fallback.jpeg`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T131438Z/sc-x-007-doctor-appointments-empty-state.jpeg`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T131438Z/sc-x-008-inline-error-mismatch.jpeg`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T131438Z/sc-x-008-ui-state-observations.txt`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T131438Z/sc-x-017-patient-back-after-logout.jpeg`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T131438Z/sc-x-018-admin-direct-route.jpeg`
- Notes:
  - Re-ran `E2E_SKIP_DOCKER_START=true npm run test:e2e:prepare` to restore deterministic backend state, then restarted the Vite frontend on `http://127.0.0.1:3000` after finding the app down at turn start.
  - Closed the remaining unstarted cross-cutting validation/session rows without introducing new product bugs: admin required-name validation held, repeated doctor schedule submit stayed stable, missing patient entity routes fell back safely, empty-state modules remained readable, and bookmark/logout-back behavior held across all three roles.
  - MCP Playwright’s primary browser transport dropped mid-turn, so the live checks continued in the Playwright record session; the application behavior stayed consistent across both MCP browser sessions.
  - This turn also captured a concise console/network export note under `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T131438Z/sc-x-turn-console-network.txt`.
- Next target:
  - Continue the remaining unstarted cross-cutting rows next: `SC-X-019`, `SC-X-020`, `SC-X-021`, `SC-X-022`, `SC-X-023`, `SC-X-024`, `SC-X-025`, `SC-X-026`, `SC-X-027`, `SC-X-028`, `SC-X-029`, `SC-X-030`, `SC-X-031`, and `SC-X-032`.

### 2026-03-18T13:47:54Z
- Agent turn: 30
- Focus: real-mode frontend recovery, cross-cutting console/network coverage, realtime validation, and restart/resilience checks
- Cases touched: SC-X-019, SC-X-020, SC-X-021, SC-X-022, SC-X-023, SC-X-024, SC-X-025, SC-X-026
- Outcome: 4 passed, 4 failed
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-020-patient-dashboard-aggregate-500.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-019-020-025-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-019-020-025-network.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-021-patient-consultation-stomp-warning.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-021-022-patient-console.log`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-022-patient-message-visible.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-022-doctor-message-visible.jpeg`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-023-recovered-after-frontend-restart.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-024-controlled-api-failure-fallback.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T133547Z/sc-x-026-consultation-persists-after-reload.png`
- Notes:
  - Re-seeded the real backend with `E2E_SKIP_DOCKER_START=true npm run test:e2e:prepare`, restarted the Vite frontend after finding it down at turn start, and kept the turn bounded to `SC-X-019` through `SC-X-026`.
  - Core-flow monitoring immediately reconfirmed two existing cross-cutting regressions: patient dashboard aggregate stats still return unexpected `500` responses (`BUG-002`), and authenticated routes still emit duplicate React key warnings (`BUG-006`).
  - Realtime detail coverage split cleanly: live message delivery between seeded patient `patient.52@healthflow.vn` and doctor `doctor.27@healthflow.vn` on consultation `427` worked end-to-end, but consultation startup still reproduced the STOMP/frame-handler exception already tracked in `BUG-003`.
  - A real frontend restart test passed: after stopping Vite and bringing it back on `127.0.0.1:3000`, the active patient consultation route recovered and remained usable.
  - A forced temporary `503` on `GET /api/messages/consultation/427` redirected the patient detail page back to `/patient/consultations` without a white screen or permanent spinner, so the degraded-state recovery path was closed `Passed`.
- Next target:
  - Finish the remaining unstarted cross-cutting/responsive rows next: `SC-X-027`, `SC-X-028`, `SC-X-029`, `SC-X-030`, `SC-X-031`, and `SC-X-032`.

### 2026-03-18T13:55:34Z
- Agent turn: 31
- Focus: final responsive/mobile and UX pass for the remaining unstarted cross-cutting rows
- Cases touched: SC-X-027, SC-X-028, SC-X-029, SC-X-030, SC-X-031, SC-X-032
- Outcome: 6 passed
- Artifacts:
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T135111Z/sc-x-027-mobile-login.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T135111Z/sc-x-028-mobile-patient-dashboard.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T135111Z/sc-x-029-mobile-doctor-schedule.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T135111Z/sc-x-030-mobile-admin-clinics.png`
  - `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/artifacts/20260318T135111Z/sc-x-031-032-observations.txt`
- Notes:
  - The frontend had dropped again at turn start and was restarted on `http://127.0.0.1:3000`; backend health remained `UP` on `:8080`.
  - The final six unstarted rows all closed `Passed` under a `390x844` mobile viewport: login, patient dashboard, doctor schedule, and admin clinics remained readable and actionable on mobile.
  - UX checks also closed `Passed`: the observed route transitions settled without permanent spinners, and the long clinic-card list stayed scannable without text overlap in the full-page capture.
  - No new product bug was introduced in this slice, and the catalog now has no `Not started` rows remaining.
- Next target:
  - If a follow-up loop is needed, use it only for blocked-row retries or failed-row revalidation after relevant fixes or environment changes.


---

## next-targets.md

# Next Targets

Update this file at the end of every loop turn so the same resumed agent can continue immediately.

## Priority Order
1. Untested High priority cases
2. Failed cases that need confirmation or narrower reproduction
3. Blocked cases that may be unblocked after environment changes
4. Medium priority coverage expansion

## Current Queue
- Catalog status:
  - No `Not started` rows remain in `coverage-status.md`.
- Highest-priority follow-up if another loop is needed:
  - Revalidate the newly reconfirmed cross-cutting regressions when fixes land:
    - `BUG-002` / `SC-X-020`
    - `BUG-003` / `SC-X-019`, `SC-X-021`
    - `BUG-006` / `SC-X-025`
  - Revalidate the open doctor profile validation regression when fixes land:
    - `BUG-007` / `SC-X-002`
- Retry doctor data-dependent blocked rows only after fresh context is available:
  - `SC-DOC-016`, `SC-DOC-018`, `SC-DOC-025`
- Reconfirm payment-history cases only after the service outage clears:
  - `SC-PAT-020`, `SC-PAT-036`, `SC-PAT-037`, `SC-PAT-038`, `SC-PAT-041`
- Revisit blocked patient data-dependent rows only after fresh data is available:
  - `SC-PAT-044`, `SC-PAT-047`, `SC-PAT-054`, `SC-PAT-064`
- Revalidate open bugs if related fixes land:
  - `BUG-001`, `BUG-003`, `BUG-013`, `BUG-022`, `BUG-023`, `BUG-024`, `BUG-025`, `BUG-026`, `BUG-027`, `BUG-028`, `BUG-029`, `BUG-030`, `BUG-031`, `BUG-032`, `BUG-033`, `BUG-034`
