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

var exportSVG = function(svg: any, name?: string) {
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

  download(svgData, `${name || 'graph'}.svg`, '.svg');

};

// Compose three Reversal Test component SVGs into a single SVG laid out in a row
const exportReversalTestCombined = (id: string, name?: string) => {
  const NS = 'http://www.w3.org/2000/svg';
  const baseId = id.startsWith('export_') ? id.split('export_')[1] : id;

  // Collect all three SVGs. Support both duplicated id and optional suffixed ids if present.
  const selector = `svg[id="${baseId}"], svg[id^="${baseId}-"]`;
  const svgNodes = Array.from(document.querySelectorAll(selector)) as SVGSVGElement[];

  if (!svgNodes.length) {
    // Fallback to default single export if nothing matched
    const fallback = document.getElementById(baseId);
    if (fallback) exportSVG(fallback, name || 'reversalTest');
    return;
  }

  // Sort by horizontal position to keep X, Y, Z left-to-right
  const positioned = svgNodes
    .map(el => ({ el, rect: el.getBoundingClientRect() }))
    .sort((a, b) => a.rect.left - b.rect.left);

  const minLeft = Math.min(...positioned.map(p => p.rect.left));
  const minTop = Math.min(...positioned.map(p => p.rect.top));
  const maxRight = Math.max(...positioned.map(p => p.rect.right));
  const maxBottom = Math.max(...positioned.map(p => p.rect.bottom));

  const totalWidth = maxRight - minLeft;
  const totalHeight = maxBottom - minTop;

  // Create combined root SVG
  const combined = document.createElementNS(NS, 'svg');
  combined.setAttribute('xmlns', NS);
  combined.setAttribute('version', '1.1');
  combined.setAttribute('width', String(totalWidth));
  combined.setAttribute('height', String(totalHeight));
  combined.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`);

  // Append cloned child SVGs with proper offsets
  positioned.forEach(({ el, rect }) => {
    const clone = el.cloneNode(true) as SVGSVGElement;
    const x = rect.left - minLeft;
    const y = rect.top - minTop;
    clone.setAttribute('x', String(x));
    clone.setAttribute('y', String(y));
    combined.appendChild(clone);
  });

  exportSVG(combined, name || 'reversalTest');
};

export const handleExportGraph = (id: string, name?: string) => {
  let svgElement = document.getElementById(id);
  const defaultId = id.split('export_')[1] || id;
  if (!svgElement) {
    svgElement = document.getElementById(defaultId);
  }

  // Reversal Test: export a single combined SVG for X/Y/Z components
  if (defaultId.indexOf('reversalTest-graph') !== -1) {
    exportReversalTestCombined(defaultId, name || 'reversalTest');
    return;
  }

  exportSVG(svgElement, name);
};