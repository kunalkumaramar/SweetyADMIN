import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchAllBlogs,
  createBlogAsync,
  updateBlogAsync,
  deleteBlogAsync,
} from '../redux/blogsSlice';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import EmailEditor from 'react-email-editor';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../ui/table';
import {
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '../ui/dropdown-menu';
import { flexRender, useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { PlusIcon, PencilIcon, TrashIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  featuredImage: z.string().optional(),
  featuredImageFile: z.any().optional(),
  blogContent: z.object({
    design: z.any(),
    markup: z.string(),
  }),
});

export default function Blogs() {
  const dispatch = useDispatch();
  const { blogs, loading, error } = useSelector((state) => state.blogs);

  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [fileToUpload, setFileToUpload] = useState(null);

  const form = useForm({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      featuredImage: '',
      featuredImageFile: null,
      blogContent: { design: {}, markup: '' },
    },
  });

  const emailEditorRef = useRef(null);

  useEffect(() => {
    dispatch(fetchAllBlogs());
  }, [dispatch]);

  const startEditBlog = (blog) => {
    console.log('Starting edit for blog:', blog);
    setEditingBlog(blog);

    form.reset({
      title: blog.title,
      featuredImage: blog.blogImgUrl?.url || '',
      featuredImageFile: null,
      blogContent: blog.blogContent || { design: {}, markup: '' },
    });

    setImagePreview(blog.blogImgUrl?.url || '');
    setFileToUpload(null);

    setShowModal(true);
    
    setTimeout(() => {
      if (emailEditorRef.current && blog.blogContent?.design) {
        console.log('Loading design into editor:', blog.blogContent.design);
        emailEditorRef.current.editor.loadDesign(blog.blogContent.design);
      }
    }, 500);
    dispatch(fetchAllBlogs());
  };

  const columns = useMemo(
    () => [
      { 
        accessorKey: 'title', 
        header: 'Title',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {row.original.blogImgUrl?.url && (
              <img 
                src={row.original.blogImgUrl.url} 
                alt={row.getValue('title')}
                className="w-12 h-12 rounded-lg object-cover shadow-sm"
              />
            )}
            <div className="max-w-xs">
              <div className="font-medium text-gray-900 truncate">
                {row.getValue('title')}
              </div>
            </div>
          </div>
        )
      },
      { 
        accessorKey: 'createdAt', 
        header: 'Created',
        cell: ({ row }) => {
          const date = new Date(row.getValue('createdAt'));
          return (
            <div className="text-gray-600">
              {date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
          );
        }
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                >
                  <EllipsisVerticalIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel className="text-xs text-gray-500">Actions</DropdownMenuLabel>
                <DropdownMenuItem 
                  onSelect={() => startEditBlog(row.original)}
                  className="cursor-pointer"
                >
                  <PencilIcon className="mr-2 w-4 h-4 text-pink-600" /> 
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onSelect={() => {
                    if (confirm('Are you sure you want to delete this blog?')) {
                      dispatch(deleteBlogAsync(row.original._id || row.original.id));
                    }
                  }}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <TrashIcon className="mr-2 w-4 h-4" /> 
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [dispatch]
  );

  const table = useReactTable({
    data: blogs || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const onSubmit = async (values) => {
    console.log('Form submitted with values:', values);
    console.log('Editing blog:', editingBlog);
    
    try {
      const exportData = await new Promise((resolve, reject) => {
        if (!emailEditorRef.current) {
          reject(new Error('Email editor not ready'));
          return;
        }
        
        emailEditorRef.current.editor.exportHtml((data) => {
          console.log('Exported editor data:', data);
          resolve(data);
        });
      });

      const { design, html } = exportData;

      const formData = new FormData();
      formData.append('blogName', values.title);
      formData.append('title', values.title);
      formData.append('designData', JSON.stringify(design));
      formData.append('markup', html);

      if (fileToUpload) {
        console.log('Adding new image file:', fileToUpload.name);
        formData.append('blogImage', fileToUpload);
      } else if (imagePreview && !editingBlog) {
        throw new Error('Please upload a banner image');
      }

      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      if (editingBlog) {
        console.log('Updating blog with ID:', editingBlog._id || editingBlog.id);
        const result = await dispatch(updateBlogAsync({ 
          id: editingBlog._id || editingBlog.id, 
          updates: formData 
        })).unwrap();
        await dispatch(fetchAllBlogs());
        console.log('Update result:', result);
        toast.success('Blog updated successfully');
      } else {
        console.log('Creating new blog');
        const result = await dispatch(createBlogAsync({ formData })).unwrap();
        await dispatch(fetchAllBlogs());
        console.log('Create result:', result);
        toast.success('Blog created successfully');
      }

      form.reset();
      setImagePreview('');
      setFileToUpload(null);
      setEditingBlog(null);
      setShowModal(false);
      
    } catch (err) {
      console.error('Submit error:', err);
      toast.error(err.message || 'Failed to save blog');
    }
  };

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Image selected:', file.name);
      setFileToUpload(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      form.setValue('featuredImage', previewUrl);
      form.setValue('featuredImageFile', file);
    }
  };

  const resetModal = () => {
    setEditingBlog(null);
    form.reset({
      title: '',
      featuredImage: '',
      featuredImageFile: null,
      blogContent: { design: {}, markup: '' },
    });
    setImagePreview('');
    setFileToUpload(null);
    
    if (emailEditorRef.current) {
      emailEditorRef.current.editor.loadDesign({});
    }
    dispatch(fetchAllBlogs());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header Section with Gradient */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl blur-2xl opacity-20"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-pink-100">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
                  Blog Management
                </h1>
                <p className="text-gray-600">Create and manage your blog posts</p>
              </div>
              <Button 
                onClick={() => {
                  resetModal();
                  setShowModal(true);
                }}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 px-6 py-6 rounded-xl"
              >
                <PlusIcon className="h-5 w-5" /> 
                <span className="font-semibold">New Blog</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
              <p className="text-pink-600 mt-4 text-center font-medium">Loading blogs...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-4 mb-6 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xl">⚠</span>
              </div>
              <div>
                <p className="font-semibold text-red-900">Error Loading Blogs</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Table Container with Glass Effect */}
        {!loading && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-rose-400 rounded-2xl blur-xl opacity-10"></div>
            <div className="relative bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-pink-100 overflow-hidden">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="bg-gradient-to-r from-pink-50 to-rose-50 border-b-2 border-pink-100 hover:from-pink-100 hover:to-rose-100 transition-colors">
                      {headerGroup.headers.map((header) => (
                        <TableCell key={header.id} className="font-semibold text-pink-900 py-4">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row, idx) => (
                      <TableRow 
                        key={row.id}
                        className="border-b border-pink-50 hover:bg-gradient-to-r hover:from-pink-50 hover:to-transparent transition-all duration-200"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-4">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mb-4">
                            <span className="text-3xl">📝</span>
                          </div>
                          <p className="text-gray-500 font-medium">No blogs found</p>
                          <p className="text-gray-400 text-sm mt-1">Create your first blog to get started</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Modal with Enhanced Styling */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger hidden />
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-2 border-pink-100 shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-pink-50 to-rose-50 -mx-6 -mt-6 px-6 py-6 mb-6 rounded-t-lg border-b-2 border-pink-100">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                {editingBlog ? '✏️ Edit Blog' : '✨ Create New Blog'}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {editingBlog ? 'Update your blog details below' : 'Fill in the details to create a new blog post'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div>
                    <Label htmlFor="title" className="text-gray-700 font-semibold">Blog Title *</Label>
                    <Input 
                      id="title" 
                      {...field} 
                      placeholder="Enter an engaging title for your blog"
                      className="mt-2 border-2 border-pink-100 focus:border-pink-400 focus:ring-pink-400 rounded-lg"
                    />
                    {fieldState.error && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <span>⚠</span> {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <div>
                <Label htmlFor="featuredImage" className="text-gray-700 font-semibold">
                  Banner Image {!editingBlog && '*'}
                </Label>
                <div className="mt-2 relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={onImageChange}
                    className="block w-full text-sm text-gray-600 
                      file:mr-4 file:py-3 file:px-6 
                      file:rounded-full file:border-0 
                      file:text-sm file:font-semibold 
                      file:bg-gradient-to-r file:from-pink-500 file:to-rose-500 
                      file:text-white file:cursor-pointer
                      hover:file:from-pink-600 hover:file:to-rose-600
                      file:transition-all file:duration-300
                      border-2 border-dashed border-pink-200 rounded-lg p-4
                      hover:border-pink-400 transition-colors cursor-pointer" 
                  />
                </div>
                {imagePreview && (
                  <div className="mt-4 relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-rose-400 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <img 
                      src={imagePreview} 
                      alt="Banner Preview" 
                      className="relative h-48 w-full object-cover border-4 border-pink-100 rounded-xl shadow-lg"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label className="text-gray-700 font-semibold">Blog Content *</Label>
                <div className="mt-2 border-4 border-pink-100 rounded-xl overflow-hidden shadow-lg">
                  <EmailEditor
                    ref={emailEditorRef}
                    onLoad={() => {
                      console.log('EmailEditor loaded');
                      if (editingBlog?.blogContent?.design) {
                        setTimeout(() => {
                          emailEditorRef.current?.editor.loadDesign(editingBlog.blogContent.design);
                        }, 100);
                      }
                    }}
                    minHeight={500}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-3 pt-6 border-t-2 border-pink-100 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  resetModal();
                }}
                className="border-2 border-gray-300 hover:bg-gray-50 rounded-lg px-6"
              >
                Cancel
              </Button>
              <Button 
                type="button"
                disabled={loading}
                onClick={form.handleSubmit(onSubmit)}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg px-8"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </span>
                ) : (
                  <span className="font-semibold">
                    {editingBlog ? '💾 Update Blog' : '🚀 Create Blog'}
                  </span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}