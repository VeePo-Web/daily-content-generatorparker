import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="text-center max-w-md">
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-4 block">
            Page Not Found
          </span>
          <h1 className="text-6xl md:text-8xl font-light tracking-tight text-foreground mb-4">
            404
          </h1>
          <p className="text-lg text-muted-foreground font-light mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button asChild className="rounded-none">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
