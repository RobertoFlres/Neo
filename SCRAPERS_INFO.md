# Información sobre los Scrapers de Noticias

## Estado Actual de los Scrapers por Categoría

### ✅ Fuentes que SÍ respetan la categoría (con limitaciones):
1. **newsdata** - Usa keywords, puede traer artículos no relacionados
2. **newsapi** - Usa categorías de la API pero puede fallar
3. **hackernews** - Filtra por keywords en título
4. **techcrunch** - Filtra por keywords en título/descripción
5. **startuplinks** - Filtra por keywords

### ❌ Fuentes que NO respetan la categoría:
1. **noro** - Siempre trae `section=all` (tecnología + negocios)
2. **referente** - No usa categoría, trae todo
3. **entrepreneur-es** - Recibe parámetro pero no lo usa
4. **expansion** - Recibe parámetro pero no lo usa

## Problemas Identificados:

1. **Filtrado por keywords**: Muchas fuentes usan filtrado por palabras clave que puede fallar y traer artículos no relacionados
2. **Falta de mapeo**: Algunas fuentes no mapean correctamente las categorías (ej: "startups" no existe en NewsAPI)
3. **Endpoints que ignoran parámetros**: Varios endpoints reciben `category` pero no lo pasan a la función

## Categorías Disponibles:
- `technology` - Tecnología general
- `business` - Negocios
- `startups` - Startups y emprendimiento
- `general` - General

## Solución Propuesta:

1. Mejorar el mapeo de categorías para cada fuente
2. Agregar filtrado post-scraping por keywords más precisos
3. Hacer que todos los endpoints usen la categoría correctamente
4. Agregar un filtro adicional en el frontend para asegurar que los artículos sean relevantes



