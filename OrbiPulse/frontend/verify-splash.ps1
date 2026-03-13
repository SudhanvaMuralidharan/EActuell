# Splash Screen Verification Script
# Run this to verify all splash screen files and configuration are correct

Write-Host "Verifying Splash Screen Setup..." -ForegroundColor Cyan
Write-Host ""

# Change to frontend directory
Set-Location "$PSScriptRoot"

# Check 1: Verify splash.png exists
Write-Host "Check 1: Splash Image File" -ForegroundColor Yellow
if (Test-Path "assets\splash.png") {
    $file = Get-Item "assets\splash.png"
    Write-Host "   OK splash.png exists" -ForegroundColor Green
    Write-Host "   Size: $('{0:N0}' -f $file.Length) bytes" -ForegroundColor Gray
    Write-Host "   Modified: $($file.LastWriteTime)" -ForegroundColor Gray
} else {
    Write-Host "   ERROR splash.png NOT FOUND" -ForegroundColor Red
    Write-Host "   Creating from icon.png..." -ForegroundColor Yellow
    Copy-Item "assets\icon.png" "assets\splash.png"
    Write-Host "   OK Created splash.png" -ForegroundColor Green
}
Write-Host ""

# Check 2: Verify icon.png exists
Write-Host "Check 2: Icon Image File" -ForegroundColor Yellow
if (Test-Path "assets\icon.png") {
    $file = Get-Item "assets\icon.png"
    Write-Host "   OK icon.png exists" -ForegroundColor Green
    Write-Host "   Size: $('{0:N0}' -f $file.Length) bytes" -ForegroundColor Gray
} else {
    Write-Host "   ERROR icon.png NOT FOUND" -ForegroundColor Red
}
Write-Host ""

# Check 3: Verify app.json configuration
Write-Host "Check 3: app.json Configuration" -ForegroundColor Yellow
if (Test-Path "app.json") {
    $appJsonContent = Get-Content "app.json" -Raw
    $appJson = $appJsonContent | ConvertFrom-Json
    
    # Check splash image path
    $splashImage = $appJson.expo.splash.image
    if ($splashImage -eq "./assets/splash.png") {
        Write-Host "   OK Splash image path correct: $splashImage" -ForegroundColor Green
    } else {
        Write-Host "   ERROR Splash image path incorrect: $splashImage" -ForegroundColor Red
        Write-Host "   Expected: ./assets/splash.png" -ForegroundColor Yellow
    }
    
    # Check splash background color
    $bgColor = $appJson.expo.splash.backgroundColor
    if ($bgColor -eq "#F4F6F7") {
        Write-Host "   OK Splash background color correct: $bgColor" -ForegroundColor Green
    } else {
        Write-Host "   ERROR Splash background color incorrect: $bgColor" -ForegroundColor Red
        Write-Host "   Expected: #F4F6F7" -ForegroundColor Yellow
    }
    
    # Check Android adaptive icon background
    $androidBg = $appJson.expo.android.adaptiveIcon.backgroundColor
    if ($androidBg -eq "#F4F6F7") {
        Write-Host "   OK Android icon background correct: $androidBg" -ForegroundColor Green
    } else {
        Write-Host "   ERROR Android icon background incorrect: $androidBg" -ForegroundColor Red
        Write-Host "   Expected: #F4F6F7" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ERROR app.json NOT FOUND" -ForegroundColor Red
}
Write-Host ""

# Check 4: Verify cache directories are clean
Write-Host "Check 4: Cache Status" -ForegroundColor Yellow
$cacheClean = $true

if (Test-Path ".expo") {
    Write-Host "   WARNING .expo folder exists (might contain old cache)" -ForegroundColor Yellow
    $cacheClean = $false
} else {
    Write-Host "   OK .expo folder cleared" -ForegroundColor Green
}

if (Test-Path "node_modules\.cache") {
    Write-Host "   WARNING Metro cache exists" -ForegroundColor Yellow
    $cacheClean = $false
} else {
    Write-Host "   OK Metro cache cleared" -ForegroundColor Green
}

if ($cacheClean) {
    Write-Host "   OK All caches are clean" -ForegroundColor Green
} else {
    Write-Host "   Tip: Run 'npx expo start -c' to clear caches" -ForegroundColor Cyan
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor White
Write-Host ""

$allGood = $true

if (-not (Test-Path "assets\splash.png")) {
    Write-Host "ERROR Missing: assets/splash.png" -ForegroundColor Red
    $allGood = $false
}

if (-not (Test-Path "assets\icon.png")) {
    Write-Host "ERROR Missing: assets/icon.png" -ForegroundColor Red
    $allGood = $false
}

if (Test-Path "app.json") {
    $appJsonCheck = Get-Content "app.json" -Raw | ConvertFrom-Json
    
    if ($appJsonCheck.expo.splash.image -ne "./assets/splash.png") {
        Write-Host "ERROR Wrong splash image path in app.json" -ForegroundColor Red
        $allGood = $false
    }
    
    if ($appJsonCheck.expo.splash.backgroundColor -ne "#F4F6F7") {
        Write-Host "ERROR Wrong splash background color" -ForegroundColor Red
        $allGood = $false
    }
}

if ($allGood) {
    Write-Host "OK Everything looks good" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next step: Run 'npx expo start -c'" -ForegroundColor Cyan
    Write-Host "Then reload your app to see the new splash screen" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "Please fix the issues above, then run:" -ForegroundColor Yellow
    Write-Host "  npx expo start -c" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
