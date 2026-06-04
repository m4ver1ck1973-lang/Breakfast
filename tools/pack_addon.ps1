# Get project root folder
$ProjectRoot = Split-Path -Path $PSScriptRoot -Parent
$ManifestPath = Join-Path -Path $ProjectRoot -ChildPath "Breakfast_BP\manifest.json"

# Read version from manifest
$VersionStr = "1.0.4"
if (Test-Path $ManifestPath) {
    try {
        $Manifest = Get-Content -Raw -Path $ManifestPath | ConvertFrom-Json
        $VersionArray = $Manifest.header.version
        $VersionStr = $VersionArray -join "."
    } catch {
        Write-Warning "Could not read version from manifest.json. Defaulting to 1.0.4."
    }
}

$AddonName = "Breakfast_$VersionStr.mcaddon"
$OutputPath = Join-Path -Path $ProjectRoot -ChildPath $AddonName

# Clean up existing archive
if (Test-Path $OutputPath) {
    Remove-Item -Force $OutputPath
}

Write-Host "Starting packaging into $AddonName..."

# Load .NET Assembly for ZipArchive
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = $null
try {
    # Open zip archive for writing
    $zip = [System.IO.Compression.ZipFile]::Open($OutputPath, [System.IO.Compression.ZipArchiveMode]::Create)

    $Folders = @("Breakfast_BP", "Breakfast_RP")
    foreach ($Folder in $Folders) {
        $FolderRoot = Join-Path -Path $ProjectRoot -ChildPath $Folder
        if (Test-Path $FolderRoot) {
            Write-Host "Packing $Folder..."
            $Files = Get-ChildItem -Path $FolderRoot -Recurse -File
            foreach ($File in $Files) {
                # Compute relative path under the project root
                $RelativePath = $File.FullName.Substring($ProjectRoot.Length + 1)
                
                # Replace Windows backslashes with forward slashes for Minecraft Bedrock compatibility
                $EntryName = $RelativePath.Replace("\", "/")
                
                # Create entry in zip
                [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $File.FullName, $EntryName) | Out-Null
            }
        } else {
            Write-Warning "Folder $Folder not found, skipping."
        }
    }
} finally {
    if ($zip -ne $null) {
        $zip.Dispose()
    }
}

Write-Host "Successfully packaged addon to $OutputPath"
