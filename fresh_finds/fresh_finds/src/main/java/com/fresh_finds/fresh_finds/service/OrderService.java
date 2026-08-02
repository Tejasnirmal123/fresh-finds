package com.fresh_finds.fresh_finds.service;

import com.fresh_finds.fresh_finds.controller.request.CreateOrderRequest;
import com.fresh_finds.fresh_finds.controller.request.UpdateOrderRequest;
import com.fresh_finds.fresh_finds.controller.response.OrderResponse;

import java.util.List;

public interface OrderService {
    OrderResponse createOrder(Long userId, CreateOrderRequest request);
    List<OrderResponse> getAllOrders();
    List<OrderResponse> getAllOrders(String status, String startDate, String endDate);
    List<OrderResponse> getUserOrders(Long userId);
    OrderResponse getOrderById(Long orderId);
    OrderResponse updateOrder(Long orderId, UpdateOrderRequest request);
}

