/**
 * Convierte un valor numérico en pesos colombianos (COP) a su representación en letras
 * en mayúsculas con la terminación legal obligatoria "PESOS M/CTE." (Moneda Corriente).
 */

function unidades(num: number): string {
  switch (num) {
    case 1: return 'UN';
    case 2: return 'DOS';
    case 3: return 'TRES';
    case 4: return 'CUATRO';
    case 5: return 'CINCO';
    case 6: return 'SEIS';
    case 7: return 'SIETE';
    case 8: return 'OCHO';
    case 9: return 'NUEVE';
    default: return '';
  }
}

function decenasYUnidades(num: number): string {
  if (num < 10) return unidades(num);
  if (num === 10) return 'DIEZ';
  if (num === 11) return 'ONCE';
  if (num === 12) return 'DOCE';
  if (num === 13) return 'TRECE';
  if (num === 14) return 'CATORCE';
  if (num === 15) return 'QUINCE';
  if (num < 20) return `DIECI${unidades(num - 10)}`;
  if (num === 20) return 'VEINTE';
  if (num < 30) return `VEINTI${unidades(num - 20)}`;
  if (num === 30) return 'TREINTA';
  if (num === 40) return 'CUARENTA';
  if (num === 50) return 'CINCUENTA';
  if (num === 60) return 'SESENTA';
  if (num === 70) return 'SETENTA';
  if (num === 80) return 'OCHENTA';
  if (num === 90) return 'NOVENTA';

  const decena = Math.floor(num / 10) * 10;
  const unidad = num % 10;
  return `${decenasYUnidades(decena)} Y ${unidades(unidad)}`;
}

function centenas(num: number): string {
  if (num === 100) return 'CIEN';
  if (num < 100) return decenasYUnidades(num);

  const c = Math.floor(num / 100);
  const resto = num % 100;
  let strCentena = '';

  switch (c) {
    case 1: strCentena = 'CIENTO'; break;
    case 2: strCentena = 'DOSCIENTOS'; break;
    case 3: strCentena = 'TRESCIENTOS'; break;
    case 4: strCentena = 'CUATROCIENTOS'; break;
    case 5: strCentena = 'QUINIENTOS'; break;
    case 6: strCentena = 'SEISCIENTOS'; break;
    case 7: strCentena = 'SETECIENTOS'; break;
    case 8: strCentena = 'OCHOCIENTOS'; break;
    case 9: strCentena = 'NOVECIENTOS'; break;
    default: strCentena = '';
  }

  return resto > 0 ? `${strCentena} ${decenasYUnidades(resto)}` : strCentena;
}

function seccionMiles(num: number): string {
  if (num === 0) return '';
  if (num === 1) return 'MIL';
  if (num < 1000) return centenas(num);

  const miles = Math.floor(num / 1000);
  const resto = num % 1000;

  const strMiles = miles === 1 ? 'UN MIL' : `${centenas(miles)} MIL`;
  return resto > 0 ? `${strMiles} ${centenas(resto)}` : strMiles;
}

export function numeroALetrasCOP(monto: number): string {
  if (!monto || isNaN(monto) || monto <= 0) {
    return 'CERO PESOS M/CTE.';
  }

  const entero = Math.floor(monto);

  if (entero === 0) return 'CERO PESOS M/CTE.';

  if (entero < 1000000) {
    const texto = seccionMiles(entero).replace(/^UN MIL/, 'MIL');
    return `${texto} PESOS M/CTE.`.replace(/\s+/g, ' ').trim();
  }

  const millones = Math.floor(entero / 1000000);
  const resto = entero % 1000000;

  let strMillones = '';
  if (millones === 1) {
    strMillones = 'UN MILLÓN';
  } else {
    strMillones = `${centenas(millones)} MILLONES`;
  }

  if (resto === 0) {
    return `${strMillones} DE PESOS M/CTE.`.replace(/\s+/g, ' ').trim();
  }

  const strResto = seccionMiles(resto).replace(/^UN MIL/, 'MIL');
  return `${strMillones} ${strResto} PESOS M/CTE.`.replace(/\s+/g, ' ').trim();
}
