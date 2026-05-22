import Layout from "@/components/layout/Layout";
import EditorialHero from "../components/homepage/EditorialHero";
import ValueStackBanner from "../components/homepage/ValueStackBanner";
import FeaturedDrop from "../components/homepage/FeaturedDrop";
import CategoryTiles from "../components/homepage/CategoryTiles";
import MarqueeStrip from "../components/homepage/MarqueeStrip";
import MissionBlock from "../components/homepage/MissionBlock";
import DropGrid from "../components/homepage/DropGrid";
import FeaturedCollection from "../components/homepage/FeaturedCollection";
import TestimonySpotlight from "../components/homepage/TestimonySpotlight";
import InstagramFeed from "../components/homepage/InstagramFeed";
import MobileStickyBar from "../components/homepage/MobileStickyBar";
import RecentlyViewed from "../components/homepage/RecentlyViewed";

const Index = () => {
  return (
    <Layout immersiveHero>
      {/* Editorial Hero - Asymmetric split layout */}
      <EditorialHero />
      
      {/* Value Strip - Compressed single line */}
      <ValueStackBanner />
      
      {/* Recently Viewed - Show for return visitors */}
      <RecentlyViewed 
        maxItems={8} 
        title="Continue Shopping"
        className="mt-8 lg:mt-12"
      />
      
      {/* Featured Drop - Magazine spread */}
      <FeaturedDrop />
      
      {/* Category Tiles - 032c asymmetric grid */}
      <CategoryTiles />
      
      {/* Social Proof Marquee */}
      <MarqueeStrip />
      
      {/* Bestsellers Grid */}
      <FeaturedCollection />
      
      {/* Mission Block - Full-bleed editorial */}
      <MissionBlock />
      
      {/* New Arrivals - Drop culture grid */}
      <DropGrid />
      
      {/* Testimony - i-D portrait style */}
      <TestimonySpotlight />
      
      {/* Instagram Collage */}
      <InstagramFeed />
      
      <MobileStickyBar />
    </Layout>
  );
};

export default Index;
