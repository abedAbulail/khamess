export type BranchSlug = "nablus" | "jenin";
export type MenuChannel = "inside" | "outside";

export type SizeSeed = {
  label: "S" | "M" | "L" | "one";
  nameAr: string;
  price: number;
};

export type ItemSeed = {
  slug: string;
  nameAr: string;
  nameEn: string;
  description?: string;
  imageUrl?: string;
  sizes: SizeSeed[];
};

export type CategorySeed = {
  slug: string;
  nameAr: string;
  note?: string;
  items: ItemSeed[];
};

export type BranchSeed = {
  id: BranchSlug;
  slug: BranchSlug;
  nameAr: string;
  nameEn: string;
  city: string;
  address: string;
  phone: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  heroImage: string;
  founded: string;
};

function s(price: number): SizeSeed {
  return { label: "S", nameAr: "صغير", price };
}
function m(price: number): SizeSeed {
  return { label: "M", nameAr: "وسط", price };
}
function l(price: number): SizeSeed {
  return { label: "L", nameAr: "كبير", price };
}
function one(price: number): SizeSeed {
  return { label: "one", nameAr: "حجم واحد", price };
}
function sm(small: number, medium: number): SizeSeed[] {
  return [s(small), m(medium)];
}
function sml(small: number, medium: number, large: number): SizeSeed[] {
  return [s(small), m(medium), l(large)];
}
function i(
  slug: string,
  nameAr: string,
  nameEn: string,
  sizes: SizeSeed[],
  description?: string,
  imageUrl?: string,
): ItemSeed {
  return { slug, nameAr, nameEn, description, imageUrl, sizes };
}

