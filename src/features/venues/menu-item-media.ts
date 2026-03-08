const secondaryImageByItemName: Record<string, string> = {
  "Croquetas de jamón":
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
  "Dados bravos de patata":
    "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?auto=format&fit=crop&w=1200&q=80",
  "Arroz meloso de carrillera":
    "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80",
  "Burger de vaca madurada":
    "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=1200&q=80",
  "Tarta de queso tostada":
    "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=1200&q=80",
  "Classic Burger":
    "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=1200&q=80",
  "Cheese Bacon Burger":
    "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=1200&q=80",
  "Patatas fritas":
    "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=1200&q=80",
  "Pizza Margarita":
    "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=1200&q=80",
  "Pizza Pepperoni":
    "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=1200&q=80",
  "Pan de ajo":
    "https://images.unsplash.com/photo-1619531038896-2d4f5bde6ef6?auto=format&fit=crop&w=1200&q=80",
  "California Roll":
    "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=1200&q=80",
  "Sushi variado":
    "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=80",
  Gyozas:
    "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80",
};

export function getMenuItemSecondaryImage(itemName: string) {
  return secondaryImageByItemName[itemName] ?? null;
}
