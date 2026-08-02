package com.fresh_finds.fresh_finds.repository;

import com.fresh_finds.fresh_finds.repository.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCartId(Long cartId);
    
    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);
    
    void deleteByCartId(Long cartId);
    
    @Query("SELECT SUM(ci.subtotal) FROM CartItem ci WHERE ci.cartId = :cartId")
    java.math.BigDecimal calculateCartSubtotal(@Param("cartId") Long cartId);
}

