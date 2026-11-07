import { useEffect } from "react";
import { useAppConfig } from "../../hooks/useAppConfig";

export interface MetaHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogType?: "website" | "article" | "profile";
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

const DEFAULT_DESCRIPTION =
  "An advanced AI conversation platform with multi-provider model support.";

export default function MetaHead({
  title,
  description,
  keywords,
  ogType = "website",
  ogImage,
  canonicalUrl,
  noIndex = false,
}: MetaHeadProps) {
  const { config } = useAppConfig();
  const siteName = config.appName || "MKK Agent";
  const activeDesc = description || `${siteName} - ${DEFAULT_DESCRIPTION}`;
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const currentUrl =
    canonicalUrl || (typeof window !== "undefined" ? window.location.href : undefined);

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to safely update or append meta tags in document.head
    const setMetaTag = (attr: "name" | "property", key: string, content?: string | null) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!content) {
        if (el) el.remove();
        return;
      }
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMetaTag("name", "description", activeDesc);
    if (keywords) setMetaTag("name", "keywords", keywords);
    setMetaTag("name", "robots", noIndex ? "noindex, nofollow" : "index, follow");

    // OpenGraph
    setMetaTag("property", "og:title", fullTitle);
    setMetaTag("property", "og:description", activeDesc);
    setMetaTag("property", "og:type", ogType);
    setMetaTag("property", "og:site_name", siteName);
    if (currentUrl) setMetaTag("property", "og:url", currentUrl);
    if (ogImage) setMetaTag("property", "og:image", ogImage);

    // Twitter
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", fullTitle);
    setMetaTag("name", "twitter:description", activeDesc);
    if (ogImage) setMetaTag("name", "twitter:image", ogImage);

    // Canonical link
    if (currentUrl) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = currentUrl;
    }
  }, [fullTitle, activeDesc, keywords, ogType, ogImage, currentUrl, noIndex, siteName]);

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={activeDesc} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={activeDesc} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={siteName} />
      {currentUrl && <meta property="og:url" content={currentUrl} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={activeDesc} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {currentUrl && <link rel="canonical" href={currentUrl} />}
    </>
  );
}
