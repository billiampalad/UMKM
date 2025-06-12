import React, { useState, useEffect } from 'react';

const ProductPage = () => {
  const user = { nama: 'Admin User' }; // Mock user
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add', 'edit', 'delete'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    nama_produk: '',
    kategori: '',
    harga: '',
    stok: '',
    deskripsi: '',
    gambar_url: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sample categories
  const categories = [
    'all',
    'Electronics',
    'Clothing',
    'Books',
    'Home & Garden',
    'Sports',
    'Beauty',
    'Food',
    'Others'
  ];

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample data - replace with actual API call
      const sampleProducts = [
        {
          id_produk: 1,
          nama_produk: 'Laptop Gaming ASUS ROG',
          kategori: 'Electronics',
          harga: 15000000,
          stok: 25,
          deskripsi: 'Laptop gaming dengan performa tinggi untuk gaming dan design',
          gambar_url: 'https://via.placeholder.com/200x150/667eea/ffffff?text=Laptop',
          created_at: '2025-06-01T10:00:00Z',
          updated_at: '2025-06-09T15:30:00Z'
        },
        {
          id_produk: 2,
          nama_produk: 'iPhone 15 Pro Max',
          kategori: 'Electronics',
          harga: 20000000,
          stok: 15,
          deskripsi: 'Smartphone flagship terbaru dari Apple dengan teknologi canggih',
          gambar_url: 'https://via.placeholder.com/200x150/764ba2/ffffff?text=iPhone',
          created_at: '2025-06-02T11:30:00Z',
          updated_at: '2025-06-09T14:15:00Z'
        },
        {
          id_produk: 3,
          nama_produk: 'Nike Air Jordan Retro',
          kategori: 'Sports',
          harga: 2500000,
          stok: 50,
          deskripsi: 'Sepatu basket klasik dengan design iconic dan comfort maksimal',
          gambar_url: 'https://via.placeholder.com/200x150/28a745/ffffff?text=Shoes',
          created_at: '2025-06-03T09:15:00Z',
          updated_at: '2025-06-09T16:45:00Z'
        },
        {
          id_produk: 4,
          nama_produk: 'Samsung 4K Smart TV 55"',
          kategori: 'Electronics',
          harga: 8500000,
          stok: 8,
          deskripsi: 'Smart TV dengan resolusi 4K dan fitur streaming lengkap',
          gambar_url: 'https://via.placeholder.com/200x150/dc3545/ffffff?text=TV',
          created_at: '2025-06-04T14:20:00Z',
          updated_at: '2025-06-09T13:10:00Z'
        },
        {
          id_produk: 5,
          nama_produk: 'Kemeja Batik Premium',
          kategori: 'Clothing',
          harga: 350000,
          stok: 30,
          deskripsi: 'Kemeja batik dengan kualitas premium untuk acara formal',
          gambar_url: 'https://via.placeholder.com/200x150/ffc107/333333?text=Batik',
          created_at: '2025-06-05T08:45:00Z',
          updated_at: '2025-06-09T12:00:00Z'
        }
      ];
      
      setProducts(sampleProducts);
    } catch (err) {
      setError('Failed to load products: ' + err.message);
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nama_produk.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.deskripsi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.kategori === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    if (!formData.nama_produk.trim()) {
      errors.nama_produk = 'Product name is required';
    }
    
    if (!formData.kategori) {
      errors.kategori = 'Category is required';
    }
    
    if (!formData.harga || isNaN(formData.harga) || Number(formData.harga) <= 0) {
      errors.harga = 'Valid price is required';
    }
    
    if (!formData.stok || isNaN(formData.stok) || Number(formData.stok) < 0) {
      errors.stok = 'Valid stock quantity is required';
    }
    
    if (!formData.deskripsi.trim()) {
      errors.deskripsi = 'Description is required';
    }
    
    return errors;
  };

  // Handle form submission
  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (modalType === 'add') {
        // Add new product
        const newProduct = {
          ...formData,
          id_produk: Date.now(), // Temporary ID
          harga: Number(formData.harga),
          stok: Number(formData.stok),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          gambar_url: formData.gambar_url || 'https://via.placeholder.com/200x150/6c757d/ffffff?text=No+Image'
        };
        
        setProducts(prev => [newProduct, ...prev]);
        
      } else if (modalType === 'edit') {
        // Update existing product
        const updatedProduct = {
          ...selectedProduct,
          ...formData,
          harga: Number(formData.harga),
          stok: Number(formData.stok),
          updated_at: new Date().toISOString()
        };
        
        setProducts(prev => prev.map(p => 
          p.id_produk === selectedProduct.id_produk ? updatedProduct : p
        ));
      }
      
      closeModal();
      
    } catch (err) {
      setError('Failed to save product: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle product deletion
  const handleDelete = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProducts(prev => prev.filter(p => p.id_produk !== selectedProduct.id_produk));
      closeModal();
      
    } catch (err) {
      setError('Failed to delete product: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open modal for different actions
  const openModal = (type, product = null) => {
    setModalType(type);
    setSelectedProduct(product);
    setFormErrors({});
    
    if (type === 'add') {
      setFormData({
        nama_produk: '',
        kategori: '',
        harga: '',
        stok: '',
        deskripsi: '',
        gambar_url: ''
      });
    } else if (type === 'edit' && product) {
      setFormData({
        nama_produk: product.nama_produk,
        kategori: product.kategori,
        harga: product.harga.toString(),
        stok: product.stok.toString(),
        deskripsi: product.deskripsi,
        gambar_url: product.gambar_url || ''
      });
    }
    
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setFormData({
      nama_produk: '',
      kategori: '',
      harga: '',
      stok: '',
      deskripsi: '',
      gambar_url: ''
    });
    setFormErrors({});
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading products...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* CDN Links */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-3xl p-8 mb-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-24 -translate-x-24"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                  <i className="fas fa-box text-orange-400"></i>
                  Product Management
                </h1>
                <p className="text-purple-100 text-lg">Manage your product inventory, pricing, and details</p>
              </div>
              <button
                onClick={() => openModal('add')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg transform hover:-translate-y-1"
              >
                <i className="fas fa-plus"></i>
                Add New Product
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
              {/* Search */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <i className="fas fa-search text-purple-500"></i>
                  Search Products
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or description..."
                    className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <i className="fas fa-folder text-purple-500"></i>
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none bg-white transition-colors duration-200"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stats */}
              <div className="text-right">
                <div className="text-gray-600 text-sm">
                  Showing {filteredProducts.length} of {products.length} products
                </div>
                <div className="text-purple-600 text-xs mt-1 font-semibold">
                  Total Stock Value: {formatCurrency(
                    filteredProducts.reduce((sum, p) => sum + (p.harga * p.stok), 0)
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6 flex justify-between items-center">
              <span className="text-red-700 flex items-center gap-2">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </span>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 text-xl"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center shadow-lg">
              <div className="text-6xl text-gray-300 mb-4">
                <i className="fas fa-box-open"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search filters' 
                  : 'Start by adding your first product'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div
                  key={product.id_produk}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-gray-100"
                >
                  {/* Product Image */}
                  <div className="relative">
                    <img
                      src={product.gambar_url}
                      alt={product.nama_produk}
                      className="w-full h-48 object-cover bg-gray-100"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/320x200/e9ecef/6c757d?text=No+Image';
                      }}
                    />
                    
                    {/* Stock Badge */}
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold ${
                      product.stok > 20 
                        ? 'bg-green-500 text-white' 
                        : product.stok > 10 
                        ? 'bg-yellow-500 text-gray-800' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {product.stok} in stock
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 bg-purple-600 bg-opacity-90 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      {product.kategori}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 leading-tight">
                      {product.nama_produk}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {product.deskripsi}
                    </p>

                    {/* Price */}
                    <div className="text-xl font-bold text-purple-600 mb-4">
                      {formatCurrency(product.harga)}
                    </div>

                    {/* Metadata */}
                    <div className="text-xs text-gray-500 mb-4 pt-3 border-t border-gray-100 space-y-1">
                      <div>Created: {formatDate(product.created_at)}</div>
                      <div>Updated: {formatDate(product.updated_at)}</div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal('edit', product)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-1"
                      >
                        <i className="fas fa-edit"></i>
                        Edit
                      </button>
                      
                      <button
                        onClick={() => openModal('delete', product)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-1"
                      >
                        <i className="fas fa-trash"></i>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    {modalType === 'add' && (
                      <>
                        <i className="fas fa-plus text-orange-500"></i>
                        Add New Product
                      </>
                    )}
                    {modalType === 'edit' && (
                      <>
                        <i className="fas fa-edit text-purple-500"></i>
                        Edit Product
                      </>
                    )}
                    {modalType === 'delete' && (
                      <>
                        <i className="fas fa-trash text-red-500"></i>
                        Delete Product
                      </>
                    )}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  {modalType === 'delete' ? (
                    // Delete Confirmation
                    <div className="text-center">
                      <div className="text-6xl text-red-500 mb-4">
                        <i className="fas fa-exclamation-triangle"></i>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        Are you sure you want to delete this product?
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                        <h4 className="font-semibold text-gray-800 mb-2">
                          {selectedProduct?.nama_produk}
                        </h4>
                        <p className="text-gray-600 text-sm mb-2">
                          Category: {selectedProduct?.kategori}
                        </p>
                        <p className="text-purple-600 font-semibold">
                          {formatCurrency(selectedProduct?.harga)}
                        </p>
                      </div>
                      <p className="text-red-600 text-sm mb-6">
                        <i className="fas fa-exclamation-triangle mr-1"></i>
                        This action cannot be undone.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={closeModal}
                          disabled={isSubmitting}
                          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl transition-colors duration-200 font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDelete}
                          disabled={isSubmitting}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl transition-colors duration-200 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <i className="fas fa-spinner animate-spin"></i>
                              Deleting...
                            </>
                          ) : (
                            'Delete Product'
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Add/Edit Form
                    <div className="space-y-4">
                      {/* Product Name */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          name="nama_produk"
                          value={formData.nama_produk}
                          onChange={handleInputChange}
                          placeholder="Enter product name"
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors duration-200 ${
                            formErrors.nama_produk ? 'border-red-500' : 'border-gray-200 focus:border-purple-500'
                          }`}
                        />
                        {formErrors.nama_produk && (
                          <div className="text-red-500 text-xs mt-1">{formErrors.nama_produk}</div>
                        )}
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          name="kategori"
                          value={formData.kategori}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none bg-white transition-colors duration-200 ${
                            formErrors.kategori ? 'border-red-500' : 'border-gray-200 focus:border-purple-500'
                          }`}
                        >
                          <option value="">Select category</option>
                          {categories.filter(cat => cat !== 'all').map(category => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                        {formErrors.kategori && (
                          <div className="text-red-500 text-xs mt-1">{formErrors.kategori}</div>
                        )}
                      </div>

                      {/* Price and Stock */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Price (IDR) *
                          </label>
                          <input
                            type="number"
                            name="harga"
                            value={formData.harga}
                            onChange={handleInputChange}
                            placeholder="0"
                            min="0"
                            step="1000"
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors duration-200 ${
                              formErrors.harga ? 'border-red-500' : 'border-gray-200 focus:border-purple-500'
                            }`}
                          />
                          {formErrors.harga && (
                            <div className="text-red-500 text-xs mt-1">{formErrors.harga}</div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Stock Quantity *
                          </label>
                          <input
                            type="number"
                            name="stok"
                            value={formData.stok}
                            onChange={handleInputChange}
                            placeholder="0"
                            min="0"
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors duration-200 ${
                              formErrors.stok ? 'border-red-500' : 'border-gray-200 focus:border-purple-500'
                            }`}
                          />
                          {formErrors.stok && (
                            <div className="text-red-500 text-xs mt-1">{formErrors.stok}</div>
                          )}
                        </div>
                      </div>

                      {/* Image URL */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Image URL
                        </label>
                        <input
                          type="url"
                          name="gambar_url"
                          value={formData.gambar_url}
                          onChange={handleInputChange}
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-200"
                        />
                        <div className="text-gray-500 text-xs mt-1">
                          Optional: Leave empty for default placeholder image
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Description *
                        </label>
                        <textarea
                          name="deskripsi"
                          value={formData.deskripsi}
                          onChange={handleInputChange}
                          placeholder="Enter product description"
                          rows="4"
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none resize-none transition-colors duration-200 ${
                            formErrors.deskripsi ? 'border-red-500' : 'border-gray-200 focus:border-purple-500'
                          }`}
                        />
                        {formErrors.deskripsi && (
                          <div className="text-red-500 text-xs mt-1">{formErrors.deskripsi}</div>
                        )}
                      </div>

                      {/* Image Preview */}
                      {formData.gambar_url && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Image Preview
                          </label>
                          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
                            <img
                              src={formData.gambar_url}
                              alt="Preview"
                              className="max-w-48 max-h-32 object-cover rounded-lg mx-auto"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <div className="hidden text-red-500 text-sm">
                              <i className="fas fa-exclamation-triangle mr-1"></i>
                              Invalid image URL
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Form Actions */}
                      <div className="flex gap-3 pt-6 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={closeModal}
                          disabled={isSubmitting}
                          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl transition-colors duration-200 font-semibold disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className={`flex-2 text-white py-3 rounded-xl transition-colors duration-200 font-semibold disabled:opacity-50 flex items-center justify-center gap-2 ${
                            modalType === 'add' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-purple-500 hover:bg-purple-600'
                          }`}
                        >
                          {isSubmitting ? (
                            <>
                              <i className="fas fa-spinner animate-spin"></i>
                              {modalType === 'add' ? 'Adding...' : 'Updating...'}
                            </>
                          ) : (
                            <>
                              <i className={modalType === 'add' ? 'fas fa-plus' : 'fas fa-edit'}></i>
                              {modalType === 'add' ? 'Add Product' : 'Update Product'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductPage;