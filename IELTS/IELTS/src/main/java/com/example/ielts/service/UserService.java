package com.example.ielts.service;


import com.example.ielts.model.User;
import com.example.ielts.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(User user) {
        // 添加业务逻辑，如检查用户名是否存在等
        return userRepository.save(user);
    }
}
