import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MEDIA } from '@/data/media';

interface SEOProps {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article';
    noindex?: boolean;
}

const DEFAULT_KEYWORDS = "USA NGO, US Charity, 501c3 Nonprofit, International Development, Patel Foundation USA, Donate from USA, Tax Deductible Charity, Global Impact, Rural Education India, Healthcare NGO";

const SEO = ({ 
    title, 
    description, 
    keywords = DEFAULT_KEYWORDS,
    image = MEDIA.brand.logoFull, 
    url,
    type = 'website',
    noindex = false
}: SEOProps) => {
    const location = useLocation();
    const siteUrl = "https://mypatelfoundation.org"; // Replace with your final production domain
    const currentUrl = url || `${siteUrl}${location.pathname}`;
    const fullTitle = `${title} | Patel Foundation`;

    useEffect(() => {
        // 1. Core Meta
        document.title = fullTitle;

        const updateMeta = (nameOrProperty: string, content: string, attr = 'name') => {
            let element = document.querySelector(`meta[${attr}="${nameOrProperty}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attr, nameOrProperty);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        const updateLink = (rel: string, href: string) => {
            let element = document.querySelector(`link[rel="${rel}"]`);
            if (!element) {
                element = document.createElement('link');
                element.setAttribute('rel', rel);
                document.head.appendChild(element);
            }
            element.setAttribute('href', href);
        };

        // Standard
        updateMeta('description', description);
        updateMeta('keywords', keywords);
        updateMeta('author', 'Patel Foundation');
        updateMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');
        updateLink('canonical', currentUrl);

        // Open Graph
        updateMeta('og:title', fullTitle, 'property');
        updateMeta('og:description', description, 'property');
        updateMeta('og:type', type, 'property');
        updateMeta('og:url', currentUrl, 'property');
        updateMeta('og:image', image, 'property');
        updateMeta('og:site_name', 'Patel Foundation', 'property');

        // Twitter
        updateMeta('twitter:card', 'summary_large_image');
        updateMeta('twitter:title', fullTitle);
        updateMeta('twitter:description', description);
        updateMeta('twitter:image', image);
        updateMeta('twitter:url', currentUrl);

        // --- Structured Data (JSON-LD) ---
        // 1. Remove existing LD+JSON
        const existingScript = document.getElementById('schema-org-jsonld');
        if (existingScript) existingScript.remove();

        // 2. Add New LD+JSON
        const script = document.createElement('script');
        script.id = 'schema-org-jsonld';
        script.type = 'application/ld+json';
        
        const jsonLd = {
            "@context": "https://schema.org",
            "@type": "NGO",
            "name": "Patel Foundation (USA)",
            "url": siteUrl,
            "logo": `${siteUrl}/assets/patel-foundation-logo.png`,
            "description": "A US-based 501(c)(3) nonprofit empowering communities through education, healthcare, and sustainable development.",
            "taxID": "XX-XXXXXXX", // User should provide actual EIN if available
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "USA"
            },
            "sameAs": [
              "https://www.facebook.com/patelfoundation",
              "https://twitter.com/patelfoundation",
              "https://www.instagram.com/patelfoundation"
            ]
        };

        script.text = JSON.stringify(jsonLd);
        document.head.appendChild(script);

    }, [fullTitle, description, keywords, image, currentUrl, type, noindex]);

    return null;
};

export default SEO;
