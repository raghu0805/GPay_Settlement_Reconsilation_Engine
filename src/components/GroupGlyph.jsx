import { HiGlobeAlt, HiRocketLaunch, HiShieldCheck, HiSparkles } from 'react-icons/hi2';

const iconMap = {
  globe: HiGlobeAlt,
  rocket: HiRocketLaunch,
  shield: HiShieldCheck,
  sparkles: HiSparkles,
};

export function GroupGlyph({ icon = 'sparkles', className = '' }) {
  const Icon = iconMap[icon] ?? HiSparkles;

  return <Icon className={className} />;
}
