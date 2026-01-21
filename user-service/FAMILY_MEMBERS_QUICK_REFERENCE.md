# Family Members API - Quick Reference Guide

## Endpoint Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/family-members` | Create new family member | Required |
| GET | `/api/family-members` | List all (paginated) | Required |
| GET | `/api/family-members/{id}` | Get by ID | Required |
| GET | `/api/family-members/user/{userId}` | Get by user ID | Required |
| PUT | `/api/family-members/{id}` | Update member | Required |
| DELETE | `/api/family-members/{id}` | Delete member (soft) | Required |

---

## Request/Response Examples

### 1. Create Family Member
```bash
POST /api/family-members HTTP/1.1
Content-Type: application/json
Authorization: Bearer <token>

{
  "userId": 1,
  "fullName": "Nguyễn Văn A",
  "dateOfBirth": "2000-01-15",
  "gender": "MALE",
  "relationship": "Cha",
  "bloodType": "O+",
  "height": 170.5,
  "weight": 65.5
}

RESPONSE: 201 Created
{
  "id": 1,
  "userId": 1,
  "fullName": "Nguyễn Văn A",
  "dateOfBirth": "2000-01-15",
  "gender": "MALE",
  "relationship": "Cha",
  "bloodType": "O+",
  "height": 170.5,
  "weight": 65.5,
  "age": 24,
  "bmi": 22.59,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

### 2. Get All Family Members
```bash
GET /api/family-members?page=0&size=10 HTTP/1.1
Authorization: Bearer <token>

RESPONSE: 200 OK
{
  "content": [...],
  "totalElements": 25,
  "totalPages": 3,
  "number": 0,
  "size": 10
}
```

### 3. Get by User ID (Cached)
```bash
GET /api/family-members/user/1 HTTP/1.1
Authorization: Bearer <token>

RESPONSE: 200 OK
[
  { id: 1, userId: 1, fullName: "...", ... },
  { id: 2, userId: 1, fullName: "...", ... }
]
```

### 4. Get by ID
```bash
GET /api/family-members/1 HTTP/1.1
Authorization: Bearer <token>

RESPONSE: 200 OK
{
  "id": 1,
  "userId": 1,
  "fullName": "Nguyễn Văn A",
  ...
}
```

### 5. Update Family Member
```bash
PUT /api/family-members/1 HTTP/1.1
Content-Type: application/json
Authorization: Bearer <token>

{
  "fullName": "Nguyễn Văn A Updated",
  "weight": 68.5
}

RESPONSE: 200 OK
{
  "id": 1,
  "userId": 1,
  "fullName": "Nguyễn Văn A Updated",
  "weight": 68.5,
  "updatedAt": "2024-01-20T14:45:30",
  ...
}
```

### 6. Delete Family Member
```bash
DELETE /api/family-members/1 HTTP/1.1
Authorization: Bearer <token>

RESPONSE: 204 No Content
```

---

## Validation Rules

### Create Request
| Field | Required | Rules |
|-------|----------|-------|
| userId | YES | Valid user ID (exists in DB) |
| fullName | YES | 2-255 characters |
| dateOfBirth | YES | Past date (yyyy-MM-dd) |
| gender | NO | MALE, FEMALE, OTHER |
| relationship | NO | Max 50 characters |
| bloodType | NO | Max 10 characters (e.g., O+, AB-) |
| height | NO | > 0 (centimeters) |
| weight | NO | > 0 (kilograms) |
| allergies | NO | Max 500 characters |
| chronicDiseases | NO | Max 500 characters |
| avatarUrl | NO | Max 500 characters |

### Update Request
- All fields are optional
- Same validation rules apply if field is provided
- Only provided fields are updated (null values ignored)

---

## Error Responses

### 400 Bad Request - Validation Error
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for request body",
  "errorCode": "METHOD_ARGUMENT_NOT_VALID",
  "details": {
    "fullName": "Họ tên không được để trống",
    "dateOfBirth": "Ngày sinh phải là ngày trong quá khứ"
  }
}
```

