export const INGREDIENT_CATEGORIES = [
  "Flour & Grains",
  "Dairy & Eggs",
  "Sweeteners",
  "Fats & Oils",
  "Leavening & Additives",
  "Flavorings & Extracts",
  "Fruits & Nuts",
  "Chocolate & Cocoa",
  "Decorating & Toppings",
  "Packaging",
  "Other",
] as const;

export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Flour & Grains": [
    "flour", "wheat", "oat", "corn", "rice", "rye", "barley", "semolina",
    "cornmeal", "starch", "cornstarch", "breadcrumb", "bran", "grain",
    "spelt", "buckwheat", "almond flour", "coconut flour",
  ],
  "Dairy & Eggs": [
    "milk", "cream", "butter", "egg", "yogurt", "cheese", "sour cream",
    "buttermilk", "whey", "condensed milk", "evaporated milk", "custard",
    "mascarpone", "ricotta", "cream cheese",
  ],
  "Sweeteners": [
    "sugar", "honey", "syrup", "molasses", "agave", "stevia",
    "icing sugar", "powdered sugar", "brown sugar", "cane",
    "maple", "treacle", "glucose", "dextrose", "fructose",
  ],
  "Fats & Oils": [
    "oil", "shortening", "lard", "margarine", "ghee", "coconut oil",
    "vegetable oil", "canola", "olive oil", "sunflower oil", "spray",
  ],
  "Leavening & Additives": [
    "yeast", "baking powder", "baking soda", "bicarbonate", "gelatin",
    "pectin", "agar", "xanthan", "guar gum", "cream of tartar",
    "citric acid", "meringue powder",
  ],
  "Flavorings & Extracts": [
    "vanilla", "extract", "cinnamon", "nutmeg", "ginger", "clove",
    "cardamom", "allspice", "anise", "peppermint", "almond extract",
    "lemon zest", "orange zest", "rose water", "coffee", "espresso",
    "matcha", "lavender", "salt", "spice", "seasoning",
  ],
  "Fruits & Nuts": [
    "almond", "walnut", "pecan", "hazelnut", "pistachio", "cashew",
    "peanut", "coconut", "macadamia", "raisin", "cranberry", "cherry",
    "blueberry", "strawberry", "raspberry", "apple", "lemon", "orange",
    "lime", "banana", "pineapple", "mango", "peach", "apricot",
    "fig", "date", "currant", "fruit", "nut", "seed", "sesame",
    "poppy", "sunflower seed", "pumpkin seed", "dried",
  ],
  "Chocolate & Cocoa": [
    "chocolate", "cocoa", "cacao", "chip", "ganache", "couverture",
    "white chocolate", "dark chocolate", "milk chocolate", "carob",
  ],
  "Decorating & Toppings": [
    "sprinkle", "fondant", "food color", "food colour", "gel color",
    "edible", "glitter", "pearl", "dragee", "nonpareil", "icing",
    "frosting", "glaze", "topping", "decoration", "marzipan",
    "gum paste", "lustre", "dust",
  ],
  "Packaging": [
    "box", "bag", "wrap", "foil", "parchment", "liner", "cup",
    "cupcake liner", "cake board", "ribbon", "label", "sticker",
    "container", "packaging", "tray",
  ],
};

export function categorizeIngredient(name: string): IngredientCategory {
  const lower = name.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return category as IngredientCategory;
      }
    }
  }

  return "Other";
}
