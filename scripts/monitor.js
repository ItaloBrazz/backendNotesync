const axios = require('axios');

const BASE_URL = 'http://localhost:8080';
const CHECK_INTERVAL = 5000;

const services = [
  { name: 'Gateway', url: `${BASE_URL}/health` },
  { name: 'Auth Service', url: `${BASE_URL}/api/auth/health` },
  { name: 'Tasks Service', url: `${BASE_URL}/api/tasks/health` }
];

async function checkHealth(service) {
  try {
    const response = await axios.get(service.url, { timeout: 3000 });
    
    if (response.status === 200) {
      console.log(`[OK] ${service.name} - Status: ${response.status}`);
      return true;
    } else {
      console.error(`[ERRO] ${service.name} - Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`[ERRO] ${service.name} - ${error.message}`);
    return false;
  }
}

async function monitorServices() {
  console.log('Iniciando monitoramento de servicos...\n');
  
  setInterval(async () => {
    console.log(`\n[${new Date().toISOString()}] Verificando saude dos servicos...`);
    
    for (const service of services) {
      await checkHealth(service);
    }
    
    console.log('---');
  }, CHECK_INTERVAL);
}

monitorServices();
