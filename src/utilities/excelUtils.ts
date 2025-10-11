import * as XLSX from 'xlsx';

/**
 * Reads the headers from the first sheet of an Excel file
 * @param file - The Excel file to read headers from
 * @returns A promise that resolves to an array of header strings
 */
export const readExcelHeaders = (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON to get headers (first row)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        const headers = jsonData[0] as string[];
        
        resolve(headers);
      } catch (error) {
        console.error('Error reading Excel file:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};