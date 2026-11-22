-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'member');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('new', 'in_progress', 'closed');

-- CreateEnum
CREATE TYPE "InquiryKind" AS ENUM ('general', 'partnership', 'ecommerce', 'anamigo_fleet', 'anamsoft', 'anamcart');

-- CreateEnum
CREATE TYPE "SocialScope" AS ENUM ('company', 'ceo');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clerk_id" TEXT,
    "display_name" TEXT,
    "disabled_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "role" "Role" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "businesses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "capabilities" TEXT[],
    "image" TEXT NOT NULL,
    "image_alt" TEXT NOT NULL,
    "logo" TEXT,
    "external_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "short_description" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "image_alt" TEXT NOT NULL DEFAULT '',
    "category_id" UUID,
    "amazon_url" TEXT NOT NULL,
    "price" DECIMAL(12,2),
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "path" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "kind" "InquiryKind" NOT NULL,
    "message" TEXT NOT NULL,
    "status" "InquiryStatus" NOT NULL DEFAULT 'new',
    "read_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "singleton" BOOLEAN NOT NULL DEFAULT true,
    "company_name" TEXT NOT NULL,
    "introduction" TEXT NOT NULL,
    "positioning" TEXT NOT NULL,
    "brand_logo" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "footer_text" TEXT NOT NULL,
    "seo_title" TEXT NOT NULL,
    "seo_description" TEXT NOT NULL,
    "ceo_name" TEXT NOT NULL,
    "ceo_designation" TEXT NOT NULL,
    "ceo_bio" TEXT NOT NULL,
    "ceo_vision" TEXT NOT NULL,
    "ceo_portrait" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_links" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "scope" "SocialScope" NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "social_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_id" UUID,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resource_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "url" TEXT NOT NULL,
    "cloudinary_id" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "bytes" INTEGER,
    "format" TEXT,
    "orphaned_at" TIMESTAMPTZ(3),
    "deleted_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiry_rate_limits" (
    "bucket" TEXT NOT NULL,
    "hour" TIMESTAMPTZ(3) NOT NULL,
    "hits" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "inquiry_rate_limits_pkey" PRIMARY KEY ("bucket","hour")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_id_key" ON "users"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_key" ON "user_roles"("user_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "businesses_slug_key" ON "businesses"("slug");

-- CreateIndex
CREATE INDEX "businesses_published_display_order_name_idx" ON "businesses"("published", "display_order", "name");

-- CreateIndex
CREATE INDEX "businesses_image_idx" ON "businesses"("image");

-- CreateIndex
CREATE INDEX "businesses_logo_idx" ON "businesses"("logo");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_category_id_idx" ON "products"("category_id");

-- CreateIndex
CREATE INDEX "products_image_idx" ON "products"("image");

-- CreateIndex
CREATE INDEX "products_published_display_order_name_id_idx" ON "products"("published", "display_order", "name", "id");

-- CreateIndex
CREATE INDEX "products_published_featured_display_order_name_id_idx" ON "products"("published", "featured", "display_order", "name", "id");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_name_key" ON "product_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_slug_key" ON "product_categories"("slug");

-- CreateIndex
CREATE INDEX "product_images_product_id_display_order_idx" ON "product_images"("product_id", "display_order");

-- CreateIndex
CREATE INDEX "product_images_path_idx" ON "product_images"("path");

-- CreateIndex
CREATE UNIQUE INDEX "product_images_product_id_path_key" ON "product_images"("product_id", "path");

-- CreateIndex
CREATE INDEX "inquiries_status_created_at_idx" ON "inquiries"("status", "created_at");

-- CreateIndex
CREATE INDEX "inquiries_updated_at_id_idx" ON "inquiries"("updated_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "site_settings_singleton_key" ON "site_settings"("singleton");

-- CreateIndex
CREATE INDEX "site_settings_brand_logo_idx" ON "site_settings"("brand_logo");

-- CreateIndex
CREATE INDEX "site_settings_ceo_portrait_idx" ON "site_settings"("ceo_portrait");

-- CreateIndex
CREATE INDEX "social_links_scope_display_order_label_idx" ON "social_links"("scope", "display_order", "label");

-- CreateIndex
CREATE INDEX "activity_logs_actor_id_created_at_idx" ON "activity_logs"("actor_id", "created_at");

-- CreateIndex
CREATE INDEX "activity_logs_resource_resource_id_created_at_idx" ON "activity_logs"("resource", "resource_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_url_key" ON "media_assets"("url");

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_cloudinary_id_key" ON "media_assets"("cloudinary_id");

-- CreateIndex
CREATE INDEX "media_assets_orphaned_at_deleted_at_idx" ON "media_assets"("orphaned_at", "deleted_at");

-- CreateIndex
CREATE INDEX "inquiry_rate_limits_hour_idx" ON "inquiry_rate_limits"("hour");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_image_fkey" FOREIGN KEY ("image") REFERENCES "media_assets"("url") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_logo_fkey" FOREIGN KEY ("logo") REFERENCES "media_assets"("url") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_image_fkey" FOREIGN KEY ("image") REFERENCES "media_assets"("url") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_path_fkey" FOREIGN KEY ("path") REFERENCES "media_assets"("url") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_brand_logo_fkey" FOREIGN KEY ("brand_logo") REFERENCES "media_assets"("url") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_ceo_portrait_fkey" FOREIGN KEY ("ceo_portrait") REFERENCES "media_assets"("url") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Business invariants enforced independently of the application.
ALTER TABLE "users" ADD CONSTRAINT "users_clerk_id_format" CHECK ("clerk_id" IS NULL OR "clerk_id" ~ '^user_[A-Za-z0-9]+$');
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_slug_check" CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
ALTER TABLE "businesses" ALTER COLUMN "capabilities" SET NOT NULL;
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_slug_check" CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
ALTER TABLE "products"
  ADD CONSTRAINT "products_slug_check" CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  ADD CONSTRAINT "products_amazon_url_check" CHECK ("amazon_url" ~* '^https://(www\.)?amazon\.com/([^/?#]+/)?(dp|gp/product)/[a-z0-9]{10}/?([?#].*)?$'),
  ADD CONSTRAINT "products_price_check" CHECK ("price" >= 0),
  ADD CONSTRAINT "products_currency_check" CHECK ("currency" ~ '^[A-Z]{3}$'),
  ADD CONSTRAINT "products_published_media_check" CHECK (NOT "published" OR ("image" IS NOT NULL AND length(btrim("image_alt")) > 0 AND "category_id" IS NOT NULL));
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_alt_check" CHECK (length(btrim("alt")) BETWEEN 1 AND 240);
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_singleton_check" CHECK ("singleton");
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_body_check" CHECK (length(btrim("name")) BETWEEN 2 AND 120 AND length(btrim("message")) BETWEEN 15 AND 4000);
ALTER TABLE "inquiry_rate_limits" ADD CONSTRAINT "inquiry_rate_limits_hits_check" CHECK ("hits" > 0);
