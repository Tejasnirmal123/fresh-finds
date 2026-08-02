package com.fresh_finds.fresh_finds.config;

import org.apache.catalina.connector.Connector;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.tomcat.servlet.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Configuration;

/**
 * Tomcat 10.1+/11 defaults maxPartCount to 10 as a DoS-protection measure.
 * Product/category forms with multiple images and tags exceed that easily.
 */
@Configuration
public class TomcatMultipartConfig implements WebServerFactoryCustomizer<TomcatServletWebServerFactory> {

    private static final Logger log = LoggerFactory.getLogger(TomcatMultipartConfig.class);

    @Override
    public void customize(TomcatServletWebServerFactory factory) {
        factory.addConnectorCustomizers((Connector connector) -> {
            connector.setMaxPartCount(100);
            log.info("Configured Tomcat connector maxPartCount={}", connector.getMaxPartCount());
        });
    }
}
