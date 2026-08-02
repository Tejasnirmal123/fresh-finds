package com.fresh_finds.fresh_finds.controller.request;

import java.math.BigDecimal;
import java.util.List;

/**
 * Request class for filtering products
 * Supports filtering by category IDs, price range, and name prefix
 */
public class ProductFilterRequest {
    
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
    
    // Constructors
    public ProductFilterRequest() {
    }
    
    public ProductFilterRequest(List<Long> categoryIds, BigDecimal minPrice, BigDecimal maxPrice, String nameStartsWith) {
        this.categoryIds = categoryIds;
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
        this.nameStartsWith = nameStartsWith;
    }
    
    // Getters and Setters
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
    
    /**
     * Check if any filter is set
     */
    public boolean hasFilters() {
        return (categoryIds != null && !categoryIds.isEmpty()) ||
               minPrice != null ||
               maxPrice != null ||
               (nameStartsWith != null && !nameStartsWith.trim().isEmpty());
    }
}

