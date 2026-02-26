// EJECUTAR ESTE SCRIPT EN LA CONSOLA DEL NAVEGADOR (F12)

// Función para cambiar el rol del admin a secretaria
function convertAdminToSecretary() {
  console.log('🔄 Convirtiendo usuario admin a secretaria...');

  const dbData = localStorage.getItem('luzDelSaberDB');

  if (!dbData) {
    console.error('❌ No hay base de datos. Refresca la página primero.');
    return;
  }

  const db = JSON.parse(dbData);

  // Buscar el usuario admin
  const adminUser = db.users?.find(u => u.email === 'admin@luzdelsaber.edu.pe');

  if (!adminUser) {
    console.error('❌ No se encontró el usuario admin@luzdelsaber.edu.pe');
    return;
  }

  console.log('📋 Usuario actual:', {
    nombre: adminUser.nombre,
    email: adminUser.email,
    rol: adminUser.rol
  });

  // Cambiar el rol a secretaria
  adminUser.rol = 'secretaria';

  // Guardar cambios
  localStorage.setItem('luzDelSaberDB', JSON.stringify(db));

  console.log('✅ ROL CAMBIADO A SECRETARIA');
  console.log('📋 Usuario actualizado:', {
    nombre: adminUser.nombre,
    email: adminUser.email,
    rol: adminUser.rol
  });

  // Cerrar sesión actual si existe
  const authToken = localStorage.getItem('authToken');
  if (authToken) {
    localStorage.removeItem('authToken');
    console.log('🔒 Sesión cerrada');
  }

  console.log('🔄 Refrescando página en 2 segundos...');
  console.log('📝 Luego inicia sesión con:');
  console.log('   Email: admin@luzdelsaber.edu.pe');
  console.log('   Password: Admin2024');
  console.log('❌ NO podrás crear/editar nada');
  console.log('✅ Solo podrás VER en modo lectura');

  setTimeout(() => {
    window.location.reload();
  }, 2000);
}

// EJECUTAR AUTOMÁTICAMENTE
convertAdminToSecretary();