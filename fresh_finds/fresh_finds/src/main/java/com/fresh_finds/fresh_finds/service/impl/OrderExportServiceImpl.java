package com.fresh_finds.fresh_finds.service.impl;

import com.fresh_finds.fresh_finds.controller.response.OrderItemResponse;
import com.fresh_finds.fresh_finds.controller.response.OrderResponse;
import com.fresh_finds.fresh_finds.service.OrderExportService;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class OrderExportServiceImpl implements OrderExportService {

    @Override
    public byte[] exportOrdersToCsv(List<OrderResponse> orders) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        OutputStreamWriter writer = new OutputStreamWriter(outputStream, StandardCharsets.UTF_8);
        
        // Write BOM for Excel compatibility
        outputStream.write(0xEF);
        outputStream.write(0xBB);
        outputStream.write(0xBF);
        
        // Write CSV header
        writer.write("Order Number,Customer Name,Email,Phone,Status,Payment Status,Order Date,Shipping Address,");
        writer.write("Product ID,Product Name,Quantity,Unit,Unit Price,Item Subtotal,Order Total\n");
        
        // Write CSV rows - one row per order item
        for (OrderResponse order : orders) {
            String orderNumber = escapeCsv(order.getOrderNumber());
            String customerName = escapeCsv(order.getCustomerFirstName() + " " + order.getCustomerLastName());
            String email = escapeCsv(order.getCustomerEmail());
            String phone = escapeCsv(order.getCustomerPhone() != null ? order.getCustomerPhone() : "");
            String orderStatus = escapeCsv(order.getStatus() != null ? order.getStatus() : "");
            String paymentStatus = escapeCsv(order.getPaymentStatus() != null ? order.getPaymentStatus() : "");
            String orderDate = order.getCreatedAt() != null ? order.getCreatedAt().toString() : "";
            String shippingAddress = escapeCsv(String.format("%s, %s, %s %s, %s",
                order.getShippingStreet(),
                order.getShippingCity(),
                order.getShippingState(),
                order.getShippingZipCode(),
                order.getShippingCountry()));
            String orderTotal = order.getTotal() != null ? order.getTotal().toString() : "0.00";
            
            // If order has items, write one row per item
            if (order.getItems() != null && !order.getItems().isEmpty()) {
                for (OrderItemResponse item : order.getItems()) {
                    writer.write(String.format("\"%s\",", orderNumber));
                    writer.write(String.format("\"%s\",", customerName));
                    writer.write(String.format("\"%s\",", email));
                    writer.write(String.format("\"%s\",", phone));
                    writer.write(String.format("\"%s\",", orderStatus));
                    writer.write(String.format("\"%s\",", paymentStatus));
                    writer.write(String.format("\"%s\",", orderDate));
                    writer.write(String.format("\"%s\",", shippingAddress));
                    writer.write(String.format("\"%s\",", item.getProductId() != null ? item.getProductId().toString() : ""));
                    writer.write(String.format("\"%s\",", escapeCsv(item.getProductName() != null ? item.getProductName() : "")));
                    writer.write(String.format("\"%d\",", item.getQuantity() != null ? item.getQuantity() : 0));
                    writer.write(String.format("\"%s\",", escapeCsv(item.getUnit() != null ? item.getUnit() : "")));
                    writer.write(String.format("\"%s\",", item.getPrice() != null ? item.getPrice().toString() : "0.00"));
                    writer.write(String.format("\"%s\",", item.getSubtotal() != null ? item.getSubtotal().toString() : "0.00"));
                    writer.write(String.format("\"%s\"\n", orderTotal));
                }
            } else {
                // If order has no items, write one row with empty product fields
                writer.write(String.format("\"%s\",", orderNumber));
                writer.write(String.format("\"%s\",", customerName));
                writer.write(String.format("\"%s\",", email));
                writer.write(String.format("\"%s\",", phone));
                writer.write(String.format("\"%s\",", orderStatus));
                writer.write(String.format("\"%s\",", paymentStatus));
                writer.write(String.format("\"%s\",", orderDate));
                writer.write(String.format("\"%s\",", shippingAddress));
                writer.write("\"\",\"\",\"0\",\"\",\"0.00\",\"0.00\",");
                writer.write(String.format("\"%s\"\n", orderTotal));
            }
        }
        
        writer.flush();
        byte[] csvBytes = outputStream.toByteArray();
        writer.close();
        
        return csvBytes;
    }

    /**
     * Escape CSV special characters
     * @param value The value to escape
     * @return Escaped value
     */
    private String escapeCsv(String value) {
        if (value == null) return "";
        return value.replace("\"", "\"\"").replace("\n", " ").replace("\r", " ");
    }
}

