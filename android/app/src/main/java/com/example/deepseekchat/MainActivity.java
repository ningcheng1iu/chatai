package com.example.deepseekchat;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // 注册本地 LLM 插件
        registerPlugin(LocalLLMPlugin.class);
        super.onCreate(savedInstanceState);
        
        // 配置WebView以允许跨域请求
        WebView webView = getBridge().getWebView();
        WebSettings webSettings = webView.getSettings();
        
        // 允许文件访问和跨域
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setAllowFileAccessFromFileURLs(true);
        webSettings.setAllowUniversalAccessFromFileURLs(true);
        
        // 启用JavaScript
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        
        // 允许混合内容
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        
        // 禁用缓存以避免问题
        webSettings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        
        // 启用数据库存储
        webSettings.setDatabaseEnabled(true);
        
        // 启用调试（仅开发）
        WebView.setWebContentsDebuggingEnabled(true);
    }
}
