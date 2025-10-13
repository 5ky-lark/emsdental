import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be positive'),
  image: z.string().min(1, 'Image is required'),
  inclusions: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, 'Inclusion name is required'),
      description: z.string().optional(),
      price: z.number().min(0, 'Price must be positive'),
    })
  ).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function EditProduct() {
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      inclusions: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "inclusions",
  });

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      const product = await response.json();
      
      // Reset form with product data
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        inclusions: product.inclusions || []
      });
      
      setPreviewUrl(product.image);
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setUploadError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setValue('image', data.url);
      setPreviewUrl(data.url);
    } catch (error) {
      setUploadError('Failed to upload image');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      router.push('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addInclusion = () => {
    append({ name: '', description: '', price: 0 });
  };

  return (
    <>
      <Head>
        <title>Edit Product - Admin Dashboard</title>
      </Head>

      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Edit Product
              </h3>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    {...register('name')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('price', { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Product Image</label>
                  <div className="mt-1 flex items-center space-x-4">
                    <div className="relative h-32 w-32 rounded-lg overflow-hidden bg-gray-100">
                      {previewUrl && (
                        <Image
                          src={previewUrl}
                          alt="Product preview"
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                      />
                  </div>
                  {uploadError && (
                    <p className="mt-1 text-sm text-red-600">{uploadError}</p>
                  )}
                      {errors.image && (
                    <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
                      )}
                </div>

                {/* Product Inclusions Section */}
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-medium text-gray-900">Product Inclusions</h3>
                    <button
                      type="button"
                      onClick={addInclusion}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Inclusion
                    </button>
                  </div>

                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="border border-gray-200 rounded-md p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-md font-medium">Inclusion #{index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                        
                        {/* Add hidden field for inclusion id if it exists */}
                        {field.id && (
                          <input type="hidden" {...register(`inclusions.${index}.id`)} />
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Name
                            </label>
                            <input
                              type="text"
                              {...register(`inclusions.${index}.name`)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            />
                            {errors.inclusions?.[index]?.name && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.inclusions[index]?.name?.message}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Price
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              {...register(`inclusions.${index}.price`, { valueAsNumber: true })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            />
                            {errors.inclusions?.[index]?.price && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.inclusions[index]?.price?.message}
                              </p>
                      )}
                    </div>
                        </div>
                        
                        <div className="mt-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Description (optional)
                          </label>
                          <textarea
                            rows={2}
                            {...register(`inclusions.${index}.description`)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                    ))}
                    
                    {fields.length === 0 && (
                      <p className="text-sm text-gray-500 italic">
                        No inclusions added. Click "Add Inclusion" to add items like extra equipment that come with this product.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => router.push('/admin/products')}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 