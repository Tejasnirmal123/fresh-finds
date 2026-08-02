package com.fresh_finds.fresh_finds.utils;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.LinkedHashMap;
import java.util.Map;

public class ApiResponse extends ResponseEntity<ResponseWrapper> {
    
    private ApiResponse(ResponseWrapper body, HttpStatus httpStatus) {
        super(body, httpStatus);
    }

    public static ApiResponse buildSuccessResponse(Object payload) {
        ResponseWrapper responseWrapper = new ResponseWrapper();
        responseWrapper.setData(payload);
        responseWrapper.setTimestamp(System.currentTimeMillis());
        responseWrapper.setVersion("v1");
        responseWrapper.setStatus(ResponseWrapper.Status.SUCCESS);
        return new ApiResponse(responseWrapper, HttpStatus.OK);
    }

    public static ApiResponse buildSuccessResponse(Object payload, HttpStatus httpStatus) {
        ResponseWrapper responseWrapper = new ResponseWrapper();
        responseWrapper.setData(payload);
        responseWrapper.setTimestamp(System.currentTimeMillis());
        responseWrapper.setVersion("v1");
        responseWrapper.setStatus(ResponseWrapper.Status.SUCCESS);
        return new ApiResponse(responseWrapper, httpStatus);
    }

    public static ApiResponse buildErrorResponse(String message, HttpStatus httpStatus) {
        Map<String, String> map = new LinkedHashMap<>();
        map.put("error", message);

        ResponseWrapper responseWrapper = new ResponseWrapper();
        responseWrapper.setData(map);
        responseWrapper.setTimestamp(System.currentTimeMillis());
        responseWrapper.setVersion("v1");
        responseWrapper.setStatus(ResponseWrapper.Status.ERROR);
        return new ApiResponse(responseWrapper, httpStatus);
    }

    public static ApiResponse buildErrorResponse(Map<String, String> errors, HttpStatus httpStatus) {
        ResponseWrapper responseWrapper = new ResponseWrapper();
        responseWrapper.setData(errors);
        responseWrapper.setTimestamp(System.currentTimeMillis());
        responseWrapper.setVersion("v1");
        responseWrapper.setStatus(ResponseWrapper.Status.ERROR);
        return new ApiResponse(responseWrapper, httpStatus);
    }
}

