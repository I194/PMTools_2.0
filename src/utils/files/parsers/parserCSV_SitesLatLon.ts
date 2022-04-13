const parseCSV_SitesLatLon = (data: string, name: string) => {
  
  // eslint-disable-next-line no-control-regex
  const eol = new RegExp("\r?\n");
  // Get all lines except the last one (it's garbage)
  let lines = data.split(eol).filter(line => line.length > 1);
  
  const headLine = lines[0].split(',');
  const latIndex = headLine.findIndex(el => el.toLowerCase() === 'lat');
  const lonIndex = headLine.findIndex(el => el.toLowerCase() === 'lon');

  const coords = lines.slice(1).map((line, index) => {
    
    const params = line.replace(/\s+/g, ' ').split(',');

    const lat = +params[latIndex];
    const lon = +params[lonIndex];

    return {
      lat, 
      lon
    };

  });
  
  return {
    coords,
    format: "CSV_SitesLatLon",
    created: new Date().toISOString(),
  };

}

export default parseCSV_SitesLatLon;