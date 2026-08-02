import React from 'react'

export default function Cart({cart, onRemoveFromCart, onUpdateQuantity, onBackToShop}){
  const getTotal = () => {
    if (!cart || cart.length === 0) return 0
    return cart.reduce((total, item) => total + (item.price * (item.quantity || 0)), 0)
  }

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      onRemoveFromCart(itemId)
    } else {
      onUpdateQuantity(itemId, newQuantity)
    }
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your Cart is Empty</h2>
        <p>Add some fresh produce to get started!</p>
        {onBackToShop && (
          <button className="back-to-shop-btn" onClick={onBackToShop}>
            Continue Shopping
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2 className="cart-title">Shopping Cart</h2>
        {onBackToShop && (
          <button className="back-to-shop-btn" onClick={onBackToShop}>
            ← Back to Shop
          </button>
        )}
      </div>
      <div className="cart-items">
        {cart.map(item => (
          <div key={item.id} className="cart-item">
            <img src={item.image} alt={item.name} className="cart-item-img" />
            <div className="cart-item-details">
              <h3>{item.name}</h3>
              <p className="cart-item-category">{item.category}</p>
              <p className="cart-item-price">₹{item.price} / {item.unit}</p>
            </div>
            <div className="cart-item-controls">
              <div className="quantity-controls">
                <button 
                  className="qty-btn" 
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                >
                  −
                </button>
                <span className="qty-value">{item.quantity || 1}</span>
                <button 
                  className="qty-btn" 
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              <p className="cart-item-total">₹{item.price * (item.quantity || 1)}</p>
              <button 
                className="remove-btn" 
                onClick={() => onRemoveFromCart(item.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <div className="cart-total">
          <h3>Total: ₹{getTotal()}</h3>
        </div>
        <button className="checkout-btn">Proceed to Checkout</button>
      </div>
    </div>
  )
}

