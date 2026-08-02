package com.fresh_finds.fresh_finds.service.impl;

import com.fresh_finds.fresh_finds.controller.request.CreateProductRequest;
import com.fresh_finds.fresh_finds.controller.request.CreateProductMultipartRequest;
import com.fresh_finds.fresh_finds.controller.request.ProductFilterRequest;
import com.fresh_finds.fresh_finds.controller.request.ProductListRequest;
import com.fresh_finds.fresh_finds.controller.response.PaginationInfo;
import com.fresh_finds.fresh_finds.controller.response.ProductListResponse;
import com.fresh_finds.fresh_finds.controller.response.ProductResponse;
import com.fresh_finds.fresh_finds.repository.*;
import com.fresh_finds.fresh_finds.repository.entity.Category;
import com.fresh_finds.fresh_finds.repository.entity.Product;
import com.fresh_finds.fresh_finds.repository.entity.ProductImage;
import com.fresh_finds.fresh_finds.repository.entity.ProductTag;
import com.fresh_finds.fresh_finds.repository.specification.ProductSpecification;
import com.fresh_finds.fresh_finds.service.ProductService;
import com.fresh_finds.fresh_finds.utils.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductTagRepository productTagRepository;
    private final FileStorageService fileStorageService;

    @Value("${api.base-path:/fresh-finds/api/v1}")
    private String apiBasePath;

    public ProductServiceImpl(ProductRepository productRepository,
                            CategoryRepository categoryRepository,
                            ProductImageRepository productImageRepository,
                            ProductTagRepository productTagRepository,
                            FileStorageService fileStorageService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productImageRepository = productImageRepository;
        this.productTagRepository = productTagRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    @Transactional
    public ProductResponse createProduct(CreateProductMultipartRequest request) {
        // Validate slug uniqueness
        if (productRepository.existsBySlug(request.getSlug())) {
            throw new IllegalArgumentException("Product with slug '" + request.getSlug() + "' already exists");
        }

        // Validate category exists
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category with ID " + request.getCategoryId() + " not found"));

        // Validate sale price
        if (request.getOnSale() != null && request.getOnSale() && request.getSalePrice() != null) {
            if (request.getSalePrice().compareTo(request.getPrice()) >= 0) {
                throw new IllegalArgumentException("Sale price must be less than regular price");
            }
        }

        // Create product entity
        Product product = new Product();
        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setCategory(category);
        product.setCategoryName(category.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setUnit(request.getUnit());
        product.setIsOrganic(request.getIsOrganic() != null ? request.getIsOrganic() : false);
        product.setIsNonGmo(request.getIsNonGmo() != null ? request.getIsNonGmo() : false);
        product.setIsSeasonal(request.getIsSeasonal() != null ? request.getIsSeasonal() : false);
        product.setStockQty(request.getStockQty() != null ? request.getStockQty() : 0);
        product.setOnSale(request.getOnSale() != null ? request.getOnSale() : false);
        product.setSalePrice(request.getSalePrice());
        product.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);

        // Save product first to get ID for image organization
        product = productRepository.save(product);

        // Store main image
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            try {
                String imagePath = fileStorageService.storeImage(request.getImage(), "product", product.getId());
                product.setImagePath(imagePath);
                product = productRepository.save(product);
            } catch (Exception e) {
                throw new RuntimeException("Failed to store main image: " + e.getMessage(), e);
            }
        }

        // Store additional images
        if (request.getImages() != null && request.getImages().length > 0) {
            List<ProductImage> productImages = new ArrayList<>();
            for (int i = 0; i < request.getImages().length; i++) {
                var image = request.getImages()[i];
                if (image != null && !image.isEmpty()) {
                    try {
                        String imagePath = fileStorageService.storeImage(image, "product", product.getId());
                        ProductImage productImage = new ProductImage();
                        productImage.setProduct(product);
                        productImage.setImagePath(imagePath);
                        productImage.setDisplayOrder(i + 1);
                        productImages.add(productImage);
                    } catch (Exception e) {
                        throw new RuntimeException("Failed to store additional image: " + e.getMessage(), e);
                    }
                }
            }
            if (!productImages.isEmpty()) {
                productImageRepository.saveAll(productImages);
            }
        }

        // Store tags
        if (request.getTags() != null && request.getTags().length > 0) {
            List<ProductTag> productTags = new ArrayList<>();
            for (String tag : request.getTags()) {
                if (tag != null && !tag.trim().isEmpty()) {
                    ProductTag productTag = new ProductTag();
                    productTag.setProduct(product);
                    productTag.setTag(tag.trim());
                    productTags.add(productTag);
                }
            }
            if (!productTags.isEmpty()) {
                productTagRepository.saveAll(productTags);
            }
        }

        return mapToResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        // Validate slug uniqueness
        if (productRepository.existsBySlug(request.getSlug())) {
            throw new IllegalArgumentException("Product with slug '" + request.getSlug() + "' already exists");
        }

        // Validate category exists
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category with ID " + request.getCategoryId() + " not found"));

        // Validate sale price
        if (request.getOnSale() != null && request.getOnSale() && request.getSalePrice() != null) {
            if (request.getSalePrice().compareTo(request.getPrice()) >= 0) {
                throw new IllegalArgumentException("Sale price must be less than regular price");
            }
        }

        // Create product entity
        Product product = new Product();
        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setCategory(category);
        product.setCategoryName(category.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setUnit(request.getUnit());
        product.setIsOrganic(request.getIsOrganic() != null ? request.getIsOrganic() : false);
        product.setIsNonGmo(request.getIsNonGmo() != null ? request.getIsNonGmo() : false);
        product.setIsSeasonal(request.getIsSeasonal() != null ? request.getIsSeasonal() : false);
        product.setStockQty(request.getStockQty() != null ? request.getStockQty() : 0);
        product.setOnSale(request.getOnSale() != null ? request.getOnSale() : false);
        product.setSalePrice(request.getSalePrice());
        product.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);

        product = productRepository.save(product);
        return mapToResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long productId, CreateProductMultipartRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product with ID " + productId + " not found"));

        // Validate slug uniqueness (excluding current product)
        if (!product.getSlug().equals(request.getSlug()) && productRepository.existsBySlug(request.getSlug())) {
            throw new IllegalArgumentException("Product with slug '" + request.getSlug() + "' already exists");
        }

        // Validate category exists
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category with ID " + request.getCategoryId() + " not found"));

        // Validate sale price
        if (request.getOnSale() != null && request.getOnSale() && request.getSalePrice() != null) {
            if (request.getSalePrice().compareTo(request.getPrice()) >= 0) {
                throw new IllegalArgumentException("Sale price must be less than regular price");
            }
        }

        // Update product fields
        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setCategory(category);
        product.setCategoryName(category.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setUnit(request.getUnit());
        product.setIsOrganic(request.getIsOrganic() != null ? request.getIsOrganic() : false);
        product.setIsNonGmo(request.getIsNonGmo() != null ? request.getIsNonGmo() : false);
        product.setIsSeasonal(request.getIsSeasonal() != null ? request.getIsSeasonal() : false);
        product.setStockQty(request.getStockQty() != null ? request.getStockQty() : 0);
        product.setOnSale(request.getOnSale() != null ? request.getOnSale() : false);
        product.setSalePrice(request.getSalePrice());
        product.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);

        // Update main image if provided
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            try {
                String imagePath = fileStorageService.storeImage(request.getImage(), "product", product.getId());
                product.setImagePath(imagePath);
            } catch (Exception e) {
                throw new RuntimeException("Failed to store main image: " + e.getMessage(), e);
            }
        }

        // Update additional images if provided
        if (request.getImages() != null && request.getImages().length > 0) {
            // Delete existing additional images
            productImageRepository.deleteByProductId(productId);
            
            // Add new images
            List<ProductImage> productImages = new ArrayList<>();
            for (int i = 0; i < request.getImages().length; i++) {
                var image = request.getImages()[i];
                if (image != null && !image.isEmpty()) {
                    try {
                        String imagePath = fileStorageService.storeImage(image, "product", product.getId());
                        ProductImage productImage = new ProductImage();
                        productImage.setProduct(product);
                        productImage.setImagePath(imagePath);
                        productImage.setDisplayOrder(i + 1);
                        productImages.add(productImage);
                    } catch (Exception e) {
                        throw new RuntimeException("Failed to store additional image: " + e.getMessage(), e);
                    }
                }
            }
            if (!productImages.isEmpty()) {
                productImageRepository.saveAll(productImages);
            }
        }

        // Update tags if provided
        if (request.getTags() != null && request.getTags().length > 0) {
            // Delete existing tags
            productTagRepository.deleteByProductId(productId);
            
            // Add new tags
            List<ProductTag> productTags = new ArrayList<>();
            for (String tag : request.getTags()) {
                if (tag != null && !tag.trim().isEmpty()) {
                    ProductTag productTag = new ProductTag();
                    productTag.setProduct(product);
                    productTag.setTag(tag.trim());
                    productTags.add(productTag);
                }
            }
            if (!productTags.isEmpty()) {
                productTagRepository.saveAll(productTags);
            }
        }

        product = productRepository.save(product);
        return mapToResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long productId, CreateProductRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product with ID " + productId + " not found"));

        // Validate slug uniqueness (excluding current product)
        if (!product.getSlug().equals(request.getSlug()) && productRepository.existsBySlug(request.getSlug())) {
            throw new IllegalArgumentException("Product with slug '" + request.getSlug() + "' already exists");
        }

        // Validate category exists
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category with ID " + request.getCategoryId() + " not found"));

        // Validate sale price
        if (request.getOnSale() != null && request.getOnSale() && request.getSalePrice() != null) {
            if (request.getSalePrice().compareTo(request.getPrice()) >= 0) {
                throw new IllegalArgumentException("Sale price must be less than regular price");
            }
        }

        // Update product fields
        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setCategory(category);
        product.setCategoryName(category.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setUnit(request.getUnit());
        product.setIsOrganic(request.getIsOrganic() != null ? request.getIsOrganic() : false);
        product.setIsNonGmo(request.getIsNonGmo() != null ? request.getIsNonGmo() : false);
        product.setIsSeasonal(request.getIsSeasonal() != null ? request.getIsSeasonal() : false);
        product.setStockQty(request.getStockQty() != null ? request.getStockQty() : 0);
        product.setOnSale(request.getOnSale() != null ? request.getOnSale() : false);
        product.setSalePrice(request.getSalePrice());
        product.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);

        product = productRepository.save(product);
        return mapToResponse(product);
    }

    @Override
    public ProductResponse getProductById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product with ID " + productId + " not found"));
        return mapToResponse(product);
    }

    @Override
    public ProductListResponse getAllProducts(int pageNo, int pageSize) {
        return getAllProducts(pageNo, pageSize, null);
    }

    @Override
    public ProductListResponse getAllProducts(int pageNo, int pageSize, ProductFilterRequest filterRequest) {
        // Create Pageable with sorting (by displayOrder, then by createdAt descending)
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by("displayOrder").ascending()
                .and(Sort.by("createdAt").descending()));

        Page<Product> productPage;
        
        // Apply filters if provided
        if (filterRequest != null && filterRequest.hasFilters()) {
            Specification<Product> spec = ProductSpecification.withFilters(filterRequest);
            productPage = productRepository.findAll(spec, pageable);
        } else {
            // For admin, fetch all products (including inactive)
            // For regular users, fetch only active products
            productPage = productRepository.findAll(pageable);
        }

        // Map products to response
        List<ProductResponse> productResponses = productPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        // Create pagination info
        PaginationInfo paginationInfo = new PaginationInfo(
                pageNo,
                productPage.getTotalPages(),
                productPage.getTotalElements(),
                pageSize,
                productPage.hasNext(),
                productPage.hasPrevious()
        );

        return new ProductListResponse(productResponses, paginationInfo);
    }

    @Override
    public ProductListResponse getAllProducts(ProductListRequest request) {
        if (request == null) {
            request = new ProductListRequest();
        }
        
        // Determine sorting based on sortBy parameter
        Sort sort;
        String sortBy = request.getSortBy() != null ? request.getSortBy().toLowerCase().trim() : "popularity";
        
        switch (sortBy) {
            case "price-low":
                // Sort by price ascending
                sort = Sort.by("price").ascending();
                break;
            case "price-high":
                // Sort by price descending
                sort = Sort.by("price").descending();
                break;
            case "popularity":
            default:
                // Default: Sort by displayOrder ascending, then by createdAt descending
                sort = Sort.by("displayOrder").ascending()
                        .and(Sort.by("createdAt").descending());
                break;
        }
        
        // Create Pageable with sorting
        Pageable pageable = PageRequest.of(request.getPageNo() - 1, request.getPageSize(), sort);

        Page<Product> productPage;
        
        // Apply filters if provided
        ProductFilterRequest filterRequest = request.toFilterRequest();
        if (filterRequest != null && filterRequest.hasFilters()) {
            Specification<Product> spec = ProductSpecification.withFilters(filterRequest);
            productPage = productRepository.findAll(spec, pageable);
        } else {
            // Fetch only active products (no filters)
            productPage = productRepository.findByIsActiveTrue(pageable);
        }

        // Map products to response
        List<ProductResponse> productResponses = productPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        // Create pagination info
        PaginationInfo paginationInfo = new PaginationInfo(
                request.getPageNo(),
                productPage.getTotalPages(),
                productPage.getTotalElements(),
                request.getPageSize(),
                productPage.hasNext(),
                productPage.hasPrevious()
        );

        return new ProductListResponse(productResponses, paginationInfo);
    }

    private ProductResponse mapToResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setSlug(product.getSlug());
        response.setCategoryId(product.getCategoryId());
        response.setCategoryName(product.getCategoryName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setUnit(product.getUnit());
        response.setImagePath(product.getImagePath());
        response.setRating(product.getRating());
        response.setRatingCount(product.getRatingCount());
        response.setIsOrganic(product.getIsOrganic());
        response.setIsNonGmo(product.getIsNonGmo());
        response.setIsSeasonal(product.getIsSeasonal());
        response.setStockQty(product.getStockQty());
        response.setOnSale(product.getOnSale());
        response.setSalePrice(product.getSalePrice());
        response.setDisplayOrder(product.getDisplayOrder());
        response.setIsActive(product.getIsActive());
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());

        // Generate image URL if image path exists
        if (product.getImagePath() != null && !product.getImagePath().isEmpty()) {
            // If imagePath is already a full URL (GCS), use it directly; otherwise construct from API base path
            String imageUrl = product.getImagePath().startsWith("http") 
                ? product.getImagePath() 
                : apiBasePath + "/images/" + product.getImagePath();
            response.setImageUrl(imageUrl);
        }

        // Load additional images
        List<ProductImage> productImages = productImageRepository.findByProductIdOrderByDisplayOrderAsc(product.getId());
        List<ProductResponse.ImageInfo> additionalImages = productImages.stream()
                .map(img -> {
                    // If imagePath is already a full URL (GCS), use it directly; otherwise construct from API base path
                    String imgUrl = img.getImagePath().startsWith("http")
                        ? img.getImagePath()
                        : apiBasePath + "/images/" + img.getImagePath();
                    return new ProductResponse.ImageInfo(
                            img.getId(),
                            img.getImagePath(),
                            imgUrl,
                            img.getDisplayOrder()
                    );
                })
                .collect(Collectors.toList());
        response.setAdditionalImages(additionalImages);

        // Load tags
        List<ProductTag> productTags = productTagRepository.findByProductId(product.getId());
        List<String> tags = productTags.stream()
                .map(ProductTag::getTag)
                .collect(Collectors.toList());
        response.setTags(tags);

        return response;
    }
}

