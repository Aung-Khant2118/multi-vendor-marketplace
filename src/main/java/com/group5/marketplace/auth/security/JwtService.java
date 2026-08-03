package com.group5.marketplace.auth.security;

import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;
import java.util.Date;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import javax.crypto.SecretKey;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    // in-memory blacklist for logged-out tokens (token -> expiration)
    private final ConcurrentMap<String, Date> blacklistedTokens = new ConcurrentHashMap<>();

//    create the signing key
    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

//    generate token
    public String generateToken(String email) {

        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey())
                .compact();
    }

//    extract email
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

//    read claims
    private Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

//    check expiration
    public boolean isTokenValid(String token, String email) {

        final String username = extractUsername(token);

        return username.equals(email)
                && !isTokenExpired(token)
                && !isTokenBlacklisted(token);
    }

    // logout: add token to blacklist so it cannot be used again
    public void logout(String token) {
        try {
            Date expiration = extractAllClaims(token).getExpiration();
            if (expiration != null) {
                blacklistedTokens.put(token, expiration);
            }
        } catch (Exception ignored) {
            // ignore invalid tokens on logout attempt
        }
    }

    // helper to check blacklisted tokens and remove expired entries lazily
    private boolean isTokenBlacklisted(String token) {
        Date exp = blacklistedTokens.get(token);
        if (exp == null) return false;
        if (exp.before(new Date())) {
            blacklistedTokens.remove(token);
            return false;
        }
        return true;
    }

//helper method
    private boolean isTokenExpired(String token) {
        return extractAllClaims(token)
                .getExpiration()
                .before(new Date());
    }
}