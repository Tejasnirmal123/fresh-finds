package com.fresh_finds.fresh_finds.service.impl;

import com.fresh_finds.fresh_finds.controller.request.AddToCartRequest;
import com.fresh_finds.fresh_finds.controller.request.UpdateCartItemRequest;
import com.fresh_finds.fresh_finds.controller.response.CartItemResponse;
import com.fresh_finds.fresh_finds.controller.response.CartResponse;
import com.fresh_finds.fresh_finds.repository.CartItemRepository;
import com.fresh_finds.fresh_finds.repository.CartRepository;
import com.fresh_finds.fresh_finds.repository.ProductRepository;
import com.fresh_finds.fresh_finds.repository.UserRepository;
import com.fresh_finds.fresh_finds.repository.entity.Cart;
import com.fresh_finds.fresh_finds.repository.entity.CartItem;
import com.fresh_finds.fresh_finds.repository.entity.Product;
import com.fresh_finds.fresh_finds.repository.entity.User;
import com.fresh_finds.fresh_finds.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final EntityManager entityManager;
    private static final BigDecimal TAX_RATE = new BigDecimal("0.08"); // 8% tax

    @Value("${api.base-path:/fresh-finds/api/v1}")
    private String apiBasePath;

    @Autowired
    public CartServiceImpl(CartRepository cartRepository, CartItemRepository cartItemRepository,
                           ProductRepository productRepository, UserRepository userRepository,
                           EntityManager entityManager) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.entityManager = entityManager;
    }

    private Cart getOrCreateCart(Long userId) {
        Optional<Cart> cartOpt = cartRepository.findByUserId(userId);
        if (cartOpt.isPresent()) {
            return cartOpt.get();
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Cart cart = new Cart(user);
        cart = cartRepository.save(cart);
        entityManager.flush(); // Ensure cart ID is available immediately
        return cart;
    }

    private void calculateCartTotals(Cart cart) {
        BigDecimal subtotal = cartItemRepository.calculateCartSubtotal(cart.getId());
        if (subtotal == null) {
            subtotal = BigDecimal.ZERO;
        }
        
        // Remove tax calculation - total = subtotal
        BigDecimal tax = BigDecimal.ZERO;
        BigDecimal total = subtotal.setScale(2, RoundingMode.HALF_UP);
        
        cart.setSubtotal(subtotal);
        cart.setTax(tax);
        cart.setTotal(total);
        cartRepository.save(cart);
    }

    private String buildImageUrl(String imagePath) {
        if (imagePath == null || imagePath.isEmpty()) {
            return null;
        }
        if (imagePath.startsWith("http")) {
            return imagePath;
        }
        // Match the pattern used in ProductServiceImpl - return relative path
        // Frontend will prepend http://localhost:8081
        return apiBasePath + "/images/" + imagePath;
    }

    private CartItemResponse mapToCartItemResponse(CartItem cartItem) {
        CartItemResponse response = new CartItemResponse();
        response.setId(cartItem.getId());
        response.setProductId(cartItem.getProductId());
        response.setProductName(cartItem.getProductName());
        response.setProductImagePath(cartItem.getProductImagePath());
        response.setProductImageUrl(buildImageUrl(cartItem.getProductImagePath()));
        response.setPrice(cartItem.getPrice());
        response.setUnit(cartItem.getUnit());
        response.setQuantity(cartItem.getQuantity());
        response.setSubtotal(cartItem.getSubtotal());
        
        // Get isOrganic from product if available
        if (cartItem.getProductId() != null) {
            productRepository.findById(cartItem.getProductId())
                    .ifPresent(product -> response.setIsOrganic(product.getIsOrganic()));
        }
        
        return response;
    }

    private CartResponse buildCartResponse(Cart cart) {
        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
        List<CartItemResponse> itemResponses = cartItems.stream()
                .map(this::mapToCartItemResponse)
                .collect(Collectors.toList());

        CartResponse response = new CartResponse();
        response.setId(cart.getId());
        response.setUserId(cart.getUserId());
        response.setItems(itemResponses);
        response.setSubtotal(cart.getSubtotal());
        response.setTax(cart.getTax());
        response.setTotal(cart.getTotal());
        response.setItemCount(itemResponses.size());

        return response;
    }

    @Override
    @Transactional
    public CartResponse getCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        calculateCartTotals(cart);
        return buildCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addToCart(Long userId, AddToCartRequest request) {
        Cart cart = getOrCreateCart(userId);
        
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (product.getIsActive() == null || !product.getIsActive()) {
            throw new IllegalArgumentException("Product is not available");
        }

        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), request.getProductId());
        
        CartItem cartItem;
        if (existingItemOpt.isPresent()) {
            // Update quantity if item already exists
            cartItem = existingItemOpt.get();
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
            // Ensure product details are up to date (in case product price changed)
            cartItem.setProduct(product);
        } else {
            // Create new cart item
            cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(request.getQuantity());
        }
        
        cartItemRepository.save(cartItem);
        calculateCartTotals(cart);
        
        return buildCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse updateCartItem(Long userId, Long cartItemId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(userId);
        
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        if (!cartItem.getCartId().equals(cart.getId())) {
            throw new IllegalArgumentException("Cart item does not belong to user's cart");
        }

        cartItem.setQuantity(request.getQuantity());
        cartItemRepository.save(cartItem);
        calculateCartTotals(cart);
        
        return buildCartResponse(cart);
    }

    @Override
    @Transactional
    public void removeCartItem(Long userId, Long cartItemId) {
        Cart cart = getOrCreateCart(userId);
        
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        if (!cartItem.getCartId().equals(cart.getId())) {
            throw new IllegalArgumentException("Cart item does not belong to user's cart");
        }

        cartItemRepository.delete(cartItem);
        calculateCartTotals(cart);
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cartItemRepository.deleteByCartId(cart.getId());
        calculateCartTotals(cart);
    }
}

