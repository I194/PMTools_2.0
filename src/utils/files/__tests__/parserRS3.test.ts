import parseRS3 from '../parsers/parserRS3';
import { describeParserReferenceOutput } from '../../../test-utils/referenceFixtures';

describeParserReferenceOutput({ parser: parseRS3, fixtureDirectory: 'rs3' });
