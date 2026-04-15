import { motion } from 'framer-motion';

interface PageHeaderProps {
    title: string;
    subtitle: string;
    backgroundImage?: string;
}

const PageHeader = ({ title, subtitle, backgroundImage }: PageHeaderProps) => {
    return (
        <section className="relative h-[40vh] min-h-[400px] flex items-center justify-center overflow-hidden">
            {/* Background Image / Pattern */}
            <div className="absolute inset-0 bg-secondary/30">
                {backgroundImage && (
                    <img
                        src={backgroundImage}
                        alt={title}
                        className="w-full h-full object-cover opacity-50"
                    />
                )}
                <div className="absolute inset-0 bg-hero-pattern opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            </div>

            <div className="container relative z-10 px-6 lg:px-12 text-center mt-20">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-display mb-6"
                >
                    {title}
                </motion.h1>

                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100px' }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="h-1 bg-primary mx-auto mb-6"
                />

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-subhead max-w-2xl mx-auto"
                >
                    {subtitle}
                </motion.p>
            </div>
        </section>
    );
};

export default PageHeader;
