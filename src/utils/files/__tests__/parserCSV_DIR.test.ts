import parseCSV_DIR from '../parsers/parserCSV_DIR';
import { describeParserReferenceOutput } from '../../../test-utils/referenceFixtures';

describeParserReferenceOutput({ parser: parseCSV_DIR, fixtureDirectory: 'csv_dir' });
