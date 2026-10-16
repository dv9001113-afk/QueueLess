import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.awt.Desktop;
import java.io.*;
import java.net.*;
import java.nio.file.Files;
import java.util.Enumeration;

/**
 * QueueLess — Cross-Platform Pure Java HTTP Server & Wi-Fi Broadcaster
 * Serves QueueLess to Android, iOS, Mac, and Windows with Zero External Dependencies.
 */
public class QueueLessServer {

    private static final int DEFAULT_PORT = 5000;

    public static void main(String[] args) {
        int port = DEFAULT_PORT;
        HttpServer server = null;

        // Try ports 5000, 5001, 5050, 8080
        int[] candidatePorts = {5000, 5001, 5050, 8080};
        for (int p : candidatePorts) {
            try {
                server = HttpServer.create(new InetSocketAddress(p), 0);
                port = p;
                break;
            } catch (IOException ignored) {}
        }

        if (server == null) {
            System.err.println("Error: Could not bind server to ports 5000-8080.");
            return;
        }

        File currentDir = new File(".").toPath().toAbsolutePath().normalize().toFile();
        server.createContext("/", new StaticFileHandler(currentDir));
        server.setExecutor(null);
        server.start();

        String localIp = getLocalIpAddress();

        System.out.println("==================================================================");
        System.out.println("   🚀 QUEUELESS MULTI-DEVICE JAVA SERVER RUNNING");
        System.out.println("==================================================================");
        System.out.println(" • Windows / PC Localhost : http://localhost:" + port);
        System.out.println(" • Android / Mac / iPhone : http://" + localIp + ":" + port);
        System.out.println("------------------------------------------------------------------");
        System.out.println(" HOW TO RUN ON MOBILE / OTHER DEVICES:");
        System.out.println(" 1. Connect phone or Mac to the same Wi-Fi network as this PC.");
        System.out.println(" 2. Open browser (Chrome / Safari) and visit: http://" + localIp + ":" + port);
        System.out.println(" 3. Tap 'Install app' or 'Add to Home screen' for the native mobile app!");
        System.out.println("==================================================================");
        System.out.println("Press Ctrl+C to stop the server.\n");

        // Auto open desktop browser
        try {
            if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                Desktop.getDesktop().browse(new URI("http://localhost:" + port));
            }
        } catch (Exception ignored) {}
    }

    private static String getLocalIpAddress() {
        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                NetworkInterface iface = interfaces.nextElement();
                if (iface.isLoopback() || !iface.isUp()) continue;
                Enumeration<InetAddress> addresses = iface.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    InetAddress addr = addresses.nextElement();
                    if (addr instanceof Inet4Address && !addr.isLoopbackAddress()) {
                        return addr.getHostAddress();
                    }
                }
            }
        } catch (Exception ignored) {}
        return "127.0.0.1";
    }

    static class StaticFileHandler implements HttpHandler {
        private final File rootDir;

        public StaticFileHandler(File rootDir) {
            this.rootDir = rootDir;
        }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            if (path == null || path.equals("/") || path.isEmpty()) {
                path = "/index.html";
            }

            // Remove leading slash
            if (path.startsWith("/")) {
                path = path.substring(1);
            }

            File targetFile = new File(rootDir, path).toPath().normalize().toFile();

            // Prevent path traversal
            if (!targetFile.toPath().startsWith(rootDir.toPath())) {
                sendResponse(exchange, 403, "Access Denied", "text/plain");
                return;
            }

            if (!targetFile.exists() || targetFile.isDirectory()) {
                // If directory, check for index.html inside
                File indexInDir = new File(targetFile, "index.html");
                if (indexInDir.exists()) {
                    targetFile = indexInDir;
                } else {
                    sendResponse(exchange, 404, "File Not Found: " + path, "text/plain");
                    return;
                }
            }

            String mimeType = getMimeType(targetFile.getName());
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().set("Content-Type", mimeType);
            exchange.getResponseHeaders().set("Cache-Control", "no-cache, must-revalidate");

            byte[] fileBytes = Files.readAllBytes(targetFile.toPath());
            exchange.sendResponseHeaders(200, fileBytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(fileBytes);
            }
        }

        private void sendResponse(HttpExchange exchange, int statusCode, String message, String mime) throws IOException {
            byte[] bytes = message.getBytes();
            exchange.getResponseHeaders().set("Content-Type", mime);
            exchange.sendResponseHeaders(statusCode, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }

        private String getMimeType(String fileName) {
            String lower = fileName.toLowerCase();
            if (lower.endsWith(".html") || lower.endsWith(".htm")) return "text/html; charset=UTF-8";
            if (lower.endsWith(".css")) return "text/css; charset=UTF-8";
            if (lower.endsWith(".js")) return "application/javascript; charset=UTF-8";
            if (lower.endsWith(".json")) return "application/json; charset=UTF-8";
            if (lower.endsWith(".png")) return "image/png";
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
            if (lower.endsWith(".svg")) return "image/svg+xml";
            if (lower.endsWith(".apk")) return "application/vnd.android.package-archive";
            if (lower.endsWith(".dmg")) return "application/x-apple-diskimage";
            if (lower.endsWith(".ipa")) return "application/octet-stream";
            if (lower.endsWith(".exe")) return "application/octet-stream";
            return "application/octet-stream";
        }
    }
}
