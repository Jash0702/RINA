#!/usr/bin/env python3
"""
RINA Vision App - Localhost Server & Media Streaming Launcher
Serves the React Vite bundle / public media files with HTTP Range Request support for smooth video playback.
"""

import os
import sys
import argparse
import socket
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DIST_DIR = BASE_DIR / "dist"
PUBLIC_DIR = BASE_DIR / "public"
VIDEOS_DIR = BASE_DIR / "videos"

class RinaVideoHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Serve dist if built, otherwise serve public or root
        serve_dir = DIST_DIR if DIST_DIR.exists() else BASE_DIR
        super().__init__(*args, directory=str(serve_dir), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

    def do_GET(self):
        # Custom route for /media/<case>/<slot> or /videos/<filename>
        if self.path.startswith("/videos/") or self.path.startswith("/media/"):
            # Try finding the video file
            filename = self.path.split("/")[-1]
            possible_paths = [
                VIDEOS_DIR / filename,
                PUBLIC_DIR / "videos" / filename,
                BASE_DIR / "videos" / filename
            ]
            for p in possible_paths:
                if p.exists() and p.is_file():
                    self.serve_file_with_ranges(p)
                    return
        
        # Single Page App fallback for React Router / client routes
        path_without_query = self.path.split("?")[0]
        full_path = Path(self.directory) / path_without_query.lstrip("/")
        if not full_path.exists() and not full_path.suffix:
            index_path = Path(self.directory) / "index.html"
            if index_path.exists():
                self.serve_file_with_ranges(index_path)
                return

        super().do_GET()

    def serve_file_with_ranges(self, filepath):
        file_size = filepath.stat().st_size
        range_header = self.headers.get("Range")

        content_type = "video/mp4"
        if filepath.suffix == ".webm":
            content_type = "video/webm"
        elif filepath.suffix == ".html":
            content_type = "text/html; charset=utf-8"
        elif filepath.suffix == ".svg":
            content_type = "image/svg+xml"
        elif filepath.suffix == ".json":
            content_type = "application/json"

        if range_header:
            # Parse Range: bytes=start-end
            try:
                ranges = range_header.replace("bytes=", "").split("-")
                start = int(ranges[0]) if ranges[0] else 0
                end = int(ranges[1]) if len(ranges) > 1 and ranges[1] else file_size - 1
                length = end - start + 1

                self.send_response(206)
                self.send_header("Content-Type", content_type)
                self.send_header("Content-Range", f"bytes {start}-{end}/{file_size}")
                self.send_header("Content-Length", str(length))
                self.send_header("Accept-Ranges", "bytes")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()

                with open(filepath, "rb") as f:
                    f.seek(start)
                    self.wfile.write(f.read(length))
                return
            except Exception:
                pass

        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(file_size))
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Access-Control-Allow-Origin", "*")
        if filepath.suffix in [".html", ".js", ".css", ".json"]:
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
        self.end_headers()

        with open(filepath, "rb") as f:
            self.wfile.write(f.read())


def find_free_port(start_port=8080):
    for port in range(start_port, start_port + 50):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(("127.0.0.1", port)) != 0:
                return port
    return 8080


def main():
    parser = argparse.ArgumentParser(description="Launch RINA Vision App")
    parser.add_argument("--port", type=int, default=0, help="Port to bind (default: auto)")
    parser.add_argument("--no-browser", action="store_true", help="Don't open browser automatically")
    args = parser.parse_args()

    port = args.port if args.port > 0 else find_free_port(8080)
    server = HTTPServer(("127.0.0.1", port), RinaVideoHandler)
    url = f"http://127.0.0.1:{port}"

    print(f"\n=======================================================")
    print(f"  RINA Vision App - React Demonstration Server")
    print(f"  Listening on: {url}")
    print(f"  Press Ctrl+C to stop the server")
    print(f"=======================================================\n")

    if not args.no_browser:
        webbrowser.open(url)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        server.server_close()


if __name__ == "__main__":
    main()
