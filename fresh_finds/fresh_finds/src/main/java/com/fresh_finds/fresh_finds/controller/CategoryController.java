package com.fresh_finds.fresh_finds.controller;

import com.fresh_finds.fresh_finds.controller.request.CreateCategoryRequest;
import com.fresh_finds.fresh_finds.controller.request.CreateCategoryMultipartRequest;
import com.fresh_finds.fresh_finds.controller.response.CategoryResponse;
import com.fresh_finds.fresh_finds.service.CategoryService;
import com.fresh_finds.fresh_finds.utils.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/fresh-finds/api/v1/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping(consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse createCategoryWithImage(@Valid @ModelAttribute CreateCategoryMultipartRequest request) {
        CategoryResponse response = categoryService.createCategory(request);
        return ApiResponse.buildSuccessResponse(response, HttpStatus.CREATED);
    }

    @PostMapping(consumes = {"application/json"})
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse createCategory(@Valid @RequestBody CreateCategoryRequest request) {
        CategoryResponse response = categoryService.createCategory(request);
        return ApiResponse.buildSuccessResponse(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ApiResponse getAllCategories() {
        System.out.println("GET /fresh-finds/api/v1/categories - Request received");
        var categories = categoryService.getAllCategories();
        System.out.println("GET /fresh-finds/api/v1/categories - Found " + categories.size() + " categories");
        return ApiResponse.buildSuccessResponse(categories);
    }

    @PutMapping(value = "/{categoryId}", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse updateCategoryWithImage(@PathVariable Long categoryId, @Valid @ModelAttribute CreateCategoryMultipartRequest request) {
        CategoryResponse response = categoryService.updateCategory(categoryId, request);
        return ApiResponse.buildSuccessResponse(response);
    }

    @PutMapping(value = "/{categoryId}", consumes = {"application/json"})
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse updateCategory(@PathVariable Long categoryId, @Valid @RequestBody CreateCategoryRequest request) {
        CategoryResponse response = categoryService.updateCategory(categoryId, request);
        return ApiResponse.buildSuccessResponse(response);
    }

    @GetMapping("/{categoryId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse getCategoryById(@PathVariable Long categoryId) {
        CategoryResponse response = categoryService.getCategoryById(categoryId);
        return ApiResponse.buildSuccessResponse(response);
    }
}
