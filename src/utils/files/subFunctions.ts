import * as XLSX from 'xlsx';

export function executeFunctionByName (functionName: string, context: any, ...args: any[]) {
  const namespaces = functionName.split(".");
  const func: any = namespaces.pop();
  for (let i = 0; i < namespaces.length; i++) {
    context = context[namespaces[i]];
  }
  console.log(context);
  return context[func].apply(context, args);
}

export const xlsx_to_csv = function to_csv(workbook: any) {
  var result: string[] = [];
  workbook.SheetNames.forEach((sheetName: string) => {
    var csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
    if(csv.length){
      result.push(csv);
    }
  });
  return result.join("\n");
};

export const toExponential_PMD = (num: number | string) => {
  if (!+num) return num;
  num = +num; 
  // pmd-like exponential format looks like this: -2.85E-08, 1.57E-02, 2.34E-12, ...
	const expRow = num.toExponential(2).toUpperCase().split('');
  if (!+expRow.slice(-2, -1)) expRow.splice(-1, 0, '0');
  return expRow.join('');
}

export const putParamToString = ((param: string|number, len: number, alignRight?: boolean) => {
  let parameter = param.toString().slice(0, len);
  if ((typeof(param) === 'number') || alignRight) {
    return ' '.repeat(len - parameter.length) + parameter;
  } else if (len === 0) return '  ' + param; // comment case
  return parameter + ' '.repeat(len - parameter.length);
}) 

export const getFileName = (fullname: string) => {
  // delete file extension and get file name
  if (!fullname.includes('.')) return fullname;
  const filename = fullname.split('.');
  filename.pop();
  console.log(filename, filename.join(''))
  return filename.join('');
}