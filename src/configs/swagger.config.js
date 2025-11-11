// swagger.config.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Bank Sultra - MSDM Modul Absensi API',
      version: '1.0.0',
      description: `
API Documentation untuk Sistem Manajemen Absensi Bank Sulawesi Tenggara

**Response Format**:
\`\`\`json
{
  "code": 200,
  "message": "Success",
  "data": {},
  "metadata": {}
}
\`\`\`
      `,
      contact: {
        name: 'Divisi SDM',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development Server',
      },
      {
        url: 'http://172.16.52.46:5000/api',
        description: 'Production Server',
      },
    ],
    tags: [
      { name: 'System', description: 'Health check & database operations' },
      { name: 'Master - Lokasi Kerja', description: 'Manajemen lokasi kerja' },
      { name: 'Master - Kebijakan Absensi', description: 'Manajemen kebijakan absensi' },
      { name: 'Master - Shift Group', description: 'Manajemen shift group' },
      { name: 'Master - Shift Kerja', description: 'Manajemen shift kerja' },
      { name: 'Master - Hari Libur', description: 'Manajemen hari libur' },
      { name: 'Relational - Shift Group Detail', description: 'Detail shift group' },
      { name: 'Relational - Shift Pegawai', description: 'Assignment shift ke pegawai' },
      { name: 'Relational - Lokasi Kerja Pegawai', description: 'Assignment lokasi kerja ke pegawai' },
      { name: 'Transactional - Log Raw Absensi', description: 'Log absensi mentah dari mesin/smartphone' },
      { name: 'Transactional - Shift Harian Pegawai', description: 'Shift harian pegawai' },
      { name: 'Transactional - Absensi Harian', description: 'Rekonsiliasi absensi harian' },
      { name: 'Laporan - Realisasi Lembur', description: 'Laporan realisasi lembur' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            code: { type: 'integer', example: 200 },
            message: { type: 'string', example: 'Success' },
            data: { type: 'object' },
            metadata: { type: 'object', nullable: true },
          },
        },
        SuccessListResponse: {
          type: 'object',
          properties: {
            code: { type: 'integer', example: 200 },
            message: { type: 'string', example: 'Success' },
            data: { type: 'array', items: { type: 'object' } },
            metadata: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                page: { type: 'integer' },
                limit: { type: 'integer' },
                totalPages: { type: 'integer' },
              },
            },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            code: { type: 'integer', example: 400 },
            message: { type: 'string', example: 'Validation Error' },
            data: {
              type: 'object',
              properties: {
                errors: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
            metadata: { type: 'object', nullable: true },
          },
        },
      },
      parameters: {
        IdParam: {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
        PageParam: {
          name: 'page',
          in: 'query',
          schema: { type: 'integer', minimum: 1, default: 1 },
        },
        LimitParam: {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    './src/routes/**/*.js',
    './src/routes/*.js',
  ],
};

export const specs = swaggerJsdoc(options);
export { swaggerUi };