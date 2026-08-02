package com.fresh_finds.fresh_finds.service;

import java.io.IOException;
import java.util.List;

public interface OrderExportService {
    /**
     * Export orders to CSV format
     * @param orders List of orders to export
     * @return CSV content as byte array
     * @throws IOException if there's an error writing the CSV
     */
    byte[] exportOrdersToCsv(List<com.fresh_finds.fresh_finds.controller.response.OrderResponse> orders) throws IOException;
}

