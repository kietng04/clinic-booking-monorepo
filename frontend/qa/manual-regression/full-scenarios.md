# Full Scenario Catalog

This file is the expanded scenario inventory for the current frontend scope.

Purpose:
- Capture a much broader set of manual test scenarios than the 47-case regression ledger.
- Serve as the source for thesis reporting, future loop runs, and scenario-to-test-case expansion.
- Separate "full scenario thinking" from the smaller execution-oriented checklist in `test-cases.md`.

Notes:
- This is a scenario catalog, not a claim that all scenarios have already been executed.
- It is "full" relative to the currently implemented frontend scope, known routes, existing E2E specs, and visible workflows.
- If new features or hidden admin flows appear, append more scenarios instead of overloading old IDs.

Status legend for future use:
- `Planned`
- `Executed`
- `Blocked`
- `Deferred`

## Scenario Structure

Each scenario includes:
- ID
- Area
- Priority
- Preconditions
- Core action
- Expected result

## 1. Public, Landing, And Auth

| ID | Area | Priority | Preconditions | Core Action | Expected Result |
| --- | --- | --- | --- | --- | --- |
| SC-AUTH-001 | Landing | High | Logged out | Open `/` | Landing page renders without crash |
| SC-AUTH-002 | Landing | Medium | Logged out | Verify hero, CTA, and key sections on `/` | Core marketing content is visible and readable |
| SC-AUTH-003 | Landing | Medium | Logged out | Click primary CTA from landing | User reaches intended auth or booking entrypoint |
| SC-AUTH-004 | Landing | Medium | Logged out | Open chatbot/help widget if present on landing | Widget opens without breaking page layout |
| SC-AUTH-005 | Auth | High | Logged out | Open `/login` | Login form renders and accepts input |
| SC-AUTH-006 | Auth | High | Logged out | Login with valid patient account | Redirects to patient dashboard |
| SC-AUTH-007 | Auth | High | Logged out | Login with valid doctor account | Redirects to doctor dashboard |
| SC-AUTH-008 | Auth | High | Logged out | Login with valid admin account | Redirects to admin dashboard |
| SC-AUTH-009 | Auth | High | Logged out | Submit invalid email/password on login | User stays unauthenticated and sees actionable error |
| SC-AUTH-010 | Auth | Medium | Logged out | Submit login with empty fields | Client-side validation prevents invalid submission |
| SC-AUTH-011 | Auth | Medium | Logged out | Submit login with malformed email | Validation message is shown |
| SC-AUTH-012 | Auth | Medium | Logged out | Use quick-login shortcut if present | Shortcut signs in the selected role correctly |
| SC-AUTH-013 | Auth | High | Logged out | Open `/register` | Registration page renders correctly |
| SC-AUTH-014 | Auth | Medium | Logged out | Submit register form with empty mandatory fields | Validation messages are shown |
| SC-AUTH-015 | Auth | Medium | Logged out | Submit register form with mismatched passwords | Mismatch validation is shown |
| SC-AUTH-016 | Auth | Medium | Logged out | Submit register form with duplicate or invalid data | Server-side or UI error is shown gracefully |
| SC-AUTH-017 | Auth | Medium | Logged out | Complete a valid registration flow if backend permits | Account is created or system returns explicit controlled denial |
| SC-AUTH-018 | Auth Recovery | Medium | Logged out | Open `/forgot-password` | Forgot-password form renders |
| SC-AUTH-019 | Auth Recovery | Medium | Logged out | Submit forgot-password with valid email | Success confirmation is shown |
| SC-AUTH-020 | Auth Recovery | Medium | Logged out | Submit forgot-password with malformed email | Validation feedback appears |
| SC-AUTH-021 | Auth Recovery | Low | Logged out | Submit forgot-password with unknown email | System does not crash and handles the case safely |
| SC-AUTH-022 | Verification | Medium | Logged out | Open `/verify-email` with no token or invalid token | Graceful invalid/expired verification state is shown |
| SC-AUTH-023 | Verification | Medium | Logged out | Open `/verify-phone` | OTP UI renders correctly |
| SC-AUTH-024 | Verification | Medium | Logged out | Try verify-phone with incomplete OTP | Verify action stays disabled or validation blocks submission |
| SC-AUTH-025 | Verification | Low | Logged out | Use resend OTP action if available | UI updates without crashing |
| SC-AUTH-026 | Reset | Low | Logged out | Open `/reset-password` without token context | Graceful invalid state or neutral reset form is shown |
| SC-AUTH-027 | Access Control | High | Logged out | Open `/dashboard` directly | Redirects to `/login` or denies access safely |
| SC-AUTH-028 | Access Control | High | Logged out | Open a patient-only route directly | Redirect or denial works correctly |
| SC-AUTH-029 | Access Control | High | Logged out | Open a doctor-only route directly | Redirect or denial works correctly |
| SC-AUTH-030 | Access Control | High | Logged out | Open an admin-only route directly | Redirect or denial works correctly |
| SC-AUTH-031 | Session | High | Logged in | Use logout action from top-nav/profile menu | Session is cleared and user returns to public state |
| SC-AUTH-032 | Session | Medium | Logged in | Refresh browser on an authenticated route | Session persists or fails explicitly and consistently |
| SC-AUTH-033 | Session | Medium | Logged in | Open a new tab with protected route | Session handling is consistent across tabs |
| SC-AUTH-034 | Session | Medium | Logged in as patient | Attempt to open doctor route | Redirects or blocks access |
| SC-AUTH-035 | Session | Medium | Logged in as patient | Attempt to open admin route | Redirects or blocks access |
| SC-AUTH-036 | Session | Medium | Logged in as doctor | Attempt to open patient route | Redirects or blocks access |
| SC-AUTH-037 | Session | Medium | Logged in as doctor | Attempt to open admin route | Redirects or blocks access |
| SC-AUTH-038 | Session | Medium | Logged in as admin | Attempt to open patient route | Redirects or blocks access |
| SC-AUTH-039 | Session | Medium | Logged in as admin | Attempt to open doctor route | Redirects or blocks access |

