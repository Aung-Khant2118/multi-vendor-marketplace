package com.group5.marketplace.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Intentionally disabled — this project uses real database data, not generated seed orders.
 * Keeping the bean as a no-op avoids accidental redistribution of production/dev rows.
 */
@Component
public class SeedDataRunner implements CommandLineRunner {

    @Override
    public void run(String... args) {
        // no-op
    }
}
