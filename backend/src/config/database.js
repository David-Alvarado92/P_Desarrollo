import sql from 'mssql';

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourStrong@Passw0rd',
  server: process.env.DB_SERVER || 'sqlserver',
  database: process.env.DB_NAME || 'BasketballDB',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool = null;

export async function connectDB() {
  try {
    if (pool) {
      return pool;
    }

    console.log('Conectando a SQL Server...');
    pool = await sql.connect(config);
    console.log('Conexión exitosa a SQL Server');
    return pool;
  } catch (error) {
    console.error('Error al conectar con SQL Server:', error);
    throw error;
  }
}

export async function getPool() {
  if (!pool) {
    await connectDB();
  }
  return pool;
}

export { sql };
