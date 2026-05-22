import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface CategoryHeaderProps {
  category: string;
}

const CategoryHeader = ({ category }: CategoryHeaderProps) => {
  const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
  
  return (
    <section className="w-full px-4 md:px-6 mb-6 md:mb-8">
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="py-2 inline-flex items-center min-h-[44px] md:min-h-0">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="py-2">{capitalizedCategory}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
        <div>
          <h1 className="text-3xl md:text-4xl font-light text-foreground">
            {capitalizedCategory}
          </h1>
        </div>
    </section>
  );
};

export default CategoryHeader;
