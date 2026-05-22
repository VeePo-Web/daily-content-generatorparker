/**
 * Line of Judah - Centralized Brand Configuration
 * 
 * Single source of truth for all brand identity, contact info,
 * social handles, trust signals, and configurable content.
 * 
 * Update this file to propagate changes across the entire site.
 */

export const BRAND = {
  // ═══════════════════════════════════════════════════════════
  // CORE IDENTITY
  // ═══════════════════════════════════════════════════════════
  name: "Line of Judah",
  shortName: "LOJ",
  tagline: "For those who walk different",
  legalEntity: "Line of Judah LLC",
  foundedYear: 2024,
  
  // ═══════════════════════════════════════════════════════════
  // CONTACT INFORMATION
  // ═══════════════════════════════════════════════════════════
  email: {
    support: "hello@lineofjudah.com",
    legal: "legal@lineofjudah.com",
    press: "press@lineofjudah.com",
  },
  
  // ═══════════════════════════════════════════════════════════
  // SOCIAL MEDIA
  // ═══════════════════════════════════════════════════════════
  social: {
    instagram: {
      handle: "@lineofjudahwear",
      url: "https://instagram.com/lineofjudahwear",
    },
    tiktok: {
      handle: "@lineofjudah",
      url: "https://tiktok.com/@lineofjudah",
    },
    youtube: {
      handle: "@lineofjudah",
      url: "https://youtube.com/@lineofjudah",
    },
    twitter: {
      handle: "@lineofjudah",
      url: "https://twitter.com/lineofjudah",
    },
  },
  
  // ═══════════════════════════════════════════════════════════
  // STATS & SOCIAL PROOF
  // Replace with real numbers when available
  // Set to null to hide from UI
  // ═══════════════════════════════════════════════════════════
  stats: {
    customers: null as string | null, // e.g., "10,000+" when verified
    countries: null as number | null, // e.g., 5 when verified
    cities: null as number | null,    // e.g., 45 when verified
    reviews: null as number | null,   // e.g., 500 when verified
    rating: 4.9,                       // Average star rating
  },
  
  // ═══════════════════════════════════════════════════════════
  // TRUST SIGNALS & POLICIES
  // ═══════════════════════════════════════════════════════════
  trust: {
    freeShippingThreshold: 99, // USD
    returnDays: 30,
    warrantyDays: 365,
    exchangeDays: 30,
  },
  
  // ═══════════════════════════════════════════════════════════
  // PROMOTIONAL CONFIG
  // ═══════════════════════════════════════════════════════════
  promo: {
    discountPrefix: "LOJ",
    statusBarMessage: "Free shipping on orders $99+",
    // Set to null to disable status bar promo
    currentPromo: null as string | null,
  },
  
  // ═══════════════════════════════════════════════════════════
  // SEO & META
  // ═══════════════════════════════════════════════════════════
  seo: {
    defaultTitle: "Line of Judah | Premium Faith-Based Streetwear",
    defaultDescription: "For those who walk different. Premium streetwear that speaks to your faith without saying a word.",
    ogImage: "/og-line-of-judah.png", // 1200x630px
  },
  
  // ═══════════════════════════════════════════════════════════
  // TESTIMONIALS
  // Replace with real customer testimonials when available
  // ═══════════════════════════════════════════════════════════
  testimonials: {
    marquee: [
      { quote: "Finally, a brand that gets it.", name: "Marcus T.", rating: 5 },
      { quote: "The quality is insane.", name: "Sarah M.", rating: 5 },
      { quote: "Premium quality, meaningful designs.", name: "David K.", rating: 5 },
      { quote: "My whole youth group loves them.", name: "Michelle R.", rating: 5 },
      { quote: "Worth every penny.", name: "James L.", rating: 5 },
      { quote: "This isn't just clothing, it's armor.", name: "Priscilla W.", rating: 5 },
    ],
    spotlight: {
      name: "Marcus T.",
      title: "Youth Pastor",
      location: "Atlanta, GA",
      quote: "I've tried so many 'Christian' brands over the years, and they all felt like wearing a billboard. Line of Judah is different. When I put on the Stay Holy hoodie for the first time, it just felt right. The quality rivals anything at the mall, and the message is subtle but powerful. My youth group noticed immediately—not because I was 'preaching at them' with my clothes, but because it sparked genuine conversations. That's the difference. This isn't just clothing. It's ministry in motion.",
      image: null as string | null, // Add customer photo URL when available
    },
  },
} as const;

// Type exports for use in components
export type BrandConfig = typeof BRAND;
export type SocialPlatform = keyof typeof BRAND.social;
export type Testimonial = typeof BRAND.testimonials.marquee[number];
