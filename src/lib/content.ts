export type Business = {
  id: string; slug: string; name: string; label: string; location: string;
  description: string; overview: string; capabilities: string[]; image: string;
  image_alt: string; logo: string | null; external_url: string | null; display_order: number;
};
export type Category = { id: string; name: string; slug: string };
export type ProductImage = { id: string; path: string; alt: string; display_order: number };
export type Product = {
  id: string; name: string; slug: string; short_description: string; description: string;
  image: string | null; image_alt: string; category_id: string | null; amazon_url: string;
  price: number | null; currency: string; featured: boolean; published: boolean; display_order: number;
  created_at: string; updated_at: string; product_categories: Category | null; product_images: ProductImage[];
};
export type Settings = {
  company_name: string; introduction: string; positioning: string; brand_logo: string | null;
  contact_email: string | null; contact_phone: string | null; footer_text: string;
  seo_title: string; seo_description: string; ceo_name: string; ceo_designation: string;
  ceo_bio: string; ceo_vision: string; ceo_portrait: string | null;
};
export type Social = { id: string; scope: 'company' | 'ceo'; label: string; url: string; display_order: number };
export const settings: Settings = {
  company_name: 'RAFIUL ANAM LLC',
  introduction: 'RAFIUL ANAM LLC is a diversified entrepreneurial organization building and supporting businesses across e-commerce, logistics, and technology. Through its growing business ecosystem, the company connects commercial opportunities, operational capabilities, and digital innovation across international markets.',
  positioning: 'Building Businesses. Connecting Markets. Creating Digital Solutions.',
  brand_logo: null, contact_email: null, contact_phone: null, footer_text: 'Building businesses across e-commerce, logistics, and technology.',
  seo_title: 'RAFIUL ANAM LLC', seo_description: 'An entrepreneurial organization connecting e-commerce, logistics, and technology through a growing ecosystem of independent businesses.',
  ceo_name: 'Rafiul Anam', ceo_designation: 'Founder & CEO',
  ceo_bio: 'Rafiul Anam is the founder and CEO of RAFIUL ANAM LLC. He leads the company’s work across e-commerce, logistics, and technology.',
  ceo_vision: 'His entrepreneurial focus brings together online commerce, delivery operations, and software development. The aim is to build independent businesses with a clear purpose in the markets they serve.',
  ceo_portrait: '/media/rafiul-anam-business-casual.webp',
};
export const businesses: Business[] = [
  { id: 'ecommerce', slug: 'ecommerce', name: 'E-commerce & Amazon Marketplace', label: 'E-commerce', location: 'United States',
    description: 'Bringing selected products to customers through the Amazon United States marketplace.',
    overview: 'Our e-commerce business presents selected products available through Amazon USA. Browse the catalogue for product information and follow the product link to its Amazon listing.',
    capabilities: ['Amazon USA marketplace', 'Selected product catalogue', 'Product information and availability'],
    image: '/media/ecommerce.webp', image_alt: 'Illustrative photograph of unbranded shipping boxes', logo: null, external_url: null, display_order: 10 },
  { id: 'anamigo-fleet', slug: 'anamigo-fleet', name: 'ANAMIGO Fleet', label: 'Logistics', location: 'Spain',
    description: 'ANAMIGO Fleet represents our logistics and delivery fleet business in Spain, focused on organized fleet operations and delivery partnerships.',
    overview: 'ANAMIGO Fleet is the business in the RAFIUL ANAM LLC ecosystem focused on logistics in Spain. Its work centers on coordinating delivery fleets and developing delivery partnerships.',
    capabilities: ['Fleet operations', 'Delivery coordination', 'Delivery partnerships'],
    image: '/media/fleet.webp', image_alt: 'Illustrative photograph of a delivery van at a loading bay', logo: null, external_url: null, display_order: 20 },
  { id: 'anamsoft', slug: 'anamsoft', name: 'ANAMSOFT', label: 'Technology', location: 'International / Remote',
    description: 'ANAMSOFT represents our technology and software development business, providing modern digital solutions, websites, applications, and digital products.',
    overview: 'ANAMSOFT is the technology business in the RAFIUL ANAM LLC ecosystem. Its focus spans software development, web applications, and digital products such as templates.',
    capabilities: ['Software development', 'Websites and web applications', 'Digital products and templates'],
    image: '/media/technology.webp', image_alt: 'Illustrative photograph of a blue-lit semiconductor board', logo: null, external_url: null, display_order: 30 },
  { id: 'anamcart', slug: 'anamcart', name: 'ANAMCART', label: 'E-commerce marketplace', location: 'Bangladesh',
    description: 'ANAMCART is our Bangladesh-based multi-category e-commerce marketplace, bringing different product categories together through one convenient online shopping destination.',
    overview: 'ANAMCART is part of the RAFIUL ANAM LLC business ecosystem. Visit ANAMCART to browse the marketplace and shop directly on its official website.',
    capabilities: ['Multi-category online shopping', 'Bangladesh marketplace'],
    image: '/media/ecommerce.webp', image_alt: 'Illustrative photograph of unbranded shipping boxes', logo: null, external_url: 'https://anamcart.com', display_order: 40 },
];
export const inquiryKinds = ['General inquiry', 'Business partnership', 'E-commerce', 'ANAMIGO Fleet', 'ANAMSOFT', 'ANAMCART'] as const;
export const inquiryStatuses = ['new', 'in_progress', 'closed'] as const;
