/**
 * PRAXIA — Domain: Family Catalog
 * 
 * Families F01–F09 are defined.
 * F10+ are NOT defined yet — the architecture allows adding them later.
 * The catalog is open, not closed.
 */

export interface Family {
  id: string;
  code: string;
  name: string;
  description: string;
}

export const FAMILIES: Family[] = [
  {
    id: 'F01',
    code: 'F01',
    name: 'Dirección, estrategia y decisión',
    description: 'Gobierno corporativo, planificación estratégica, toma de decisiones.',
  },
  {
    id: 'F02',
    code: 'F02',
    name: 'Rentabilidad, costes, ingresos y valor',
    description: 'Estructura de costes, márgenes, ingresos, creación de valor.',
  },
  {
    id: 'F03',
    code: 'F03',
    name: 'Operaciones, procesos, productividad y calidad',
    description: 'Procesos operativos, eficiencia, calidad, productividad.',
  },
  {
    id: 'F04',
    code: 'F04',
    name: 'Compras, contratos y proveedores',
    description: 'Procurement, gestión contractual, relación con proveedores.',
  },
  {
    id: 'F05',
    code: 'F05',
    name: 'Supply Chain, inventario, almacenes y logística',
    description: 'Cadena de suministro, gestión de inventarios, logística.',
  },
  {
    id: 'F06',
    code: 'F06',
    name: 'Comercial, clientes, marketing, pricing y crecimiento',
    description: 'Ventas, marketing, relación con clientes, estrategia de precios.',
  },
  {
    id: 'F07',
    code: 'F07',
    name: 'Activos, instalaciones, mantenimiento y energía',
    description: 'Gestión de activos, instalaciones, mantenimiento, eficiencia energética.',
  },
  {
    id: 'F08',
    code: 'F08',
    name: 'Personas, organización, talento y conocimiento',
    description: 'Capital humano, estructura organizativa, gestión del talento.',
  },
  {
    id: 'F09',
    code: 'F09',
    name: 'Tecnología, datos, automatización e inteligencia artificial',
    description: 'Infraestructura tecnológica, datos, automatización, IA.',
  },
];

/**
 * Get a family by its ID.
 * Returns undefined if not found (e.g., F10+ not yet defined).
 */
export function getFamilyById(id: string): Family | undefined {
  return FAMILIES.find((f) => f.id === id);
}

/**
 * Check if a family ID is valid (currently defined).
 */
export function isValidFamilyId(id: string): boolean {
  return FAMILIES.some((f) => f.id === id);
}
