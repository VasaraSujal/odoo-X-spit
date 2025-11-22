# Test Backend API

## Using PowerShell

### 1. Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET
```

### 2. Register Inventory Manager
```powershell
$body = @{
    name = "Admin Manager"
    email = "admin@stockmaster.com"
    password = "admin123"
    role = "inventory_manager"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### 3. Register Warehouse Staff
```powershell
$body = @{
    name = "Staff Member"
    email = "staff@stockmaster.com"
    password = "staff123"
    role = "warehouse_staff"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### 4. Login
```powershell
$loginBody = @{
    email = "admin@stockmaster.com"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody

# Save the token
$token = $response.token
Write-Host "Token: $token"
```

### 5. Get Current User (Protected Route)
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" `
    -Method GET `
    -Headers $headers
```

### 6. Get All Users (Inventory Manager Only)
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/users" `
    -Method GET `
    -Headers $headers
```

### 7. Update Profile
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

$updateBody = @{
    name = "Updated Admin"
    preferredWarehouseId = "WH-001"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/profile" `
    -Method PUT `
    -Headers $headers `
    -ContentType "application/json" `
    -Body $updateBody
```

### 8. Change Password
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

$passwordBody = @{
    currentPassword = "admin123"
    newPassword = "newadmin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/password" `
    -Method PUT `
    -Headers $headers `
    -ContentType "application/json" `
    -Body $passwordBody
```

### 9. Logout
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/logout" `
    -Method POST `
    -Headers $headers
```

## Test All at Once

```powershell
# 1. Health Check
Write-Host "=== Testing Health Check ===" -ForegroundColor Green
Invoke-RestMethod -Uri "http://localhost:5000/api/health"

# 2. Register
Write-Host "`n=== Registering User ===" -ForegroundColor Green
$registerBody = @{
    name = "Test Manager"
    email = "test@manager.com"
    password = "test123"
    role = "inventory_manager"
} | ConvertTo-Json

$registerResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $registerBody
$registerResponse

# 3. Login
Write-Host "`n=== Logging In ===" -ForegroundColor Green
$loginBody = @{
    email = "test@manager.com"
    password = "test123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody
$token = $loginResponse.token
$loginResponse

# 4. Get Me
Write-Host "`n=== Getting Current User ===" -ForegroundColor Green
$headers = @{ "Authorization" = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" `
    -Method GET `
    -Headers $headers

Write-Host "`n=== All Tests Complete! ===" -ForegroundColor Cyan
```
