# Build stage
FROM rust:1.88-slim AS builder

WORKDIR /usr/src/app
# Pre-install pkg-config and libssl-dev if needed (not for basic binary, but common in Rust)
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*
COPY . .
# Build for release
RUN cargo build --release

# Run stage
FROM debian:bookworm-slim

WORKDIR /app

# Install SSL certificates for Supabase connection (CRITICAL)
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy binary from builder
COPY --from=builder /usr/src/app/target/release/hostelhub_backend /app/hostelhub_backend

EXPOSE 8080

ENV PORT=8080
ENV RUST_LOG=info

CMD ["./hostelhub_backend"]
