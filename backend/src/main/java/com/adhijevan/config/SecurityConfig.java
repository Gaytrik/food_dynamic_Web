package com.adhijevan.config;

import com.adhijevan.utils.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // ✅ PUBLIC ENDPOINTS (no auth required)
                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/**",
                                "/api/auth/verify-otp",
                                "/api/auth/test",
                                "/api/menu/category/view-all",  // view menu (for customers)
                                "/api/menu/category/{id}" ,
                                "/api/menu/**",
                                "/api/cart/**",// view specific category
                                "/api/orders/**",
                                "/api/box/**",
                                "/api/box-order/**",
                                "/ws/**",
                                "/api/fruit-bowl/**",
                                "/api/fruit-bowl-order/**",
                                "/api/deliveries/**",
                                "/api/reviews/**",// view specific category
                                "/api/settings/**" // settings endpoints for GST and delivery
                        ).permitAll()

                        // ✅ USER ENDPOINTS (require authentication)
                        .requestMatchers(
                                "/api/auth/user/**",
                                "/api/auth/update",
                                "/api/auth/delete"
                        ).authenticated()

                        // ✅ ADMIN-ONLY ENDPOINTS
                        .requestMatchers(
                                "/api/auth/users/**"        // update/delete menu item
                        ).hasAuthority("ADMIN")

                        // ✅ Any other request must be authenticated
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:8080"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // ✅ UPDATED: Add userId and other custom headers
        configuration.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "userId",           // ✅ ADD THIS LINE
                "User-ID",          // ✅ Optional: alternative header name
                "X-User-Id"         // ✅ Optional: another alternative
        ));

        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}