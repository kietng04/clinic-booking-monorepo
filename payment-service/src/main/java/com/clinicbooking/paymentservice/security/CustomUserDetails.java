package com.clinicbooking.paymentservice.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomUserDetails implements UserDetails {

    
    private Long userId;

    
    private String email;

    
    private String role;

    
    private String username;

    
    private String password;

    
    @Builder.Default
    private boolean enabled = true;

    
    @Builder.Default
    private boolean accountNonLocked = true;

    
    @Builder.Default
    private boolean credentialsNonExpired = true;

    
    @Builder.Default
    private boolean accountNonExpired = true;

    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (role == null) {
            return Collections.emptyList();
        }
        String authority = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        return Collections.singletonList(new SimpleGrantedAuthority(authority));
    }

    
    @Override
    public String getPassword() {
        return password;
    }

    
    @Override
    public String getUsername() {
        return username != null ? username : email;
    }

    
    @Override
    public boolean isAccountNonExpired() {
        return accountNonExpired;
    }

    
    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }

    
    @Override
    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }

    
    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
