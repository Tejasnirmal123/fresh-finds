package com.fresh_finds.fresh_finds.config;

import com.fresh_finds.fresh_finds.utils.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        
        String requestPath = request.getRequestURI();
        
        // Skip JWT validation for public endpoints - only auth and images
        if (requestPath.equals("/fresh-finds/api/v1/auth/register") ||
            requestPath.equals("/fresh-finds/api/v1/auth/login") ||
            requestPath.startsWith("/fresh-finds/api/v1/images/") ||
                requestPath.equals("/fresh-finds/api/v1/health")) {
            chain.doFilter(request, response);
            return;
        }
        
        final String authorizationHeader = request.getHeader("Authorization");
        
        String username = null;
        String jwt = null;
        String role = null;
        
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
                role = jwtUtil.getRoleFromToken(jwt);
                
                logger.debug("Extracted username: " + username + ", role: " + role + " for path: " + requestPath);
                
                if (username != null && jwtUtil.validateToken(jwt, username)) {
                    // If role is null, default to CUSTOMER
                    if (role == null || role.isEmpty()) {
                        logger.warn("Role is null or empty for user: " + username + ", defaulting to CUSTOMER");
                        role = "CUSTOMER";
                    }
                    
                    // Ensure role is uppercase to match Spring Security expectations
                    role = role.toUpperCase();
                    String authority = "ROLE_" + role;
                    
                    logger.info("Setting authentication for user: " + username + " with authority: " + authority);
                    
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            Collections.singletonList(new SimpleGrantedAuthority(authority))
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.info("JWT token validated successfully for user: " + username + " with role: " + role + ", authority: " + authority);
                } else {
                    logger.warn("JWT token validation failed - username: " + username + ", role: " + role + ", token valid: " + (username != null && jwtUtil.validateToken(jwt, username)));
                }
                // If token is invalid or expired, we don't set authentication
                // Spring Security will reject the request with 401
            } catch (Exception e) {
                logger.error("JWT token validation failed for path: " + requestPath + ", error: " + e.getMessage(), e);
                // Don't set authentication - Spring Security will handle the 401 response
            }
        } else {
            logger.warn("No Authorization header found for path: " + requestPath);
        }
        // If no token is provided, we don't set authentication
        // Spring Security will reject the request with 401
        
        chain.doFilter(request, response);
    }
}

