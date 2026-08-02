package com.fresh_finds.fresh_finds.service;

import com.fresh_finds.fresh_finds.controller.request.AddToCartRequest;
import com.fresh_finds.fresh_finds.controller.request.UpdateCartItemRequest;
import com.fresh_finds.fresh_finds.controller.response.CartResponse;

public interface CartService {
    CartResponse getCart(Long userId);
    CartResponse addToCart(Long userId, AddToCartRequest request);
    CartResponse updateCartItem(Long userId, Long cartItemId, UpdateCartItemRequest request);
    void removeCartItem(Long userId, Long cartItemId);
    void clearCart(Long userId);
}

