// src/employee/pages/ShopPage.js
import React, { useState, useEffect } from 'react';
import { productAPI, cartAPI } from '../../shared/services/api';
import Loading from '../../shared/components/Loading';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [addingToCart, setAddingToCart] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const itemsPerPage = 12;

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm
      };

      const response = await productAPI.getAllProducts(params);
      const { products: productData, pagination } = response.data.data;
      
      setProducts(productData);
      setTotalPages(pagination.totalPages);
      
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const handleAddToCart = async (productId, quantity = 1) => {
    try {
      setAddingToCart(prev => ({ ...prev, [productId]: true }));
      
      await cartAPI.addToCart({
        id_product: productId,
        jumlah: quantity
      });

      setSuccessMessage('Product added to cart successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add product to cart';
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const ProductCard = ({ product }) => {
    const [quantity, setQuantity] = useState(1);
    const isAddingToCart = addingToCart[product.id_product];

    const incrementQuantity = () => {
      if (quantity < product.stock) {
        setQuantity(prev => prev + 1);
      }
    };

    const decrementQuantity = () => {
      if (quantity > 1) {
        setQuantity(prev => prev - 1);
      }
    };

    return (
      <div style={viewMode === 'grid' ? styles.productCardGrid : styles.productCardList}>
        <div style={viewMode === 'grid' ? styles.productImageGrid : styles.productImageList}>
          <i className="fas fa-box" style={styles.productIcon}></i>
          {product.stock === 0 && (
            <div style={styles.outOfStockOverlay}>
              <i className="fas fa-ban" style={styles.outOfStockIcon}></i>
              Out of Stock
            </div>
          )}
        </div>
        
        <div style={viewMode === 'grid' ? styles.productInfoGrid : styles.productInfoList}>
          <h3 style={styles.productName}>{product.nama_product}</h3>
          <p style={viewMode === 'grid' ? styles.productDescription : styles.productDescriptionList}>
            {product.deskripsi}
          </p>
          <div style={styles.productPrice}>
            Rp {product.harga.toLocaleString()}
          </div>
          <div style={styles.productStock}>
            <span style={{
              ...styles.stockBadge,
              backgroundColor: product.stock <= 10 ? 'rgba(255, 102, 0, 0.2)' : 'rgba(143, 209, 79, 0.2)',
              color: product.stock <= 10 ? '#FF6600' : '#8FD14F'
            }}>
              <i className={`fas ${product.stock > 0 ? 'fa-check-circle' : 'fa-times-circle'}`} style={styles.stockIcon}></i>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>
        </div>

        <div style={viewMode === 'grid' ? styles.productActionsGrid : styles.productActionsList}>
          {product.stock > 0 && (
            <>
              <div style={styles.quantitySelector}>
                <button 
                  type="button"
                  style={{
                    ...styles.quantityBtn,
                    opacity: quantity <= 1 ? 0.5 : 1,
                    cursor: quantity <= 1 ? 'not-allowed' : 'pointer'
                  }}
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <i className="fas fa-minus"></i>
                </button>
                <span style={styles.quantityDisplay}>{quantity}</span>
                <button 
                  type="button"
                  style={{
                    ...styles.quantityBtn,
                    opacity: quantity >= product.stock ? 0.5 : 1,
                    cursor: quantity >= product.stock ? 'not-allowed' : 'pointer'
                  }}
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stock}
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              
              <button
                style={{
                  ...styles.addToCartBtn,
                  opacity: isAddingToCart || product.stock === 0 ? 0.7 : 1,
                  cursor: isAddingToCart || product.stock === 0 ? 'not-allowed' : 'pointer'
                }}
                onClick={() => handleAddToCart(product.id_product, quantity)}
                disabled={isAddingToCart || product.stock === 0}
              >
                {isAddingToCart ? (
                  <>
                    <div style={styles.spinner}></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <i className="fas fa-shopping-cart" style={styles.buttonIcon}></i>
                    Add to Cart
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const Pagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div style={styles.pagination}>
        <button
          style={{
            ...styles.paginationBtn,
            opacity: currentPage === 1 ? 0.5 : 1,
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
          }}
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          <i className="fas fa-chevron-left" style={styles.paginationIcon}></i>
          Previous
        </button>
        
        {pages.map(page => (
          <button
            key={page}
            style={{
              ...styles.paginationBtn,
              ...(currentPage === page ? styles.paginationBtnActive : {})
            }}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}
        
        <button
          style={{
            ...styles.paginationBtn,
            opacity: currentPage === totalPages ? 0.5 : 1,
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
          }}
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          Next
          <i className="fas fa-chevron-right" style={styles.paginationIcon}></i>
        </button>
      </div>
    );
  };

  return (
    <div style={styles.shopPage}>
      {/* FontAwesome CDN */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
      />
      
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.shopHeader}>
          <div style={styles.headerContent}>
            <div style={styles.headerText}>
              <h1 style={styles.pageTitle}>
                <i className="fas fa-store" style={styles.headerIcon}></i>
                Product Catalog
              </h1>
              <p style={styles.pageSubtitle}>Browse and add products to your cart</p>
            </div>
            <div style={styles.headerStats}>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{products.length}</div>
                <div style={styles.statLabel}>Products</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div style={styles.shopFilters}>
          <div style={styles.filtersContent}>
            <form onSubmit={handleSearch} style={styles.searchForm}>
              <div style={styles.searchInputGroup}>
                <i className="fas fa-search" style={styles.searchIcon}></i>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
                <button type="submit" style={styles.searchBtn}>
                  <i className="fas fa-search" style={styles.buttonIcon}></i>
                  Search
                </button>
              </div>
            </form>

            <div style={styles.viewControls}>
              <button
                style={{
                  ...styles.viewBtn,
                  ...(viewMode === 'grid' ? styles.viewBtnActive : {})
                }}
                onClick={() => setViewMode('grid')}
              >
                <i className="fas fa-th-large"></i>
              </button>
              <button
                style={{
                  ...styles.viewBtn,
                  ...(viewMode === 'list' ? styles.viewBtnActive : {})
                }}
                onClick={() => setViewMode('list')}
              >
                <i className="fas fa-list"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div style={styles.alertSuccess}>
            <i className="fas fa-check-circle" style={styles.alertIcon}></i>
            {successMessage}
          </div>
        )}

        {error && (
          <div style={styles.alertError}>
            <i className="fas fa-exclamation-triangle" style={styles.alertIcon}></i>
            {error}
          </div>
        )}

        {/* Products */}
        {loading ? (
          <div style={styles.loadingContainer}>
            <Loading message="Loading products..." />
          </div>
        ) : (
          <>
            {products.length > 0 ? (
              <>
                <div style={viewMode === 'grid' ? styles.productsGrid : styles.productsList}>
                  {products.map(product => (
                    <ProductCard key={product.id_product} product={product} />
                  ))}
                </div>
                
                {totalPages > 1 && <Pagination />}
              </>
            ) : (
              <div style={styles.noProducts}>
                <i className="fas fa-box-open" style={styles.emptyIcon}></i>
                <h3 style={styles.emptyTitle}>No products found</h3>
                <p style={styles.emptyText}>Try adjusting your search terms or filters</p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                    fetchProducts();
                  }}
                  style={styles.resetButton}
                >
                  <i className="fas fa-redo" style={styles.buttonIcon}></i>
                  Reset Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Styles object
const styles = {
  shopPage: {
    minHeight: '100vh',
    backgroundColor: '#F5F5F5',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px'
  },
  shopHeader: {
    background: 'linear-gradient(135deg, #604CC3 0%, #8b5cf6 100%)',
    borderRadius: '20px',
    padding: '32px',
    marginBottom: '24px',
    color: 'white',
    position: 'relative',
    overflow: 'hidden'
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 10,
    flexWrap: 'wrap',
    gap: '24px'
  },
  headerText: {
    flex: 1
  },
  pageTitle: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  headerIcon: {
    color: 'white'
  },
  pageSubtitle: {
    fontSize: '1.125rem',
    margin: 0,
    opacity: 0.9
  },
  headerStats: {
    display: 'flex',
    gap: '24px'
  },
  statItem: {
    textAlign: 'center',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    padding: '16px 24px',
    backdropFilter: 'blur(10px)'
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '4px'
  },
  statLabel: {
    fontSize: '0.875rem',
    opacity: 0.9
  },
  shopFilters: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  },
  filtersContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '24px',
    flexWrap: 'wrap'
  },
  searchForm: {
    flex: 1,
    maxWidth: '500px'
  },
  searchInputGroup: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    background: 'white',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    overflow: 'hidden',
    transition: 'all 0.3s ease'
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    color: '#666',
    zIndex: 1
  },
  searchInput: {
    flex: 1,
    padding: '14px 16px 14px 48px',
    border: 'none',
    fontSize: '1rem',
    outline: 'none',
    background: 'transparent'
  },
  searchBtn: {
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #FF6600 0%, #ff8533 100%)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease'
  },
  viewControls: {
    display: 'flex',
    gap: '8px',
    background: '#f8f9fa',
    borderRadius: '12px',
    padding: '4px'
  },
  viewBtn: {
    padding: '12px 16px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    borderRadius: '8px',
    color: '#666',
    fontSize: '1.125rem',
    transition: 'all 0.3s ease'
  },
  viewBtnActive: {
    background: '#604CC3',
    color: 'white',
    boxShadow: '0 2px 8px rgba(96, 76, 195, 0.3)'
  },
  alertSuccess: {
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(143, 209, 79, 0.2)',
    border: '1px solid #8FD14F',
    color: '#8FD14F',
    fontWeight: '500'
  },
  alertError: {
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid #ef4444',
    color: '#ef4444',
    fontWeight: '500'
  },
  alertIcon: {
    fontSize: '1.125rem'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px'
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '32px'
  },
  productsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '32px'
  },
  productCardGrid: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer'
  },
  productCardList: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '24px',
    cursor: 'pointer'
  },
  productImageGrid: {
    height: '200px',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    color: '#666'
  },
  productImageList: {
    width: '80px',
    height: '80px',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '24px',
    flexShrink: 0,
    position: 'relative',
    color: '#666'
  },
  productIcon: {
    fontSize: '2.5rem'
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    gap: '8px'
  },
  outOfStockIcon: {
    fontSize: '1.5rem'
  },
  productInfoGrid: {
    padding: '24px',
    flex: 1
  },
  productInfoList: {
    flex: 1,
    paddingRight: '24px'
  },
  productName: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 8px 0',
    lineHeight: '1.4'
  },
  productDescription: {
    color: '#666',
    fontSize: '0.875rem',
    margin: '0 0 16px 0',
    lineHeight: '1.5',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  productDescriptionList: {
    color: '#666',
    fontSize: '0.875rem',
    margin: '0 0 16px 0',
    lineHeight: '1.5',
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  productPrice: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#FF6600',
    marginBottom: '8px'
  },
  productStock: {
    marginBottom: '16px'
  },
  stockBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  },
  stockIcon: {
    fontSize: '0.75rem'
  },
  productActionsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '0 24px 24px'
  },
  productActionsList: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '16px',
    minWidth: '250px'
  },
  quantitySelector: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: '#f8f9fa',
    borderRadius: '12px',
    padding: '8px 12px'
  },
  quantityBtn: {
    width: '36px',
    height: '36px',
    border: 'none',
    background: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    transition: 'all 0.3s ease',
    fontSize: '0.875rem'
  },
  quantityDisplay: {
    minWidth: '40px',
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
    fontSize: '1rem'
  },
  addToCartBtn: {
    padding: '14px 20px',
    background: 'linear-gradient(135deg, #8FD14F 0%, #7bc142 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    fontSize: '0.875rem'
  },
  spinner: {
    border: '2px solid transparent',
    borderTop: '2px solid currentColor',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    animation: 'spin 1s linear infinite'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginTop: '32px',
    flexWrap: 'wrap'
  },
  paginationBtn: {
    padding: '12px 16px',
    border: '1px solid #e5e7eb',
    background: 'white',
    cursor: 'pointer',
    borderRadius: '8px',
    color: '#333',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  paginationBtnActive: {
    background: '#604CC3',
    color: 'white',
    borderColor: '#604CC3'
  },
  paginationIcon: {
    fontSize: '0.75rem'
  },
  noProducts: {
    textAlign: 'center',
    padding: '64px 32px',
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  },
  emptyIcon: {
    fontSize: '5rem',
    color: '#d1d5db',
    marginBottom: '24px'
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
    margin: '0 0 8px 0'
  },
  emptyText: {
    color: '#666',
    marginBottom: '32px',
    fontSize: '1rem',
    margin: '0 0 32px 0'
  },
  resetButton: {
    background: 'linear-gradient(135deg, #604CC3 0%, #8b5cf6 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease'
  },
  buttonIcon: {
    fontSize: '0.875rem'
  }
};

export default ShopPage;