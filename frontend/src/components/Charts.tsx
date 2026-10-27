import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { revenueTrend, riskMix } from "../data/mock";

export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={revenueTrend}>
        <defs>
          <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6D5BFF" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#6D5BFF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#EEF2FF" />
        <XAxis dataKey="month" stroke="#94A3B8" />
        <YAxis stroke="#94A3B8" />
        <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #E5E7EB" }} />
        <Area type="monotone" dataKey="revenue" stroke="#6D5BFF" fill="url(#revenue)" strokeWidth={3} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ChurnLineChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={revenueTrend}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EEF2FF" />
        <XAxis dataKey="month" stroke="#94A3B8" />
        <YAxis stroke="#94A3B8" />
        <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #E5E7EB" }} />
        <Line type="monotone" dataKey="churn" stroke="#6D5BFF" strokeWidth={3} dot={{ r: 4, fill: "#6D5BFF" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CustomerBarChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={revenueTrend}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EEF2FF" />
        <XAxis dataKey="month" stroke="#94A3B8" />
        <YAxis stroke="#94A3B8" />
        <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #E5E7EB" }} />
        <Bar dataKey="customers" radius={[12, 12, 0, 0]} fill="#00D4FF" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RiskDonut() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie data={riskMix} dataKey="value" nameKey="name" innerRadius={64} outerRadius={92} paddingAngle={4}>
          {riskMix.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #E5E7EB" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function RetentionRadar() {
  const data = [
    { subject: "Support", score: 76 },
    { subject: "Contract", score: 91 },
    { subject: "Billing", score: 64 },
    { subject: "Usage", score: 72 },
    { subject: "Value", score: 83 }
  ];
  return (
    <ResponsiveContainer width="100%" height={250}>
      <RadarChart data={data}>
        <PolarGrid stroke="#EEF2FF" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: "#6B7280", fontSize: 12 }} />
        <PolarRadiusAxis tick={false} axisLine={false} />
        <Radar dataKey="score" stroke="#6D5BFF" fill="#6D5BFF" fillOpacity={0.22} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
