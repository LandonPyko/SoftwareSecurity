# Configuration Steps

(Will fix this stuff later)
Install Postgresql: https://learn.microsoft.com/en-us/windows/wsl/tutorials/wsl-database

Set postgres password
Install dotenv: npm install dotenv
Create .env file in Link-Board that holds: DATABASE_URL=postgres://postgres:mypassword@localhost:5432/linkboard
Replace mypassword with a password you set
npm run db:push
npm run dev or npm start