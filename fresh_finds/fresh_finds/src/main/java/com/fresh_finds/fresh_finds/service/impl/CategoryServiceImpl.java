package com.fresh_finds.fresh_finds.service.impl;

import com.fresh_finds.fresh_finds.controller.request.CreateCategoryRequest;
import com.fresh_finds.fresh_finds.controller.request.CreateCategoryMultipartRequest;
import com.fresh_finds.fresh_finds.controller.response.CategoryResponse;
import com.fresh_finds.fresh_finds.repository.CategoryRepository;
import com.fresh_finds.fresh_finds.repository.entity.Category;
import com.fresh_finds.fresh_finds.service.CategoryService;
import com.fresh_finds.fresh_finds.utils.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;

    @Value("${api.base-path:/fresh-finds/api/v1}")
    private String apiBasePath;

    public CategoryServiceImpl(CategoryRepository categoryRepository, FileStorageService fileStorageService) {
        this.categoryRepository = categoryRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    public List<CategoryResponse> getAllCategories() {
        System.out.println("CategoryServiceImpl.getAllCategories() - Starting");
        // Get all categories and filter active ones (handles null isActive)
        List<Category> allCategories = categoryRepository.findAll();
        System.out.println("CategoryServiceImpl.getAllCategories() - Found " + allCategories.size() + " total categories in DB");
        
        List<Category> activeCategories = allCategories.stream()
                .filter(cat -> {
                    boolean isActive = cat.getIsActive() == null || cat.getIsActive();
                    System.out.println("Category: " + cat.getName() + ", isActive: " + cat.getIsActive() + ", filtered: " + isActive);
                    return isActive;
                })
                .sorted((a, b) -> {
                    int orderA = a.getDisplayOrder() != null ? a.getDisplayOrder() : 0;
                    int orderB = b.getDisplayOrder() != null ? b.getDisplayOrder() : 0;
                    return Integer.compare(orderA, orderB);
                })
                .collect(Collectors.toList());
        
        System.out.println("CategoryServiceImpl.getAllCategories() - Returning " + activeCategories.size() + " active categories");
        
        return activeCategories.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CreateCategoryMultipartRequest request) {
        // Validate slug uniqueness
        if (categoryRepository.existsBySlug(request.getSlug())) {
            throw new IllegalArgumentException("Category with slug '" + request.getSlug() + "' already exists");
        }

        // Create category entity
        Category category = new Category();
        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setDescription(request.getDescription());
        category.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);

        // Save category first to get ID (if needed for file organization)
        category = categoryRepository.save(category);

        // Store image if provided
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            try {
                String imagePath = fileStorageService.storeImage(request.getImage(), "category", null);
                category.setImagePath(imagePath);
                category = categoryRepository.save(category);
            } catch (Exception e) {
                throw new RuntimeException("Failed to store image: " + e.getMessage(), e);
            }
        }

        return mapToResponse(category);
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        // Validate slug uniqueness
        if (categoryRepository.existsBySlug(request.getSlug())) {
            throw new IllegalArgumentException("Category with slug '" + request.getSlug() + "' already exists");
        }

        // Create category entity
        Category category = new Category();
        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setDescription(request.getDescription());
        category.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);

        category = categoryRepository.save(category);
        return mapToResponse(category);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long categoryId, CreateCategoryMultipartRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category with ID " + categoryId + " not found"));

        // Validate slug uniqueness (excluding current category)
        if (!category.getSlug().equals(request.getSlug()) && categoryRepository.existsBySlug(request.getSlug())) {
            throw new IllegalArgumentException("Category with slug '" + request.getSlug() + "' already exists");
        }

        // Update category fields
        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setDescription(request.getDescription());
        category.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);

        // Update image if provided
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            try {
                String imagePath = fileStorageService.storeImage(request.getImage(), "category", null);
                category.setImagePath(imagePath);
            } catch (Exception e) {
                throw new RuntimeException("Failed to store image: " + e.getMessage(), e);
            }
        }

        category = categoryRepository.save(category);
        return mapToResponse(category);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long categoryId, CreateCategoryRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category with ID " + categoryId + " not found"));

        // Validate slug uniqueness (excluding current category)
        if (!category.getSlug().equals(request.getSlug()) && categoryRepository.existsBySlug(request.getSlug())) {
            throw new IllegalArgumentException("Category with slug '" + request.getSlug() + "' already exists");
        }

        // Update category fields
        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setDescription(request.getDescription());
        category.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);

        category = categoryRepository.save(category);
        return mapToResponse(category);
    }

    @Override
    public CategoryResponse getCategoryById(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category with ID " + categoryId + " not found"));
        return mapToResponse(category);
    }

    private CategoryResponse mapToResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setSlug(category.getSlug());
        response.setImagePath(category.getImagePath());
        response.setDescription(category.getDescription());
        response.setProductCount(category.getProductCount());
        response.setDisplayOrder(category.getDisplayOrder());
        response.setIsActive(category.getIsActive());
        response.setCreatedAt(category.getCreatedAt());
        response.setUpdatedAt(category.getUpdatedAt());

        // Generate image URL if image path exists
        if (category.getImagePath() != null && !category.getImagePath().isEmpty()) {
            // If imagePath is already a full URL (GCS), use it directly; otherwise construct from API base path
            String imageUrl = category.getImagePath().startsWith("http")
                ? category.getImagePath()
                : apiBasePath + "/images/" + category.getImagePath();
            System.out.println("CategoryServiceImpl: Generated imageUrl: " + imageUrl);
            response.setImageUrl(imageUrl);
        } else {
            System.out.println("CategoryServiceImpl: No imagePath for category: " + category.getName());
        }

        return response;
    }
}

