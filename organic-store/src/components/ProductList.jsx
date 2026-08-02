import React from 'react'
import ProductCard from './ProductCard'

export default function ProductList({products = [], onAddToCart}){
  if(!products || products.length===0) return <p className="no-results">No items found.</p>
  return (
    <section className="product-grid">
      {products.map(p => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />)}
    </section>
  )
}
