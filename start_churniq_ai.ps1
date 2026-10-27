$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$url = "http://127.0.0.1:8000/ui/preview.html"

Write-Host "Starting ChurnIQ AI FastAPI backend..."
Start-Process -FilePath python -ArgumentList @("-m", "uvicorn", "api.app:app", "--host", "127.0.0.1", "--port", "8000") -WorkingDirectory $root -WindowStyle Hidden | Out-Null
Start-Sleep -Seconds 3

Write-Host "Opening ChurnIQ AI interface: $url"
Start-Process $url