## 2. Patient Dashboard And Navigation

| ID | Area | Priority | Preconditions | Core Action | Expected Result |
| --- | --- | --- | --- | --- | --- |
| SC-PAT-001 | Dashboard | High | Logged in as patient | Open `/dashboard` | Dashboard renders without route crash |
| SC-PAT-002 | Dashboard | High | Logged in as patient | Validate summary cards and widgets | Core dashboard modules appear |
| SC-PAT-003 | Dashboard | High | Logged in as patient | Observe network/console on dashboard load | No unexpected 5xx or JS exceptions |
| SC-PAT-004 | Navigation | High | Logged in as patient | Use sidebar to move to appointments | Correct route transition occurs |
| SC-PAT-005 | Navigation | Medium | Logged in as patient | Use sidebar to move to doctor search | Correct route transition occurs |
| SC-PAT-006 | Navigation | Medium | Logged in as patient | Use sidebar to move to records, metrics, family, notifications | All links work |
| SC-PAT-007 | Navigation | Medium | Logged in as patient | Use header/profile entrypoints to profile pages | Navigation works without dead links |

## 3. Patient Doctor Search And Discovery

| ID | Area | Priority | Preconditions | Core Action | Expected Result |
| --- | --- | --- | --- | --- | --- |
| SC-PAT-008 | Doctor Search | High | Logged in as patient | Open `/find-doctors` | Doctor search page renders |
| SC-PAT-009 | Doctor Search | High | Logged in as patient | Search by doctor name | Results filter correctly |
| SC-PAT-010 | Doctor Search | High | Logged in as patient | Search by specialty text | Matching doctors are shown |
| SC-PAT-011 | Doctor Search | Medium | Logged in as patient | Clear search/filter inputs | Full list is restored |
| SC-PAT-012 | Doctor Search | Medium | Logged in as patient | Open a doctor card/detail affordance if present | Doctor info renders correctly |
| SC-PAT-013 | Doctor Search | Medium | Logged in as patient | Use booking CTA from search results | User reaches booking flow with selected doctor context |
| SC-PAT-014 | Doctor Search | Low | Logged in as patient | Search with no-match keyword | Graceful empty state is shown |

## 4. Patient Appointment Booking

