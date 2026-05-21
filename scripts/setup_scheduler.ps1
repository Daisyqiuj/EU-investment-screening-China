# 创建 Windows 计划任务：每周一上午 9:00 自动更新案例库
# 请以管理员身份运行 PowerShell，或在当前用户下创建任务

$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$ScriptPath = Join-Path $ProjectRoot "scripts\update_database.py"
$TaskName = "EU-China-FDI-Weekly-Update"

$PyLauncher = Get-Command py -ErrorAction SilentlyContinue
if ($PyLauncher) {
    $Python = $PyLauncher.Source
    $Action = New-ScheduledTaskAction -Execute $Python -Argument "-3 `"$ScriptPath`"" -WorkingDirectory $ProjectRoot
} else {
    $Python = (Get-Command python -ErrorAction SilentlyContinue).Source
    if (-not $Python) {
        Write-Error "未找到 Python。请先安装 Python 3.10+（推荐通过 py 启动器）。"
        exit 1
    }
    $Action = New-ScheduledTaskAction -Execute $Python -Argument "`"$ScriptPath`"" -WorkingDirectory $ProjectRoot
}

$Trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At "09:00"
$Settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "欧盟涉华投资审查案例库每周一9点自动更新" -Force

Write-Host "已创建/更新计划任务: $TaskName"
Write-Host "执行时间: 每周一 09:00"
Write-Host "脚本路径: $ScriptPath"
Write-Host ""
Write-Host "手动测试更新: py -3 `"$ScriptPath`""
