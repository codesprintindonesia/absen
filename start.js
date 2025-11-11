/**
 * start.js - Application Entry Point
 *
 * This script handles the initialization sequence:
 * 1. Load environment variables
 * 2. Initialize OpenTelemetry (observability)
 * 3. Load and start the main application
 */

import { config as dotenv } from "dotenv";

/**
 * Main startup function
 * Handles application initialization with proper error handling
 */
async function startApplication() {
    try {
        // Step 1: Load environment variables
        console.log("[STARTUP] Loading environment variables...");
        dotenv();
        console.log("[STARTUP] Environment variables loaded");

        // Step 2: Initialize OpenTelemetry
        console.log("[STARTUP] Initializing OpenTelemetry...");
        try {
            await import("./src/libraries/otel.library.cjs");
            console.log("[STARTUP] OpenTelemetry initialized successfully");
        } catch (otelError) {
            console.error("[STARTUP] Failed to initialize OpenTelemetry:", otelError.message);
            console.warn("[STARTUP] Application will continue without tracing/observability");
            // OpenTelemetry is not critical, continue without it
        }

        // Step 3: Load main application
        console.log("[STARTUP] Loading main application...");
        await import("./src/app.js");
        console.log("[STARTUP] Application started successfully");
        console.log("[STARTUP] Server is ready to accept connections");

    } catch (error) {
        // Critical error - application cannot start
        console.error("[STARTUP] FATAL: Failed to start application");
        console.error("[STARTUP] Error:", error.message);
        console.error("[STARTUP] Stack:", error.stack);

        // Exit with error code
        process.exit(1);
    }
}

// Execute startup
startApplication();