| ID | Area | Priority | Preconditions | Core Action | Expected Result |
| --- | --- | --- | --- | --- | --- |
| SC-PAT-015 | Booking | High | Logged in as patient | Open `/appointments/book` | Booking wizard/form renders |
| SC-PAT-016 | Booking | High | Logged in as patient | Start booking from preselected doctor | Doctor context is preserved |
| SC-PAT-017 | Booking | High | Logged in as patient | Select doctor, date, time, notes, and continue | Flow advances correctly between steps |
| SC-PAT-018 | Booking | High | Logged in as patient | Submit a valid booking | Appointment is created or redirected into payment flow |
| SC-PAT-019 | Booking | High | Logged in as patient | Verify new appointment appears in appointments list | Newly created appointment is visible |
| SC-PAT-020 | Booking | High | Logged in as patient | Verify payment handoff if booking requires it | Redirect to payment page/gateway happens correctly |
| SC-PAT-021 | Booking | Medium | Logged in as patient | Attempt booking with missing mandatory fields | Validation blocks progress |
| SC-PAT-022 | Booking | Medium | Logged in as patient | Attempt booking with invalid date/time combination | System blocks invalid slot selection |
| SC-PAT-023 | Booking | Medium | Logged in as patient | Go backward and forward through booking steps | State is preserved correctly |
| SC-PAT-024 | Booking | Medium | Logged in as patient | Cancel or abandon booking mid-flow | UI exits safely without ghost state |
| SC-PAT-025 | Booking | Medium | Logged in as patient | Retry after one failed booking or payment handoff | Flow stays recoverable |

## 5. Patient Appointments And Appointment Detail

| ID | Area | Priority | Preconditions | Core Action | Expected Result |
| --- | --- | --- | --- | --- | --- |
| SC-PAT-026 | Appointments | High | Logged in as patient | Open `/appointments` | Appointment list renders |
| SC-PAT-027 | Appointments | High | Logged in as patient with seeded appointments | Inspect statuses and metadata in list | Cards/rows show correct data |
| SC-PAT-028 | Appointments | Medium | Logged in as patient | Open an appointment detail page | Detail page renders correctly |
| SC-PAT-029 | Appointments | Medium | Logged in as patient | Use cancel action if available | Appointment state changes or system denies safely |
| SC-PAT-030 | Appointments | Medium | Logged in as patient | Use reschedule affordance if present | Flow opens or system states feature is unavailable |
| SC-PAT-031 | Appointments | Medium | Logged in as patient | Validate empty state when no appointments exist | Empty-state UI is graceful |
| SC-PAT-032 | Appointment Detail | Medium | Logged in as patient | Verify doctor, time, location, reason, notes, payment summary | Detail data is consistent |
| SC-PAT-033 | Appointment Detail | Medium | Logged in as patient | Use detail quick actions | Actions navigate correctly or fail gracefully |
| SC-PAT-034 | Appointment Detail | Low | Logged in as patient | Open non-existent appointment ID | Graceful not-found or safe fallback is shown |

## 6. Patient Payments And Payment Result

| ID | Area | Priority | Preconditions | Core Action | Expected Result |
| --- | --- | --- | --- | --- | --- |
| SC-PAT-035 | Payments | High | Logged in as patient | Open `/payments` | Payment history page renders |
| SC-PAT-036 | Payments | High | Logged in as patient with prior order | Verify pending/completed payment row appears | Payment entry is visible and readable |
| SC-PAT-037 | Payments | Medium | Logged in as patient | Search payment by order code | Results filter correctly |
| SC-PAT-038 | Payments | Medium | Logged in as patient | Filter payments by method or status | Filtering works without crash |
| SC-PAT-039 | Payments | Medium | Logged in as patient | Open payment result/return route if reachable | Result page renders correct success/failure state |
| SC-PAT-040 | Payments | Medium | Logged in as patient | Validate return from payment provider with missing params | Graceful error or neutral state is shown |
| SC-PAT-041 | Payments | Medium | Logged in as patient | Continue from payment history into related appointment | Cross-linking works correctly |
| SC-PAT-042 | Payments | Low | Logged in as patient | Check empty-state payment history | Empty-state UI is correct |

