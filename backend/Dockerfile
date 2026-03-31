# Build stage
FROM rust:1.88-slim AS builder

WORKDIR /usr/src/app
COPY . .

# Build for release
RUN cargo build --release

# Run stage
FROM debian:bookworm-slim

WORKDIR /app

# Install SSL certificates for Supabase connection
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/src/app/target/release/hostelhub_backend /app/hostelhub_backend
COPY .env /app/.env

EXPOSE 8080

CMD ["./hostelhub_backend"]
