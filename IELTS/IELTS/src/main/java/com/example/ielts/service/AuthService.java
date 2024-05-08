package com.example.ielts.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class AuthService {

    @Value("${wechat.appid}")
    private String appId;

    @Value("${wechat.secret}")
    private String appSecret;

    private final RestTemplate restTemplate;

    @Autowired
    public AuthService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String loginWithWechat(String code) {
        String url = "https://api.weixin.qq.com/sns/jscode2session";
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url)
                .queryParam("appid", appId)
                .queryParam("secret", appSecret)
                .queryParam("js_code", code)
                .queryParam("grant_type", "authorization_code");

        WechatAuthResponse response = restTemplate.getForObject(builder.toUriString(), WechatAuthResponse.class);
        if (response != null && response.getOpenid() != null) {
            // 逻辑处理，如保存用户信息到数据库
            // 返回自定义的令牌或session信息
            return response.getOpenid();  // 简化示例，实际应返回更安全的令牌
        } else {
            throw new RuntimeException("Failed to login with WeChat");
        }
    }

    private static class WechatAuthResponse {
        private String openid;
        private String session_key;

        public String getOpenid() {
            return openid;
        }

        public void setOpenid(String openid) {
            this.openid = openid;
        }

        public String getSession_key() {
            return session_key;
        }

        public void setSession_key(String session_key) {
            this.session_key = session_key;
        }
// getter and setter
    }
}
