import type { ExcelValue, LogEntry, LogsByDate, Sheet } from '../types';
import type { MonitoringAnalytics } from '../types';


/**
 * Checks if a log entry matches any monitoring data based on date and time
 * @param log The log entry to check
 * @param monitoringData Array of monitoring data to match against
 * @returns boolean indicating if there's a match
 */
export const isLogMatchingMonitoringData = (
  log: LogEntry, 
  monitoringData: MonitoringAnalytics[] | null = []
): boolean => {
  if (!log['Log Time'] || !monitoringData?.length) return false;
  
  const logTime = new Date(log['Log Time']);
  if (isNaN(logTime.getTime())) return false;
  
  const logDate = logTime.toISOString().split('T')[0];
  const logHour = logTime.getHours().toString().padStart(2, '0');
  const logMinute = logTime.getMinutes().toString().padStart(2, '0');
  
  // console.log("log", logDate, logHour, logMinute)
  return monitoringData.some(monitor => {
    const monitorDate = monitor.extracted_date;
    // const monitorTime = monitor.extracted_time;
    const monitorHour = monitor.extracted_time?.split(":")[0];
    const monitorMinute = monitor.extracted_time?.split(":")[1];
    // console.log("monitoring", monitorDate, monitorTime, monitorHour, monitorMinute)
    return logDate === monitorDate && logHour === monitorHour && logMinute === monitorMinute;
  });
};


// Normalize field names to handle different naming conventions
const normalizeFieldName = (name: string): string => {
  const fieldMap: Record<string, string> = {
    'log stamp': 'Log Time',
    'log time': 'Log Time',
    'logtime': 'Log Time',
    'log date': 'Log Time',
    'media': 'Media',
    'brand': 'Brand Name',
    'brand name': 'Brand Name',
    'screen status': 'Screen Status',
    'screenstatus': 'Screen Status',
    's.n.': 'S.N.',
    'sn': 'S.N.',
    'id': 'S.N.'
  };

  const lowerName = name.toLowerCase().trim();
  return fieldMap[lowerName] || name;
};

// Convert ExcelValue[] to LogEntry
type LogRow = ExcelValue[] | Record<string, unknown>;

export const toLogEntry = (headers: string[], row: LogRow): LogEntry => {
  const entry: Record<string, string> = {};

  // Handle array rows
  if (Array.isArray(row)) {
    headers.forEach((header, index) => {
      const value = row[index];
      entry[header] = value?.toString() || '';
    });
  } 
  // Handle object rows
  else if (row && typeof row === 'object') {
    Object.entries(row).forEach(([key, value]) => {
      const normalizedKey = normalizeFieldName(key);
      entry[normalizedKey] = value?.toString() || '';
    });
  }

  // Parse and normalize dates
  const parseDate = (dateStr: string): string => {
    if (!dateStr) return '';
    
    // Try parsing with Date object
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      // Format as YYYY-MM-DD HH:mm:ss
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }
    
    // Try common date formats
    const formats = [
      // YYYY-MM-DD HH:MM:SS
      /^(\d{4})-(\d{1,2})-(\d{1,2}) (\d{1,2}):(\d{2}):(\d{2})$/,
      // MM/DD/YYYY, HH:MM:SS AM/PM
      /^(\d{1,2})\/(\d{1,2})\/(\d{4}), (\d{1,2}):(\d{2}):(\d{2}) (AM|PM)$/i,
      // DD-MM-YYYY HH:MM:SS
      /^(\d{1,2})-(\d{1,2})-(\d{4}) (\d{1,2}):(\d{2}):(\d{2})$/,
    ];
    
    for (const regex of formats) {
      const match = dateStr.match(regex);
      if (match) {
        let year, month, day, hours, minutes, seconds;
        
        if (match[3].length === 4) {
          // YYYY-MM-DD or MM/DD/YYYY format
          year = parseInt(match[3], 10);
          month = parseInt(match[1], 10) - 1;
          day = parseInt(match[2], 10);
        } else {
          // DD-MM-YYYY format
          year = parseInt(match[3], 10);
          month = parseInt(match[2], 10) - 1;
          day = parseInt(match[1], 10);
        }
        
        // Handle time
        if (match[4]) {
          hours = parseInt(match[4], 10);
          minutes = parseInt(match[5], 10);
          seconds = match[6] ? parseInt(match[6], 10) : 0;
          
          // Handle 12-hour format
          if (match[7] && match[7].toUpperCase() === 'PM' && hours < 12) {
            hours += 12;
          } else if (match[7] && match[7].toUpperCase() === 'AM' && hours === 12) {
            hours = 0;
          }
        }
        
        const parsedDate = new Date(year, month, day, hours || 0, minutes || 0, seconds || 0);
        if (!isNaN(parsedDate.getTime())) {
          const pad = (n: number) => n.toString().padStart(2, '0');
          return `${parsedDate.getFullYear()}-${pad(parsedDate.getMonth() + 1)}-${pad(parsedDate.getDate())} ${pad(parsedDate.getHours())}:${pad(parsedDate.getMinutes())}:${pad(parsedDate.getSeconds())}`;
        }
      }
    }
    
    return dateStr; // Return original if parsing fails
  };

  // Normalize all entry keys first
  const normalizedEntry: Record<string, string> = {};
  Object.entries(entry).forEach(([key, value]) => {
    const normalizedKey = normalizeFieldName(key);
    normalizedEntry[normalizedKey] = value;
  });

  // Ensure all required fields exist with proper types
  const logEntry: LogEntry = {
    'S.N.': normalizedEntry['S.N.'] || normalizedEntry['id'] || '',
    'Log Time': parseDate(normalizedEntry['Log Time'] || normalizedEntry['Log Date'] || ''),
    'Media': normalizedEntry['Media'] || '',
    'Brand Name': normalizedEntry['Brand Name'] || '',
    'Screen Status': (normalizedEntry['Screen Status'] || 'unknown').toLowerCase(),
    ...normalizedEntry
  };
  
  console.log('Processed log entry:', logEntry);
  
  return entry as LogEntry;
};

