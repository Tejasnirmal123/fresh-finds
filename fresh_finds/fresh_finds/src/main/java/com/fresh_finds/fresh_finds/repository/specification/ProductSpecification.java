package com.fresh_finds.fresh_finds.repository.specification;

import com.fresh_finds.fresh_finds.controller.request.ProductFilterRequest;
import com.fresh_finds.fresh_finds.repository.entity.Product;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * JPA Specification for building dynamic product queries based on filters
 */
public class ProductSpecification {

    /**
     * Creates a Specification for filtering products based on the provided filter request
     * 
     * @param filterRequest The filter request containing filter criteria
     * @return Specification for querying products
     */
    public static Specification<Product> withFilters(ProductFilterRequest filterRequest) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always filter by active products
            predicates.add(criteriaBuilder.isTrue(root.get("isActive")));

            // Category filter: if categoryIds is provided and not empty
            if (filterRequest != null && filterRequest.getCategoryIds() != null && !filterRequest.getCategoryIds().isEmpty()) {
                predicates.add(root.get("categoryId").in(filterRequest.getCategoryIds()));
            }

            // Price range filter: minPrice
            if (filterRequest != null && filterRequest.getMinPrice() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("price"), filterRequest.getMinPrice()));
            }

            // Price range filter: maxPrice
            if (filterRequest != null && filterRequest.getMaxPrice() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("price"), filterRequest.getMaxPrice()));
            }

            // Name starts with filter: case-insensitive
            if (filterRequest != null && filterRequest.getNameStartsWith() != null && !filterRequest.getNameStartsWith().trim().isEmpty()) {
                String prefix = filterRequest.getNameStartsWith().trim();
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("name")),
                    prefix.toLowerCase() + "%"
                ));
            }

            // Combine all predicates with AND
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}

