$ErrorActionPreference = 'Stop'

$ProjectRoot = 'D:\projects\n8n-nodes-scriptureflow'
$LocalN8nRoot = 'D:\projects\n8n-local'
$TargetRoot = 'D:\projects\n8n-local\custom-nodes\n8n-nodes-scriptureflow'

function Write-Status {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    Write-Host "[ScriptureFlow] $Message"
}

$currentPath = (Get-Location).ProviderPath
if ($currentPath -ine $ProjectRoot) {
    throw "Run this script from $ProjectRoot. Current folder is $currentPath."
}

if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot 'package.json') -PathType Leaf)) {
    throw "package.json was not found in $ProjectRoot."
}

if (-not (Test-Path -LiteralPath $LocalN8nRoot -PathType Container)) {
    throw "Local n8n sandbox folder was not found: $LocalN8nRoot"
}

if (-not (Test-Path -LiteralPath (Join-Path $LocalN8nRoot 'custom-nodes') -PathType Container)) {
    throw "Local n8n custom-nodes folder was not found: $(Join-Path $LocalN8nRoot 'custom-nodes')"
}

Write-Status 'Building package with npm.cmd run build...'
npm.cmd run build
if ($LASTEXITCODE -ne 0) {
    throw "Build failed with exit code $LASTEXITCODE. Deployment stopped."
}
Write-Status 'Build passed.'

$distPath = Join-Path $ProjectRoot 'dist'
if (-not (Test-Path -LiteralPath $distPath -PathType Container)) {
    throw "Build did not produce a dist folder: $distPath"
}

if (Test-Path -LiteralPath $TargetRoot) {
    Write-Status "Removing existing local deployment folder: $TargetRoot"
    Remove-Item -LiteralPath $TargetRoot -Recurse -Force
}

Write-Status "Creating local deployment folder: $TargetRoot"
New-Item -ItemType Directory -Force -Path $TargetRoot | Out-Null

Write-Status 'Copying package.json...'
Copy-Item -LiteralPath (Join-Path $ProjectRoot 'package.json') -Destination (Join-Path $TargetRoot 'package.json') -Force

Write-Status 'Copying dist output, including compiled node files and static assets...'
Copy-Item -LiteralPath $distPath -Destination $TargetRoot -Recurse -Force

Write-Status 'Local package files copied. node_modules was intentionally not copied.'

Write-Status 'Restarting local n8n Docker container...'
Push-Location $LocalN8nRoot
try {
    docker compose restart
    if ($LASTEXITCODE -ne 0) {
        throw "docker compose restart failed with exit code $LASTEXITCODE."
    }
}
finally {
    Pop-Location
}

Write-Status 'n8n restarted.'
Write-Status 'Refresh the n8n browser tab at http://localhost:5678 and search for "ScriptureFlow".'