## 7. Patient Medical Records, Prescriptions, And Health Metrics

| ID | Area | Priority | Preconditions | Core Action | Expected Result |
| --- | --- | --- | --- | --- | --- |
| SC-PAT-043 | Medical Records | High | Logged in as patient | Open `/medical-records` | Records list renders |
| SC-PAT-044 | Medical Records | High | Logged in as patient | Open one record detail if available | Record detail renders |
| SC-PAT-045 | Medical Records | Medium | Logged in as patient | Validate empty-state records when none exist | Empty-state is graceful |
| SC-PAT-046 | Medical Records | Low | Logged in as patient | Open non-existent medical record ID | Graceful not-found behavior appears |
| SC-PAT-047 | Prescriptions | Medium | Logged in as patient | Open linked prescription detail if available | Prescription view renders correctly |
| SC-PAT-048 | Prescriptions | Low | Logged in as patient | Open invalid prescription ID | Safe fallback or error message is shown |
| SC-PAT-049 | Health Metrics | High | Logged in as patient | Open `/health-metrics` | Metrics page renders |
| SC-PAT-050 | Health Metrics | High | Logged in as patient | Add a valid blood pressure metric | Entry saves successfully |
| SC-PAT-051 | Health Metrics | Medium | Logged in as patient | Add another metric type if UI supports it | Additional metric persists correctly |
| SC-PAT-052 | Health Metrics | Medium | Logged in as patient | Verify newly added metric appears in cards/chart | Data refreshes correctly |
| SC-PAT-053 | Health Metrics | Medium | Logged in as patient | Submit metric form with invalid value/text | Validation prevents bad submission or error is graceful |
| SC-PAT-054 | Health Metrics | Low | Logged in as patient | Validate empty-state charts before first entry | Empty-state is informative and stable |

## 8. Patient Family And Notifications

| ID | Area | Priority | Preconditions | Core Action | Expected Result |
| --- | --- | --- | --- | --- | --- |
| SC-PAT-055 | Family | High | Logged in as patient | Open `/family` | Family management page renders |
| SC-PAT-056 | Family | High | Logged in as patient | Add a valid family member | Family member persists and appears in list |
| SC-PAT-057 | Family | Medium | Logged in as patient with family entry | Edit a family member | Updated data is saved |
| SC-PAT-058 | Family | Medium | Logged in as patient with family entry | Delete a family member | Entry is removed or explicit confirmation is required |
| SC-PAT-059 | Family | Medium | Logged in as patient | Submit family form with missing required fields | Validation is shown |
| SC-PAT-060 | Family | Low | Logged in as patient | Verify empty-state family page | Empty-state is graceful |
| SC-PAT-061 | Notifications | Medium | Logged in as patient | Open `/notifications` | Notifications page renders |
| SC-PAT-062 | Notifications | Medium | Logged in as patient | Switch notification categories/tabs | UI updates correctly |
| SC-PAT-063 | Notifications | Medium | Logged in as patient | Mark read or use available row action if present | Item state changes correctly |
| SC-PAT-064 | Notifications | Low | Logged in as patient | Verify empty-state notification list | Empty-state is graceful |

## 9. Patient Consultation And Messaging

| ID | Area | Priority | Preconditions | Core Action | Expected Result |
| --- | --- | --- | --- | --- | --- |
| SC-PAT-065 | Consultation | High | Logged in as patient | Open `/patient/consultations` | Consultation list renders |
| SC-PAT-066 | Consultation | High | Logged in as patient | Open new consultation request flow | Request form renders |
| SC-PAT-067 | Consultation | High | Logged in as patient | Create a valid consultation request | New request is created in `PENDING` state |
| SC-PAT-068 | Consultation | High | Logged in as patient | Open newly created consultation detail | Detail page renders |
| SC-PAT-069 | Consultation | High | Logged in as patient | Send a consultation message if chat is available | Message is sent successfully |
| SC-PAT-070 | Consultation | High | Logged in as patient | Observe realtime/websocket initialization | No unexpected realtime JS exception occurs |
| SC-PAT-071 | Consultation | Medium | Logged in as patient | Create request with missing topic/message | Validation is shown |
| SC-PAT-072 | Consultation | Medium | Logged in as patient | Open unauthorized or foreign consultation ID | Access is blocked |
| SC-PAT-073 | Consultation | Low | Logged in as patient | Open non-existent consultation ID | Graceful not-found behavior appears |
| SC-PAT-074 | Messages | Low | Logged in as patient | Open `/messages` redirect | Redirect resolves to patient consultation route |

