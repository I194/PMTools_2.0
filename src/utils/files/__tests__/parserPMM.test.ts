import parsePMM from '../parsers/parserPMM';
import { describeParserReferenceOutput } from '../../../test-utils/referenceFixtures';

describeParserReferenceOutput({ parser: parsePMM, fixtureDirectory: 'pmm' });
