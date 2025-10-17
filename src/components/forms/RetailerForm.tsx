import { useEffect, useState } from 'react';
import { getS3Url } from '../../utilities/awsUtils';
import type { RetailerFormData } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store';
import { getAllProducts } from '../../store/slices/productsSlice';
import { getAllUsers } from '../../store/slices/usersSlice';

interface RetailerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (retailer: RetailerFormData) => void;
  isLoading?: boolean;
  initialData?: RetailerFormData;
}

export function RetailerForm({ isOpen, onClose, onSubmit, isLoading, initialData }: RetailerFormProps) {
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const { users } = useAppSelector((state) => state.users);
  
  // Filter users to only include those with retailer role
  const retailers = users.filter(user => user.role === 'retailer');
  
  useEffect(() => {
    // Fetch all users when the component mounts
    dispatch(getAllUsers());
  }, [dispatch]);
  
  const defaultFormData: RetailerFormData = {
    name: '',
    images: [],
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    zipCode: '',
    latitude: '',
    longitude: '',
    gst: '',
    pan: '',
    ownerId: '',
    ownerName: '',
    ownerEmail: '',
    createdBy: user?._id,
    
  }

  const [formData, setFormData] = useState<RetailerFormData>(() => ({
    ...defaultFormData,
    ...initialData,
  }));

  // Keep a parallel list of actual File objects for any newly added previews (blob: URLs)
  const [localFiles, setLocalFiles] = useState<File[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e?.target?.files) {
      const files = Array.from(e?.target?.files ?? []);
      if (files.length > 0) {
        
        const imageUrls = files.map(file => URL.createObjectURL(file));
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...imageUrls]
        }));
        // Track the actual File objects so we can upload them later
        setLocalFiles(prev => [...prev, ...files]);
      }

    }
  };

  const removeImage = (index: number) => {
    // Revoke blob preview URL to free memory
    const toRemove = formData.images?.[index];
    if (typeof toRemove === 'string' && toRemove.startsWith('blob:')) {
      try { URL.revokeObjectURL(toRemove); } catch { void 0; }
    }
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));

    // If the removed preview was a blob URL, also remove the corresponding File from localFiles.
    // Determine its position among blob previews up to this index.
    setLocalFiles(prevFiles => {
      const imgs = formData.images;
      const isBlobAtIndex = typeof imgs?.[index] === 'string' && imgs?.[index].startsWith('blob:');
      if (!isBlobAtIndex) return prevFiles; // do not alter for existing http/https URLs

      // Count how many blob items existed before this index to map to localFiles position
      let blobPos = 0;
      for (let i = 0; i < index; i++) {
        if (typeof imgs[i] === 'string' && imgs[i].startsWith('blob:')) blobPos++;
      }
      return prevFiles.filter((_, i) => i !== blobPos);
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    const value = target.type === 'checkbox' 
      ? (target as HTMLInputElement).checked 
      : target.value;
    const { name } = target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    try {
      // Filter out any existing S3 URLs (already uploaded)
      const existingUrls = formData.images?.filter(url => 
        typeof url === 'string' && (url.startsWith('http') || url.startsWith('https'))
      );
      
      // Get only the new items (blob previews or data URLs)
      const newItems = formData.images?.filter(url => 
        typeof url !== 'string' || !(url.startsWith('http') || url.startsWith('https'))
      );
      
      // Upload new files to S3; for blob previews, prefer the real File from localFiles in order.
      let blobPointer = 0;
      const uploadPromises = newItems?.map(async (item) => {
        // If item is a string blob/data URL, upload corresponding File from localFiles
        if (typeof item === 'string') {
          if (item.startsWith('blob:')) {
            const file = localFiles[blobPointer];
            blobPointer += 1;
            if (file) {
              return await getS3Url(file);
            }
            // Fallback: fetch if mapping failed
            const res = await fetch(item);
            const blob = await res.blob();
            const mime = blob.type && blob.type !== '' ? blob.type : 'image/png';
            const ext = mime.includes('/') ? mime.split('/')[1] : 'png';
            const filename = `site-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const fallbackFile = new File([blob], filename, { type: mime });
            return await getS3Url(fallbackFile);
          }
          if (item.startsWith('data:')) {
            // Convert data URL to File
            const res = await fetch(item);
            const blob = await res.blob();
            const mime = blob.type && blob.type !== '' ? blob.type : 'image/png';
            const ext = mime.includes('/') ? mime.split('/')[1] : 'png';
            const filename = `site-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const file = new File([blob], filename, { type: mime });
            return await getS3Url(file);
          }
          // http(s) should have been filtered out already; return as-is
          return item;
        }
        // If somehow we got a File-like object
        if (item && typeof item === 'object' && 'name' in item && 'type' in item) {
          return await getS3Url(item as File);
        }
        return item as unknown as string;
      });
      
      // Wait for all uploads to complete
      const uploadedUrls = await Promise.all(uploadPromises);
      console.log(uploadedUrls);
      // Combine existing URLs with newly uploaded ones
      const allUrls = Array.from(new Set([...existingUrls, ...uploadedUrls]));
      
      // Call onSubmit with updated formData containing S3 URLs
      onSubmit({
        ...formData,
        images: allUrls
      });
      
      // Reset form after successful submission if not in edit mode
      if (!initialData) {
        // Revoke any remaining blob previews
        formData?.images?.forEach(u => {
          if (typeof u === 'string' && u.startsWith('blob:')) {
            try { URL.revokeObjectURL(u); } catch { void 0; }
          }
        });
        setFormData({...defaultFormData, images: allUrls ? allUrls : []});
        setLocalFiles([]);
      }
      
    } catch (error) {
      console.error('Error uploading files to S3:', error);
      throw error; // Re-throw to handle in the parent component
    }
  };

  

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(prev => ({
        ...prev,
        products: []
      }));
    }
    dispatch(getAllProducts());
  }, [initialData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto py-4">
      <div className="bg-white dark:bg-black rounded-lg shadow-xl w-full max-w-md my-auto mx-4 max-h-[50vh] flex flex-col">
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h3 className="text-xl font-semibold text-[var(--text)]">Create New Retailer</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">

          <div className="">
            <form id="site-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                {/* Retailer Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                    Shop Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background-alt)] text-[var(--text)]"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background-alt)] text-[var(--text)]"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background-alt)] text-[var(--text)]"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Tax Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="gst" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                      GST Number
                    </label>
                    <input
                      type="text"
                      id="gst"
                      name="gst"
                      value={formData.gst || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background-alt)] text-[var(--text)] uppercase"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label htmlFor="pan" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                      PAN Number
                    </label>
                    <input
                      type="text"
                      id="pan"
                      name="pan"
                      value={formData.pan || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background-alt)] text-[var(--text)] uppercase"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Retailer Selection */}
                <div className="space-y-4 p-4 border border-[var(--border)] rounded-md">
                  <h4 className="text-sm font-medium text-[var(--text-muted)]">Retailer Information</h4>
                  <div>
                    <label htmlFor="retailerSelect" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                      Select Retailer
                    </label>
                    <select
                      id="retailerSelect"
                      value={formData.ownerId || ''}
                      onChange={(e) => {
                        const selectedRetailer = retailers.find(r => r._id === e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          ownerId: selectedRetailer?._id || '',
                          ownerName: selectedRetailer?.username || '',
                          ownerEmail: selectedRetailer?.email || ''
                        }));
                      }}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background-alt)] text-[var(--text)]"
                      disabled={isLoading}
                    >
                      <option value="">Select a retailer</option>
                      {retailers.map((retailer) => (
                        <option key={retailer._id} value={retailer._id}>
                          {retailer.username} - {retailer.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Display selected retailer info */}
                  {formData.ownerId && (
                    <div className="mt-4 p-3 bg-[var(--background-alt)] rounded-md border border-[var(--border)]">
                      <h5 className="text-sm font-medium text-[var(--text-muted)] mb-2">Selected Retailer</h5>
                      <p className="text-sm">
                        <span className="font-medium">Name:</span> {formData.ownerName}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Email:</span> {formData.ownerEmail}
                      </p>
                    </div>
                  )}
                </div>

                {/* Retailer Images */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                    Retailer Images
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-[var(--border)] rounded-md">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-[var(--text-muted)]"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-[var(--text-muted)]">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-transparent rounded-md font-medium text-[var(--primary)] hover:text-[var(--primary-dark)] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[var(--primary)]"
                        >
                          <span>Upload files</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={isLoading}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </div>
                  
                  {/* Preview Uploaded Images */}
                  {formData?.images && formData?.images?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-[var(--text-muted)] mb-2">
                        Selected Images
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {formData?.images?.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Preview ${index + 1}`}
                              className="h-20 w-full object-cover rounded-md"
                            />
                            <button
                              title="Remove"
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              disabled={isLoading}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Address Section */}
                <div className="space-y-4 p-4 border border-[var(--border)] rounded-md">
                  <h4 className="text-sm font-medium text-[var(--text-muted)]">Location Details</h4>
                  
                  {/* address */}
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                      Address *
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background-alt)] text-[var(--text)]"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* City */}
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background-alt)] text-[var(--text)]"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* State */}
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background-alt)] text-[var(--text)]"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    {/* country */}
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                        Country *
                      </label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background-alt)] text-[var(--text)]"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  {/* Zip */}
                  <div className="">
                    <label htmlFor="zipCode" className="block text-sm font-medium text-[var(--text-muted)]">
                      Zip Code *
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background-alt)]"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="latitude" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                        Latitude
                      </label>
                      <input
                        type="text"
                        id="latitude"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background-alt)] text-[var(--text)]"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label htmlFor="longitude" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                        Longitude
                      </label>
                      <input
                        type="text"
                        id="longitude"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background-alt)] text-[var(--text)]"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

              </div>
            </form>
          </div>
          {/* Form Footer */}
          <div className="sticky bottom-0 bg-[var(--background)] border-t border-[var(--border)] mt-6 -mx-6 px-6 py-4">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="site-form"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Retailer'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
