# PowerShell script to start both backend and frontend services

# Start backend in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev"

# Start frontend in current window
cd frontend
npm start 