import parsePMD from '../parsers/parserPMD';
import { describeParserReferenceOutput } from '../../../test-utils/referenceFixtures';

describeParserReferenceOutput({ parser: parsePMD, fixtureDirectory: 'pmd' });
