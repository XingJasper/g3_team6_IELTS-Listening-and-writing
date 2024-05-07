package com.example.ielts.repository;


import com.example.ielts.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    // 这里可以添加一些查找用户的自定义方法
}
