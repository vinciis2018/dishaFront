import Axios from 'axios';
import { nodeurl } from '../constants/helperConstants';

interface AwsUrlResponse {
  success: boolean;
  [key: string]: unknown;
  data: {
    fileName: string;
    url: string;
    uploadUrl: string;
  }
}

/**
 * Gets a pre-signed URL for file upload to AWS S3
 * @param contentType - MIME type of the file
 * @param fileName - Name of the file to be uploaded
 * @returns Promise with the AWS upload URL and other response data
 */
export const getS3UploadUrl = async (
  contentType: string,
  fileName: string
): Promise<AwsUrlResponse> => {
  try {
    const { data } = await Axios.post<AwsUrlResponse>(
      `${nodeurl}/aws/getS3UploadUrl`,
      { contentType, name: fileName }
    );
    return data;
  } catch (error) {
    console.error('Failed to get AWS upload URL:', error);
    throw new Error('Failed to get AWS upload URL. Please try again.');
  }
};

/**
 * Uploads a file to AWS S3 using a pre-signed URL
 * @param url - Pre-signed URL for upload
 * @param file - File to be uploaded
 * @returns Promise that resolves when upload is complete
 */
export const uploadOnS3 = async (url: string, file: File): Promise<void> => {
  try {
    await Axios.put(url, file, {
      headers: {
        'Content-Type': file.type,
      },
    });
  } catch (error) {
    console.error('Failed to upload file to AWS:', error);
    throw new Error('Failed to upload file. Please try again.');
  }
};

/**
 * Gets a pre-signed URL and uploads the file in one step
 * @param file - File to be uploaded
 * @returns Promise that resolves with the AWS URL of the uploaded file
 */
export const getS3Url = async (file: File): Promise<string> => {
  try {
    const awsData = await getS3UploadUrl(file.type, file.name);
    // If backend indicates file already exists (no upload needed), return existing URL
    if (!awsData.data.uploadUrl) {
      return awsData.data.url;
    }
    // Otherwise upload and return the final URL
    await uploadOnS3(awsData.data.uploadUrl, file);
    return awsData.data.url;
  } catch (error) {
    console.error('Error in AWS file upload process:', error);
    throw new Error('Failed to process file upload. Please try again.');
  }
};

/**
 * Sanitizes a URL for S3 by encoding special characters
 * @param url - URL to be sanitized
 * @returns Encoded URL string
 */
export const sanitizeUrlForS3 = (url: string): string => {
  return encodeURI(url);
};