package com.clinicbooking.clinic_booking_system.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.clinicbooking.clinic_booking_system.service.HelloService;

@RestController
@RequestMapping("/api")
public class HelloController {

    @Autowired
    private HelloService helloService;

    @GetMapping("/hello")
    public ResponseEntity<String> getHello() {
        return ResponseEntity.ok(helloService.getHelloMessage());
    }
}

