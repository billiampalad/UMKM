import React, { useState, useEffect } from 'react';
import api from '../../shared/utils/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    try {
      await api.post('/cart', {
        id_product: productId,
        jumlah: 1
      });
      alert('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding product to cart');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="product-list">
      <h1>Products</h1>
      
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id_product} className="product-card">
            <h3>{product.nama_product}</h3>
            <p className="description">{product.deskripsi}</p>
            <p className="price">Rp {product.harga?.toLocaleString()}</p>
            <p className="stock">Stock: {product.stock}</p>
            
            <button 
              onClick={() => addToCart(product.id_product)}
              disabled={product.stock === 0}
              className="btn-primary"
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;