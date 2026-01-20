# Family Members API - User Service Documentation

## Overview

The Family Members API provides comprehensive endpoints for managing family members of users in the Clinic Booking System. The API supports full CRUD operations (Create, Read, Update, Delete) with proper validation, error handling, and caching mechanisms.

## Base URL

```
http://localhost:8080/api/family-members
```

## Authentication

All endpoints require Bearer token authentication via the `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

## API Endpoints

### 1. Create Family Member

**Endpoint:** `POST /api/family-members`

**Description:** Create a new family member for a user.

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "userId": 1,
  "fullName": "Nguyễn Văn A",
  "dateOfBirth": "2000-01-15",
  "gender": "MALE",
  "relationship": "Cha",
  "bloodType": "O+",
  "height": 170.5,
  "weight": 65.5,
  "allergies": "Dị ứng với Penicillin",
  "chronicDiseases": "Tiểu đường loại 2",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**Request Field Validation:**
- `userId` (required): Valid user ID that exists
- `fullName` (required): 2-255 characters
- `dateOfBirth` (required): Must be a past date
- `gender`: MALE, FEMALE, OTHER
- `relationship`: Maximum 50 characters
- `bloodType`: Maximum 10 characters
- `height`: Must be greater than 0 (cm)
- `weight`: Must be greater than 0 (kg)
- `allergies`: Maximum 500 characters
- `chronicDiseases`: Maximum 500 characters
- `avatarUrl`: Maximum 500 characters

**Success Response:** `201 Created`
```json
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
  "allergies": "Dị ứng với Penicillin",
  "chronicDiseases": "Tiểu đường loại 2",
  "avatarUrl": "https://example.com/avatar.jpg",
  "age": 24,
  "bmi": 22.59,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

**Error Responses:**
- `400 Bad Request`: Validation failed
  ```json
  {
    "timestamp": "2024-01-15T10:30:00",
    "status": 400,
    "error": "Bad Request",
    "message": "Validation failed for request body",
    "errorCode": "METHOD_ARGUMENT_NOT_VALID",
    "details": {
      "fullName": "Họ tên không được để trống",
      "dateOfBirth": "Ngày sinh không được để trống"
    },
    "path": "/api/family-members",
    "correlationId": "550e8400-e29b-41d4-a716-446655440000"
  }
  ```

- `404 Not Found`: User not found
  ```json
  {
    "timestamp": "2024-01-15T10:30:00",
    "status": 404,
    "error": "Not Found",
    "message": "User with ID 999 not found",
    "errorCode": "RESOURCE_NOT_FOUND",
    "path": "/api/family-members",
    "correlationId": "550e8400-e29b-41d4-a716-446655440000"
  }
  ```

---

### 2. Get Family Member by ID

**Endpoint:** `GET /api/family-members/{id}`

**Description:** Retrieve details of a specific family member.

**Path Parameters:**
- `id` (required): Family member ID

**Request Headers:**
```
Authorization: Bearer <jwt-token>
```

