package com.fresh_finds.fresh_finds.controller;

import com.fresh_finds.fresh_finds.controller.request.AddToCartRequest;
import com.fresh_finds.fresh_finds.controller.request.UpdateCartItemRequest;
import com.fresh_finds.fresh_finds.controller.response.CartResponse;
import com.fresh_finds.fresh_finds.service.CartService;
import com.fresh_finds.fresh_finds.utils.ApiResponse;
import com.fresh_finds.fresh_finds.utils.SecurityUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/fresh-finds/api/v1/cart")
public class CartController {

    private final CartService cartService;
    private final SecurityUtil securityUtil;

    public CartController(CartService cartService, SecurityUtil securityUtil) {
        this.cartService = cartService;
        this.securityUtil = securityUtil;
    }

    @GetMapping
    public ApiResponse getCart() {
        Long userId = securityUtil.getCurrentUserId();
        CartResponse response = cartService.getCart(userId);
        return ApiResponse.buildSuccessResponse(response);
    }

    @PostMapping("/items")
    public ApiResponse addToCart(@Valid @RequestBody AddToCartRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        CartResponse response = cartService.addToCart(userId, request);
        return ApiResponse.buildSuccessResponse(response, HttpStatus.CREATED);
    }

    @PutMapping("/items/{cartItemId}")
    public ApiResponse updateCartItem(@PathVariable Long cartItemId, @Valid @RequestBody UpdateCartItemRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        CartResponse response = cartService.updateCartItem(userId, cartItemId, request);
        return ApiResponse.buildSuccessResponse(response);
    }

    @DeleteMapping("/items/{cartItemId}")
    public ApiResponse removeCartItem(@PathVariable Long cartItemId) {
        Long userId = securityUtil.getCurrentUserId();
        cartService.removeCartItem(userId, cartItemId);
        return ApiResponse.buildSuccessResponse(null);
    }

    @DeleteMapping
    public ApiResponse clearCart() {
        Long userId = securityUtil.getCurrentUserId();
        cartService.clearCart(userId);
        return ApiResponse.buildSuccessResponse(null);
    }
}

