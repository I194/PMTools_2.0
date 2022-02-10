// https://stackoverflow.com/questions/38477972/javascript-save-svg-element-to-file-on-disk

// Function to download data to a file
export const download = (data: string | ArrayBuffer, filename: string, type: string) => {
  const file = new Blob([data], {type: type});
  const a = document.createElement("a");
  const url = URL.createObjectURL(file);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(function() {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);  
  }, 0); 
}

var exportSVG = function(svg: any) {
  // first create a clone of our svg node so we don't mess the original one
  var clone = svg.cloneNode(true);
  // create a doctype
  var svgDocType = document.implementation.createDocumentType('svg', "-//W3C//DTD SVG 1.1//EN", "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd");
  // a fresh svg document
  var svgDoc = document.implementation.createDocument('http://www.w3.org/2000/svg', 'svg', svgDocType);
  // replace the documentElement with our clone 
  svgDoc.replaceChild(clone, svgDoc.documentElement);
  // get the data
  var svgData = (new XMLSerializer()).serializeToString(svgDoc);

  // now you've got your svg data, the following will depend on how you want to download it
  // e.g yo could make a Blob of it for FileSaver.js
  /*
  var blob = new Blob([svgData.replace(/></g, '>\n\r<')]);
  saveAs(blob, 'myAwesomeSVG.svg');
  */
  // here I'll just make a simple a with download attribute

  // var a = document.createElement('a');
  // a.href = 'data:image/svg+xml; charset=utf8, ' + encodeURIComponent(svgData.replace(/></g, '>\n\r<'));
  // a.download = 'myAwesomeSVG.svg';
  // a.innerHTML = 'download the svg file';
  // document.body.appendChild(a);

  download(svgData, 'myAwesomeSVG.svg', '.svg');

};



export const handleSave = () => {
  console.log(document.getElementById('zijd-graph'))
	exportSVG(document.getElementById('mag-graph'));
}