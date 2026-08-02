package com.fresh_finds.fresh_finds.service;

import com.fresh_finds.fresh_finds.controller.request.CreateProductRequest;
import com.fresh_finds.fresh_finds.controller.request.CreateProductMultipartRequest;
import com.fresh_finds.fresh_finds.controller.request.ProductFilterRequest;
import com.fresh_finds.fresh_finds.controller.request.ProductListRequest;
import com.fresh_finds.fresh_finds.controller.response.ProductListResponse;
import com.fresh_finds.fresh_finds.controller.response.ProductResponse;

public interface ProductService {
    ProductResponse createProduct(CreateProductMultipartRequest request);
    ProductResponse createProduct(CreateProductRequest request);
    ProductResponse updateProduct(Long productId, CreateProductMultipartRequest request);
    ProductResponse updateProduct(Long productId, CreateProductRequest request);
    ProductResponse getProductById(Long productId);
    ProductListResponse getAllProducts(int pageNo, int pageSize);
    ProductListResponse getAllProducts(int pageNo, int pageSize, ProductFilterRequest filterRequest);
    ProductListResponse getAllProducts(ProductListRequest request);
}

