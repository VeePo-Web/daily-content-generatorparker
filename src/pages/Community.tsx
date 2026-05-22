import Layout from "@/components/layout/Layout";
import CommunityHero from "@/components/community/CommunityHero";
import StoryGrid from "@/components/community/StoryGrid";
import SocialFeed from "@/components/community/SocialFeed";
import SubmitStoryCTA from "@/components/community/SubmitStoryCTA";

export default function Community() {
  return (
    <Layout>
      <CommunityHero />
      <StoryGrid />
      <div className="h-px bg-border" />
      <SocialFeed />
      <div className="h-px bg-border" />
      <SubmitStoryCTA />
    </Layout>
  );
}
