/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        // Product image URLs are free-form until Cloudinary/S3 is chosen (see
        // .env.example), so there's no fixed set of hosts to allow via
        // remotePatterns yet. Once that's decided, set remotePatterns to that
        // host and drop `unoptimized` to get real image optimization (and a
        // better LCP) instead of serving images as-is.
        unoptimized: true,
    },
};

export default nextConfig;
