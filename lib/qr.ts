export const BRANCH_SLUGS = ["nablus", "jenin"] as const;

export function isBranchSlug(value: string): value is "nablus" | "jenin" {
  return value === "nablus" || value === "jenin";
}

export function qrCatalog(origin: string) {
  return [
    {
      id: "home",
      titleAr: "اختيار الفرع",
      titleEn: "Branch picker",
      hint: "الرابط العام — الزبون يختار نابلس أو جنين",
      path: "/",
      url: origin,
    },
    {
      id: "nablus-links",
      titleAr: "روابط نابلس",
      titleEn: "Nablus linktree",
      hint: "فيسبوك، إنستغرام، تيك توك، واتساب، والمنيو",
      path: "/nablus",
      url: `${origin}/nablus`,
    },
    {
      id: "jenin-links",
      titleAr: "روابط جنين",
      titleEn: "Jenin linktree",
      hint: "فيسبوك، إنستغرام، تيك توك، واتساب، والمنيو",
      path: "/jenin",
      url: `${origin}/jenin`,
    },
    {
      id: "nablus-order",
      titleAr: "منيو نابلس للطلب",
      titleEn: "Nablus order menu",
      hint: "الزبون يختار الحجم والكمية ويضيف للسلة",
      path: "/nablus/menu",
      url: `${origin}/nablus/menu`,
    },
    {
      id: "jenin-order",
      titleAr: "منيو جنين للطلب",
      titleEn: "Jenin order menu",
      hint: "الزبون يختار الحجم والكمية ويضيف للسلة",
      path: "/jenin/menu",
      url: `${origin}/jenin/menu`,
    },
    {
      id: "nablus-view",
      titleAr: "منيو نابلس للطاولة",
      titleEn: "Nablus table menu",
      hint: "عرض فقط داخل المطعم — بدون سلة",
      path: "/view/nablus",
      url: `${origin}/view/nablus`,
    },
    {
      id: "jenin-view",
      titleAr: "منيو جنين للطاولة",
      titleEn: "Jenin table menu",
      hint: "عرض فقط داخل المطعم — بدون سلة",
      path: "/view/jenin",
      url: `${origin}/view/jenin`,
    },
  ];
}
