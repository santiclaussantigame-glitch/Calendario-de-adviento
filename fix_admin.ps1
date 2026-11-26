$path = "C:\Users\USUARIO\OneDrive\Desktop\calendario de adviento\index.html"
$content = Get-Content -Raw $path
# Remove all adminUnlockBtn buttons (multiline)
$content = $content -replace '(?s)<button[^>]*id="adminUnlockBtn"[^>]*>.*?</button>\s*',''
# Define the admin button HTML
$insert = '<button type="button" class="ambient-btn" id="adminUnlockBtn" aria-label="Modo administrador">🔒 Solo entra Santi</button>'
# Insert the button before </body>
$content = $content -replace '</body>', "`n    $insert`n</body>"
Set-Content -Path $path -Value $content -Encoding UTF8