### 404 Not Found
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "FamilyMember with ID 999 not found",
  "errorCode": "RESOURCE_NOT_FOUND"
}
```

### 500 Internal Server Error
```json
{
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred. Please contact support.",
  "errorCode": "INTERNAL_SERVER_ERROR"
}
```

---

## Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | OK | GET request successful |
| 201 | Created | POST request successful |
| 204 | No Content | DELETE request successful |
| 400 | Bad Request | Validation failed, invalid data |
| 401 | Unauthorized | Missing/invalid JWT token |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected error |

---

## Headers

### Required Headers
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Optional Headers
```
X-Correlation-ID: 550e8400-e29b-41d4-a716-446655440000
```

---

## Caching

### Cache Details
- **Service:** Redis
- **TTL:** 30 minutes
- **Cached Endpoint:** `GET /api/family-members/user/{userId}`
- **Cache Key:** `familyMembers:{userId}`

### Cache Invalidation
- Create → Invalidates user's cache
- Update → Invalidates user's cache
- Delete → Invalidates user's cache

### Performance Impact
- First request: Database query (slow)
- Subsequent requests (within 30 min): Cache hit (fast)
- After 30 min: Database query again

---

## Calculated Fields

### Age
```
age = currentYear - birthYear
```
Example: Born 2000-01-15 → age 24 (in 2024)

### BMI (Body Mass Index)
```
bmi = weight (kg) / (height (m))²
     = weight (kg) / (height (cm) / 100)²
```
Example: 65.5 kg, 170.5 cm → BMI = 22.59

---

## Soft Delete Behavior

### What is Soft Delete?
- Record is marked as deleted (`isDeleted = true`)
- Not physically removed from database
- Invisible in normal queries and API responses

### Implications
- Deleted members don't appear in list/search
- Accessing deleted member returns 404
- Data preserved for audit/compliance
- Can't re-activate (intentional design)

### Querying Deleted Items
- Regular queries: Ignore deleted items
- Requires direct database query to see deleted items

---

## Common Workflows

### Add Family Member
```
1. POST /api/family-members
2. Receive 201 with member data
3. Cache automatically created for user
```

### List All Members of User
```
1. GET /api/family-members/user/{userId}
2. First call: Database + create cache (cache TTL: 30 min)
3. Subsequent calls (within 30 min): Fast cache response
4. After 30 min: New database query
```

### Update Member Information
```
1. PUT /api/family-members/{id}
2. Only provide fields to update
3. Receive 200 with updated data
4. User's cache automatically invalidated
```

### Remove Family Member
```
1. DELETE /api/family-members/{id}
2. Receive 204 (no content)
3. Member marked as deleted
4. No longer appears in list
5. User's cache invalidated
```

---

## API Base URL

Development:
```
http://localhost:8080/api/family-members
```

Production:
```
https://clinic-booking-api.example.com/api/family-members
```

---

## Authentication

### JWT Token
1. Obtain token from `/api/auth/login`
2. Include in Authorization header:
   ```
   Authorization: Bearer <your-jwt-token>
   ```
3. Token typically valid for 24 hours
4. Refresh token to extend session

### Token Example
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwi
YWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.
TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ
```

---

## Debugging Tips

### Enable Correlation ID
```
X-Correlation-ID: 550e8400-e29b-41d4-a716-446655440000
```
Used in logs to track request across services.

### Check Response Headers
- `Content-Type: application/json`
- `Date: Mon, 15 Jan 2024 10:30:00 GMT`

### Read Error Details
- Check `errorCode` for programmatic handling
- Check `details` field for field-level errors
- Use `correlationId` when reporting issues

### Common Issues
| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check JWT token validity and expiration |
| 404 Not Found | Verify resource ID exists and isn't deleted |
| 400 Bad Request | Review validation errors in `details` field |
| Slow responses | Check if in cache window (30 min TTL) |

---

## Tools & Resources

### API Testing
- **Postman:** Import API collection for testing
- **cURL:** Command-line testing
- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **REST Client:** VS Code extension

### Documentation
- Full API Docs: `FAMILY_MEMBERS_API.md`
- Implementation Details: `FAMILY_MEMBERS_IMPLEMENTATION_CHECKLIST.md`
- Source Code: Check repository files

---

## Support & Troubleshooting

If encountering issues:
1. Check error response and error code
2. Verify request format and validation
3. Ensure JWT token is valid
4. Check user exists (for user-based operations)
5. Provide correlation ID when reporting bugs

---

## Version Information

- **API Version:** 1.0
- **Last Updated:** 2024-01-15
- **Status:** Production Ready
- **Framework:** Spring Boot 3.x
- **Java Version:** 17+
