package com.adhijevan.utils;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();

        // ✅ Skip JWT filter for public endpoints
        if (path.startsWith("/api/auth/register")
                || path.startsWith("/api/auth/login")
                || path.startsWith("/api/auth/send-otp")
                || path.startsWith("/api/auth/verify-otp")
                || path.startsWith("/api/auth/test")
                || path.startsWith("/api/menu/")
                || path.startsWith("/api/cart/")
                || path.startsWith("/api/box/")
                || path.startsWith("/api/box-order")
                || path.startsWith("/ws")
                || path.startsWith("/api/fruit-bowl/")
                || path.startsWith("/api/fruit-bowl-order/")
                || path.startsWith("/api/deliveries")
                || path.startsWith("/api/reviews")){
            filterChain.doFilter(request, response);
            return;
        }

        // ✅ Extract JWT token from header
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (jwtUtils.validateToken(token)) {
                String username = jwtUtils.getUsername(token);
                String role = jwtUtils.getRole(token);

                // Set authentication context
                var auth = new UsernamePasswordAuthenticationToken(
                        username, null, List.of(() -> role)
                );
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        filterChain.doFilter(request, response);
    }
}
