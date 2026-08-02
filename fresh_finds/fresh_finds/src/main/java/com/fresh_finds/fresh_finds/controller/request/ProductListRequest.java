package com.fresh_finds.fresh_finds.controller.request;

import java.math.BigDecimal;
import java.util.List;

/**
 * Request class for getting a list of products with pagination and filters
 */
public class ProductListRequest {
    
    /**
     * Page number (1-based)
     * Default: 1
     */
    private Integer pageNo = 1;
    
    /**
     * Number of items per page
     * Default: 10
     */
    private Integer pageSize = 10;
    
    /**
     * List of category IDs to filter by
     * If null or empty, no category filter is applied
     */
    private List<Long> categoryIds;
    
    /**
     * Minimum price for filtering
     * If null, no minimum price filter is applied
     */
    private BigDecimal minPrice;
    
    /**
     * Maximum price for filtering
     * If null, no maximum price filter is applied
     */
    private BigDecimal maxPrice;
    
    /**
     * Name prefix to filter products by name starting with this letter/string
     * Case-insensitive matching
     * If null or empty, no name filter is applied
     */
    private String nameStartsWith;
    
    /**
     * Sort order for products
     * Values: "popularity" (default), "price-low", "price-high"
     * "popularity" - sorted by displayOrder ascending, then createdAt descending
     * "price-low" - sorted by price ascending
     * "price-high" - sorted by price descending
     */
    private String sortBy = "popularity";
    
    // Constructors
    public ProductListRequest() {
    }
    
    public ProductListRequest(Integer pageNo, Integer pageSize) {
        this.pageNo = pageNo;
        this.pageSize = pageSize;
    }
    
    // Getters and Setters
    public Integer getPageNo() {
        return pageNo;
    }
    
    public void setPageNo(Integer pageNo) {
        this.pageNo = pageNo != null && pageNo > 0 ? pageNo : 1;
    }
    
    public Integer getPageSize() {
        return pageSize;
    }
    
    public void setPageSize(Integer pageSize) {
        this.pageSize = pageSize != null && pageSize > 0 ? pageSize : 10;
    }
    
    public List<Long> getCategoryIds() {
        return categoryIds;
    }
    
    public void setCategoryIds(List<Long> categoryIds) {
        this.categoryIds = categoryIds;
    }
    
    public BigDecimal getMinPrice() {
        return minPrice;
    }
    
    public void setMinPrice(BigDecimal minPrice) {
        this.minPrice = minPrice;
    }
    
    public BigDecimal getMaxPrice() {
        return maxPrice;
    }
    
    public void setMaxPrice(BigDecimal maxPrice) {
        this.maxPrice = maxPrice;
    }
    
    public String getNameStartsWith() {
        return nameStartsWith;
    }
    
    public void setNameStartsWith(String nameStartsWith) {
        this.nameStartsWith = nameStartsWith;
    }
    
    public String getSortBy() {
        return sortBy;
    }
    
    public void setSortBy(String sortBy) {
        // Validate and set default if invalid
        if (sortBy == null || sortBy.trim().isEmpty()) {
            this.sortBy = "popularity";
        } else {
            String normalized = sortBy.toLowerCase().trim();
            if (normalized.equals("price-low") || normalized.equals("price-high") || normalized.equals("popularity")) {
                this.sortBy = normalized;
            } else {
                this.sortBy = "popularity";
            }
        }
    }
    
    /**
     * Check if any filter is set
     */
    public boolean hasFilters() {
        return (categoryIds != null && !categoryIds.isEmpty()) ||
               minPrice != null ||
               maxPrice != null ||
               (nameStartsWith != null && !nameStartsWith.trim().isEmpty());
    }
    
    /**
     * Convert to ProductFilterRequest for service layer
     */
    public ProductFilterRequest toFilterRequest() {
        if (!hasFilters()) {
            return null;
        }
        ProductFilterRequest filterRequest = new ProductFilterRequest();
        filterRequest.setCategoryIds(categoryIds);
        filterRequest.setMinPrice(minPrice);
        filterRequest.setMaxPrice(maxPrice);
        filterRequest.setNameStartsWith(nameStartsWith);
        return filterRequest;
    }
}

