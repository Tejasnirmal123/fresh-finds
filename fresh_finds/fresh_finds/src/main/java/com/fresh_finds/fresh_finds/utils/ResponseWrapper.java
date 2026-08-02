package com.fresh_finds.fresh_finds.utils;

public class ResponseWrapper {
    private String version;
    private long timestamp;
    private Status status;
    private Object data;

    public enum Status {
        SUCCESS, ERROR
    }

    public ResponseWrapper() {
    }

    public ResponseWrapper(String version, long timestamp, Status status, Object data) {
        this.version = version;
        this.timestamp = timestamp;
        this.status = status;
        this.data = data;
    }

    public static ResponseWrapper createResponse(Status status, Object data) {
        ResponseWrapper response = new ResponseWrapper();
        response.setVersion("v1");
        response.setTimestamp(System.currentTimeMillis());
        response.setStatus(status);
        response.setData(data);
        return response;
    }

    // Getters and Setters
    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }
}

