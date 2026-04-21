import { motion } from "framer-motion";

const stats = [
  { value: "500+", label: "活跃学员" },
  { value: "3", label: "模拟线" },
  { value: "92%", label: "能力提升率" },
  { value: "4.9", label: "平均评分" },
];

export function StatBar() {
  return (
    <div className="glass-card py-8 px-6">
      <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center space-y-1"
          >
            <p className="text-3xl font-display font-bold text-primary">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