## 10. Patient Profile And Settings

| ID | Area | Priority | Preconditions | Core Action | Expected Result |
| --- | --- | --- | --- | --- | --- |
| SC-PAT-075 | Profile | High | Logged in as patient | Open `/profile` | Profile page renders with current data |
| SC-PAT-076 | Profile | High | Logged in as patient | Save profile with valid data | Success feedback is shown |
| SC-PAT-077 | Profile | Medium | Logged in as patient | Save profile with invalid phone/email if UI allows | Validation appears or server error is handled clearly |
| SC-PAT-078 | Security | High | Logged in as patient | Open `/profile/security` | Security page renders |
| SC-PAT-079 | Security | High | Logged in as patient | Submit mismatched new passwords | Validation message is shown |
| SC-PAT-080 | Security | Medium | Logged in as patient | Submit valid password change if environment permits | Password update succeeds or returns controlled server response |
| SC-PAT-081 | Notifications Settings | Medium | Logged in as patient | Open `/profile/notifications` | Notification-settings page renders |
| SC-PAT-082 | Notifications Settings | Medium | Logged in as patient | Toggle and save notification settings | Save succeeds and UI confirms it |

## 11. Doctor Dashboard, Appointments, And Schedule

| ID | Area | Priority | Preconditions | Core Action | Expected Result |
| --- | --- | --- | --- | --- | --- |
| SC-DOC-001 | Dashboard | High | Logged in as doctor | Open `/dashboard` | Doctor dashboard renders |
| SC-DOC-002 | Dashboard | High | Logged in as doctor | Verify doctor quick actions and cards | Key widgets are visible |
| SC-DOC-003 | Appointments | High | Logged in as doctor | Open `/doctor/appointments` | Doctor appointments page renders |
| SC-DOC-004 | Appointments | High | Logged in as doctor with scheduled visit | Verify appointment data and status controls | Data is consistent and actions are usable |
| SC-DOC-005 | Appointments | Medium | Logged in as doctor | Validate empty-state with no appointments | Empty-state is graceful |
| SC-DOC-006 | Appointments | Medium | Logged in as doctor | Try confirm/complete/cancel action if available | State changes or controlled denial occurs |
| SC-DOC-007 | Schedule | High | Logged in as doctor | Open `/schedule` | Schedule page renders |
| SC-DOC-008 | Schedule | High | Logged in as doctor | Modify schedule and save | Success feedback is shown |
| SC-DOC-009 | Schedule | Medium | Logged in as doctor | Submit invalid schedule combination if UI permits | Validation or safe error is shown |
| SC-DOC-010 | Schedule | Medium | Logged in as doctor | Reload schedule page after save | Changes persist correctly |

## 12. Doctor Patients, Medical Record Creation, And Profile

| ID | Area | Priority | Preconditions | Core Action | Expected Result |
| --- | --- | --- | --- | --- | --- |
| SC-DOC-011 | Patients | High | Logged in as doctor | Open `/patients` | Doctor patient list renders |
| SC-DOC-012 | Patients | Medium | Logged in as doctor | Search or filter patient list if available | Results update correctly |
| SC-DOC-013 | Patients | Medium | Logged in as doctor | Open patient detail affordance if present | Detail view is consistent |
| SC-DOC-014 | Patients | Medium | Logged in as doctor | Validate empty-state when no assigned patients exist | Empty-state is graceful |
| SC-DOC-015 | Create Medical Record | High | Logged in as doctor | Open `/doctor/create-medical-record` | Record creation form opens or route explains why not available |
| SC-DOC-016 | Create Medical Record | High | Logged in as doctor with valid appointment context | Create a valid medical record | Record is saved successfully |
| SC-DOC-017 | Create Medical Record | Medium | Logged in as doctor | Attempt record creation with invalid appointment state | Operation is rejected safely |
| SC-DOC-018 | Create Medical Record | Medium | Logged in as doctor | Attempt record creation for another doctor's patient | Access is denied safely |
| SC-DOC-019 | Profile | Medium | Logged in as doctor | Open `/profile` | Doctor profile renders correctly |
| SC-DOC-020 | Profile | Medium | Logged in as doctor | Save profile with valid data | Success feedback is shown |
| SC-DOC-021 | Profile | Medium | Logged in as doctor | Save profile with invalid phone data | Validation or clear error appears |
| SC-DOC-022 | Security | Low | Logged in as doctor | Open `/profile/security` | Security page renders |
| SC-DOC-023 | Notifications Settings | Low | Logged in as doctor | Open `/profile/notifications` | Notification-settings page renders |

