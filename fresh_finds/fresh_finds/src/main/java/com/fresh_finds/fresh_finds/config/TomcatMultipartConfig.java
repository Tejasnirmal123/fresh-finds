package com.fresh_finds.fresh_finds.config;

import org.springframework.boot.tomcat.servlet.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Configuration;

/**
 * Tomcat 10.1+/11 defaults maxPartCount to 10 as a DoS-protection measure.
 * Product/category forms with multiple images and tags exceed that easily.
 */
@Configuration
public class TomcatMultipartConfig implements WebServerFactoryCustomizer<TomcatServletWebServerFactory> {

    @Override
    public void customize(TomcatServletWebServerFactory factory) {
        factory.addConnectorCustomizers(connector -> connector.setProperty("maxPartCount", "100"));
    }
}
