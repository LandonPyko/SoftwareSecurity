# Configuration Steps

Install Postgresql: sudo apt install postgresql postgresql-contrib
sudo service postgresql start
Set postgresql password: sudo passwd postgres

Install dotenv: npm install dotenv
Create .env file in Link-Board that holds: DATABASE_URL=postgres://postgres:mypassword@localhost:5432/linkboard
Replace mypassword with a password you set

npm run db:push

npm run build
npm run dev or npm start