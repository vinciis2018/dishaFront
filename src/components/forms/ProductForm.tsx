import { useState } from 'react';
import { getS3Url } from '../../utilities/awsUtils';
import type { ProductFormData } from '../../types';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (site: ProductFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<ProductFormData>;
}

export function ProductForm({ isOpen, onClose, onSubmit, isLoading, initialData }: ProductFormProps) {
  const defaultFormData: ProductFormData = {
    name: '',
    formula: 'calcium carbonate',
    images: [],
    manufacturer: 'ekum',
    unitQuantity: 10,
    availability: true,
    minOrderQuantity: 10,
    mrp: 0,
    ptr: 0,
    packSize: '10*1*1',
    description: '',
  }

  const [formData, setFormData] = useState<ProductFormData>(() => ({
    ...defaultFormData,
    ...initialData,
  }));

  // Keep a parallel list of actual File objects for any newly added previews (blob: URLs)
  const [localFiles, setLocalFiles] = useState<File[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const imageUrls = files.map(file => URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        siteImages: [...prev.images, ...imageUrls]
      }));
      // Track the actual File objects so we can upload them later
      setLocalFiles(prev => [...prev, ...files]);
    }
  };

  const removeImage = (index: number) => {
    // Revoke blob preview URL to free memory
    const toRemove = formData.images[index];
    if (typeof toRemove === 'string' && toRemove.startsWith('blob:')) {
      try { URL.revokeObjectURL(toRemove); } catch { void 0; }
    }
    setFormData(prev => ({
      ...prev,
      siteImages: prev.images.filter((_, i) => i !== index)
    }));

    // If the removed preview was a blob URL, also remove the corresponding File from localFiles.
    // Determine its position among blob previews up to this index.
    setLocalFiles(prevFiles => {
      const imgs = formData.images;
      const isBlobAtIndex = typeof imgs[index] === 'string' && imgs[index].startsWith('blob:');
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
      const existingUrls = formData.images.filter(url => 
        typeof url === 'string' && (url.startsWith('http') || url.startsWith('https'))
      );
      
      // Get only the new items (blob previews or data URLs)
      const newItems = formData.images.filter(url => 
        typeof url !== 'string' || !(url.startsWith('http') || url.startsWith('https'))
      );
      
      // Upload new files to S3; for blob previews, prefer the real File from localFiles in order.
      let blobPointer = 0;
      const uploadPromises = newItems.map(async (item) => {
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
        formData.images.forEach(u => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto py-8">
      <div className="bg-white dark:bg-black rounded-lg shadow-xl w-full max-w-md my-8">
        <div className="p-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
          <div className="flex items-center justify-between mb-6 sticky top-0 bg-[var(--background)] pt-4 pb-2 -mt-4 -mx-6 px-6 border-b border-[var(--border)]">
            <h3 className="text-xl font-semibold text-[var(--text)]">Create New Product</h3>
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

          <div className="">
            <form id="site-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                {/* Product Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                    Product Name *
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

                {/* Product Images */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                    Product Images
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
                  {formData.images.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-[var(--text-muted)] mb-2">
                        Selected Images
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {formData.images.map((image, index) => (
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

                {/* Details Section */}
                <div className="space-y-4 p-4 border border-[var(--border)] rounded-md">
                  <h4 className="text-sm font-medium text-[var(--text-muted)]">Product Details</h4>
                  
                  {/* Formula */}
                  <div>
                    <label htmlFor="formula" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                      Formula *
                    </label>
                    <input
                      type="text"
                      id="formula"
                      name="formula"
                      value={formData.formula}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background-alt)] text-[var(--text)]"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* manufacturer */}
                    <div>
                      <label htmlFor="manufacturer" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                        Manufacturer *
                      </label>
                      <input
                        type="text"
                        id="manufacturer"
                        name="manufacturer"
                        value={formData.manufacturer}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background-alt)] text-[var(--text)]"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* unitQuantity */}
                    <div>
                      <label htmlFor="unitQuantity" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                        Quantity *
                      </label>
                      <input
                        type="text"
                        id="unitQuantity"
                        name="unitQuantity"
                        value={formData.unitQuantity}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background-alt)] text-[var(--text)]"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    {/* Min order */}
                    <div>
                      <label htmlFor="minOrderQuantity" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                        Min Order Quantity *
                      </label>
                      <input
                        type="text"
                        id="minOrderQuantity"
                        name="minOrderQuantity"
                        value={formData.minOrderQuantity}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background-alt)] text-[var(--text)]"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    
                  </div>
                  {/* availability */}
                  <div className="flex gap-2 items-center">
                    <input
                      type="checkbox"
                      id="availability"
                      name="availability"
                      checked={formData.availability}
                      onChange={handleChange}
                      className="w-4 h-4 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background-alt)]"
                      required
                      disabled={isLoading}
                    />
                    <label htmlFor="availability" className="block text-sm font-medium text-[var(--text-muted)]">
                      Availability *
                    </label>
                  </div>
                </div>

              </div>
            </form>
          </div>
          
          {/* Form Footer */}
          <div className="sticky bottom-0 bg-[var(--background)] border-t border-[var(--border)] mt-6 flex justify-end space-x-3 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="site-form"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-[var(--text)] bg-[var(--primary)] rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[var(--text)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Product'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
