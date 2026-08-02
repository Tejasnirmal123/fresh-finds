package com.fresh_finds.fresh_finds.service.impl;

import com.fresh_finds.fresh_finds.controller.request.CreateOrderRequest;
import com.fresh_finds.fresh_finds.controller.request.UpdateOrderRequest;
import com.fresh_finds.fresh_finds.controller.response.OrderItemResponse;
import com.fresh_finds.fresh_finds.controller.response.OrderResponse;
import com.fresh_finds.fresh_finds.repository.*;
import com.fresh_finds.fresh_finds.repository.entity.*;
import com.fresh_finds.fresh_finds.service.CartService;
import com.fresh_finds.fresh_finds.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    private final EntityManager entityManager;

    @Value("${api.base-path:/fresh-finds/api/v1}")
    private String apiBasePath;

    @Autowired
    public OrderServiceImpl(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                           CartRepository cartRepository, CartItemRepository cartItemRepository,
                           ProductRepository productRepository, UserRepository userRepository,
                           CartService cartService, EntityManager entityManager) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.cartService = cartService;
        this.entityManager = entityManager;
    }

    private String buildImageUrl(String imagePath) {
        if (imagePath == null || imagePath.isEmpty()) {
            return null;
        }
        if (imagePath.startsWith("http")) {
            return imagePath;
        }
        return apiBasePath + "/images/" + imagePath;
    }

    private OrderItemResponse mapToOrderItemResponse(OrderItem orderItem) {
        OrderItemResponse response = new OrderItemResponse();
        response.setId(orderItem.getId());
        response.setProductId(orderItem.getProductId());
        response.setProductName(orderItem.getProductName());
        response.setProductImagePath(orderItem.getProductImagePath());
        response.setProductImageUrl(buildImageUrl(orderItem.getProductImagePath()));
        response.setPrice(orderItem.getPrice());
        response.setUnit(orderItem.getUnit());
        response.setQuantity(orderItem.getQuantity());
        response.setSubtotal(orderItem.getSubtotal());
        return response;
    }

    @Override
    @Transactional
    public OrderResponse createOrder(Long userId, CreateOrderRequest request) {
        // Get or create user's cart
        Cart cart = cartRepository.findByUserId(userId).orElse(null);
        if (cart == null) {
            // Create cart if it doesn't exist
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            cart = new Cart(user);
            cart = cartRepository.save(cart);
            entityManager.flush();
        }

        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
        if (cartItems == null || cartItems.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty. Please add items to your cart before placing an order.");
        }

        // Get user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Create order
        Order order = new Order();
        order.setUser(user);
        order.setCustomerFirstName(request.getFirstName());
        order.setCustomerLastName(request.getLastName());
        order.setCustomerEmail(request.getEmail());
        order.setCustomerPhone(request.getPhone());
        
        // Combine address lines
        String fullAddress = request.getAddressLine1();
        if (request.getAddressLine2() != null && !request.getAddressLine2().isEmpty()) {
            fullAddress += ", " + request.getAddressLine2();
        }
        order.setShippingStreet(fullAddress);
        order.setShippingCity(request.getCity());
        order.setShippingState(request.getState());
        order.setShippingZipCode(request.getZipCode());
        order.setShippingCountry(request.getCountry());
        
        // Set order totals from cart
        order.setSubtotal(cart.getSubtotal());
        order.setTax(cart.getTax());
        order.setShipping(BigDecimal.ZERO); // Free shipping
        order.setDiscount(cart.getDiscount());
        order.setTotal(cart.getTotal());
        
        // Set notes from delivery instructions
        if (request.getDeliveryInstructions() != null && !request.getDeliveryInstructions().isEmpty()) {
            order.setNotes(request.getDeliveryInstructions());
        }
        
        // Set status - no payment for now
        order.setStatus("CONFIRMED");
        order.setPaymentStatus("PENDING");
        order.setPaymentMethod("CASH_ON_DELIVERY");

        // Save order first to get ID
        order = orderRepository.save(order);
        entityManager.flush(); // Ensure order is persisted and ID is available
        
        // Update order number with ID (after @PostPersist, we need to refresh or update manually)
        if (order.getId() != null) {
            String orderNumber = "ORD-" + java.time.LocalDateTime.now().getYear() + "-" + 
                               String.format("%06d", order.getId());
            order.setOrderNumber(orderNumber);
            order = orderRepository.save(order);
        }

        // Create order items from cart items and update stock
        for (CartItem cartItem : cartItems) {
            Product product = productRepository.findById(cartItem.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + cartItem.getProductId()));

            // Update stock quantity
            Integer currentStock = product.getStockQty() != null ? product.getStockQty() : 0;
            Integer orderedQuantity = cartItem.getQuantity() != null ? cartItem.getQuantity() : 0;
            Integer newStock = Math.max(0, currentStock - orderedQuantity); // Prevent negative stock
            product.setStockQty(newStock);
            productRepository.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            // Product details are set automatically in OrderItem.setProduct()
            
            orderItemRepository.save(orderItem);
        }

        // Clear cart after order creation
        cartService.clearCart(userId);

        // Build response using helper method
        return mapToOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();
        return orders.stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders(String status, String startDate, String endDate) {
        List<Order> orders;
        
        // Build query based on filters
        if (status != null && !status.isEmpty()) {
            if (startDate != null && !startDate.isEmpty() && endDate != null && !endDate.isEmpty()) {
                // Filter by status and date range
                java.time.LocalDate start = java.time.LocalDate.parse(startDate);
                java.time.LocalDate end = java.time.LocalDate.parse(endDate);
                orders = orderRepository.findByStatusAndCreatedAtBetweenOrderByCreatedAtDesc(
                    status, 
                    start.atStartOfDay(), 
                    end.atTime(23, 59, 59)
                );
            } else {
                // Filter by status only
                orders = orderRepository.findByStatusOrderByCreatedAtDesc(status);
            }
        } else if (startDate != null && !startDate.isEmpty() && endDate != null && !endDate.isEmpty()) {
            // Filter by date range only
            java.time.LocalDate start = java.time.LocalDate.parse(startDate);
            java.time.LocalDate end = java.time.LocalDate.parse(endDate);
            orders = orderRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(
                start.atStartOfDay(), 
                end.atTime(23, 59, 59)
            );
        } else {
            // No filters
            orders = orderRepository.findAllByOrderByCreatedAtDesc();
        }
        
        return orders.stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(Long userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return orders.stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        return mapToOrderResponse(order);
    }

    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(order.getId());
        List<OrderItemResponse> itemResponses = orderItems.stream()
                .map(this::mapToOrderItemResponse)
                .collect(Collectors.toList());

        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setOrderNumber(order.getOrderNumber());
        response.setUserId(order.getUserId());
        response.setCustomerFirstName(order.getCustomerFirstName());
        response.setCustomerLastName(order.getCustomerLastName());
        response.setCustomerEmail(order.getCustomerEmail());
        response.setCustomerPhone(order.getCustomerPhone());
        response.setShippingStreet(order.getShippingStreet());
        response.setShippingCity(order.getShippingCity());
        response.setShippingState(order.getShippingState());
        response.setShippingZipCode(order.getShippingZipCode());
        response.setShippingCountry(order.getShippingCountry());
        response.setSubtotal(order.getSubtotal());
        response.setTax(order.getTax());
        response.setShipping(order.getShipping());
        response.setDiscount(order.getDiscount());
        response.setTotal(order.getTotal());
        response.setStatus(order.getStatus());
        response.setPaymentStatus(order.getPaymentStatus());
        response.setNotes(order.getNotes());
        response.setCreatedAt(order.getCreatedAt());
        response.setItems(itemResponses);

        return response;
    }

    @Override
    @Transactional
    public OrderResponse updateOrder(Long orderId, com.fresh_finds.fresh_finds.controller.request.UpdateOrderRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order with ID " + orderId + " not found"));

        // Update status
        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            order.setStatus(request.getStatus());
            
            // If status is DELIVERED, set deliveredAt timestamp
            if ("DELIVERED".equalsIgnoreCase(request.getStatus())) {
                order.setDeliveredAt(java.time.LocalDateTime.now());
            }
        }

        // Update payment status
        if (request.getPaymentStatus() != null && !request.getPaymentStatus().isEmpty()) {
            order.setPaymentStatus(request.getPaymentStatus());
        }

        // Update notes if provided
        if (request.getNotes() != null) {
            order.setNotes(request.getNotes());
        }

        order = orderRepository.save(order);
        return mapToOrderResponse(order);
    }
}

