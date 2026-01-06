package com.clinicbooking.paymentservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String HEADER_USER_ID = "X-User-Id";
    private static final String HEADER_USER_ROLE = "X-User-Role";
    private static final String HEADER_USER_EMAIL = "X-User-Email";
    private static final String HEADER_AUTHENTICATED = "X-Authenticated";

    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String requestURI = request.getRequestURI();

        if (isPublicEndpoint(requestURI)) {
            log.debug("Public endpoint accessed - URI: {}", requestURI);
            filterChain.doFilter(request, response);
            return;
        }

        try {

            String userId = request.getHeader(HEADER_USER_ID);
            String userRole = request.getHeader(HEADER_USER_ROLE);
            String userEmail = request.getHeader(HEADER_USER_EMAIL);
            String authenticated = request.getHeader(HEADER_AUTHENTICATED);

            if ("true".equalsIgnoreCase(authenticated) && userId != null && !userId.isBlank()) {

                CustomUserDetails userDetails = CustomUserDetails.builder()
                        .userId(Long.parseLong(userId))
                        .email(userEmail)
                        .role(userRole)
                        .username(userEmail != null ? userEmail : "user_" + userId)
                        .enabled(true)
                        .accountNonExpired(true)
                        .accountNonLocked(true)
                        .credentialsNonExpired(true)
                        .build();

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);

                log.debug("User authenticated via headers - UserId: {}, Role: {}, Email: {}",
                         userId, userRole, userEmail);
            } else {
                log.warn("Authentication headers missing or invalid - URI: {}, Authenticated: {}, UserId: {}",
                        requestURI, authenticated, userId);
            }

        } catch (NumberFormatException e) {
            log.error("Invalid user ID format in header - URI: {}", requestURI, e);
            SecurityContextHolder.clearContext();
        } catch (Exception e) {
            log.error("Error processing authentication headers - URI: {}", requestURI, e);
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    
    private boolean isPublicEndpoint(String requestURI) {
        return requestURI.startsWith("/api/payments/momo/callback") ||
               requestURI.startsWith("/actuator/") ||
               requestURI.startsWith("/swagger-ui") ||
               requestURI.startsWith("/v3/api-docs") ||
               requestURI.startsWith("/webjars/");
    }
}
