// swagger.config.js
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load OpenAPI YAML file
const openapiPath = join(__dirname, '../../openapi-absensi.yaml');
const openapiFile = readFileSync(openapiPath, 'utf8');
const specs = load(openapiFile);

export { specs, swaggerUi };