**Success Response:** `200 OK`
```json
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
  "allergies": "Dị ứng với Penicillin",
  "chronicDiseases": "Tiểu đường loại 2",
  "avatarUrl": "https://example.com/avatar.jpg",
  "age": 24,
  "bmi": 22.59,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

**Error Responses:**
- `404 Not Found`: Family member not found or deleted

---

### 3. Get Family Members by User ID

**Endpoint:** `GET /api/family-members/user/{userId}`

**Description:** Retrieve all family members of a specific user (non-deleted only).

**Path Parameters:**
- `userId` (required): User ID

**Request Headers:**
```
Authorization: Bearer <jwt-token>
```

**Success Response:** `200 OK`
```json
[
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
    "allergies": "Dị ứng với Penicillin",
    "chronicDiseases": "Tiểu đường loại 2",
    "avatarUrl": "https://example.com/avatar.jpg",
    "age": 24,
    "bmi": 22.59,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  },
  {
    "id": 2,
    "userId": 1,
    "fullName": "Nguyễn Thị B",
    "dateOfBirth": "1975-05-20",
    "gender": "FEMALE",
    "relationship": "Mẹ",
    "bloodType": "A+",
    "height": 165.0,
    "weight": 58.5,
    "allergies": null,
    "chronicDiseases": null,
    "avatarUrl": null,
    "age": 49,
    "bmi": 21.50,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
]
```

**Note:** Results are cached for 30 minutes for performance optimization.

**Error Responses:**
- `404 Not Found`: User not found

---

### 4. Get All Family Members (Paginated)

**Endpoint:** `GET /api/family-members`

**Description:** Retrieve all family members with pagination and sorting support.

**Query Parameters:**
- `page` (optional): Page number (0-indexed, default: 0)
- `size` (optional): Page size (default: 20)
- `sort` (optional): Sort criteria (e.g., `createdAt,desc`)

**Request Headers:**
```
Authorization: Bearer <jwt-token>
```

**Example Request:**
```
GET /api/family-members?page=0&size=10&sort=createdAt,desc
```

**Success Response:** `200 OK`
```json
{
  "content": [
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
      "allergies": "Dị ứng với Penicillin",
      "chronicDiseases": "Tiểu đường loại 2",
      "avatarUrl": "https://example.com/avatar.jpg",
      "age": 24,
      "bmi": 22.59,
      "createdAt": "2024-01-15T10:30:00",
      "updatedAt": "2024-01-15T10:30:00"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": {
      "empty": false,
      "unsorted": false,
      "sorted": true
    },
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "totalElements": 15,
  "totalPages": 2,
  "last": false,
  "size": 10,
  "number": 0,
  "first": true,
  "numberOfElements": 10,
  "empty": false
}
```

**Error Responses:**
- `400 Bad Request`: Invalid pagination parameters

---

### 5. Update Family Member

**Endpoint:** `PUT /api/family-members/{id}`

**Description:** Update information of a specific family member.

**Path Parameters:**
- `id` (required): Family member ID

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <jwt-token>
```

**Request Body:** (All fields are optional)
```json
{
  "fullName": "Nguyễn Văn A",
  "dateOfBirth": "2000-01-15",
  "gender": "MALE",
  "relationship": "Cha",
  "bloodType": "O+",
  "height": 170.5,
  "weight": 65.5,
  "allergies": "Dị ứng với Penicillin",
  "chronicDiseases": "Tiểu đường loại 2",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**Request Field Validation:**
- `fullName`: 2-255 characters (if provided)
- `dateOfBirth`: Must be a past date (if provided)
- `height`: Must be greater than 0 (cm, if provided)
- `weight`: Must be greater than 0 (kg, if provided)
- `relationship`: Maximum 50 characters (if provided)
- `bloodType`: Maximum 10 characters (if provided)
- `allergies`: Maximum 500 characters (if provided)
- `chronicDiseases`: Maximum 500 characters (if provided)
- `avatarUrl`: Maximum 500 characters (if provided)

**Success Response:** `200 OK`
```json
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
  "allergies": "Dị ứng với Penicillin",
  "chronicDiseases": "Tiểu đường loại 2",
  "avatarUrl": "https://example.com/avatar.jpg",
  "age": 24,
  "bmi": 22.59,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-20T14:45:30"
}
```

**Note:** Cache is automatically invalidated for the user after update.

**Error Responses:**
- `400 Bad Request`: Validation failed
- `404 Not Found`: Family member not found or deleted

---

### 6. Delete Family Member (Soft Delete)

**Endpoint:** `DELETE /api/family-members/{id}`

**Description:** Soft delete a family member (marked as deleted without physical removal).

**Path Parameters:**
- `id` (required): Family member ID

**Request Headers:**
```
Authorization: Bearer <jwt-token>
```

**Success Response:** `204 No Content`

**Note:**
- This is a soft delete operation - the record is marked as deleted but not physically removed from the database
- Deleted family members will not appear in list/search results
- Cache is automatically invalidated for the user after deletion

**Error Responses:**
- `404 Not Found`: Family member not found or already deleted

---

## Calculated Fields

### Age
Automatically calculated from the `dateOfBirth` field. Returns the age in years.

### BMI (Body Mass Index)
Automatically calculated using the formula: `weight (kg) / (height (m))^2`

Both fields require:
- `height`: in centimeters (cm)
- `weight`: in kilograms (kg)

---

## Caching

The Family Members API implements Redis caching for performance optimization:

- **Cache Key:** `familyMembers:{userId}`
- **Cache TTL:** 30 minutes
- **Cache Invalidation:**
  - On create (for the user)
  - On update (for the user)
  - On delete (for the user)

---

## Error Handling

All errors are returned in a standardized JSON format:

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Human-readable error message",
  "errorCode": "ERROR_CODE",
  "details": {
    "field1": "error message",
    "field2": "error message"
  },
  "path": "/api/family-members",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Common Error Codes:
- `METHOD_ARGUMENT_NOT_VALID`: Request body validation failed
- `CONSTRAINT_VIOLATION`: Request parameter validation failed
- `RESOURCE_NOT_FOUND`: Resource does not exist
- `INTERNAL_SERVER_ERROR`: Unexpected server error

---

## Status Codes

| Code | Description |
|------|-------------|
| 200  | OK - Request successful |
| 201  | Created - Resource created successfully |
| 204  | No Content - Deletion successful |
| 400  | Bad Request - Validation error |
| 401  | Unauthorized - Missing or invalid authentication |
| 404  | Not Found - Resource not found |
| 500  | Internal Server Error - Unexpected error |

---

## Example cURL Commands

### Create Family Member
```bash
curl -X POST http://localhost:8080/api/family-members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{
    "userId": 1,
    "fullName": "Nguyễn Văn A",
    "dateOfBirth": "2000-01-15",
    "gender": "MALE",
    "relationship": "Cha",
    "bloodType": "O+",
    "height": 170.5,
    "weight": 65.5
  }'
