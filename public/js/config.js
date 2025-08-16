// Configuración de la API
// CAMBIA ESTA URL POR LA URL REAL DE TU API EN RENDER
const API_BASE_URL = 'https://tu-api.onrender.com';

// Función para construir URLs completas de la API
function getApiUrl(endpoint) {
  return `${API_BASE_URL}/api${endpoint}`;
}

// Función para verificar si el usuario está autenticado
async function checkAuth() {
  try {
    const response = await fetch(getApiUrl('/usuario'), {
      credentials: 'include'
    });
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error verificando autenticación:', error);
    return null;
  }
}

// Función para redirigir si no está autenticado
async function requireAuth() {
  const user = await checkAuth();
  if (!user) {
    window.location.href = 'login.html';
    return false;
  }
  return user;
}

// Función para hacer logout
async function logout() {
  try {
    await fetch(getApiUrl('/logout'), {
      method: 'POST',
      credentials: 'include'
    });
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Error en logout:', error);
    window.location.href = 'login.html';
  }
}
