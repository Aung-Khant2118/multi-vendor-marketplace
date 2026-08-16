package com.group5.marketplace.auth.security;

import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
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

    @Value("${jwt.refresh-expiration:604800000}")
    private long jwtRefreshExpiration;

    // in-memory blacklist for logged-out tokens (token -> expiration)
    private final ConcurrentMap<String, Date> blacklistedTokens = new ConcurrentHashMap<>();

    // create the signing key
    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // generate token that carries the user role as a claim (used by the frontend
    // for role detection; authorization still relies on backend authorities)
    public String generateToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    // generate a longer-lived refresh token; the `type` claim distinguishes it
    // from the access token so refresh tokens cannot be used as access tokens
    public String generateRefreshToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .claim("type", "refresh")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtRefreshExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    // extract email safely (returns null on invalid token)
    public String extractUsername(String token) {
        Claims claims = extractAllClaims(token);
        return claims == null ? null : claims.getSubject();
    }

    // extract role safely (returns null on invalid token)
    public String extractRole(String token) {
        Claims claims = extractAllClaims(token);
        return claims == null ? null : claims.get("role", String.class);
    }

    // read claims using jjwt 0.11+ parserBuilder API; return null on parse errors
    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException | IllegalArgumentException e) {
            // invalid/expired token
            return null;
        }
    }

    // check expiration; treat invalid token as expired
    private boolean isTokenExpired(String token) {
        Claims claims = extractAllClaims(token);
        if (claims == null) return true;
        Date exp = claims.getExpiration();
        return exp == null || exp.before(new Date());
    }

    public boolean isTokenValid(String token, String email) {
        String username = extractUsername(token);
        if (username == null) return false;

        return username.equals(email)
                && !isTokenExpired(token)
                && !isTokenBlacklisted(token);
    }

    // refresh tokens are only valid if they carry the `type=refresh` claim,
    // belong to the subject, and have not expired or been blacklisted
    public boolean isRefreshTokenValid(String token, String email) {
        Claims claims = extractAllClaims(token);
        if (claims == null) return false;

        String type = claims.get("type", String.class);
        if (!"refresh".equals(type)) return false;

        return email != null && email.equals(claims.getSubject())
                && !isTokenExpired(token)
                && !isTokenBlacklisted(token);
    }

    // logout: add token to blacklist so it cannot be used again
    public void logout(String token) {
        try {
            Claims claims = extractAllClaims(token);
            if (claims != null) {
                Date expiration = claims.getExpiration();
                if (expiration != null) {
                    blacklistedTokens.put(token, expiration);
                }
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

    // optional maintenance: remove expired entries from blacklist
    public void removeExpiredFromBlacklist() {
        Date now = new Date();
        blacklistedTokens.entrySet().removeIf(e -> e.getValue().before(now));
    }
}