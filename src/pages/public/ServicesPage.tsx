import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, ArrowRight, ShieldCheck, CheckCircle2, Search, Filter } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SeoHead } from '../../components/shared/SeoHead';
import { fadeInUp, staggerContainer, cardHoverProps } from '../../lib/animations';

export const ServicesPage: React.FC = () => {
  const { enabledServices } = useSettings();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique categories
  const categories = ['all', ...Array.from(new Set(enabledServices.map((s) => s.category)))];

  const filteredServices = enabledServices.filter((service) => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesQuery =
      searchQuery.trim() === '' ||
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.symptoms.some((symp) => symp.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="bg-brand-light min-h-screen py-10 sm:py-16">
      <SeoHead
        title="Smartphone Repair Services | Dunlop, Kolkata"
        description="Comprehensive Android and iPhone repair services at Bhajan Complex, 139 B.T. Road, Dunlop, Kolkata 700108. Screen replacement, battery replacement, charging port repair, and motherboard diagnostics."
        canonicalPath="/services"
        keywords="phone repair services Dunlop, mobile repairing Kolkata, screen replacement Dunlop 700108, battery repair Baranagar, mobile charging port Bonhooghly, iPhone repair Belgharia"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Repair Services', url: '/services' },
        ]}
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-brand-orange uppercase tracking-wider">
            Diagnostic & Hardware Services
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-navy tracking-tight">
            Our Mobile Repair Capabilities
          </h1>
          <p className="text-sm sm:text-base text-brand-secondary leading-relaxed">
            Every repair at Mobile Repairing House begins with an in-person physical and electrical diagnosis. We evaluate the problem and provide a clear, upfront estimate before commencing any work.
          </p>
        </motion.div>

        {/* Filter and Search Bar */}
        <motion.div
          variants={fadeInUp}
          className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-brand-border shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 max-w-4xl mx-auto"
        >
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${
                  selectedCategory === cat
                    ? 'bg-brand-navy text-white shadow-xs'
                    : 'text-brand-secondary hover:text-brand-navy bg-brand-light hover:bg-white border border-brand-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-brand-secondary absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search symptoms or services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-brand-light border border-brand-border rounded-xl text-xs text-brand-navy placeholder:text-brand-secondary focus:outline-none focus:border-brand-orange"
            />
          </div>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredServices.map((service) => (
              <motion.div
                key={service.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                {...cardHoverProps}
                className="bg-white rounded-3xl p-6 border border-brand-border shadow-xs hover:shadow-card-hover hover:border-brand-navy/30 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-brand-navy uppercase bg-brand-light px-2.5 py-1 rounded-full border border-brand-border">
                      {service.category}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Bench Tested
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-brand-navy group-hover:text-brand-orange transition-colors mb-2">
                    {service.title}
                  </h3>

                  <p className="text-xs text-brand-secondary leading-relaxed mb-4">
                    {service.shortDescription}
                  </p>

                  <div className="space-y-1.5 mb-5 border-t border-brand-border/60 pt-3">
                    <span className="text-[10px] font-bold text-brand-navy block uppercase tracking-wider">
                      Common Symptoms:
                    </span>
                    {service.symptoms.slice(0, 3).map((symp, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-brand-text">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-orange shrink-0 mt-0.5" />
                        <span className="truncate">{symp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-brand-border flex items-center justify-between">
                  <Link
                    to={`/services/${service.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-navy group-hover:text-brand-orange transition-colors"
                  >
                    <span>Full Diagnostic Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link to={`/repair-request?category=${encodeURIComponent(service.title)}`}>
                    <Button size="sm" variant="outline" className="text-xs py-1 px-3">
                      Enquire
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredServices.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border border-brand-border"
          >
            <Smartphone className="w-10 h-10 text-brand-secondary/40 mx-auto mb-3" />
            <h4 className="text-base font-bold text-brand-navy">No matching services found</h4>
            <p className="text-xs text-brand-secondary mt-1">
              Try adjusting your search terms or filter selection.
            </p>
          </motion.div>
        )}

        {/* Bottom Banner */}
        <motion.div
          variants={fadeInUp}
          className="bg-white rounded-3xl p-8 border border-brand-border shadow-xs max-w-4xl mx-auto text-center space-y-4"
        >
          <h3 className="text-xl font-bold text-brand-navy">
            Not sure what is wrong with your phone?
          </h3>
          <p className="text-xs sm:text-sm text-brand-secondary max-w-xl mx-auto leading-relaxed">
            Bring your phone directly to our shop in Bhajan Complex, Dunlop, or submit an online request with what you are experiencing. We will inspect it and advise you honestly.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link to="/repair-request">
              <Button size="md" variant="primary">
                Book Diagnostic Check
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="md" variant="outline">
                View Shop Directions
              </Button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