```

### Get Family Members by User ID
```bash
curl -X GET http://localhost:8080/api/family-members/user/1 \
  -H "Authorization: Bearer <jwt-token>"
```

### Update Family Member
```bash
curl -X PUT http://localhost:8080/api/family-members/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{
    "fullName": "Nguyễn Văn A Updated",
    "weight": 68.5
  }'
```

### Delete Family Member
```bash
curl -X DELETE http://localhost:8080/api/family-members/1 \
  -H "Authorization: Bearer <jwt-token>"
```

---

## Swagger UI

Access the interactive API documentation at:
```
http://localhost:8080/swagger-ui.html
```

---

## Implementation Details

### Architecture
- **Controller:** `FamilyMemberController.java` - REST endpoints
- **Service:** `FamilyMemberService.java` (interface) & `FamilyMemberServiceImpl.java` (implementation)
- **Entity:** `FamilyMember.java` - JPA entity with soft delete support
- **Repository:** `FamilyMemberRepository.java` - Data access layer
- **Mapper:** `FamilyMemberMapper.java` - MapStruct DTO mapping
- **DTOs:**
  - `FamilyMemberCreateDto.java` - Request body for creation
  - `FamilyMemberUpdateDto.java` - Request body for updates
  - `FamilyMemberResponseDto.java` - Response body

### Technologies Used
- **Spring Boot 3.x**: Web framework
- **Spring Data JPA**: Database access
- **Spring Cache with Redis**: Caching layer
- **MapStruct**: DTO mapping
- **Hibernate Validation**: Input validation
- **SpringDoc OpenAPI (Swagger)**: API documentation
- **Lombok**: Boilerplate code reduction

### Database Schema
```sql
CREATE TABLE family_members (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10),
  relationship VARCHAR(50),
  blood_type VARCHAR(10),
  height DECIMAL(5,2),
  weight DECIMAL(5,2),
  allergies TEXT,
  chronic_diseases TEXT,
  avatar_url VARCHAR(500),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id)
);
```

---

## Best Practices

1. **Always provide a valid JWT token** in the Authorization header
2. **Use appropriate HTTP methods** (GET for retrieval, POST for creation, PUT for updates, DELETE for deletion)
3. **Handle pagination** for large result sets
4. **Utilize caching** by calling the list endpoint multiple times within 30 minutes
5. **Validate input data** on client-side before sending requests
6. **Check error responses** and act according to error codes
7. **Use correlation IDs** for debugging and error tracking across services

---

## Support

For issues or questions regarding the Family Members API, please contact the development team or check the detailed logs using the correlation ID provided in error responses.
