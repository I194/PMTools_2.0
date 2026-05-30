import parseCSV_PMD from '../parsers/parserCSV_PMD';
import { describeParserReferenceOutput } from '../../../test-utils/referenceFixtures';

describeParserReferenceOutput({ parser: parseCSV_PMD, fixtureDirectory: 'csv_pmd' });
