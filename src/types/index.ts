// Shared types across the application

export interface UserLoginFormData {
  username?: string;
  password: string;
  email?: string;
}

export interface UserRegistrationFormData {
  firstName: string,
  lastName: string,
  email: string,
  username: string,
  avatar?: string,
  password?: string,
  confirmPassword?: string,
}

export interface User {
  _id?: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}


export interface ExcelFile {
  originalName: string;
  url: string;
  uploadedAt: string;
}

export interface MediaFile {
  _id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  path: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  formula: string;
  images: string[];
  manufacturer: string;
  unitQuantity: number;
  availability: boolean;
  minOrderQuantity: number;
}


export interface ProductFormData {
  name: string;
  formula: string;
  images: string[];
  manufacturer: string;
  unitQuantity: number;
  availability: boolean;
  minOrderQuantity: number;
}

export interface Retailer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  gst?: string;
  pan?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RetailerFormData {
  name: string;
  email?: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  gst?: string;
  pan?: string;
}

export interface Order {
  _id: string;
  retailerId: string;
  distributorId: string;
  products: Product[];
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}


export interface Distributor {
  _id: string;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  images: string[];
  products: Product[];
  ordersRecieved: Order[];
  gst?: string;
  pan?: string;
  phone?: string;
  email?: string;
}


export interface DistributorFormData {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  images: string[];
  products: Product[];
  ordersRecieved: Order[];
  gst?: string;
  pan?: string;
  phone?: string;
  email?: string;
}




// excel utils

export type ExcelValue = string | number | boolean | Date | null | string;

export interface ExcelData {
  headers: string[];
  rows: ExcelValue[][];
}

export interface Sheet {
  sheetName: string;
  headers: string[];
  rows: ExcelValue[][];
}


export interface ExcelStats {
  rowCount: number;
  columnCount: number;
  totalSheets: number;
}

export interface SortConfig {
  key: string;
  direction: 'ascending' | 'descending';
}

// Interface for the parsed Excel result including both data and stats
export interface ParsedExcelResult {
    data: ExcelData;
    stats: ExcelStats;
}

// Error type for parsing issues
export interface ExcelParseError {
    error: string;
}


export type JobStatus = 'stuck' | 'waiting' | 'active' | 'completed' | 'failed' | 'error' | 'not_found' | 'no_job' ;

export interface WebsocketStatusUpdate {
  jobId: string;
  status: JobStatus;
  progress: number;
  result?: {
    audit_report: Array<{ data: number[] } | Buffer>;
  },
  error?: string;
  stack?: unknown;
  state?: string;
}
