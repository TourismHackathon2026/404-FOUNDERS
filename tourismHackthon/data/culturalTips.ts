export interface CulturalTip {
  id: string;
  title: string;
  body: string;
  category: string;
}

export const CULTURAL_TIPS: CulturalTip[] = [
  {
    id: "namaste",
    title: "Namaste greeting",
    body: "Press palms together at chest level and say 'Namaste' — the universal respectful greeting in Nepal.",
    category: "Etiquette",
  },
  {
    id: "shoes",
    title: "Remove your shoes",
    body: "Always remove shoes before entering temples, monasteries, and many homes. Socks are usually fine.",
    category: "Temples",
  },
  {
    id: "clockwise",
    title: "Walk clockwise",
    body: "At Buddhist stupas and temples, always circumambulate clockwise. Spin prayer wheels with your right hand.",
    category: "Temples",
  },
  {
    id: "photography",
    title: "Ask before photographing",
    body: "Some temples prohibit photos inside. Always ask Sadhus before taking their portrait — a small tip is customary.",
    category: "Etiquette",
  },
  {
    id: "momo",
    title: "Try momo like a local",
    body: "Buff (buffalo) momo is the Kathmandu classic. Eat with your hands or a fork — jhol (soup) momo is eaten by dipping.",
    category: "Food",
  },
  {
    id: "bargaining",
    title: "Bargain with a smile",
    body: "In Thamel markets, polite bargaining is expected. Start at 60–70% of the quoted price and stay friendly.",
    category: "Shopping",
  },
  {
    id: "left-hand",
    title: "Right hand only",
    body: "Use your right hand for eating, giving, and receiving. The left hand is considered unclean in traditional settings.",
    category: "Etiquette",
  },
  {
    id: "tipping",
    title: "Tipping customs",
    body: "Tipping is not mandatory but appreciated. 10% at restaurants; round up taxi fares. Temple donations are voluntary.",
    category: "Money",
  },
];
