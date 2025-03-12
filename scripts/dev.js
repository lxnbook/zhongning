const concurrently = require('concurrently');

concurrently([
  { 
    command: 'cd frontend && npm start', 
    name: 'FRONTEND', 
    prefixColor: 'blue' 
  },
  { 
    command: 'cd backend && npm run dev', 
    name: 'BACKEND', 
    prefixColor: 'green' 
  }
], {
  prefix: 'name',
  killOthers: ['failure', 'success'],
  restartTries: 3,
  restartDelay: 1000
}).then(
  () => console.log('All processes exited with success'),
  (error) => console.error('One or more processes failed', error)
); 