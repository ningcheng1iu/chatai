package com.example.deepseekchat;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Environment;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "LocalLLM")
public class LocalLLMPlugin extends Plugin {
    
    private static final String MODEL_FILE_NAME = "qwen3-4b-instruct-2507-q4_k_m.gguf";
    private LocalLLMEngine engine;
    
    @PluginMethod
    public void initialize(PluginCall call) {
        try {
            String modelPath = call.getString("modelPath");
            engine = new LocalLLMEngine();
            
            boolean success = engine.initialize(getContext(), modelPath);
            
            JSObject result = new JSObject();
            result.put("success", success);
            if (success) {
                result.put("message", "Model loaded successfully");
                call.resolve(result);
            } else {
                result.put("message", "Failed to load model");
                call.reject("Failed to load model");
            }
        } catch (Exception e) {
            JSObject result = new JSObject();
            result.put("success", false);
            result.put("message", e.getMessage());
            call.reject(e.getMessage());
        }
    }
    
    @PluginMethod
    public void generate(PluginCall call) {
        try {
            String prompt = call.getString("prompt");
            String systemPrompt = call.getString("systemPrompt", "");
            int maxTokens = call.getInt("maxTokens", 512);
            double temperature = call.getDouble("temperature", 0.7);
            
            String response = engine.generate(prompt, systemPrompt, maxTokens, temperature);
            
            JSObject result = new JSObject();
            result.put("text", response);
            call.resolve(result);
        } catch (Exception e) {
            JSObject result = new JSObject();
            result.put("text", "");
            call.reject(e.getMessage());
        }
    }
    
    @PluginMethod
    public void checkModelExists(PluginCall call) {
        try {
            String modelPath = call.getString("modelPath");
            File modelFile = new File(modelPath);
            boolean exists = modelFile.exists() && modelFile.isFile();
            
            JSObject result = new JSObject();
            result.put("exists", exists);
            result.put("size", exists ? modelFile.length() : 0);
            call.resolve(result);
        } catch (Exception e) {
            JSObject result = new JSObject();
            result.put("exists", false);
            call.reject(e.getMessage());
        }
    }
    
    @PluginMethod
    public void checkNetwork(PluginCall call) {
        try {
            boolean isOnline = NetworkUtils.isNetworkAvailable(getContext());
            
            JSObject result = new JSObject();
            result.put("online", isOnline);
            call.resolve(result);
        } catch (Exception e) {
            JSObject result = new JSObject();
            result.put("online", false);
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void saveTextFile(PluginCall call) {
        String fileName = call.getString("fileName", "xiaohanxingxu-memory.json");
        String content = call.getString("content", "");

        if (!fileName.endsWith(".json")) {
            fileName = fileName + ".json";
        }

        fileName = fileName.replaceAll("[\\\\/:*?\"<>|]", "_");
        File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
        if (!downloadsDir.exists() && !downloadsDir.mkdirs()) {
            call.reject("无法访问下载目录：" + downloadsDir.getAbsolutePath());
            return;
        }

        File outputFile = new File(downloadsDir, fileName);
        try (FileOutputStream out = new FileOutputStream(outputFile)) {
            out.write(content.getBytes(StandardCharsets.UTF_8));
            out.getFD().sync();

            JSObject response = new JSObject();
            response.put("success", true);
            response.put("path", outputFile.getAbsolutePath());
            response.put("size", outputFile.length());
            call.resolve(response);
        } catch (IOException e) {
            call.reject("保存文件失败：" + e.getClass().getSimpleName() + " - " + e.getMessage() + "，目标：" + outputFile.getAbsolutePath());
        }
    }

    @PluginMethod
    public void getExportLocation(PluginCall call) {
        File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
        File[] files = downloadsDir.listFiles((dir, name) ->
            name.startsWith("xiaohanxingxu-memory-") && name.endsWith(".json")
        );

        File latest = null;
        if (files != null) {
            for (File file : files) {
                if (latest == null || file.lastModified() > latest.lastModified()) {
                    latest = file;
                }
            }
        }

        JSObject response = new JSObject();
        response.put("directory", downloadsDir.getAbsolutePath());
        response.put("exists", latest != null && latest.exists());
        if (latest != null) {
            response.put("fileName", latest.getName());
            response.put("path", latest.getAbsolutePath());
            response.put("size", latest.length());
            response.put("updatedAt", latest.lastModified());
        }
        call.resolve(response);
    }

    @PluginMethod
    public void importModel(PluginCall call) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("*/*");
        intent.putExtra(Intent.EXTRA_MIME_TYPES, new String[] {
            "application/octet-stream",
            "application/x-gguf",
            "*/*"
        });
        startActivityForResult(call, intent, "handleModelImport");
    }

    @ActivityCallback
    private void handleModelImport(PluginCall call, ActivityResult result) {
        if (call == null) {
            return;
        }

        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            call.reject("未选择模型文件。");
            return;
        }

        Uri uri = result.getData().getData();
        new Thread(() -> copySelectedModel(call, uri)).start();
    }

    private void copySelectedModel(PluginCall call, Uri uri) {
        File targetDir = getContext().getExternalFilesDir(null);
        if (targetDir == null) {
            targetDir = getContext().getFilesDir();
        }

        File targetFile = new File(targetDir, MODEL_FILE_NAME);
        File tempFile = new File(targetDir, MODEL_FILE_NAME + ".tmp");

        try (InputStream in = getContext().getContentResolver().openInputStream(uri);
             FileOutputStream out = new FileOutputStream(tempFile)) {
            if (in == null) {
                call.reject("无法读取选择的模型文件。");
                return;
            }

            byte[] buffer = new byte[1024 * 1024];
            int read;
            long total = 0;
            while ((read = in.read(buffer)) != -1) {
                out.write(buffer, 0, read);
                total += read;
            }
            out.getFD().sync();

            if (targetFile.exists() && !targetFile.delete()) {
                call.reject("无法替换旧模型文件。");
                return;
            }
            if (!tempFile.renameTo(targetFile)) {
                call.reject("模型文件保存失败。");
                return;
            }

            JSObject response = new JSObject();
            response.put("success", true);
            response.put("modelPath", targetFile.getAbsolutePath());
            response.put("size", total);
            call.resolve(response);
        } catch (IOException e) {
            if (tempFile.exists()) {
                //noinspection ResultOfMethodCallIgnored
                tempFile.delete();
            }
            call.reject("模型导入失败：" + e.getMessage());
        }
    }
}
