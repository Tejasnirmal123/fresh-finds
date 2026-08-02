package com.fresh_finds.fresh_finds.service;

import com.fresh_finds.fresh_finds.controller.request.CreateCategoryRequest;
import com.fresh_finds.fresh_finds.controller.request.CreateCategoryMultipartRequest;
import com.fresh_finds.fresh_finds.controller.response.CategoryResponse;

import java.util.List;

public interface CategoryService {
    List<CategoryResponse> getAllCategories();
    CategoryResponse createCategory(CreateCategoryMultipartRequest request);
    CategoryResponse createCategory(CreateCategoryRequest request);
    CategoryResponse updateCategory(Long categoryId, CreateCategoryMultipartRequest request);
    CategoryResponse updateCategory(Long categoryId, CreateCategoryRequest request);
    CategoryResponse getCategoryById(Long categoryId);
}

