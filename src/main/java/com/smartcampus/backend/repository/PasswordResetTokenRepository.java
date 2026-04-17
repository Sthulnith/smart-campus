package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    Optional<PasswordResetToken> findTopByUserIdOrderByCreatedAtDesc(Long userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update PasswordResetToken t
            set t.used = true
            where t.id = :tokenId
              and t.used = false
              and t.expiresAt > :now
            """)
    int markUsedIfValid(@Param("tokenId") Long tokenId, @Param("now") Instant now);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update PasswordResetToken t set t.used = true where t.user.id = :userId and t.used = false")
    int invalidateUnusedForUser(@Param("userId") Long userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update PasswordResetToken t
            set t.used = true
            where t.user.id = :userId
              and t.used = false
              and t.id <> :excludeTokenId
            """)
    int invalidateUnusedForUserExcluding(@Param("userId") Long userId, @Param("excludeTokenId") Long excludeTokenId);
}
