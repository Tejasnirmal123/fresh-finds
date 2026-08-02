package com.fresh_finds.fresh_finds.controller;

import com.fresh_finds.fresh_finds.controller.request.CreateProductRequest;
import com.fresh_finds.fresh_finds.controller.request.CreateProductMultipartRequest;
import com.fresh_finds.fresh_finds.controller.request.ProductFilterRequest;
import com.fresh_finds.fresh_finds.controller.request.ProductListRequest;
import com.fresh_finds.fresh_finds.controller.response.ProductListResponse;
import com.fresh_finds.fresh_finds.controller.response.ProductResponse;
import com.fresh_finds.fresh_finds.service.ProductService;
import com.fresh_finds.fresh_finds.utils.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/fresh-finds/api/v1/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping("/search")
    public ApiResponse searchProducts(@Valid @RequestBody ProductListRequest request) {
        ProductListResponse response = productService.getAllProducts(request);
        return ApiResponse.buildSuccessResponse(response);
    }

    @PostMapping(consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse createProductWithImages(@Valid @ModelAttribute CreateProductMultipartRequest request) {
        System.out.println("=== ProductController.createProductWithImages called ===");
        System.out.println("Request received - Name: " + (request != null ? request.getName() : "null"));
        if (request != null) {
            System.out.println("Image: " + (request.getImage() != null ? request.getImage().getOriginalFilename() : "null"));
            System.out.println("Images array: " + (request.getImages() != null ? request.getImages().length : "null"));
        }
        ProductResponse response = productService.createProduct(request);
        return ApiResponse.buildSuccessResponse(response, HttpStatus.CREATED);
    }

    @PostMapping(consumes = {"application/json"})
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse createProduct(@Valid @RequestBody CreateProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        return ApiResponse.buildSuccessResponse(response, HttpStatus.CREATED);
    }

    @PutMapping(value = "/{productId}", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse updateProductWithImages(@PathVariable Long productId, @Valid @ModelAttribute CreateProductMultipartRequest request) {
        ProductResponse response = productService.updateProduct(productId, request);
        return ApiResponse.buildSuccessResponse(response);
    }

    @PutMapping(value = "/{productId}", consumes = {"application/json"})
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse updateProduct(@PathVariable Long productId, @Valid @RequestBody CreateProductRequest request) {
        ProductResponse response = productService.updateProduct(productId, request);
        return ApiResponse.buildSuccessResponse(response);
    }

    @GetMapping("/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse getProductById(@PathVariable Long productId) {
        ProductResponse response = productService.getProductById(productId);
        return ApiResponse.buildSuccessResponse(response);
    }
}
