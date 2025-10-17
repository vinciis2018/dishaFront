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
  role: string,
}

export interface User {
  _id?: string;
  username: string;
  email: string;
  role: 'retailer' | 'distributor' | 'admin' | 'default' | 'rte';
  retailerDetails?: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    gstNumber?: string;
    pincode?: string;
    state?: string;
    city?: string;
    status: 'active' | 'inactive' | 'pending';
  };
  distributorDetails?: {
    _id: string;
    name: string;
    address: string;
    latitude: string;
    longitude: string;
    contactNumber: string;
    email: string;
    pincode: string;
    state: string;
    city: string;
    gstNumber: string;
    status: 'active' | 'inactive' | 'pending';
  };
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
  mrp?: number;
  ptr?: number;
  packSize?: string;
  description?: string;
  orderQuantity?: number;
}


export interface ProductFormData {
  name: string;
  formula: string;
  images: string[];
  manufacturer: string;
  unitQuantity: number;
  availability: boolean;
  minOrderQuantity: number;
  mrp?: number;
  ptr?: number;
  packSize?: string;
  description?: string;
}

export interface Retailer {
  _id: string;
  name: string;
  images?: string[];
  email?: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude: string;
  longitude: string;
  gst?: string;
  pan?: string;
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  ordersPlaced?: Order[];

}

export interface RetailerFormData {
  name: string;
  images: string[];
  email?: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude: string;
  longitude: string;
  gst?: string;
  pan?: string;
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
  createdBy?: string;
}

export interface Order {
  _id: string;
  products: Product[];
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  username: string;
  deliveryAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  notes: string;
  paymentMethod: string;
  paymentStatus: string;
  price: number;
  quantity: number;
  retailerName?: string;
  retailerEmail?: string;
  retailerId?: string;
  distributorName?: string;
  distributorEmail?: string;
  distributorId?: string;
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
  ownerId?: string,
  ownerName?: string,
  ownerEmail?: string,
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
  ownerId?: string,
  ownerName?: string,
  ownerEmail?: string,
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
