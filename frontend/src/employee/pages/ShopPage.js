// src/employee/pages/ShoPage.js
import React, { useState, useEffect } from 'react';
import { 
  FiSearch, FiShoppingCart, FiPackage, FiFilter, 
  FiGrid, FiList, FiPlus, FiMinus, FiCheck 
} from 'react-icons/fi';
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
      <div className={`product-card ${viewMode}`}>
        <div className="product-image">
          <FiPackage />
          {product.stock === 0 && (
            <div className="out-of-stock-overlay">
              Out of Stock
            </div>
          )}
        </div>
        
        <div className="product-info">
          <h3 className="product-name">{product.nama_product}</h3>
          <p className="product-description">{product.deskripsi}</p>
          <div className="product-price">
            Rp {product.harga.toLocaleString()}
          </div>
          <div className="product-stock">
            <span className={`stock-badge ${product.stock <= 10 ? 'low-stock' : 'in-stock'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>
        </div>

        <div className="product-actions">
          {product.stock > 0 && (
            <>
              <div className="quantity-selector">
                <button 
                  type="button"
                  className="quantity-btn"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <FiMinus />
                </button>
                <span className="quantity-display">{quantity}</span>
                <button 
                  type="button"
                  className="quantity-btn"
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stock}
                >
                  <FiPlus />
                </button>
              </div>
              
              <button
                className="add-to-cart-btn"
                onClick={() => handleAddToCart(product.id_product, quantity)}
                disabled={isAddingToCart || product.stock === 0}
              >
                {isAddingToCart ? (
                  <>
                    <div className="spinner-sm"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <FiShoppingCart />
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
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        
        {pages.map(page => (
          <button
            key={page}
            className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}
        
        <button
          className="pagination-btn"
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="shop-page">
      {/* Header */}
      <div className="shop-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">Product Catalog</h1>
            <p className="page-subtitle">Browse and add products to your cart</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="shop-filters">
        <div className="filters-content">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">
                Search
              </button>
            </div>
          </form>

          <div className="view-controls">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <FiGrid />
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <FiList />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="alert alert-success">
          <FiCheck /> {successMessage}
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Products */}
      {loading ? (
        <Loading message="Loading products..." />
      ) : (
        <>
          {products.length > 0 ? (
            <>
              <div className={`products-container ${viewMode}`}>
                {products.map(product => (
                  <ProductCard key={product.id_product} product={product} />
                ))}
              </div>
              
              {totalPages > 1 && <Pagination />}
            </>
          ) : (
            <div className="no-products">
              <FiPackage className="empty-icon" />
              <h3>No products found</h3>
              <p>Try adjusting your search terms or filters</p>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .shop-page {
          padding: 0;
        }

        .shop-header {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .page-subtitle {
          color: #666;
          font-size: 1rem;
          margin: 0;
        }

        .shop-filters {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .filters-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .search-form {
          flex: 1;
          max-width: 400px;
        }

        .search-input-group {
          display: flex;
          align-items: center;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          color: #666;
          z-index: 1;
        }

        .search-input {
          flex: 1;
          padding: 10px 12px 10px 40px;
          border: 1px solid #ddd;
          border-radius: 6px 0 0 6px;
          font-size: 14px;
        }

        .search-input:focus {
          outline: none;
          border-color: #007bff;
        }

        .search-btn {
          padding: 10px 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 0 6px 6px 0;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }

        .search-btn:hover {
          background: #0056b3;
        }

        .view-controls {
          display: flex;
          gap: 0.5rem;
        }

        .view-btn {
          padding: 8px;
          border: 1px solid #ddd;
          background: white;
          cursor: pointer;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
        }

        .view-btn:hover,
        .view-btn.active {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }

        .products-container {
          margin-bottom: 2rem;
        }

        .products-container.grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .products-container.list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .product-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
          overflow: hidden;
        }

        .product-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .product-card.grid {
          display: flex;
          flex-direction: column;
        }

        .product-card.list {
          display: flex;
          flex-direction: row;
          align-items: center;
          padding: 1.5rem;
        }

        .product-image {
          position: relative;
          background: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
        }

        .product-card.grid .product-image {
          height: 200px;
          font-size: 3rem;
        }

        .product-card.list .product-image {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          font-size: 2rem;
          margin-right: 1.5rem;
          flex-shrink: 0;
        }

        .out-of-stock-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .product-info {
          flex: 1;
        }

        .product-card.grid .product-info {
          padding: 1.5rem;
        }

        .product-card.list .product-info {
          padding-right: 1.5rem;
        }

        .product-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: #333;
          margin: 0 0 0.5rem 0;
          line-height: 1.4;
        }

        .product-description {
          color: #666;
          font-size: 0.875rem;
          margin: 0 0 1rem 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-card.list .product-description {
          -webkit-line-clamp: 1;
        }

        .product-price {
          font-size: 1.25rem;
          font-weight: 700;
          color: #007bff;
          margin-bottom: 0.5rem;
        }

        .stock-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .stock-badge.in-stock {
          background: #d4edda;
          color: #155724;
        }

        .stock-badge.low-stock {
          background: #fff3cd;
          color: #856404;
        }

        .product-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .product-card.grid .product-actions {
          padding: 0 1.5rem 1.5rem;
        }

        .product-card.list .product-actions {
          flex-direction: row;
          align-items: center;
          min-width: 200px;
        }

        .quantity-selector {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: #f8f9fa;
          border-radius: 6px;
          padding: 0.5rem;
        }

        .quantity-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          transition: all 0.2s;
        }

        .quantity-btn:hover:not(:disabled) {
          background: #007bff;
          color: white;
        }

        .quantity-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .quantity-display {
          min-width: 40px;
          text-align: center;
          font-weight: 600;
          color: #333;
        }

        .add-to-cart-btn {
          padding: 12px 16px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: background-color 0.2s;
        }

        .add-to-cart-btn:hover:not(:disabled) {
          background: #1e7e34;
        }

        .add-to-cart-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner-sm {
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          margin-top: 2rem;
        }

        .pagination-btn {
          padding: 8px 12px;
          border: 1px solid #ddd;
          background: white;
          cursor: pointer;
          border-radius: 6px;
          color: #333;
          font-size: 14px;
          transition: all 0.2s;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #f8f9fa;
          border-color: #007bff;
        }

        .pagination-btn.active {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .no-products {
          text-align: center;
          padding: 4rem 2rem;
          color: #666;
        }

        .empty-icon {
          font-size: 4rem;
          color: #ddd;
          margin-bottom: 1rem;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .alert-success {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
        }

        .alert-error {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .shop-header {
            padding: 1.5rem;
          }

          .page-title {
            font-size: 1.5rem;
          }

          .filters-content {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .search-form {
            max-width: none;
          }

          .view-controls {
            align-self: center;
          }

          .products-container.grid {
            grid-template-columns: 1fr;
          }

          .product-card.list {
            flex-direction: column;
            align-items: stretch;
          }

          .product-card.list .product-image {
            margin-right: 0;
            margin-bottom: 1rem;
            height: 120px;
          }

          .product-card.list .product-actions {
            flex-direction: column;
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default ShopPage;