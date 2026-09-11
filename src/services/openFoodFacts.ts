export interface OpenFoodItem {
  id?: string;
  name: string;
  brand?: string;
  barcode?: string;
  calories: number; // per 100g
  protein: number;
  carbs: number;
  fat: number;
  imageUrl?: string;
}

// Fetch single product by exact barcode from Open Food Facts API v2
export const fetchProductByBarcode = async (barcode: string): Promise<OpenFoodItem | null> => {
  const cleanBarcode = barcode.trim().replace(/\s+/g, '');
  if (!cleanBarcode) return null;

  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`);
    if (!res.ok) return null;
    const data = await res.json();

    if (data.status === 1 && data.product) {
      const p = data.product;
      const nutriments = p.nutriments || {};

      const kcal = Math.round(
        nutriments['energy-kcal_100g'] ?? 
        nutriments['energy-kcal'] ?? 
        (nutriments['energy_100g'] ? nutriments['energy_100g'] / 4.184 : 0)
      );

      const protein = Math.round((nutriments['proteins_100g'] ?? nutriments['proteins'] ?? 0) * 10) / 10;
      const carbs = Math.round((nutriments['carbohydrates_100g'] ?? nutriments['carbohydrates'] ?? 0) * 10) / 10;
      const fat = Math.round((nutriments['fat_100g'] ?? nutriments['fat'] ?? 0) * 10) / 10;

      const brand = p.brands ? p.brands.split(',')[0].trim() : '';
      const rawName = p.product_name_it || p.product_name || 'Alimento Verificato';
      const fullName = brand ? `${rawName} (${brand})` : rawName;

      return {
        id: cleanBarcode,
        barcode: cleanBarcode,
        name: fullName,
        brand,
        calories: kcal,
        protein,
        carbs,
        fat,
        imageUrl: p.image_front_small_url || p.image_front_thumb_url
      };
    }
    return null;
  } catch (err) {
    console.warn('[OpenFoodFacts] Error fetching barcode:', err);
    return null;
  }
};

// Search products by name from Open Food Facts database
export const searchProductsByName = async (query: string): Promise<OpenFoodItem[]> => {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  try {
    const url = `https://it.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(trimmed)}&search_simple=1&action=process&json=1&page_size=12`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();

    if (data && Array.isArray(data.products)) {
      return data.products
        .filter((p: any) => p && (p.product_name || p.product_name_it))
        .map((p: any) => {
          const nutriments = p.nutriments || {};
          const kcal = Math.round(
            nutriments['energy-kcal_100g'] ?? 
            nutriments['energy-kcal'] ?? 
            (nutriments['energy_100g'] ? nutriments['energy_100g'] / 4.184 : 0)
          );
          const protein = Math.round((nutriments['proteins_100g'] ?? nutriments['proteins'] ?? 0) * 10) / 10;
          const carbs = Math.round((nutriments['carbohydrates_100g'] ?? nutriments['carbohydrates'] ?? 0) * 10) / 10;
          const fat = Math.round((nutriments['fat_100g'] ?? nutriments['fat'] ?? 0) * 10) / 10;
          const brand = p.brands ? p.brands.split(',')[0].trim() : '';
          const rawName = p.product_name_it || p.product_name;
          const fullName = brand ? `${rawName} (${brand})` : rawName;

          return {
            id: p.code || `${p._id || Date.now()}`,
            barcode: p.code,
            name: fullName,
            brand,
            calories: kcal,
            protein,
            carbs,
            fat,
            imageUrl: p.image_front_small_url || p.image_front_thumb_url
          };
        });
    }
    return [];
  } catch (err) {
    console.warn('[OpenFoodFacts] Error searching products:', err);
    return [];
  }
};