/**
 * Groups logs by hour for a given day's logs
 * @param logs Array of log entries to be grouped by hour
 * @returns Object with hour as key (format: 'HH:00') and array of logs for that hour
 */
export const groupLogsByHour = (logs: LogEntry[]): Record<string, LogEntry[]> => {
  const grouped: Record<string, LogEntry[]> = {};

  if (!Array.isArray(logs) || logs.length === 0) {
    return grouped;
  }

  logs.forEach((log) => {
    if (!log['Log Time']) return;
    
    const logTime = new Date(log['Log Time']);
    if (isNaN(logTime.getTime())) return;
    
    const hour = logTime.getHours();
    const hourKey = `${hour.toString().padStart(2, '0')}:00`;
    
    if (!grouped[hourKey]) {
      grouped[hourKey] = [];
    }
    
    grouped[hourKey].push(log);
  });

  return grouped;
};

/**
 * Transforms excel data into logs grouped by date
 * @param excelData Array of sheet data from Excel file
 * @returns Array of logs grouped by date
 */
export const getLogsByDate = (excelData: Sheet[]): LogsByDate[] => {
  if (!Array.isArray(excelData) || excelData.length === 0) {
    console.log('No excelData or empty array provided');
    return [];
  }
  return excelData
    .filter(sheet => {
      const isValid = sheet && 
                      sheet.sheetName && 
                      Array.isArray(sheet.rows) && 
                      Array.isArray(sheet.headers);
      if (!isValid) {
        console.warn('Invalid sheet data:', sheet);
      }
      return isValid;
    })
    .map(sheet => {
      try {
        // Convert sheet name (YYYY-MM-DD) to Date object
        const date = new Date(sheet.sheetName);
        // Process rows - they might be arrays or objects
        const logs = (sheet.rows || []).map(row => {
          // If row is already an object with the correct structure, use it directly
          if (row && typeof row === 'object' && !Array.isArray(row)) {
            return row as unknown as LogEntry;
          }
          // If row is an array, convert it using toLogEntry
          if (Array.isArray(row)) {
            return toLogEntry(sheet.headers, row);
          }
          // Skip invalid rows
          console.warn('Skipping invalid row:', row);
          return null;
        }).filter((log): log is LogEntry => log !== null);
        
        // Filter out 'Device Time' from headers and create a new array
        const filteredHeaders = (sheet.headers || []).filter(header => 
          header.toLowerCase() !== 'device time' && header.toLowerCase() !== 'devicetime'
        );

        return {
          sheetName: sheet.sheetName,
          date,
          logs,
          headers: filteredHeaders
        };
      } catch (error) {
        console.error('Error processing sheet:', sheet.sheetName, error);
        return null;
      }
    })
    .filter((sheet): sheet is LogsByDate => sheet !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime()); // Sort by date
};