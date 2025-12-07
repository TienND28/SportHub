# Script to reorganize frontend structure for Sports Venue Booking System
# Run this from the frontend directory: .\reorganize-structure.ps1

Write-Host "🏀 Reorganizing SportHub Frontend Structure..." -ForegroundColor Green
Write-Host "Project: Sports Venue Booking System`n" -ForegroundColor Cyan

# Create new directory structure
Write-Host "📁 Creating directory structure..." -ForegroundColor Yellow

$directories = @(
    "src/components/features/booking",
    "src/components/features/venue",
    "src/components/features/payment",
    "src/components/features/admin",
    "src/components/layouts",
    "src/components/ui",
    "src/pages/admin",
    "src/pages/client",
    "src/pages/owner",
    "src/services/booking",
    "src/services/venue",
    "src/services/payment"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  ✓ Created: $dir" -ForegroundColor Green
    }
}

Write-Host "`n📦 Moving files to new structure..." -ForegroundColor Yellow
Write-Host "`n  Components:" -ForegroundColor Cyan

# Move admin components
if (Test-Path "src/components/UserDetailModal.tsx") {
    Move-Item "src/components/UserDetailModal.tsx" "src/components/features/admin/UserDetailModal.tsx" -Force
    Write-Host "    ✓ UserDetailModal.tsx" -ForegroundColor Green
}

# Move layout components
if (Test-Path "src/components/AdminLayout.tsx") {
    Move-Item "src/components/AdminLayout.tsx" "src/components/layouts/AdminLayout.tsx" -Force
    Write-Host "    ✓ AdminLayout.tsx" -ForegroundColor Green
}

# Move UI components
$uiComponents = @("ConfirmDialog.tsx", "AuthModal.tsx", "Header.tsx", "ProtectedRoute.tsx")
foreach ($component in $uiComponents) {
    if (Test-Path "src/components/$component") {
        Move-Item "src/components/$component" "src/components/ui/$component" -Force
        Write-Host "    ✓ $component" -ForegroundColor Green
    }
}

Write-Host "`n  Pages:" -ForegroundColor Cyan

# Move admin pages
if (Test-Path "src/pages/AdminDashboardPage.tsx") {
    Move-Item "src/pages/AdminDashboardPage.tsx" "src/pages/admin/DashboardPage.tsx" -Force
    Write-Host "    ✓ AdminDashboardPage.tsx → DashboardPage.tsx" -ForegroundColor Green
}

if (Test-Path "src/pages/AdminUsersPage.tsx") {
    Move-Item "src/pages/AdminUsersPage.tsx" "src/pages/admin/UsersPage.tsx" -Force
    Write-Host "    ✓ AdminUsersPage.tsx → UsersPage.tsx" -ForegroundColor Green
}

Write-Host "`n✅ File reorganization complete!" -ForegroundColor Green
Write-Host "`n⚠️  Next: Update import paths in your files" -ForegroundColor Yellow
