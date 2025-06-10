// src/admin/pages/ProductPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/contexts/AuthContext';

const ProductPage = () => {
  const { user } = useAuth();
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        flexDirection: 'column'
      }}>
        <div className="spinner" style={{ 
          width: '40px', 
          height: '40px', 
          margin: '0 auto 20px' 
        }}></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '1.75rem' }}>
              📦 Product Management
            </h1>
            <p style={{ margin: 0, color: '#666' }}>
              Manage your product inventory, pricing, and details
            </p>
          </div>
          <button
            onClick={() => openModal('add')}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              cursor: 'pointer',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            ➕ Add New Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '16px',
          alignItems: 'end'
        }}>
          {/* Search */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: '500',
              color: '#333'
            }}>
              🔍 Search Products
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or description..."
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e9ecef',
                borderRadius: '6px',
                fontSize: '14px',
                transition: 'border-color 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
            />
          </div>

          {/* Category Filter */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: '500',
              color: '#333'
            }}>
              📂 Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e9ecef',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          {/* Stats */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#666', fontSize: '14px' }}>
              Showing {filteredProducts.length} of {products.length} products
            </div>
            <div style={{ color: '#667eea', fontSize: '12px', marginTop: '2px' }}>
              Total Stock Value: {formatCurrency(
                filteredProducts.reduce((sum, p) => sum + (p.harga * p.stok), 0)
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>❌ {error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#721c24',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '60px 20px',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
          <h3 style={{ color: '#666', marginBottom: '8px' }}>No Products Found</h3>
          <p style={{ color: '#999' }}>
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search filters' 
              : 'Start by adding your first product'
            }
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {filteredProducts.map(product => (
            <div
              key={product.id_produk}
              style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                border: '1px solid #f0f0f0'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              {/* Product Image */}
              <div style={{ position: 'relative' }}>
                <img
                  src={product.gambar_url}
                  alt={product.nama_produk}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    backgroundColor: '#f8f9fa'
                  }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/320x200/e9ecef/6c757d?text=No+Image';
                  }}
                />
                
                {/* Stock Badge */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: product.stok > 20 ? '#28a745' : product.stok > 10 ? '#ffc107' : '#dc3545',
                  color: product.stok > 10 ? 'white' : '#333',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {product.stok} in stock
                </div>

                {/* Category Badge */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(102, 126, 234, 0.9)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '500'
                }}>
                  {product.kategori}
                </div>
              </div>

              {/* Product Details */}
              <div style={{ padding: '20px' }}>
                <h3 style={{
                  margin: '0 0 8px 0',
                  fontSize: '1.1rem',
                  color: '#333',
                  lineHeight: '1.4',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {product.nama_produk}
                </h3>
                
                <p style={{
                  margin: '0 0 16px 0',
                  color: '#666',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {product.deskripsi}
                </p>

                {/* Price */}
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#667eea',
                  marginBottom: '16px'
                }}>
                  {formatCurrency(product.harga)}
                </div>

                {/* Metadata */}
                <div style={{
                  fontSize: '12px',
                  color: '#999',
                  marginBottom: '16px',
                  borderTop: '1px solid #f0f0f0',
                  paddingTop: '12px'
                }}>
                  <div>Created: {formatDate(product.created_at)}</div>
                  <div>Updated: {formatDate(product.updated_at)}</div>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  <button
                    onClick={() => openModal('edit', product)}
                    style={{
                      flex: 1,
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#218838'}
                    onMouseOut={(e) => e.target.style.background = '#28a745'}
                  >
                    ✏️ Edit
                  </button>
                  
                  <button
                    onClick={() => openModal('delete', product)}
                    style={{
                      flex: 1,
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#c82333'}
                    onMouseOut={(e) => e.target.style.background = '#dc3545'}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px 24px 16px',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{ margin: 0, color: '#333' }}>
                  {modalType === 'add' && '➕ Add New Product'}
                  {modalType === 'edit' && '✏️ Edit Product'}
                  {modalType === 'delete' && '🗑️ Delete Product'}
                </h2>
                <button
                  onClick={closeModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#999',
                    padding: '0',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#f8f9fa';
                    e.target.style.color = '#333';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'none';
                    e.target.style.color = '#999';
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px' }}>
              {modalType === 'delete' ? (
                // Delete Confirmation
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                  <h3 style={{ color: '#333', marginBottom: '16px' }}>
                    Are you sure you want to delete this product?
                  </h3>
                  <div style={{
                    background: '#f8f9fa',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '24px',
                    textAlign: 'left'
                  }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>
                      {selectedProduct?.nama_produk}
                    </h4>
                    <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
                      Category: {selectedProduct?.kategori}
                    </p>
                    <p style={{ margin: '0', color: '#667eea', fontWeight: '600' }}>
                      {formatCurrency(selectedProduct?.harga)}
                    </p>
                  </div>
                  <p style={{ color: '#dc3545', marginBottom: '24px' }}>
                    This action cannot be undone.
                  </p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                      onClick={closeModal}
                      disabled={isSubmitting}
                      style={{
                        background: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '10px 24px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isSubmitting}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '10px 24px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
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
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gap: '20px' }}>
                    {/* Product Name */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '6px',
                        fontWeight: '500',
                        color: '#333'
                      }}>
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="nama_produk"
                        value={formData.nama_produk}
                        onChange={handleInputChange}
                        placeholder="Enter product name"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: `2px solid ${formErrors.nama_produk ? '#dc3545' : '#e9ecef'}`,
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                      {formErrors.nama_produk && (
                        <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>
                          {formErrors.nama_produk}
                        </div>
                      )}
                    </div>

                    {/* Category */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '6px',
                        fontWeight: '500',
                        color: '#333'
                      }}>
                        Category *
                      </label>
                      <select
                        name="kategori"
                        value={formData.kategori}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: `2px solid ${formErrors.kategori ? '#dc3545' : '#e9ecef'}`,
                          borderRadius: '6px',
                          fontSize: '14px',
                          backgroundColor: 'white',
                          cursor: 'pointer',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="">Select category</option>
                        {categories.filter(cat => cat !== 'all').map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      {formErrors.kategori && (
                        <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>
                          {formErrors.kategori}
                        </div>
                      )}
                    </div>

                    {/* Price and Stock */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontWeight: '500',
                          color: '#333'
                        }}>
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
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: `2px solid ${formErrors.harga ? '#dc3545' : '#e9ecef'}`,
                            borderRadius: '6px',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                        {formErrors.harga && (
                          <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>
                            {formErrors.harga}
                          </div>
                        )}
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontWeight: '500',
                          color: '#333'
                        }}>
                          Stock Quantity *
                        </label>
                        <input
                          type="number"
                          name="stok"
                          value={formData.stok}
                          onChange={handleInputChange}
                          placeholder="0"
                          min="0"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: `2px solid ${formErrors.stok ? '#dc3545' : '#e9ecef'}`,
                            borderRadius: '6px',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                        {formErrors.stok && (
                          <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>
                            {formErrors.stok}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Image URL */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '6px',
                        fontWeight: '500',
                        color: '#333'
                      }}>
                        Image URL
                      </label>
                      <input
                        type="url"
                        name="gambar_url"
                        value={formData.gambar_url}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '2px solid #e9ecef',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                      <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                        Optional: Leave empty for default placeholder image
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '6px',
                        fontWeight: '500',
                        color: '#333'
                      }}>
                        Description *
                      </label>
                      <textarea
                        name="deskripsi"
                        value={formData.deskripsi}
                        onChange={handleInputChange}
                        placeholder="Enter product description"
                        rows="4"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: `2px solid ${formErrors.deskripsi ? '#dc3545' : '#e9ecef'}`,
                          borderRadius: '6px',
                          fontSize: '14px',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box'
                        }}
                      />
                      {formErrors.deskripsi && (
                        <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>
                          {formErrors.deskripsi}
                        </div>
                      )}
                    </div>

                    {/* Image Preview */}
                    {formData.gambar_url && (
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontWeight: '500',
                          color: '#333'
                        }}>
                          Image Preview
                        </label>
                        <div style={{
                          border: '2px dashed #e9ecef',
                          borderRadius: '8px',
                          padding: '16px',
                          textAlign: 'center'
                        }}>
                          <img
                            src={formData.gambar_url}
                            alt="Preview"
                            style={{
                              maxWidth: '200px',
                              maxHeight: '150px',
                              objectFit: 'cover',
                              borderRadius: '6px'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          <div style={{ display: 'none', color: '#dc3545', fontSize: '14px' }}>
                            ❌ Invalid image URL
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginTop: '32px',
                    paddingTop: '24px',
                    borderTop: '1px solid #f0f0f0'
                  }}>
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={isSubmitting}
                      style={{
                        flex: 1,
                        background: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '12px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        opacity: isSubmitting ? 0.6 : 1
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        flex: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '12px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        opacity: isSubmitting ? 0.6 : 1
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="spinner" style={{ 
                            width: '16px', 
                            height: '16px',
                            borderColor: 'rgba(255,255,255,0.3)',
                            borderTopColor: 'white'
                          }}></div>
                          {modalType === 'add' ? 'Adding...' : 'Updating...'}
                        </>
                      ) : (
                        <>
                          {modalType === 'add' ? '➕ Add Product' : '✏️ Update Product'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inline Styles for Animations */}
      <style jsx>{`
        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #667eea;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .product-grid {
            grid-template-columns: 1fr !important;
          }
          
          .filters-grid {
            grid-template-columns: 1fr !important;
          }
          
          .modal-content {
            margin: 10px !important;
            max-height: 95vh !important;
          }
          
          .price-stock-grid {
            grid-template-columns: 1fr !important;
          }
        }

        /* Scroll bar styling */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        /* Form focus effects */
        input:focus, select:focus, textarea:focus {
          outline: none !important;
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
        }

        /* Button hover effects */
        button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }

        button:active:not(:disabled) {
          transform: translateY(0);
        }

        /* Modal animation */
        .modal-enter {
          opacity: 0;
          transform: scale(0.9);
        }

        .modal-enter-active {
          opacity: 1;
          transform: scale(1);
          transition: opacity 300ms, transform 300ms;
        }

        /* Card hover effects */
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        /* Loading animation */
        .loading-shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        /* Success/Error message animations */
        .alert-enter {
          opacity: 0;
          transform: translateY(-20px);
        }

        .alert-enter-active {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 300ms, transform 300ms;
        }

        /* Tooltip styles */
        .tooltip {
          position: relative;
        }

        .tooltip:hover::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: #333;
          color: white;
          padding: 6px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          z-index: 1000;
        }

        /* Custom select arrow */
        select {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 8px center;
          background-repeat: no-repeat;
          background-size: 16px;
          padding-right: 32px !important;
          appearance: none;
        }

        /* Focus visible for accessibility */
        button:focus-visible,
        input:focus-visible,
        select:focus-visible,
        textarea:focus-visible {
          outline: 2px solid #667eea;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

export default ProductPage;