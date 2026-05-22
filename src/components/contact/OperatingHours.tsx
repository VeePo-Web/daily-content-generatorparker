import { cn } from "@/lib/utils";

interface HoursRow {
  day: string;
  email: string;
  phone: string;
  chat: string;
}

const schedule: HoursRow[] = [
  { day: "Monday", email: "9am–9pm", phone: "9am–6pm", chat: "9am–6pm" },
  { day: "Tuesday", email: "9am–9pm", phone: "9am–6pm", chat: "9am–6pm" },
  { day: "Wednesday", email: "9am–9pm", phone: "9am–6pm", chat: "9am–6pm" },
  { day: "Thursday", email: "9am–9pm", phone: "9am–6pm", chat: "9am–6pm" },
  { day: "Friday", email: "9am–9pm", phone: "9am–6pm", chat: "9am–6pm" },
  { day: "Saturday", email: "10am–6pm", phone: "10am–4pm", chat: "Closed" },
  { day: "Sunday", email: "Closed", phone: "Closed", chat: "Closed" },
];

const OperatingHours = () => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-medium text-xs tracking-widest text-muted-foreground">
              DAY
            </th>
            <th className="text-left py-3 px-4 font-medium text-xs tracking-widest text-muted-foreground">
              EMAIL
            </th>
            <th className="text-left py-3 px-4 font-medium text-xs tracking-widest text-muted-foreground">
              PHONE
            </th>
            <th className="text-left py-3 px-4 font-medium text-xs tracking-widest text-muted-foreground">
              LIVE CHAT
            </th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((row, index) => (
            <tr 
              key={row.day} 
              className={cn(
                "border-b border-border/50",
                index === schedule.length - 1 && "border-b-0"
              )}
            >
              <td className="py-3 px-4 font-medium">{row.day}</td>
              <td className={cn(
                "py-3 px-4",
                row.email === "Closed" ? "text-muted-foreground" : "text-foreground"
              )}>
                {row.email}
              </td>
              <td className={cn(
                "py-3 px-4",
                row.phone === "Closed" ? "text-muted-foreground" : "text-foreground"
              )}>
                {row.phone}
              </td>
              <td className={cn(
                "py-3 px-4",
                row.chat === "Closed" ? "text-muted-foreground" : "text-foreground"
              )}>
                {row.chat}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-muted-foreground mt-4 px-4">
        All times shown in Eastern Time (ET). Response times may vary during holidays.
      </p>
    </div>
  );
};

export default OperatingHours;
