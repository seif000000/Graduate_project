export const MOCK_MEDICINES = [
  {
    id: 1,
    name: "بانادول أدفانس",
    scientificName: "Paracetamol",
    category: "مسكنات",
    expiryDate: "2025-12-01",
    location: "القاهرة - مدينة نصر",
    donorType: "شخص",
    status: "متوفر فوراً",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
    distance: "1.2 كم"
  },
  {
    id: 2,
    name: "أوجمنتين 1 جم",
    scientificName: "Amoxicillin/Clavulanate",
    category: "مضادات حيوية",
    expiryDate: "2025-08-15",
    location: "الجيزة - الدقي",
    donorType: "صيدلية",
    status: "تبرع",
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&q=80",
    distance: "3.5 كم"
  },
  {
    id: 3,
    name: "كونجيستال",
    scientificName: "Paracetamol/Chlorpheniramine",
    category: "برد وإنفلونزا",
    expiryDate: "2026-01-10",
    location: "الإسكندرية - سموحة",
    donorType: "شخص",
    status: "متوفر فوراً",
    image: "https://images.unsplash.com/photo-1550572017-ed20015994b9?w=400&q=80",
    distance: "210 كم"
  },
  {
    id: 4,
    name: "جليبوفين 500",
    scientificName: "Metformin",
    category: "سكرى",
    expiryDate: "2025-10-20",
    location: "القاهرة - المعادي",
    donorType: "شخص",
    status: "تبرع",
    image: "https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?w=400&q=80",
    distance: "5.8 كم"
  }
];

export const CATEGORIES = [
  "الكل", "مسكنات", "مضادات حيوية", "برد وإنفلونزا", "سكرى", "ضغط الدم", "أخرى"
];

export const PROVINCES = [
  "الكل", "القاهرة", "الجيزة", "الإسكندرية", "طنطا", "المنصورة", "أسيوط"
];

export const COMMUNITY_REQUESTS = [
  {
    id: 1,
    user: "أحمد محمد",
    medicineName: "أنسولين لانتوس",
    urgency: "طارئ",
    location: "القاهرة - المعادي",
    time: "منذ ساعتين",
    desc: "محتاج حقنة أنسولين لانتوس ضروري جداً لوالدتي، الصيدليات اللي حولي مفيش فيها حالياً.",
    responses: 3
  },
  {
    id: 2,
    user: "سارة محمود",
    medicineName: "إيبوتين هورمون",
    urgency: "عادي",
    location: "الجيزة - فيصل",
    time: "منذ 5 ساعات",
    desc: "أبحث عن هذا الدواء لمريض فشل كلوي، غير مقتدر على سعره بالكامل.",
    responses: 1
  },
  {
    id: 3,
    user: "مركز طبي الخير",
    medicineName: "مجموعة أدوية أطفال",
    urgency: "متوسط",
    location: "طنطا",
    time: "منذ يوم",
    desc: "محتاجين مسكنات ومضادات حيوية للأطفال كصدقة جارية للمركز الطبي لخدمة الفقراء.",
    responses: 12
  }
];
