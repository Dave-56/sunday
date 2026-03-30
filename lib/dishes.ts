export interface Dish {
  name: string;
  cuisine: string;
  why: string;
  difficulty: string;
  prepTime: string;
  servings: string;
  ingredients: string[];
  steps: string[];
}

const FALLBACK_DISH_POOL: Dish[] = [
  {
    name: "Smoky Jollof Rice with Grilled Chicken",
    cuisine: "Nigerian",
    why: "Batch-cooks beautifully and gets even better after a day in the fridge.",
    difficulty: "Easy",
    prepTime: "2 hours",
    servings: "10–12 servings (2 people × 5–6 days)",
    ingredients: [
      "4 cups long-grain parboiled rice",
      "12 chicken thighs, skin removed",
      "10 large tomatoes",
      "4 red bell peppers",
      "3 onions",
      "1/2 cup vegetable oil",
      "4 tbsp tomato paste",
      "2 tbsp curry powder",
      "2 tbsp thyme",
      "4 stock cubes (dairy-free)",
      "Salt and black pepper to taste",
    ],
    steps: [
      "Wash 4 cups parboiled rice in cold water 3–4 times until the water runs mostly clear. Soak in warm water for 20 minutes, then drain and set aside.",
      "Roughly chop 10 large tomatoes, 4 red bell peppers, and 2 onions. Blend in batches until completely smooth — you should get about 6–7 cups of puree. Set aside.",
      "Season the 12 chicken thighs generously with 1 tbsp curry powder, 1 tbsp thyme, salt, and black pepper. Rub the seasoning into the meat on all sides.",
      "Preheat your grill or oven to 200°C (400°F). Grill chicken thighs for 20–25 minutes, flipping halfway, until charred on the outside and cooked through (internal temp 75°C/165°F). Set aside.",
      "Dice the remaining onion finely. Heat 1/2 cup vegetable oil in a large heavy-bottomed pot over medium heat until it shimmers (about 2 minutes). Fry the diced onion for 3–4 minutes until translucent and soft.",
      "Add 4 tbsp tomato paste and fry for 2–3 minutes, stirring constantly, until it darkens slightly and smells fragrant — this removes the raw tinny taste.",
      "Pour in the blended tomato-pepper puree. Increase heat to medium-high and cook for 25–30 minutes, stirring every 5 minutes. The sauce is ready when the oil floats on top and it has reduced by about half.",
      "Add 4 crushed stock cubes, the remaining 1 tbsp curry powder, 1 tbsp thyme, salt, and pepper. Stir well. Add the drained rice and 3 cups of water. Stir once to combine.",
      "Cover the pot tightly with aluminium foil, then place the lid on top to trap steam. Reduce heat to the lowest setting and cook for 30–35 minutes. Do NOT open the lid during this time.",
      "After 35 minutes, check the rice — it should be tender with all liquid absorbed. Lay the grilled chicken on top, re-cover, and steam for 10 more minutes on low heat.",
      "Fluff the rice gently with a fork. Portion into meal prep containers (about 1.5 cups rice + 1–2 chicken thighs each). Cool for 20 minutes before sealing and refrigerating. Reheat in the microwave for 2–3 minutes at medium-high power.",
    ],
  },
  {
    name: "Ayamase-Inspired Turkey Stew with Rice",
    cuisine: "Nigerian",
    why: "Spicy, rich, and perfect for reheating without losing flavor.",
    difficulty: "Intermediate",
    prepTime: "2.5 hours",
    servings: "10–12 servings (2 people × 5–6 days)",
    ingredients: [
      "2.5 kg turkey wings or drumsticks",
      "12 green bell peppers",
      "3 onions",
      "1 cup vegetable oil",
      "2 cups locust beans (iru), optional",
      "3 tbsp ground crayfish",
      "4 stock cubes (dairy-free)",
      "Salt to taste",
      "Cooked rice for serving",
    ],
    steps: [
      "Rinse 2.5 kg turkey pieces under cold water. Place in a large pot with 1 roughly chopped onion, 2 crushed stock cubes, and 1 tsp salt. Add water to just cover the meat. Bring to a boil over high heat, then reduce to medium and simmer for 40–50 minutes until fork-tender. Reserve 2 cups of the stock.",
      "While the turkey boils, deseed the 12 green bell peppers (remove the white pith too for a milder stew). Roughly chop along with 2 onions. Blend in batches until coarsely chopped — not smooth, you want some texture.",
      "Remove cooked turkey from the stock and pat dry with paper towels. Preheat oven grill/broiler to 220°C (425°F). Place turkey on a baking tray and grill for 12–15 minutes, turning once, until golden-brown and slightly crispy.",
      "Heat 1 cup vegetable oil in a large deep pot over medium heat for 3–4 minutes until hot but not smoking. Carefully pour in the blended green pepper mixture — it will sizzle vigorously, so stand back.",
      "Fry the pepper mixture on medium-high heat for 25–30 minutes, stirring every 5 minutes. It's ready when the oil rises to the surface and the mixture has reduced by about a third. The colour will darken from bright green to olive green.",
      "If using locust beans (iru), rinse them and add now. Add 3 tbsp ground crayfish, 2 crushed stock cubes, and salt to taste. Stir well and cook for 5 more minutes until fragrant.",
      "Pour in 2 cups reserved turkey stock. Add the grilled turkey pieces, pressing them gently into the sauce. Reduce heat to low and simmer for 15–20 minutes, stirring occasionally, until the stew thickens.",
      "Cook 4 cups long-grain rice with 6 cups water and a pinch of salt — bring to a boil, cover, and cook on lowest heat for 20 minutes until fluffy.",
      "Portion into containers: about 1 cup rice + a generous ladle of stew with 1–2 turkey pieces per serving. Cool for 20 minutes uncovered before sealing. Reheat in the microwave for 2–3 minutes at medium power, adding a splash of water to the stew if it's thickened overnight.",
    ],
  },
  {
    name: "Thai Basil Chicken with Coconut Rice",
    cuisine: "Thai",
    why: "Fast to cook in bulk and keeps a bold, fresh taste through the week.",
    difficulty: "Easy",
    prepTime: "1.5 hours",
    servings: "10–12 servings (2 people × 5–6 days)",
    ingredients: [
      "2.2 kg chicken mince",
      "6 cups jasmine rice",
      "2 cans full-fat coconut milk",
      "12 garlic cloves, minced",
      "8 red chilies, sliced",
      "1 cup low-sodium soy sauce",
      "1/2 cup oyster sauce (dairy-free)",
      "4 tbsp brown sugar",
      "4 cups Thai basil leaves",
      "3 tbsp vegetable oil",
    ],
    steps: [
      "Rinse 6 cups jasmine rice until water runs clear (about 3 rinses). Add to a large pot with 2 cans coconut milk and 4 cups water. Bring to a boil over high heat, stir once, then cover tightly and reduce to the lowest heat. Cook for 18–20 minutes until all liquid is absorbed and rice is fluffy. Do not open the lid during cooking.",
      "While rice cooks, mince 12 garlic cloves and thinly slice 8 red chilies (remove seeds if you want less heat). Wash and pick 4 cups of Thai basil leaves from their stems.",
      "Heat 3 tbsp vegetable oil in a large wok or deep pan over high heat until smoking — about 2 minutes. Add garlic and chilies, stir-fry for 30 seconds until fragrant. They should sizzle immediately. Don't let the garlic turn brown.",
      "Add all 2.2 kg chicken mince to the wok. Break it up with a wooden spoon and spread across the pan. Let it sit untouched for 2 minutes to get some caramelised colour on the bottom, then stir and cook for 6–8 minutes total until no pink remains.",
      "Pour in 1 cup soy sauce, 1/2 cup oyster sauce, and 4 tbsp brown sugar. Stir everything together and cook for 3–4 minutes until the sauce reduces, thickens, and coats the chicken with a glossy sheen.",
      "Remove wok from heat. Fold in 4 cups Thai basil leaves — they'll wilt in about 30 seconds from residual heat, keeping their flavour bright. Taste and adjust salt if needed.",
      "Fluff the coconut rice with a fork. Portion into containers: about 1 cup coconut rice + 1 cup chicken mixture per serving. Allow to cool uncovered for 15 minutes before sealing and refrigerating. Keeps well for 5 days. Reheat in microwave for 2 minutes at medium-high power.",
    ],
  },
  {
    name: "Chinese Ginger Soy Beef Stir-Fry with Noodles",
    cuisine: "Chinese",
    why: "Great texture after reheating and easy to portion for weekday dinners.",
    difficulty: "Easy",
    prepTime: "1.75 hours",
    servings: "10–12 servings (2 people × 5–6 days)",
    ingredients: [
      "2 kg flank steak, sliced thin",
      "1.5 kg egg noodles",
      "10 spring onions",
      "8 garlic cloves",
      "4 tbsp grated ginger",
      "3/4 cup soy sauce",
      "1/3 cup sesame oil",
      "1/4 cup rice vinegar",
      "2 tbsp cornstarch",
      "4 tbsp neutral oil",
    ],
    steps: [
      "Slice 2 kg flank steak against the grain into thin strips (about 3mm thick — partially freezing the steak for 30 minutes makes this easier). Place in a bowl with 1/4 cup soy sauce and 2 tbsp cornstarch. Mix well and let marinate for 20 minutes at room temperature.",
      "Bring a large pot of water to a rolling boil. Cook 1.5 kg egg noodles according to packet instructions (usually 3–4 minutes for fresh, 6–8 for dried). Drain, rinse under cold water to stop cooking, and toss with 1 tbsp sesame oil to prevent sticking.",
      "Slice 10 spring onions — separate the white parts (cut into 2cm pieces) from the green tops (slice thinly, set aside for garnish). Mince 8 garlic cloves and grate 4 tbsp fresh ginger.",
      "Heat 2 tbsp neutral oil in a large wok over the highest heat until smoking. Add half the marinated beef in a single layer — do not crowd the pan. Sear for 90 seconds without stirring to build a crust, then flip and cook another 60 seconds. Transfer to a plate. Repeat with remaining beef and 1 tbsp oil.",
      "In the same wok (don't clean it — those brown bits are flavour), add 1 tbsp neutral oil. Add the ginger, garlic, and white spring onion pieces. Stir-fry for 45 seconds until very fragrant and the garlic is golden.",
      "Mix the sauce in a small bowl: remaining 1/2 cup soy sauce, remaining sesame oil (about 1/4 cup), and 1/4 cup rice vinegar. Pour into the wok and let it bubble vigorously for 30 seconds.",
      "Return all the beef and its resting juices to the wok. Add the noodles and toss everything together using tongs for 2 minutes until the noodles are evenly coated and heated through.",
      "Remove from heat and scatter the green spring onion tops over the dish. Portion into containers (about 1.5 cups per serving). Cool for 15 minutes uncovered before sealing. Reheat in microwave for 2 minutes — add a splash of water before reheating to keep the noodles from drying out.",
    ],
  },
];

function toCleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => toCleanString(item))
    .filter((item) => item.length > 0);
}

export function normalizeDish(value: unknown): Dish | null {
  if (!value || typeof value !== "object") return null;

  const dish = value as Record<string, unknown>;
  const normalized: Dish = {
    name: toCleanString(dish.name),
    cuisine: toCleanString(dish.cuisine),
    why: toCleanString(dish.why),
    difficulty: toCleanString(dish.difficulty),
    prepTime: toCleanString(dish.prepTime),
    servings: toCleanString(dish.servings),
    ingredients: toStringArray(dish.ingredients),
    steps: toStringArray(dish.steps),
  };

  if (
    !normalized.name ||
    !normalized.cuisine ||
    !normalized.why ||
    !normalized.difficulty ||
    !normalized.prepTime ||
    !normalized.servings ||
    normalized.ingredients.length === 0 ||
    normalized.steps.length === 0
  ) {
    return null;
  }

  return normalized;
}

export function normalizeDishes(value: unknown, max = 3): Dish[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((dish) => normalizeDish(dish))
    .filter((dish): dish is Dish => Boolean(dish))
    .slice(0, max);
}

export function getFallbackSuggestions(recentDishes: string[], max = 3): Dish[] {
  const recentSet = new Set(
    recentDishes.map((dish) => dish.trim().toLowerCase())
  );

  const filtered = FALLBACK_DISH_POOL.filter(
    (dish) => !recentSet.has(dish.name.toLowerCase())
  );
  const candidates =
    filtered.length >= max ? filtered : [...filtered, ...FALLBACK_DISH_POOL];

  return candidates.slice(0, max);
}
