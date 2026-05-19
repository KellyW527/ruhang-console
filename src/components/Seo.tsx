import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://ruhang-console.pages.dev";
const SITE_NAME = "入行";
const DEFAULT_TITLE = "入行｜金融岗位真实任务模拟平台";
const DEFAULT_DESCRIPTION =
  "入行通过真实金融岗位任务、资料包、AI 上级反馈和作品集交付，帮助学生训练投行、PE/VC、并购和卖方研究等核心金融岗位能力。";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.svg`;

type SeoConfig = {
  title: string;
  description: string;
  path: string;
  robots?: string;
  type?: "website" | "article";
  structuredData?: Record<string, unknown>;
};

const publicPageSeo: Record<string, SeoConfig> = {
  "/": {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    path: "/",
    structuredData: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "EducationalOrganization",
          "@id": `${SITE_URL}/#organization`,
          name: SITE_NAME,
          alternateName: ["入行金融", "Ruhang"],
          url: SITE_URL,
          logo: `${SITE_URL}/favicon.ico`,
          description: DEFAULT_DESCRIPTION,
          sameAs: [],
        },
        {
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
          name: SITE_NAME,
          alternateName: ["入行金融岗位真实任务模拟平台", "Ruhang"],
          url: SITE_URL,
          inLanguage: "zh-CN",
          publisher: { "@id": `${SITE_URL}/#organization` },
          description: DEFAULT_DESCRIPTION,
        },
        {
          "@type": "ItemList",
          name: "入行金融职业任务模拟训练",
          itemListElement: [
            "入行投资银行 IPO 项目模拟",
            "入行私募股权与风险投资项目模拟",
            "入行并购买方项目模拟",
            "入行卖方研究报告项目模拟",
          ].map((name, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Course",
              name,
              provider: { "@id": `${SITE_URL}/#organization` },
            },
          })),
        },
      ],
    },
  },
  "/pricing": {
    title: "定价｜入行金融岗位模拟训练",
    description:
      "查看入行免费体验、基础会员、高级会员和单个项目额度价格，解锁投行、PE/VC、并购、卖方研究等金融实战项目。",
    path: "/pricing",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "入行金融岗位模拟训练",
      description:
        "真实金融岗位任务模拟、AI 上级反馈、能力报告与结业证书。",
      brand: { "@type": "Brand", name: SITE_NAME },
      offers: [
        { "@type": "Offer", name: "免费体验", price: "0", priceCurrency: "CNY" },
        { "@type": "Offer", name: "基础月度会员", price: "59", priceCurrency: "CNY" },
        { "@type": "Offer", name: "高级月度会员", price: "198", priceCurrency: "CNY" },
      ],
    },
  },
  "/demo": {
    title: "产品 Demo｜入行金融工作台预览",
    description:
      "体验入行金融工作台 Demo：接收 AI 上级任务、查看真实项目资料包、提交交付物并获得能力反馈。",
    path: "/demo",
  },
  "/privacy": {
    title: "隐私政策｜入行",
    description: "了解入行如何收集、使用、存储和保护用户账号、学习、支付及设备相关信息。",
    path: "/privacy",
    type: "article",
  },
  "/terms": {
    title: "服务条款｜入行",
    description: "查看入行账号、付费、退款、内容版权、使用规范及服务终止相关条款。",
    path: "/terms",
    type: "article",
  },
};

const noIndexSeo: Record<string, SeoConfig> = {
  "/login": {
    title: "登录｜入行",
    description: "登录入行账号，继续你的金融岗位模拟训练。",
    path: "/login",
    robots: "noindex, nofollow",
  },
  "/register": {
    title: "注册｜入行",
    description: "创建入行账号，免费开始金融岗位真实任务模拟。",
    path: "/register",
    robots: "noindex, nofollow",
  },
  "/reset-password": {
    title: "重置密码｜入行",
    description: "重置你的入行账号密码。",
    path: "/reset-password",
    robots: "noindex, nofollow",
  },
};

function upsertMeta(selector: string, create: () => HTMLMetaElement, value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = create();
    document.head.appendChild(element);
  }
  element.setAttribute("content", value);
}

function setNameMeta(name: string, content: string) {
  upsertMeta(
    `meta[name="${name}"]`,
    () => {
      const meta = document.createElement("meta");
      meta.setAttribute("name", name);
      return meta;
    },
    content,
  );
}

function setPropertyMeta(property: string, content: string) {
  upsertMeta(
    `meta[property="${property}"]`,
    () => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", property);
      return meta;
    },
    content,
  );
}

function setCanonical(url: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

function setStructuredData(data?: Record<string, unknown>) {
  const id = "page-structured-data";
  const existing = document.getElementById(id);

  if (!data) {
    existing?.remove();
    return;
  }

  const script = existing ?? document.createElement("script");
  script.id = id;
  script.setAttribute("type", "application/ld+json");
  script.textContent = JSON.stringify(data);
  if (!existing) document.head.appendChild(script);
}

function resolveSeo(pathname: string): SeoConfig {
  if (publicPageSeo[pathname]) return publicPageSeo[pathname];
  if (noIndexSeo[pathname]) return noIndexSeo[pathname];

  return {
    title: `${SITE_NAME}｜金融职业训练工作台`,
    description: DEFAULT_DESCRIPTION,
    path: pathname,
    robots: "noindex, nofollow",
  };
}

export function SeoMetaManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = resolveSeo(pathname);
    const canonicalUrl = `${SITE_URL}${seo.path}`;
    const robots = seo.robots ?? "index, follow, max-image-preview:large";

    document.documentElement.lang = "zh-CN";
    document.title = seo.title;

    setNameMeta("application-name", SITE_NAME);
    setNameMeta("description", seo.description);
    setNameMeta("robots", robots);
    setNameMeta("author", SITE_NAME);
    setNameMeta(
      "keywords",
      "金融实习,投行实习,PEVC实习,并购实习,卖方研究,金融求职,金融建模,行业研究,投委会Memo,金融职业训练",
    );
    setCanonical(canonicalUrl);

    setPropertyMeta("og:site_name", SITE_NAME);
    setPropertyMeta("og:locale", "zh_CN");
    setPropertyMeta("og:type", seo.type ?? "website");
    setPropertyMeta("og:title", seo.title);
    setPropertyMeta("og:description", seo.description);
    setPropertyMeta("og:url", canonicalUrl);
    setPropertyMeta("og:image", DEFAULT_IMAGE);
    setPropertyMeta("og:image:alt", "入行金融岗位真实任务模拟平台");

    setNameMeta("twitter:card", "summary_large_image");
    setNameMeta("twitter:title", seo.title);
    setNameMeta("twitter:description", seo.description);
    setNameMeta("twitter:image", DEFAULT_IMAGE);

    setStructuredData(seo.structuredData);
  }, [pathname]);

  return null;
}
