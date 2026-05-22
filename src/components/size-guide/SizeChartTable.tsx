import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SizeData {
  size: string;
  chest: string;
  length: string;
  sleeve: string;
  isPopular?: boolean;
}

interface SizeChartTableProps {
  data: SizeData[];
  unit: "in" | "cm";
  className?: string;
}

const SizeChartTable = ({ data, unit, className }: SizeChartTableProps) => {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <Table>
        <TableHeader>
          <TableRow className="border-stone-300 dark:border-stone-700 hover:bg-transparent">
            <TableHead className="text-xs font-medium tracking-widest uppercase text-foreground">
              Size
            </TableHead>
            <TableHead className="text-xs font-medium tracking-widest uppercase text-foreground">
              Chest ({unit})
            </TableHead>
            <TableHead className="text-xs font-medium tracking-widest uppercase text-foreground">
              Length ({unit})
            </TableHead>
            <TableHead className="text-xs font-medium tracking-widest uppercase text-foreground">
              Sleeve ({unit})
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow 
              key={row.size} 
              className={cn(
                "border-stone-200 dark:border-stone-800 transition-colors",
                row.isPopular && "bg-champagne-50/50 dark:bg-champagne-900/20"
              )}
            >
              <TableCell className="font-medium">
                <span className="flex items-center gap-2">
                  {row.size}
                  {row.isPopular && (
                    <Badge 
                      variant="secondary" 
                      className="bg-champagne-500 text-white text-[10px] px-1.5 py-0 font-medium tracking-wider hover:bg-champagne-500"
                    >
                      POPULAR
                    </Badge>
                  )}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">{row.chest}</TableCell>
              <TableCell className="text-muted-foreground">{row.length}</TableCell>
              <TableCell className="text-muted-foreground">{row.sleeve}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SizeChartTable;
