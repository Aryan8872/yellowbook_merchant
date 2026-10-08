"use client";
import { BarChart, Bar, Cell, XAxis, ResponsiveContainer } from "recharts";

export default function ActiveDayGraph({ data }: { data: { day: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data}>
        <XAxis dataKey="day" axisLine={false} tickLine={false} />
        <Bar dataKey="value" radius={12}>
          {data.map((d) => (
            <Cell key={d.day} fill={d.value === max ? "#3b82f6" : "#f3f4f6"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}