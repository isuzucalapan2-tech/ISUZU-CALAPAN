# Ensure logs directory exists
New-Item -ItemType Directory -Force -Path "logs" | Out-Null
$LogFile = "$(Get-Location)/logs/backup.log"
$XamppPath = "C:\xampp"
$MaxRetries = 3
$BaseDelay = 5

function Write-Log {
    param([string]$Message)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] $Message"
    Add-Content -Path $LogFile -Value $LogEntry
    Write-Host $LogEntry
}

function Test-ServiceRunning {
    param([string]$ServiceType)
    switch ($ServiceType) {
        "xampp" { return (Get-Process -Name "xampp-control" -ErrorAction SilentlyContinue) -ne $null }
        "apache" { return (Get-Process -Name "httpd" -ErrorAction SilentlyContinue) -ne $null }
        "mysql" { return (Get-Process -Name "mysqld" -ErrorAction SilentlyContinue) -ne $null }
    }
    return $false
}

function Start-WithRetry {
    param([scriptblock]$Action, [string]$Description, [string]$ServiceType = "")
    for ($i = 1; $i -le $MaxRetries; $i++) {
        Write-Log "$Description attempt #$i"
        try {
            & $Action
            Start-Sleep -Seconds ($BaseDelay * [math]::Pow(2, ($i-1)))
            if ($ServiceType -and (Test-ServiceRunning $ServiceType)) {
                Write-Log "$Description — SUCCESS (confirmed $ServiceType running)"
                return $true
            } elseif (-not $ServiceType) {
                Write-Log "$Description — SUCCESS"
                return $true
            }
        } catch {
            Write-Log "$Description attempt #$i — FAILED: $_"
            if ($i -lt $MaxRetries) {
                Start-Sleep -Seconds ($BaseDelay * [math]::Pow(2, $i))
            }
        }
    }
    Write-Log "$Description — ALL RETRIES FAILED"
    return $false
}

Write-Log "=== Saturday Backup Process Started ==="

# Check/Start XAMPP Control Panel
if (-not (Test-ServiceRunning "xampp")) {
    $xamppStarted = Start-WithRetry { Start-Process -FilePath "$XamppPath\xampp-control.exe" -ArgumentList "start" -Wait -WindowStyle Hidden } "XAMPP Control Panel start" "xampp"
    if (-not $xamppStarted) {
        Write-Log "XAMPP Control Panel start failed - aborting"
        exit 1
    }
} else {
    Write-Log "XAMPP Control Panel already running"
}

Start-Sleep 10

# Start Apache
$ApacheAction = { Start-Process -FilePath "$XamppPath\xampp-control.exe" -ArgumentList "startapache" -Wait -WindowStyle Hidden }
if (-not (Start-WithRetry $ApacheAction "Apache start" "apache")) {
    Write-Log "Apache failed - aborting"
    exit 1
}

Start-Sleep 10

# Start MySQL
$MySQLAction = { Start-Process -FilePath "$XamppPath\xampp-control.exe" -ArgumentList "startmysql" -Wait -WindowStyle Hidden }
if (-not (Start-WithRetry $MySQLAction "MySQL start" "mysql")) {
    Write-Log "MySQL failed - aborting"
    exit 1
}

Write-Log "All services started successfully. Waiting 1800s (30min) buffer for full initialization before backup..."

Start-Sleep 1800

# Validate XAMPP path
if (-not (Test-Path "$XamppPath\xampp-control.exe")) {
    Write-Log "ERROR: XAMPP not found at $XamppPath\xampp-control.exe - aborting"
    exit 1
}

# Run backup with retry (cd first)
Set-Location "C:\Users\admin\Downloads\ISUZU-APP"
$BackupCmd = 'node firestore-sync/syncFirestoreToMySQL.js'
for ($i = 1; $i -le $MaxRetries; $i++) {
    Write-Log "Backup attempt #$i"
    try {
        $backupProcess = Start-Process -FilePath "node" -ArgumentList "firestore-sync/syncFirestoreToMySQL.js" -Wait -NoNewWindow -PassThru -RedirectStandardOutput "backup_output.txt" -RedirectStandardError "backup_error.txt"
        $exitCode = $backupProcess.ExitCode
        $output = Get-Content "backup_output.txt" -Raw
        $errorOutput = Get-Content "backup_error.txt" -Raw
        
        Write-Log "Backup attempt #$i exit code: $exitCode"
        if ($output) { Write-Log "Output preview: $($output.Substring(0, [Math]::Min(500, $output.Length)))" }
        if ($errorOutput) { Write-Log "Error output: $errorOutput" }
        
        Remove-Item "backup_output.txt", "backup_error.txt" -ErrorAction SilentlyContinue
        
        if ($exitCode -eq 0) {
            Write-Log "Backup SUCCESS"
            break
        } else {
            throw "Backup script exited with code $exitCode"
        }
    } catch {
        Write-Log "Backup attempt #$i FAILED: $_"
        if ($i -eq $MaxRetries) {
            Write-Log "All backup retries failed - Backup Failed"
            exit 1
        }
        Start-Sleep -Seconds (10 * [math]::Pow(2, $i))
    }
}

Write-Log "=== Backup Process Completed ==="

