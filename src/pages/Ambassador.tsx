import Layout from "@/components/layout/Layout";
import AmbassadorHero from "@/components/ambassador/AmbassadorHero";
import AmbassadorBenefits from "@/components/ambassador/AmbassadorBenefits";
import AmbassadorRequirements from "@/components/ambassador/AmbassadorRequirements";
import AmbassadorForm from "@/components/ambassador/AmbassadorForm";
import CurrentAmbassadors from "@/components/ambassador/CurrentAmbassadors";

const Ambassador = () => {
  return (
    <Layout>
      <AmbassadorHero />
      <CurrentAmbassadors />
      <AmbassadorBenefits />
      <AmbassadorRequirements />
      <AmbassadorForm />
    </Layout>
  );
};

export default Ambassador;
