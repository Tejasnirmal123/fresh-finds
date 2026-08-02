package com.fresh_finds.fresh_finds.controller;

import com.fresh_finds.fresh_finds.controller.request.CreateOrderRequest;
import com.fresh_finds.fresh_finds.controller.request.UpdateOrderRequest;
import com.fresh_finds.fresh_finds.controller.response.OrderResponse;
import com.fresh_finds.fresh_finds.service.OrderExportService;
import com.fresh_finds.fresh_finds.service.OrderService;
import com.fresh_finds.fresh_finds.utils.ApiResponse;
import com.fresh_finds.fresh_finds.utils.SecurityUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/fresh-finds/api/v1/orders")
public class OrderController {

    private final OrderService orderService;
    private final OrderExportService orderExportService;
    private final SecurityUtil securityUtil;

    public OrderController(OrderService orderService, OrderExportService orderExportService, SecurityUtil securityUtil) {
        this.orderService = orderService;
        this.orderExportService = orderExportService;
        this.securityUtil = securityUtil;
    }

    @PostMapping
    public ApiResponse createOrder(@Valid @RequestBody CreateOrderRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        OrderResponse response = orderService.createOrder(userId, request);
        return ApiResponse.buildSuccessResponse(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse getAllOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        List<OrderResponse> orders;
        if (status != null || startDate != null || endDate != null) {
            orders = orderService.getAllOrders(status, startDate, endDate);
        } else {
            orders = orderService.getAllOrders();
        }
        return ApiResponse.buildSuccessResponse(orders);
    }

    @GetMapping("/download")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> downloadOrdersAsCsv(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            // Get orders based on filters
            List<OrderResponse> orders;
            if (status != null || startDate != null || endDate != null) {
                orders = orderService.getAllOrders(status, startDate, endDate);
            } else {
                orders = orderService.getAllOrders();
            }

            // Export to CSV using service
            byte[] csvBytes = orderExportService.exportOrdersToCsv(orders);
            
            // Set response headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv; charset=utf-8"));
            headers.setContentDispositionFormData("attachment", "orders_" + 
                java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(csvBytes);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/my-orders")
    public ApiResponse getUserOrders() {
        Long userId = securityUtil.getCurrentUserId();
        List<OrderResponse> orders = orderService.getUserOrders(userId);
        return ApiResponse.buildSuccessResponse(orders);
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse getOrderById(@PathVariable Long orderId) {
        OrderResponse order = orderService.getOrderById(orderId);
        return ApiResponse.buildSuccessResponse(order);
    }

    @PutMapping("/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse updateOrder(@PathVariable Long orderId, @Valid @RequestBody UpdateOrderRequest request) {
        OrderResponse response = orderService.updateOrder(orderId, request);
        return ApiResponse.buildSuccessResponse(response);
    }
}