## 13. Doctor Consultations And Analytics

| ID | Area | Priority | Preconditions | Core Action | Expected Result |
| --- | --- | --- | --- | --- | --- |
| SC-DOC-024 | Consultations | High | Logged in as doctor | Open `/consultations` | Consultation queue/list renders |
| SC-DOC-025 | Consultations | High | Logged in as doctor with pending request | Accept a pending consultation | Request moves into active state |
| SC-DOC-026 | Consultations | High | Logged in as doctor with active consultation | Open consultation detail page | Detail page renders correctly |
| SC-DOC-027 | Consultations | High | Logged in as doctor with active consultation | Send consultation message | Message send succeeds |
| SC-DOC-028 | Consultations | High | Logged in as doctor | Observe realtime/websocket setup on detail page | No unexpected JS exception occurs |
| SC-DOC-029 | Consultations | Medium | Logged in as doctor | Attempt to open unauthorized consultation ID | Access is denied |
| SC-DOC-030 | Consultations | Low | Logged in as doctor | Open non-existent consultation ID | Graceful not-found behavior appears |
| SC-DOC-031 | Messages | Low | Logged in as doctor | Open `/messages` redirect | Redirect resolves to doctor consultation route |
| SC-DOC-032 | Analytics | Medium | Logged in as doctor | Open `/doctor/analytics` | Analytics page renders |
| SC-DOC-033 | Analytics | Medium | Logged in as doctor | Change date range/filter on analytics | UI refreshes without crash |
| SC-DOC-034 | Analytics | Medium | Logged in as doctor | Validate empty-state analytics when no data exists | Empty-state is graceful |

## 14. Admin Dashboard And User Management

| ID | Area | Priority | Preconditions | Core Action | Expected Result |
| --- | --- | --- | --- | --- | --- |
| SC-ADM-001 | Dashboard | High | Logged in as admin | Open `/dashboard` | Admin dashboard renders |
| SC-ADM-002 | Dashboard | Medium | Logged in as admin | Verify summary cards and recent activity | Key widgets appear correctly |
| SC-ADM-003 | Users | High | Logged in as admin | Open `/users` | User management page renders |
| SC-ADM-004 | Users | High | Logged in as admin | Search user by name/email | Search results update correctly |
| SC-ADM-005 | Users | High | Logged in as admin | Open edit modal for a user | Modal renders seeded values |
| SC-ADM-006 | Users | High | Logged in as admin | Save a valid user edit | Save succeeds consistently |
| SC-ADM-007 | Users | Medium | Logged in as admin | Attempt save with invalid or empty required data | Validation or explicit error is shown |
| SC-ADM-008 | Users | Medium | Logged in as admin | Filter by role/status if available | Filtering works correctly |
| SC-ADM-009 | Users | Low | Logged in as admin | Retry save after transient backend failure | UI remains recoverable |

## 15. Admin Doctor, Clinic, Service, And Room Management