export const insideCategories: CategorySeed[] = [
  {
    slug: "breakfast",
    nameAr: "مقبلات الإفطار",
    items: [
      i("hummus", "حمص", "Hummus", sm(10, 18)),
      i("hummus-meat", "حمص باللحمة", "Hummus with meat", sm(22, 35)),
      i("hummus-shawarma", "حمص بالشاورما", "Hummus with shawarma", sm(22, 35)),
      i("hummus-lamb", "حمص بلحمة خروف", "Hummus with lamb", sm(38, 50)),
      i("foul", "فول", "Foul", sm(10, 17)),
      i("msabaha", "مسبحة / قدسية", "Musabaha / Qudsia", sm(12, 18)),
      i("fatteh-nuts", "فتة بالمكسرات", "Fatteh with nuts", sm(15, 25)),
      i("fatteh-meat", "فتة باللحمة والمكسرات", "Fatteh with meat and nuts", sm(25, 40)),
      i("shami-fatteh", "فتة شامية بالصنوبر", "Shami fatteh with pine nuts", [s(40)]),
      i("eggplant-fatteh", "فتة باذنجان", "Eggplant fatteh", [s(12)]),
      i("potatoes", "بطاطا", "Potatoes", sm(12, 18)),
      i("shakshuka", "شكشوكة تركية", "Turkish shakshuka", [s(15)]),
      i("mixed-fried", "مقالي مشكل", "Mixed fried", [s(12)]),
      i("labneh-arugula", "لبنة بالجرجير", "Labneh with arugula", [s(8)]),
      i("kibbeh", "كبة شامية", "Shami kibbeh", [one(16)]),
      i("shami-salad-5", "سلطة شامية مشكلة عدد 5", "Mixed shami salad (5 pcs)", [one(15)]),
      i("liver", "كبدة مع دبس الرمان", "Liver with pomegranate molasses", [s(22)]),
      i("fried-cheese", "جبنة مقلية", "Fried cheese", [s(12)]),
      i("breaded-cheese", "جبنة بالقرشلة", "Breaded cheese", [s(15)]),
      i("sunny-eggs", "بيض عيون", "Sunny side up", [s(10)]),
      i("cheese-omelette", "اومليت جبنة", "Cheese omelette", [s(12)]),
      i("double-omelette", "عجة دبل", "Double omelette", [s(12)]),
      i("laban-mix", "خلطة باللبن", "Yogurt mix", [s(7)]),
      i("meat-tomato", "قلاية بندورة باللحمة", "Tomato pan with meat", [s(22)]),
      i("fried-tomato", "قلاية بندورة", "Tomato pan", [s(12)]),
      i("potato-egg", "بطاطا وبيض", "Potato and egg", [s(12)]),
      i("sausage-egg", "نقانق وبيض", "Sausage and egg", [s(12)]),
      i("mutabbal", "متبلات بأنواعها", "Assorted mutabbal", [s(7)]),
      i("falafel", "فلافل", "Falafel", [one(3)]),
    ],
  },
  {
    slug: "pizza",
    nameAr: "بيتزا",
    items: [
      i("margherita", "بيتزا مارجريتا", "Margherita", [one(25)]),
      i("veg", "بيتزا خضار", "Vegetable pizza", [one(25)]),
      i("salami", "بيتزا بيروني (سلامي)", "Pepperoni / salami pizza", [one(30)]),
      i("bbq", "بيتزا باربيكيو بالدجاج", "BBQ chicken pizza", [one(35)]),
    ],
  },
  {
    slug: "mains",
    nameAr: "الوجبات الرئيسية",
    note: "تُقدّم مع سلطات وبطاطا",
    items: [
      i("mixed-grill", "مشاوي مشكل", "Mixed grill", [one(60)], "مع سلطات وبطاطا"),
      i("lamb-pieces", "شقف خروف", "Lamb pieces", [one(65)], "مع سلطات وبطاطا"),
      i("lamb-chops", "ريش خروف", "Lamb chops", [one(70)], "مع سلطات وبطاطا"),
      i("kebab", "كباب", "Kebab", [one(45)], "مع سلطات وبطاطا"),
      i("tawook", "شيش طاووق", "Shish tawook", [one(45)], "مع سلطات وبطاطا"),
      i("grilled-breast", "صدر دجاج مشوي", "Grilled chicken breast", [one(40)], "مع سلطات وبطاطا"),
      i("cream-breast", "صدر دجاج بالكريما", "Chicken breast with cream", [one(45)], "مع سلطات وبطاطا"),
      i("meat-fakhara", "فخارة لحمة", "Meat clay pot", [one(60)], "مع سلطات وبطاطا"),
      i("chicken-fakhara", "فخارة دجاج", "Chicken clay pot", [one(50)], "مع سلطات وبطاطا"),
      i("mansaf", "منسف لحمة", "Lamb mansaf", [one(80)], "مع سلطات وبطاطا"),
      i("kabsa", "كبسة", "Kabsa", [one(55)], "مع سلطات وبطاطا", "/nablus-platter.jpg"),
      i("fettuccine", "فوتوتشيني", "Fettuccine", [one(35)]),
      i("chicken-fettuccine", "فوتوتشيني بالدجاج", "Chicken fettuccine", [one(45)]),
    ],
  },
  {
    slug: "manaqish",
    nameAr: "المناقيش",
    items: [
      i("zaatar", "زعتر", "Za'atar", [one(10)]),
      i("cheese", "جبنة", "Cheese", [one(12)]),
      i("egg", "بيض", "Egg", [one(10)]),
      i("egg-cheese", "بيض مع جبنة", "Egg with cheese", [one(12)]),
      i("mixed", "مكس", "Mixed", [one(12)]),
      i("mixed-cheese", "مكس أجبان", "Mixed cheeses", [one(13)]),
    ],
  },
  {
    slug: "salads",
    nameAr: "سلطات خضراء",
    items: [
      i("arugula", "سلطة جرجير", "Arugula salad", [one(12)]),
      i("tabbouleh", "تبولة", "Tabbouleh", [one(12)]),
      i("arabic", "عربية", "Arabic salad", [one(10)]),
      i("fattoush-cheese", "فتوش بالجبنة", "Fattoush with cheese", [one(15)]),
      i("greek", "يونانية", "Greek salad", [one(15)]),
      i("falahi", "فلاحية", "Falahi salad", [one(10)]),
      i("quinoa", "بولة كينوا", "Quinoa tabbouleh", [one(22)]),
    ],
  },
  {
    slug: "drinks",
    nameAr: "المشروبات",
    items: [
      i("cola", "كولا صغير", "Small cola", [one(3)]),
      i("juice", "عصير صغير", "Small juice", [one(3)]),
      i("water", "مياه صغير", "Small water", [one(3)]),
      i("tea", "شاي / شاي أخضر", "Tea / green tea", [one(3)]),
      i("arabic-coffee", "قهوة عربية", "Arabic coffee", [one(4)]),
      i("lemonade", "ليمون طبيعي", "Fresh lemonade", [one(9)]),
      i("orange", "برتقال طبيعي", "Fresh orange juice", [one(9)]),
    ],
  },
];

