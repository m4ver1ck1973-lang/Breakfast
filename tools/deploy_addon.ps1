# Get project root folder
$ProjectRoot = Split-Path -Path $PSScriptRoot -Parent

# Detect all active Mojang directories
$TargetDirs = @(
    "$env:appdata\Minecraft Bedrock\Users\Shared\games\com.mojang",
    "$env:localappdata\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang",
    "$env:localappdata\Packages\Microsoft.MinecraftWindowsBeta_8wekyb3d8bbwe\LocalState\games\com.mojang"
)

$DeployedCount = 0

foreach ($MojangDir in $TargetDirs) {
    if (Test-Path $MojangDir) {
        Write-Host "Deploying to Mojang directory: $MojangDir"
        
        # 1. Clean up standard behavior_packs and resource_packs to avoid UUID conflicts
        $StandardBpDir = Join-Path -Path $MojangDir -ChildPath "behavior_packs"
        $StandardRpDir = Join-Path -Path $MojangDir -ChildPath "resource_packs"

        if (Test-Path $StandardBpDir) {
            Get-ChildItem -Path $StandardBpDir -Directory | ForEach-Object {
                $ManifestFile = Join-Path -Path $_.FullName -ChildPath "manifest.json"
                if (Test-Path $ManifestFile) {
                    $Content = Get-Content -Raw -Path $ManifestFile
                    if ($Content -match "Breakfast") {
                        Write-Host "  Cleaning up conflicting imported Behavior Pack: $($_.FullName)"
                        Remove-Item -Recurse -Force $_.FullName
                    }
                }
            }
        }

        if (Test-Path $StandardRpDir) {
            Get-ChildItem -Path $StandardRpDir -Directory | ForEach-Object {
                $ManifestFile = Join-Path -Path $_.FullName -ChildPath "manifest.json"
                if (Test-Path $ManifestFile) {
                    $Content = Get-Content -Raw -Path $ManifestFile
                    if ($Content -match "Breakfast") {
                        Write-Host "  Cleaning up conflicting imported Resource Pack: $($_.FullName)"
                        Remove-Item -Recurse -Force $_.FullName
                    }
                }
            }
        }

        # 2. Deploy to development folders for live reloading
        $bpDest = Join-Path -Path $MojangDir -ChildPath "development_behavior_packs\Breakfast_BP"
        $rpDest = Join-Path -Path $MojangDir -ChildPath "development_resource_packs\Breakfast_RP"
        
        Write-Host "  Deploying Behavior Pack to: $bpDest"
        if (Test-Path $bpDest) {
            Remove-Item -Recurse -Force $bpDest
        }
        Copy-Item -Recurse -Path (Join-Path -Path $ProjectRoot -ChildPath "Breakfast_BP") -Destination $bpDest
        
        Write-Host "  Deploying Resource Pack to: $rpDest"
        if (Test-Path $rpDest) {
            Remove-Item -Recurse -Force $rpDest
        }
        Copy-Item -Recurse -Path (Join-Path -Path $ProjectRoot -ChildPath "Breakfast_RP") -Destination $rpDest
        
        $DeployedCount++
    }
}

if ($DeployedCount -gt 0) {
    Write-Host "Direct deployment complete to $DeployedCount directories! Restart Minecraft and reload your world to see updates."
} else {
    Write-Warning "No com.mojang development directory found."
}