| ID | Area | Priority | Preconditions | Core Action | Expected Result |
| --- | --- | --- | --- | --- | --- |
| SC-ADM-010 | Doctor Management | High | Logged in as admin | Open `/doctors` | Doctor management page renders |
| SC-ADM-011 | Doctor Management | High | Logged in as admin | Search doctors by name | List filters without crashing |
| SC-ADM-012 | Doctor Management | Medium | Logged in as admin | Filter doctors by specialty/status if available | Filtering works correctly |
| SC-ADM-013 | Doctor Management | Medium | Logged in as admin | Open doctor edit/approval action | Modal or action panel opens |
| SC-ADM-014 | Doctor Management | Medium | Logged in as admin | Save doctor update | Save succeeds or explicit error is shown |
| SC-ADM-015 | Clinics | Medium | Logged in as admin | Open `/admin/clinics` | Clinic management page renders |
| SC-ADM-016 | Clinics | Medium | Logged in as admin | Search clinics by name | Results filter correctly |
| SC-ADM-017 | Clinics | Medium | Logged in as admin | Open and save clinic edit with valid values | Save succeeds |
| SC-ADM-018 | Clinics | Medium | Logged in as admin | Create clinic with empty required field | Validation is shown |
| SC-ADM-019 | Services | Medium | Logged in as admin | Open `/admin/services` | Service management page renders |
| SC-ADM-020 | Services | Medium | Logged in as admin | Search services by keyword | Results update correctly |
| SC-ADM-021 | Services | Medium | Logged in as admin | Filter by category if available | Filtering works |
| SC-ADM-022 | Services | Medium | Logged in as admin | Open and save service edit | Save succeeds |
| SC-ADM-023 | Services | Medium | Logged in as admin | Attempt invalid service save | Validation or error appears safely |
| SC-ADM-024 | Rooms | Medium | Logged in as admin | Open `/admin/rooms` | Room management page renders |
| SC-ADM-025 | Rooms | Medium | Logged in as admin | Search rooms by clinic/room name | Results update correctly |
| SC-ADM-026 | Rooms | Medium | Logged in as admin | Open and save room edit | Save succeeds |
| SC-ADM-027 | Rooms | Medium | Logged in as admin | Attempt invalid room save | Validation or safe error appears |

## 16. Admin Reports And Profile

| ID | Area | Priority | Preconditions | Core Action | Expected Result |
| --- | --- | --- | --- | --- | --- |
| SC-ADM-028 | Reports | High | Logged in as admin | Open `/admin/reports` | Reports page renders |
| SC-ADM-029 | Reports | High | Logged in as admin | Switch between report tabs/views | UI updates without crash |
| SC-ADM-030 | Reports | High | Logged in as admin | Change date range | Report queries succeed and UI refreshes |
| SC-ADM-031 | Reports | Medium | Logged in as admin | Change grouping granularity | Chart/table updates correctly |
| SC-ADM-032 | Reports | Medium | Logged in as admin | Validate empty-state or no-data range | UI handles no data gracefully |
| SC-ADM-033 | Reports | Low | Logged in as admin | Use export/download action if present | Artifact is generated or action fails gracefully |
| SC-ADM-034 | Profile | Medium | Logged in as admin | Open `/profile` | Admin profile page renders |
| SC-ADM-035 | Profile | Medium | Logged in as admin | Save valid admin profile values | Save succeeds |
| SC-ADM-036 | Profile | Medium | Logged in as admin | Save invalid profile input if possible | Validation or explicit error appears |

## 17. Shared Profile, Validation, And Error-Handling

| ID | Area | Priority | Preconditions | Core Action | Expected Result |
| --- | --- | --- | --- | --- | --- |
| SC-X-001 | Validation | High | Patient logged in | Submit security form with mismatched passwords | Clear validation message appears |
| SC-X-002 | Validation | High | Doctor logged in | Submit profile with invalid phone format | UI shows actionable feedback or controlled API error |
| SC-X-003 | Validation | Medium | Admin logged in | Submit create/edit entity form missing required name | Required-field feedback is shown |
| SC-X-004 | Validation | Medium | Any role | Submit form twice quickly | No duplicate crash or broken pending state occurs |
| SC-X-005 | Error Handling | High | Any role | Trigger one known server-side failure | UI shows clear non-crashing failure state |
| SC-X-006 | Error Handling | Medium | Any role | Open route with missing entity ID | Graceful not-found or fallback behavior appears |
| SC-X-007 | Error Handling | Medium | Any role | Simulate empty-state pages across modules | Empty-state copy and layout remain usable |
| SC-X-008 | Error Handling | Medium | Any role | Observe toast, inline error, and loading UI states | States are visible and consistent |