export const outsideCategories: CategorySeed[] = [
  {
    slug: "plates",
    nameAr: "قائمة الصحون",
    items: [
      i("hummus", "حمص", "Hummus", sml(5, 7, 10)),
      i("foul", "فول", "Foul", sml(5, 7, 10)),
      i("musabaha", "مسبحة", "Musabaha", sml(5, 7, 10)),
      i("qudsia", "قدسية", "Qudsia", sml(5, 7, 10)),
      i("mixed-salads", "مشكل سلطات", "Mixed salads", sml(6, 8, 12)),
      i("pickles", "تصليحة (مقبلات)", "Pickles / appetizers", sm(4, 7)),
    ],
  },
  {
    slug: "boxes",
    nameAr: "قائمة العلب",
    items: [
      i("hummus-box", "حمص", "Hummus box", sm(4, 8)),
      i("foul-box", "فول", "Foul box", sm(4, 8)),
      i("musabaha-box", "مسبحة", "Musabaha box", sm(5, 9)),
      i("qudsia-box", "قدسية", "Qudsia box", sm(5, 9)),
      i("salads-box", "سلطات ومتبلات", "Salads and mutabbal", sm(5, 10)),
      i("labneh-box", "لبنة بالجرجير", "Labneh with arugula", sm(5, 10)),
      i("falafel-3", "فلافل 3 حبات", "Falafel 3 pcs", [one(1)]),
    ],
  },
  {
    slug: "breakfasts",
    nameAr: "إفطارات خميس",
    items: [
      i("fatteh-nuts", "فتة بالمكسرات", "Fatteh with nuts", sml(15, 25, 35)),
      i("fatteh-meat", "فتة باللحمة والمكسرات", "Fatteh with meat and nuts", sml(25, 35, 55)),
      i("shami-fatteh", "فتة شامية (لحمة خروف وصنوبر)", "Shami fatteh with lamb and pine nuts", sm(40, 55)),
      i("eggplant-fatteh", "فتة باذنجان", "Eggplant fatteh", sm(12, 22)),
      i("hummus-lamb", "حمص مع لحمة خروف شقف", "Hummus with lamb pieces", sm(35, 45)),
      i("hummus-beef", "حمص مع لحمة عجل", "Hummus with beef", sml(20, 25, 30)),
      i("kibbeh", "كبة شامية 1 حبة", "Shami kibbeh 1 pc", [one(4)]),
    ],
  },
  {
    slug: "fried",
    nameAr: "مقالي",
    items: [
      i("omelette", "عجة", "Omelette", [s(6)]),
      i("potatoes", "بطاطا", "Potatoes", sm(10, 15)),
      i("potato-egg", "بطاطا وبيض", "Potato and egg", sml(8, 10, 15)),
      i("sausage-egg", "نقانق وبيض", "Sausage and egg", sml(8, 10, 15)),
      i("fried-tomato", "قلاية بندورة", "Tomato pan", sml(8, 10, 15)),
      i("shakshuka", "شكشوكة تركية", "Turkish shakshuka", sml(10, 12, 15)),
      i("mixed-fried", "مقالي مشكل", "Mixed fried", sml(12, 15, 20)),
      i("cheese-omelette", "أومليت جبنة", "Cheese omelette", [s(8)]),
      i("fried-cheese", "جبنة مقلية", "Fried cheese", [s(10)]),
      i("sunny-eggs", "بيض عيون", "Sunny side up", [s(6)]),
      i("liver", "كبدة دجاج", "Chicken liver", sml(15, 20, 30)),
      i("tomato-meat", "بندورة مع لحمة", "Tomato with meat", sml(20, 25, 30)),
    ],
  },
  {
    slug: "sandwiches",
    nameAr: "سندويشات",
    items: [
      i("falafel-wrap", "فلافل لف", "Falafel wrap", [one(6)]),
      i("falafel", "فلافل عادي", "Regular falafel", [one(5)]),
      i("hummus-meat-wrap", "لف حمص مع لحمة", "Hummus with meat wrap", [one(12)]),
      i("shawarma-wrap", "لفة شاورما", "Shawarma wrap", [one(15)]),
      i("omelette-sandwich", "سندويش عجة", "Omelette sandwich", [one(5)]),
      i("potato-sandwich", "سندويش بطاطا", "Potato sandwich", [one(6)]),
      i("hummus-foul-sandwich", "سندويش حمص - فول", "Hummus and foul sandwich", [one(4)]),
      i("labneh-sandwich", "سندويش لبنة", "Labneh sandwich", [one(4)]),
    ],
  },
  {
    slug: "salads",
    nameAr: "سلطات خضراء",
    items: [
      i("arugula", "سلطة جرجير", "Arugula salad", sm(12, 20)),
      i("tabbouleh", "تبولة", "Tabbouleh", sm(12, 20)),
      i("quinoa", "تبولة كينوا", "Quinoa tabbouleh", sm(22, 30)),
      i("arabic", "عربية", "Arabic salad", sm(10, 20)),
      i("fattoush-cheese", "فتوش بالجبنة", "Fattoush with cheese", sm(15, 22)),
      i("greek", "يونانية", "Greek salad", sm(15, 22)),
      i("falahi", "فلاحية", "Falahi salad", sm(10, 20)),
      i("arabic-tahini", "عربية بالطحينة", "Arabic with tahini", sm(12, 20)),
    ],
  },
  {
    slug: "mains",
    nameAr: "وجبات رئيسية",
    note: "تُقدّم مع سلطات وبطاطا",
    items: [
      i("mixed-grill", "مشاوي مشكل", "Mixed grill", [one(50)], "مع سلطات وبطاطا"),
      i("lamb-pieces", "شقف خروف", "Lamb pieces", [one(55)], "مع سلطات وبطاطا"),
      i("lamb-chops", "ريش خروف", "Lamb chops", [one(65)], "مع سلطات وبطاطا"),
      i("kebab", "كباب", "Kebab", [one(40)], "مع سلطات وبطاطا"),
      i("tawook", "شيش طاووق", "Shish tawook", [one(35)], "مع سلطات وبطاطا"),
      i("grilled-breast", "صدر دجاج مشوي", "Grilled chicken breast", [one(30)], "مع سلطات وبطاطا"),
      i("cream-breast", "صدر دجاج بالكريما", "Chicken breast with cream", [one(40)], "مع سلطات وبطاطا"),
      i("meat-fakhara", "فخارة لحمة", "Meat clay pot", [one(50)], "مع سلطات وبطاطا"),
      i("chicken-fakhara", "فخارة دجاج", "Chicken clay pot", [one(40)], "مع سلطات وبطاطا"),
      i("mansaf", "منسف لحمة", "Lamb mansaf", [one(60)], "مع سلطات وبطاطا"),
      i("kabsa", "كبسة", "Kabsa", [one(45)], "مع سلطات وبطاطا", "/nablus-platter.jpg"),
      i("fettuccine", "فوتوتشيني", "Fettuccine", [one(30)]),
      i("chicken-fettuccine", "فوتوتشيني بالدجاج", "Chicken fettuccine", [one(40)]),
      i("healthy", "وجبة صحية مع أرز", "Healthy meal with rice", [one(35)]),
    ],
  },
  {
    slug: "pastries",
    nameAr: "قائمة المعجنات",
    items: [
      i("cheese-manakish", "منقوشة جبنة", "Cheese manakish", [one(8)]),
      i("zaatar-manakish", "منقوشة زعتر", "Za'atar manakish", [one(7)]),
      i("eggs", "بيض", "Egg", [one(8)]),
      i("eggs-cheese", "بيض مع جبنة", "Egg with cheese", [one(9)]),
      i("mixed-eggs", "مكس بيض", "Mixed eggs", [one(9)]),
      i("sausage-emek", "نقانق مع جبنة عيمك", "Sausage with Emek cheese", [one(12)]),
      i("mixed-cheeses", "مكس أجبان", "Mixed cheeses", [one(12)]),
      i("cheese-tomato", "جبنة مع بندورة", "Cheese with tomato", [one(8)]),
      i("tomato", "بندورة", "Tomato", [one(7)]),
      i("cheese-green-zaatar", "جبنة مع زعتر أخضر", "Cheese with green za'atar", [one(9)]),
    ],
  },
  {
    slug: "pizza",
    nameAr: "البيتزا",
    items: [
      i("margherita", "بيتزا مارجريتا", "Margherita", [one(20)]),
      i("salami", "بيتزا سلامي", "Salami pizza", [one(25)]),
      i("bbq", "بيتزا باربيكيو دجاج", "BBQ chicken pizza", [one(35)]),
      i("veg", "بيتزا خضار", "Vegetable pizza", [one(20)]),
    ],
  },
];

export const channelMenus: Record<MenuChannel, CategorySeed[]> = {
  inside: insideCategories,
  outside: outsideCategories,
};

export const branchSeeds: BranchSeed[] = [
  {
    id: "nablus",
    slug: "nablus",
    nameAr: "نابلس — رفيديا",
    nameEn: "Nablus Rafidia",
    city: "نابلس",
    address: "رفيديا، مقابل البرج",
    phone: "0599352222",
    whatsapp: "970599352222",
    facebook: "",
    instagram: "",
    tiktok: "",
    heroImage: "/branches/nablus.jpg",
    founded: "1968",
  },
  {
    id: "jenin",
    slug: "jenin",
    nameAr: "جنين — شارع حيفا",
    nameEn: "Jenin Haifa Street",
    city: "جنين",
    address: "شارع حيفا، بجانب محطة حيفا",
    phone: "0595444497",
    whatsapp: "970595444497",
    facebook: "",
    instagram: "",
    tiktok: "",
    heroImage: "/branches/jenin.jpg",
    founded: "1968",
  },
];
