// Generador de credenciales para nuevos usuarios
export class CredentialGenerator {
  // Genera un email único basado en nombres y apellidos
  static generateEmail(nombres, apellidoPaterno, apellidoMaterno = '', domain = 'luzdelsaber.edu.pe') {
    const cleanNombres = nombres.toLowerCase().replace(/\s+/g, '');
    const cleanApellidoP = apellidoPaterno.toLowerCase().replace(/\s+/g, '');
    const cleanApellidoM = apellidoMaterno?.toLowerCase().replace(/\s+/g, '') || '';

    // Usar hash para generar número consistente
    const nameString = cleanNombres + cleanApellidoP + cleanApellidoM;
    const hash = nameString.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    const consistentNumber = hash % 1000;

    return `${cleanNombres}.${cleanApellidoP}${consistentNumber}@${domain}`;
  }

  // Genera una contraseña temporal basada en el DNI y rol
  static generatePassword(dni, rol = 'padre') {
    const year = new Date().getFullYear();
    const rolCapitalized = rol.charAt(0).toUpperCase() + rol.slice(1);

    // Usar primeros 4 dígitos del DNI + rol + año
    const firstFourDigits = dni.substring(0, 4);
    return `${rolCapitalized}${firstFourDigits}${year}`;
  }

  // Genera credenciales completas para un nuevo padre
  static generateParentCredentials(parentData) {
    const { first_names, apellidoPaterno, apellidoMaterno = '', dni } = parentData;

    return {
      email: this.generateEmail(nombres, apellidoPaterno, apellidoMaterno),
      password: this.generatePassword(dni, 'padre'),
      temporaryPassword: true // Marca que es contraseña temporal
    };
  }
}