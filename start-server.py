#!/usr/bin/env python3
"""
QueueLess — Cross-Platform Local Server & Mobile Wi-Fi Broadcaster
Serves QueueLess to Windows, Android, Mac, and iOS devices on the same local network.
"""

import http.server
import socketserver
import socket
import webbrowser
import os
import sys

PORT = 5000

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and PWA MIME types
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, must-revalidate')
        super().end_headers()

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(base_dir)

    local_ip = get_local_ip()

    print("==================================================================")
    print("   🚀 QUEUELESS MULTI-DEVICE WI-FI SERVER RUNNING")
    socketserver.TCPServer.allow_reuse_address = True
    active_port = PORT
    httpd = None

    for p in [5000, 5001, 5050, 8080]:
        try:
            httpd = socketserver.TCPServer(("", p), CustomHandler)
            active_port = p
            break
        except OSError:
            continue

    if not httpd:
        print("Could not bind to any test port (5000-8080).")
        sys.exit(1)

    print(f" • PC / Desktop URL   : http://localhost:{active_port}")
    print(f" • Android / Mac / iOS: http://{local_ip}:{active_port}")
    print("------------------------------------------------------------------")
    print(" ON ANDROID / IPHONE / MAC:")
    print(f" 1. Connect device to the same Wi-Fi network as this PC.")
    print(f" 2. Open browser and visit: http://{local_ip}:{active_port}")
    print(" 3. Tap 'Install App' or 'Add to Home screen' for native mobile app!")
    print("==================================================================")
    print("Press Ctrl+C to stop the server.\n")

    try:
        webbrowser.open(f"http://localhost:{active_port}")
    except Exception:
        pass

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nQueueLess Server stopped.")
        sys.exit(0)

if __name__ == '__main__':
    main()
