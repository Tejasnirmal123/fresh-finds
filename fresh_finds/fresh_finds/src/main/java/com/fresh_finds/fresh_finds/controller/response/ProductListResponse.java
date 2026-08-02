package com.fresh_finds.fresh_finds.controller.response;

import java.util.List;

public class ProductListResponse {
    private List<ProductResponse> products;
    private PaginationInfo pagination;

    public ProductListResponse() {
    }

    public ProductListResponse(List<ProductResponse> products, PaginationInfo pagination) {
        this.products = products;
        this.pagination = pagination;
    }

    // Getters and Setters
    public List<ProductResponse> getProducts() {
        return products;
    }

    public void setProducts(List<ProductResponse> products) {
        this.products = products;
    }

    public PaginationInfo getPagination() {
        return pagination;
    }

    public void setPagination(PaginationInfo pagination) {
        this.pagination = pagination;
    }
}

