# Run this once after Python is installed to schedule daily emails at 8 AM MST
# Open PowerShell as Administrator and run: .\setup-scheduler.ps1

$taskName = "VeepoSocialGenerator"
$scriptPath = "C:\Users\Nuc2020\veepo-social\run.bat"

# Remove existing task if it exists
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

# Create the trigger — 8:00 AM daily
$trigger = New-ScheduledTaskTrigger -Daily -At "08:00AM"

# Run as current user, only when logged in
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive

# The action
$action = New-ScheduledTaskAction -Execute $scriptPath

# Register
Register-ScheduledTask -TaskName $taskName -Trigger $trigger -Principal $principal -Action $action -Description "Veepo daily social content generator"

Write-Host "Scheduled task created. Runs daily at 8:00 AM." -ForegroundColor Green
Write-Host "To test it now: Start-ScheduledTask -TaskName '$taskName'" -ForegroundColor Cyan
