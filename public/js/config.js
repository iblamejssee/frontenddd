// Configuración de la API - TODO en un solo servidor
// No necesitas cambiar nada aquí - funciona automáticamente

// Función para construir URLs de la API
function getApiUrl(endpoint) {
  return `/api${endpoint}`;
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
    window.location.href = '/login';
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
    window.location.href = '/login';
  } catch (error) {
    console.error('Error en logout:', error);
    window.location.href = '/login';
  }
}
