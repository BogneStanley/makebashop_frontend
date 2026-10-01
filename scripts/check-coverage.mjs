import { readFileSync } from 'node:fs';
import coverage from 'istanbul-lib-coverage';

const reportPath = 'coverage/shop_front/coverage-final.json';
const minimumLineCoverage = 25;
const report = JSON.parse(readFileSync(reportPath, 'utf8'));
const lineCoverage = coverage.createCoverageMap(report).getCoverageSummary().lines.pct;

console.log(`Frontend line coverage: ${lineCoverage}% (minimum: ${minimumLineCoverage}%)`);

if (lineCoverage < minimumLineCoverage) {
  process.exitCode = 1;
}
