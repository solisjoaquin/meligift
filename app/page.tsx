"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  title: string;
  price: number;
  thumbnail: string;
  permalink: string;
}

export default function GiftRecommender() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          "https://api.mercadolibre.com/sites/MLA/categories"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Categories:", data);
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    const response = await fetch(
      `https://api.mercadolibre.com/sites/MLA/search?status=active&category=${selectedCategory}`
    );
    const data = await response.json();
    const filteredProducts = filterProductsByPriceRange(
      data.results,
      priceRange
    );
    const randomProduct =
      filteredProducts[Math.floor(Math.random() * filteredProducts.length)];

    randomProduct.thumbnail = randomProduct.thumbnail.replace(
      "-I.jpg",
      "-O.jpg"
    );
    setProduct(randomProduct);
    setLoading(false);
  };

  const filterProductsByPriceRange = (products: Product[], range: string) => {
    switch (range) {
      case "hasta30000":
        return products.filter((p) => p.price <= 30000);
      case "hasta50000":
        return products.filter((p) => p.price <= 50000);
      case "hasta75000":
        return products.filter((p) => p.price <= 75000);
      case "hasta100000":
        return products.filter((p) => p.price <= 100000);
      case "masde100000":
        return products.filter((p) => p.price > 100000);
      default:
        return products;
    }
  };
  return (
    <div className="min-h-screen bg-red-100 p-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-green-700">
        Recomendador de Regalos Navideños
      </h1>
      <div className="max-w-md mx-auto space-y-4">
        <Select onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={setPriceRange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un rango de precios" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hasta30000">Hasta $30,000</SelectItem>
            <SelectItem value="hasta50000">Hasta $50,000</SelectItem>
            <SelectItem value="hasta75000">Hasta $75,000</SelectItem>
            <SelectItem value="hasta100000">Hasta $100,000</SelectItem>
            <SelectItem value="masde100000">Más de $100,000</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={handleSearch}
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={!selectedCategory || !priceRange || loading}
        >
          {loading ? "Buscando regalo..." : "Buscar regalo"}
        </Button>
      </div>
      {product && (
        <Card className="max-w-md mx-auto mt-8 bg-white shadow-lg">
          <CardHeader>
            <CardTitle>{product.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Image
              src={product.thumbnail}
              alt={product.title}
              width={200}
              height={200}
            />
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-4">
            <p className="text-2xl font-bold">
              ${product.price.toLocaleString()}
            </p>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <a
                href={product.permalink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver en MercadoLibre
              </a>
            </Button>
            <Button
              onClick={handleSearch}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Elegir otro producto
            </Button>
            <Button
              onClick={() => {
                setSelectedCategory("");
                setPriceRange("");
                setProduct(null);
              }}
              className="w-full"
            >
              Volver a elegir categoría
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
