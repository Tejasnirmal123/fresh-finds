package com.fresh_finds.fresh_finds.repository;

import com.fresh_finds.fresh_finds.repository.entity.ProductTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductTagRepository extends JpaRepository<ProductTag, Long> {
    List<ProductTag> findByProductId(Long productId);
    void deleteByProductId(Long productId);
}

