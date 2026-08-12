package com.group5.marketplace.user.entity;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Date;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String username;

    @Column
    private String phoneNumber;

    @Column(nullable = false)
    private String password;

    // fields for password reset flow
    @Column(name = "reset_token")
    private String resetToken;

    @Temporal(TemporalType.TIMESTAMP)
    private Date resetTokenExpiry;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    public User() {}

    public User(long id, String firstName, String lastName, String email, String username, String phoneNumber, String password, String resetToken, Date resetTokenExpiry, Role role) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.username = username;
        this.phoneNumber = phoneNumber;
        this.password = password;
        this.resetToken = resetToken;
        this.resetTokenExpiry = resetTokenExpiry;
        this.role = role;
    }

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getUsernameField() { return username; }
    public void setUsernameField(String username) { this.username = username; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public void setPassword(String password) { this.password = password; }
    public String getResetToken() { return resetToken; }
    public void setResetToken(String resetToken) { this.resetToken = resetToken; }
    public Date getResetTokenExpiry() { return resetTokenExpiry; }
    public void setResetTokenExpiry(Date resetTokenExpiry) { this.resetTokenExpiry = resetTokenExpiry; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public static Builder builder() { return new Builder(); }
    public static class Builder { 
        private long id; private String firstName; private String lastName; private String email; private String username; private String phoneNumber; private String password; private String resetToken; private Date resetTokenExpiry; private Role role;
        public Builder id(long id){ this.id=id; return this; }
        public Builder firstName(String firstName){ this.firstName=firstName; return this; }
        public Builder lastName(String lastName){ this.lastName=lastName; return this; }
        public Builder email(String email){ this.email=email; return this; }
        public Builder username(String username){ this.username=username; return this; }
        public Builder phoneNumber(String phoneNumber){ this.phoneNumber=phoneNumber; return this; }
        public Builder password(String password){ this.password=password; return this; }
        public Builder resetToken(String resetToken){ this.resetToken=resetToken; return this; }
        public Builder resetTokenExpiry(Date resetTokenExpiry){ this.resetTokenExpiry=resetTokenExpiry; return this; }
        public Builder role(Role role){ this.role=role; return this; }
        public User build(){ return new User(id, firstName, lastName, email, username, phoneNumber, password, resetToken, resetTokenExpiry, role); }
    }
}