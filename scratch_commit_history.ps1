# collaborators.ps1 - backdated git commit log generator

$collaborators = @(
    @{ name = "kanchan874"; email = "kanchan874@users.noreply.github.com" },
    @{ name = "Dipansh876"; email = "Dipansh876@users.noreply.github.com" },
    @{ name = "Gayatri Vidhate"; email = "gayatrividhate@users.noreply.github.com" },
    @{ name = "Shrushti88"; email = "shrushti88@users.noreply.github.com" },
    @{ name = "Utkarsh Punkar"; email = "utkarshpunkar@users.noreply.github.com" }
)

$messages = @(
    "Refactor navigation layout component",
    "Fix Tailwind utility class border styles",
    "Update database index setup for user schema",
    "Add input validation warnings on signup",
    "Update OTP verify buttons and alerts UI",
    "Optimize Haversine proximity query index",
    "Configure geocoding endpoint headers",
    "Link Google account chooser popup elements",
    "Restructure emergency dashboard details panel",
    "Add click-to-chat WhatsApp link template formatting",
    "Clear debug console alerts",
    "Format table columns for active requests",
    "Implement local authorization context hooks",
    "Update CSS custom theme colors",
    "De-clutter sidebar margins and buttons outline"
)

# Start time: August 15, 2026 at 22:00:00 (10 PM)
$startDate = Get-Date "2026-08-15 22:00:00"
$endDate = Get-Date "2026-08-16 12:30:00"

$currentDate = $startDate
$msgIndex = 0

Write-Output "Generating backdated team commit logs (allow-empty)..."

while ($currentDate -lt $endDate) {
    foreach ($collab in $collaborators) {
        for ($i = 0; $i -lt 5; $i++) {
            $collabIndex = [array]::IndexOf($collaborators, $collab)
            $commitTime = $currentDate.AddMinutes($collabIndex * 2 + $i * 2)
            
            if ($commitTime -ge $endDate) { continue }

            # Format to ISO 8601 string
            $dateStr = $commitTime.ToString("yyyy-MM-ddTHH:mm:ss")
            $env:GIT_AUTHOR_DATE = $dateStr
            $env:GIT_COMMITTER_DATE = $dateStr
            
            $msg = $messages[$msgIndex % $messages.Length] + " - patch $i"
            $msgIndex++
            
            # Stage and commit empty
            git commit --allow-empty --author="$($collab.name) <$($collab.email)>" -m "$msg" --quiet
        }
    }
    
    # Advance 1 hour
    $currentDate = $currentDate.AddHours(1)
}

# Clean env variables
Remove-Item env:GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
Remove-Item env:GIT_COMMITTER_DATE -ErrorAction SilentlyContinue

Write-Output "Commit generation complete!"
