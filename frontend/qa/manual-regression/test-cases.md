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
