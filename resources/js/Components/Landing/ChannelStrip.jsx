import { motion } from 'framer-motion';
import { EASE_OUT } from '@/Components/UI/Motion';
import { FacebookIcon, InstagramIcon, TiktokIcon, WhatsappIcon } from '@/Components/UI/BrandIcons';
import { OperatorLogo } from '@/Components/Landing/Illustrations';
import { COUNTRIES, OPERATOR_NAMES } from '@/Components/Landing/Countries';
import { Section } from '@/Components/Landing/Frame';

const SOCIALS = [
    [WhatsappIcon, '#25D366', 'WhatsApp'],
    [InstagramIcon, '#E1306C', 'Instagram'],
    [TiktokIcon, '#141412', 'TikTok'],
    [FacebookIcon, '#1877F2', 'Facebook'],
];

// Chaque opérateur avec les pays où il est prévu (le pays ouvert en premier)
const OPERATORS = Object.keys(OPERATOR_NAMES).map((op) => ({
    op,
    countries: COUNTRIES.filter((c) => c.ops.includes(op)).sort((a, b) => Number(!!b.live) - Number(!!a.live)),
})).sort((a, b) => b.countries.length - a.countries.length);

/** Bande sous le hero : réseaux où vendre, puis tous les opérateurs Mobile Money des pays couverts. */
export default function ChannelStrip() {
    return (
        <Section top={false} className="bg-white py-12">
            <div className="grid items-center gap-8 lg:grid-cols-[auto_1fr] lg:gap-12">
                <div>
                    <p className="text-[13px] text-[#8B8A83]">Vendez sur</p>
                    <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
                        {SOCIALS.map(([Icon, color, name], i) => (
                            <motion.li key={name} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, ease: EASE_OUT }}
                                className="flex items-center gap-2 text-[15px] font-medium text-[#3D3C37]">
                                <Icon className="h-5 w-5" style={{ color }} /> {name}
                            </motion.li>
                        ))}
                    </ul>
                </div>
                <div className="lg:border-l lg:border-black/[0.07] lg:pl-12">
                    <p className="text-[13px] text-[#8B8A83]">Encaissez avec le Mobile Money de vos clients · <span className="text-[#141412]">disponible au Cameroun</span>, {COUNTRIES.length - 1} autres pays bientôt</p>
                    <ul className="mt-3 flex flex-wrap gap-2.5">
                        {OPERATORS.map(({ op, countries }, i) => {
                            const isLive = countries.some((c) => c.live);
                            return (
                                <motion.li key={op} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.05, ease: EASE_OUT }}
                                    whileHover={{ y: -2 }} title={countries.map((c) => c.name).join(', ')}
                                    className={`flex items-center gap-2.5 rounded-full border py-1 pl-1 pr-3 ${isLive ? 'border-[#FFCC00]/70 bg-[#FFFCEF]' : 'border-black/[0.08] bg-white'}`}>
                                    <OperatorLogo op={op} className="h-7 w-7" />
                                    <span className="text-[13px] font-medium text-[#3D3C37]">{OPERATOR_NAMES[op]}</span>
                                    <span className="flex items-center -space-x-1">
                                        {countries.slice(0, 5).map((c) => (
                                            <img key={c.code} src={`/images/flags/${c.code}.svg`} alt="" className={`h-[18px] w-[18px] rounded-full object-cover ring-2 ring-white ${c.live ? '' : 'opacity-60 grayscale-[30%]'}`} />
                                        ))}
                                        {countries.length > 5 && <span className="!ml-1 text-[11px] text-[#8B8A83]">+{countries.length - 5}</span>}
                                    </span>
                                </motion.li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </Section>
    );
}
