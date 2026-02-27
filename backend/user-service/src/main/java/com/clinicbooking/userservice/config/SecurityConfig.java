package com.clinicbooking.userservice.config;

import com.clinicbooking.userservice.repository.UserRepository;
import com.clinicbooking.userservice.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Security Configuration for JWT-based authentication.
 *
 * Configuration details:
 * - STATELESS session management (no cookies, JWT-based)
 * - CSRF protection disabled (stateless API)
 * - JwtAuthenticationFilter added before UsernamePasswordAuthenticationFilter
 * - Whitelisted paths: /api/auth/**, /actuator/**, /swagger-ui/**,
 * /v3/api-docs/**
 * - Protected paths: All other endpoints require valid JWT authentication
 * - UserDetailsService loads user by email from database
 * - BCryptPasswordEncoder for password hashing
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserRepository userRepository;

    /**
     * Whitelisted paths that don't require JWT authentication
     */
    private static final String[] WHITELIST_PATHS = {
            "/api/auth/**",
            "/actuator/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**",
            "/webjars/**"
    };

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * UserDetailsService that loads user by email from database.
     * This is used by the authentication provider.
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return email -> {
            var user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

            // Convert User entity to UserDetails
            // GrantedAuthorities are set by the JwtAuthenticationFilter
            return org.springframework.security.core.userdetails.User.builder()
                    .username(user.getEmail())
                    .password(user.getPassword())
                    .authorities("ROLE_" + user.getRole().name())
                    .accountLocked(!user.getIsActive())
                    .build();
        };
    }

    /**
     * AuthenticationProvider for username/password authentication.
     * Used for login endpoint to authenticate users.
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * AuthenticationManager bean used for injecting into services.
     * Primarily used in authentication endpoints to authenticate user credentials.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Main security filter chain configuration.
     *
     * Order of operations:
     * 1. CSRF is disabled (stateless API)
     * 2. Session management is STATELESS (JWT-based)
     * 3. HTTP authorization requests are configured:
     * - Whitelisted paths: permitAll()
     * - Protected paths: authenticated()
     * 4. JwtAuthenticationFilter is added before
     * UsernamePasswordAuthenticationFilter
     * 5. HTTP Basic and Form Login are disabled
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Whitelist authentication and documentation endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        .requestMatchers("/webjars/**").permitAll()
                        // Internal service-to-service communication endpoints (no JWT required)
                        .requestMatchers("/api/statistics/**").permitAll()
                        .requestMatchers("/api/users/internal/**").permitAll()
                        // All other endpoints require authentication
                        .anyRequest().authenticated())
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .httpBasic(httpBasic -> httpBasic.disable())
                .formLogin(formLogin -> formLogin.disable());

        return http.build();
    }
}
