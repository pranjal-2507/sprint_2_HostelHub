# Utility script to kill any process running on port 8080 or named 'hostelhub_backend'
# Usage: powershell -ExecutionPolicy Bypass -File kill-port.ps1

$port = 8080
$processName = "hostelhub_backend"

Write-Host "--- Backend Cleanup Utility ---" -ForegroundColor Cyan

# 1. Kill by process name (handles file locks)
Write-Host "Checking for processes named '$processName'..." -ForegroundColor Cyan
$namedProcesses = Get-Process -Name $processName -ErrorAction SilentlyContinue
if ($namedProcesses) {
    foreach ($p in $namedProcesses) {
        Write-Host "Found process '$($p.ProcessName)' (PID: $($p.Id)). Terminating..." -ForegroundColor Yellow
        Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "All processes named '$processName' closed." -ForegroundColor Green
} else {
    Write-Host "No processes named '$processName' found." -ForegroundColor Gray
}

# 2. Kill by port (handles network conflicts)
Write-Host "Checking for port $port..." -ForegroundColor Cyan
try {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction Stop
    $processId = $connection.OwningProcess
    $p = Get-Process -Id $processId -ErrorAction SilentlyContinue
    
    if ($p) {
        Write-Host "Found process '$($p.ProcessName)' (PID: $processId) using port $port. Terminating..." -ForegroundColor Yellow
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        Write-Host "Successfully cleared port $port." -ForegroundColor Green
    }
}
catch {
    Write-Host "No active connections on port $port." -ForegroundColor Gray
}

Write-Host "Cleanup complete. You can now run 'cargo run' safely!" -ForegroundColor Green
