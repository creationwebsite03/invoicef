import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
}

const SEO: React.FC<SEOProps> = ({ title, description, keywords }) => {
  useEffect(() => {
    const baseTitle = "Invoice Generator";
    const tagline = "Free Professional Invoice Generator";
    let finalTitle = "";
    
    if (title.includes(baseTitle)) {
      finalTitle = title;
    } else {
      finalTitle = `${title} | ${baseTitle} - ${tagline}`;
    }
    
    document.title = finalTitle;
    try {
      localStorage.setItem('last_seo_title', finalTitle);
    } catch (e) {}

    // Use MutationObserver for bulletproof title stability against Google Translate
    const observer = new MutationObserver(() => {
      if (document.title !== finalTitle) {
        document.title = finalTitle;
      }
    });

    observer.observe(document.querySelector('title')!, { childList: true, subtree: true, characterData: true });
    
    // Update description meta tag
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Update keywords meta tag
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    if (keywords) {
      metaKeywords.setAttribute('content', keywords);
    }

    return () => observer.disconnect();
  }, [title, description, keywords]);

  return null;
};

export default SEO;
