import parseCSV_SitesLatLon from '../parsers/parserCSV_SitesLatLon';
import { describeParserReferenceOutput } from '../../../test-utils/referenceFixtures';

describeParserReferenceOutput({
  parser: parseCSV_SitesLatLon,
  fixtureDirectory: 'csv_sites_latlon',
});
