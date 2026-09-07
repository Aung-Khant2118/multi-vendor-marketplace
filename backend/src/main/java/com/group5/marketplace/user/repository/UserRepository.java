package com.group5.marketplace.user.repository;

import com.group5.marketplace.user.entity.Role;
import com.group5.marketplace.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findByResetToken(String token);

    Optional<User> findByVerificationToken(String token);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    Page<User> findAllByOrderByIdDesc(Pageable pageable);

    Page<User> findByRoleOrderByIdDesc(Role role, Pageable pageable);

    @Query("SELECT u.role, COUNT(u) FROM User u GROUP BY u.role")
    List<Object[]> countByRoleGroup();
}