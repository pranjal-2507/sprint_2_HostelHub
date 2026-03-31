# Utility script to kill any process running on port 8080 (backend default)
# Usage: powershell -ExecutionPolicy Bypass -File kill-port.ps1

$port = 8080
Write-Host "Checking for processes on port $port..." -ForegroundColor Cyan

try {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction Stop
    $processId = $connection.OwningProcess
    $processName = (Get-Process -Id $processId).ProcessName

    Write-Host "Found process '$processName' (PID: $processId) using port $port." -ForegroundColor Yellow
    Write-Host "Terminating process..." -ForegroundColor Cyan
    
    Stop-Process -Id $processId -Force
    Write-Host "Successfully cleared port $port." -ForegroundColor Green
}
catch {
    Write-Host "No process found on port $port. You are good to go!" -ForegroundColor Green
}