## 18. Cross-Role Security, Navigation, And Session Integrity

| ID | Area | Priority | Preconditions | Core Action | Expected Result |
| --- | --- | --- | --- | --- | --- |
| SC-X-009 | Authorization | High | Logged in as patient | Access doctor appointment route | Access denied or redirected |
| SC-X-010 | Authorization | High | Logged in as patient | Access admin route | Access denied or redirected |
| SC-X-011 | Authorization | High | Logged in as doctor | Access patient booking route | Access denied or redirected |
| SC-X-012 | Authorization | High | Logged in as doctor | Access admin route | Access denied or redirected |
| SC-X-013 | Authorization | High | Logged in as admin | Access patient booking route | Access denied or redirected |
| SC-X-014 | Authorization | High | Logged in as admin | Access doctor appointment route | Access denied or redirected |
| SC-X-015 | Navigation | High | Logged in as each role | Traverse primary sidebar links | No broken links or dead routes |
| SC-X-016 | Session | High | Logged in as each role | Refresh current authenticated page | Session persists consistently |
| SC-X-017 | Session | Medium | Logged in as each role | Logout then use browser back button | Protected content is not reopened without auth |
| SC-X-018 | Session | Medium | Logged in as each role | Open direct route bookmark | Correct role state is honored |

## 19. Console, Network, Realtime, And Resilience

| ID | Area | Priority | Preconditions | Core Action | Expected Result |
| --- | --- | --- | --- | --- | --- |
| SC-X-019 | Console | High | Any meaningful flow | Observe browser console during core flows | No unhandled JS exception appears |
| SC-X-020 | Network | High | Any meaningful flow | Observe failed network requests during core flows | No unexpected 5xx/4xx outside known negative tests |
| SC-X-021 | Realtime | High | Consultation detail open | Observe websocket/STOMP initialization | Realtime setup occurs without connection exception |
| SC-X-022 | Realtime | Medium | Consultation detail open | Send message and observe update | Message lifecycle is reflected in UI |
| SC-X-023 | Recovery | Medium | App running | Restart frontend and re-enter seeded flow | User can continue after app restart |
| SC-X-024 | Recovery | Medium | App/backend partially unavailable | Observe app behavior on temporary API failure | User sees controlled degraded state |
| SC-X-025 | Duplicates | Medium | Dashboard or menu pages loaded | Watch for duplicate React key warnings | No duplicate-key warning should exist |
| SC-X-026 | State Sync | Medium | After create/update flows | Refresh list pages after mutation | Changed entity persists after reload |

## 20. Responsive And UX Sampling

| ID | Area | Priority | Preconditions | Core Action | Expected Result |
| --- | --- | --- | --- | --- | --- |
| SC-X-027 | Responsive | Medium | Logged out | Open login page on mobile viewport | Form remains usable and readable |
| SC-X-028 | Responsive | Medium | Logged in as patient | Open patient dashboard on mobile viewport | Main content remains usable |
| SC-X-029 | Responsive | Medium | Logged in as doctor | Open doctor schedule on mobile viewport | Schedule page remains usable |
| SC-X-030 | Responsive | Medium | Logged in as admin | Open admin clinics page on mobile viewport | Cards/forms remain usable |
| SC-X-031 | UX | Low | Any role | Confirm loading spinners and transitions do not block actions permanently | Page remains usable |
| SC-X-032 | UX | Low | Any role | Confirm long lists/cards remain scannable | Layout remains readable |

## Coverage Summary Of This Catalog

This expanded catalog currently contains:
- 39 scenarios for public/auth/session access
- 82 scenarios for patient workflows
- 34 scenarios for doctor workflows
- 36 scenarios for admin workflows
- 32 cross-cutting scenarios

Total catalog size: 223 scenarios

Recommended next step:
- Keep `test-cases.md` as the compact regression ledger.
- Use this file to derive a larger execution matrix in batches, for example:
  - Batch 1: High-priority happy paths
  - Batch 2: High-priority negative and authz
  - Batch 3: Medium-priority CRUD and filters
  - Batch 4: Realtime, resilience, and responsive checks
