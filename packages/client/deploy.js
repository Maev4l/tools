/**
 * Deployment script for CloudFront distribution
 */

import { execSync } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const infra = require('../../infra.json');

execSync(
  `deploy-aws-s3-cloudfront --source ./.dist --bucket ${infra.frontendBucket.value} --distribution ${infra.frontendDistribution.value} --invalidation-path "/*" --profile default --delete --non-interactive --cache-control index.html:no-cache`,
  { stdio: 'inherit' }
);
